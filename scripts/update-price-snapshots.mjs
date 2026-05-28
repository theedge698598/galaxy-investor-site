#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

const today = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Toronto',
  month: 'long',
  day: 'numeric',
  year: 'numeric'
}).format(new Date());

const articles = [
  {
    ticker: 'QCOM',
    displayTicker: 'QCOM',
    firstPublishPrice: 177.01,
    firstPublishText: '$177.01',
    articlePath: 'research/qcom/index.html',
    priceSource: 'yahoo',
    yahooSymbol: 'QCOM',
    homepageMetaRegex: /Stock primer · Semiconductors · Published May 2, 2026(?: · Updated [^·<]+)?(?: ?· ?[+\-−]\d+(?:\.\d+)?% since publish)*/g,
    homepageMeta: () => `Stock primer · Semiconductors · Published May 2, 2026 · Updated ${today}`,
    featuredChipRegex: /<span class="chip" style="background:var\(--edge-soft\);color:var\(--edge-deep\)">[+-]\d+(?:\.\d+)?% since publish<\/span>/g,
  },
  {
    ticker: 'SYRUP',
    displayTicker: 'SYRUP',
    firstPublishPrice: 0.2496,
    firstPublishText: '$0.2496',
    articlePath: 'research/maple/index.html',
    priceSource: 'coingecko',
    coinGeckoId: 'syrup',
    homepageMetaRegex: /Crypto primer · On[- ]chain lending · Published May 4, 2026(?: · Updated [^·<]+)?(?: ?· ?[+\-−]\d+(?:\.\d+)?% since publish)*/g,
    homepageMeta: () => `Crypto primer · On-chain lending · Published May 4, 2026 · Updated ${today}`,
  },
  {
    ticker: 'GLXY',
    displayTicker: 'GLXY',
    firstPublishPrice: 26.28,
    firstPublishText: '$26.28',
    articlePath: 'research/galaxy/index.html',
    priceSource: 'yahoo',
    yahooSymbol: 'GLXY',
    homepageMetaRegex: /Crypto infrastructure · Helios · Published April 23, 2026(?: · Updated [^·<]+)?(?: ?· ?[+\-−]\d+(?:\.\d+)?% since publish)*/g,
    homepageMeta: () => `Crypto infrastructure · Helios · Published April 23, 2026 · Updated ${today}`,
  }
];

function money(value, decimals = value < 1 ? 4 : 2) {
  return `$${Number(value).toFixed(decimals)}`;
}

function returnText(first, current) {
  const ret = ((current / first) - 1) * 100;
  const sign = ret >= 0 ? '+' : '−';
  return `${sign}${Math.abs(ret).toFixed(1)}%`;
}

function returnClass(ret) {
  return ret.startsWith('+') ? 'up' : 'down';
}

async function yahooPrice(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 EdgeInvestingPriceUpdater/1.0' } });
  if (!response.ok) throw new Error(`Yahoo ${symbol} HTTP ${response.status}`);
  const data = await response.json();
  const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (!Number.isFinite(price)) throw new Error(`Yahoo ${symbol} returned no regularMarketPrice`);
  return price;
}

async function coinGeckoPrice(id) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd`;
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 EdgeInvestingPriceUpdater/1.0' } });
  if (!response.ok) throw new Error(`CoinGecko ${id} HTTP ${response.status}`);
  const data = await response.json();
  const price = data?.[id]?.usd;
  if (!Number.isFinite(price)) throw new Error(`CoinGecko ${id} returned no usd price`);
  return price;
}

async function priceFor(article) {
  if (article.priceSource === 'yahoo') return yahooPrice(article.yahooSymbol);
  if (article.priceSource === 'coingecko') return coinGeckoPrice(article.coinGeckoId);
  throw new Error(`Unknown price source for ${article.ticker}`);
}

function performanceBlock(article, currentPrice, ret) {
  return `<div class="research-performance" aria-label="Performance since first publish"><div><span class="label">Ticker</span><span class="value">${article.displayTicker}</span></div><div><span class="label">Price at first publish</span><span class="value">${article.firstPublishText}</span></div><div><span class="label">Price snapshot</span><span class="value">${money(currentPrice)}</span></div><div class="${returnClass(ret)}"><span class="label">Return since publish</span><span class="value">${ret}</span></div></div>`;
}

function replaceOnce(text, regex, replacement, label) {
  const next = text.replace(regex, replacement);
  if (next === text) throw new Error(`No replacement made for ${label}`);
  return next;
}

function updatePublishDate(html) {
  return html.replace(
    /<div class="publish-date"><strong>Published<\/strong> ([^<]+?)(?:<span class="sep">·<\/span><strong>Updated<\/strong> [^<]+)?<\/div>/,
    `<div class="publish-date"><strong>Published</strong> $1<span class="sep">·</span><strong>Updated</strong> ${today}</div>`
  );
}

for (const article of articles) {
  article.currentPrice = await priceFor(article);
  article.return = returnText(article.firstPublishPrice, article.currentPrice);
  console.log(`${article.ticker}: ${money(article.currentPrice)} (${article.return})`);
}

for (const article of articles) {
  let html = await readFile(article.articlePath, 'utf8');
  html = updatePublishDate(html);
  html = replaceOnce(
    html,
    /<div class="research-performance" aria-label="(?:Performance since first publish|Research snapshot)">.*?<\/div><\/div>/,
    performanceBlock(article, article.currentPrice, article.return),
    `${article.ticker} performance block`
  );
  await writeFile(article.articlePath, html);
}

for (const path of ['index.html', 'research/index.html']) {
  let html = await readFile(path, 'utf8');
  for (const article of articles) {
    html = replaceOnce(html, article.homepageMetaRegex, article.homepageMeta(article.return), `${path} ${article.ticker} card meta`);
  }
  await writeFile(path, html);
}

let researchIndex = await readFile('research/index.html', 'utf8');
const qcom = articles.find(article => article.ticker === 'QCOM');
const chip = `<span class="chip" style="background:var(--edge-soft);color:var(--edge-deep)">${qcom.return} since publish</span>`;
if (qcom.featuredChipRegex.test(researchIndex)) {
  researchIndex = researchIndex.replace(qcom.featuredChipRegex, chip);
} else {
  researchIndex = replaceOnce(
    researchIndex,
    /<span class="chip">Featured<\/span><span class="chip">Stock primer<\/span><span class="chip">Published May 2, 2026<\/span>/,
    `<span class="chip">Featured</span><span class="chip">Stock primer</span><span class="chip">Published May 2, 2026</span>${chip}`,
    'research featured QCOM chip'
  );
}
await writeFile('research/index.html', researchIndex);
