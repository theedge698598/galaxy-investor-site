#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = new Map(process.argv.slice(2).map(arg => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=') || 'true'];
}));

const source = (args.get('source') || process.env.PORTFOLIO_OS_SOURCE || 'http://127.0.0.1:5201').replace(/\/$/, '');
const output = args.get('output') || 'portfolio/index.html';
const timezone = args.get('timezone') || 'America/Toronto';
const scope = String(args.get('scope') || process.env.PORTFOLIO_SCOPE || 'stocks').toLowerCase();

const money = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 });

function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0;
}

function pct(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(digits)}%`;
}

function signedPct(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(digits)}%`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function paragraph(value) {
  return escapeHtml(value || 'Thesis note pending.').replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
}

function quoteSymbol(holding) {
  return String(holding['Yahoo Symbol'] || holding.Ticker || '').trim().toUpperCase();
}

function saleQuoteSymbol(ticker) {
  return String(ticker || '').trim().toUpperCase().replace(/\.B\.TO$/, '-B.TO');
}

function includesTicker(holding, query) {
  return String(holding.Ticker || '').toLowerCase().includes(query.toLowerCase());
}

function isCash(holding) {
  return includesTicker(holding, 'cash') || quoteSymbol(holding) === 'CAD';
}

const directCryptoSymbols = new Set(['BTC', 'BITCOIN', 'ETH', 'ETHEREUM', 'SOL', 'USDC', 'USDT', 'DAI', 'DOGE', 'ADA', 'AVAX', 'MATIC', 'POL', 'LINK', 'XRP', 'BNB']);

function rowText(row, field) {
  return String(row?.[field] || '').trim();
}

function lowerRow(row, field) {
  return rowText(row, field).toLowerCase();
}

function tickerText(row) {
  return String(row?.Ticker || row?.ticker || '').trim().toUpperCase();
}

function looksLikeCryptoSecurity(row) {
  if (['wallet', 'exchange'].includes(lowerRow(row, 'sourceKind'))) return false;
  if (row?.chain || row?.walletAddress || row?.contractAddress) return false;
  if (['stock', 'etf', 'fund'].includes(lowerRow(row, 'assetKind'))) return true;
  const combined = `${row?.Ticker || row?.ticker || ''} ${row?.Name || ''} ${row?.['Yahoo Symbol'] || ''} ${row?.Theme || row?.theme || ''} ${row?.['Asset Class'] || row?.assetClass || ''}`.toLowerCase();
  return /\betf\b|\bfund\b|\btrust\b|\bequity\b|\bstock\b|\bshares?\b|\bsecurity\b/.test(combined);
}

function isDirectCryptoRow(row) {
  if (['wallet', 'exchange'].includes(lowerRow(row, 'sourceKind'))) return true;
  if (row?.chain || row?.walletAddress || row?.contractAddress) return true;
  if (looksLikeCryptoSecurity(row)) return false;
  if (lowerRow(row, 'assetKind') === 'crypto' || lowerRow(row, 'exposureKind') === 'crypto' || lowerRow(row, 'Asset Class') === 'crypto' || lowerRow(row, 'assetClass') === 'crypto') return true;
  if (String(row?.['Yahoo Symbol'] || '').toUpperCase().startsWith('CRYPTO:')) return true;
  return directCryptoSymbols.has(tickerText(row));
}

function filterPortfolioByScope(portfolio) {
  if (scope === 'combined') return portfolio;
  if (!['stocks', 'stock'].includes(scope)) throw new Error(`Unsupported portfolio scope: ${scope}`);
  const holdings = (portfolio.holdings || []).filter(holding => isCash(holding) || !isDirectCryptoRow(holding));
  const tickers = new Set(holdings.map(tickerText));
  const keepTicker = value => tickers.has(String(value || '').trim().toUpperCase());
  const transactions = (portfolio.transactions || []).filter(tx => keepTicker(tx.ticker) || !isDirectCryptoRow(tx));
  const saleInScope = sale => {
    if (keepTicker(sale.Ticker)) return true;
    const saleTicker = String(sale.Ticker || '').trim().toUpperCase();
    const saleDate = String(sale['Sale Date'] || '').slice(0, 10);
    const saleShares = asNumber(sale['Shares Sold']);
    const tx = (portfolio.transactions || []).find(item => String(item.ticker || '').trim().toUpperCase() === saleTicker
      && String(item.date || '').slice(0, 10) === saleDate
      && String(item.action || '').toLowerCase() === 'sell'
      && (!saleShares || asNumber(item.shares) === saleShares));
    return tx ? !isDirectCryptoRow(tx) : true;
  };
  return {
    ...portfolio,
    holdings,
    transactions,
    salesLog: (portfolio.salesLog || []).filter(saleInScope),
    activities: (portfolio.activities || []).filter(row => !row.ticker || keepTicker(row.ticker) || !isDirectCryptoRow(row)),
    theses: (portfolio.theses || []).filter(row => keepTicker(row.ticker)),
    decisionRecords: (portfolio.decisionRecords || []).filter(row => !row.ticker || keepTicker(row.ticker) || !isDirectCryptoRow(row))
  };
}

function eventDate(value) {
  const text = String(value || '').slice(0, 10);
  const time = new Date(`${text}T00:00:00`).getTime();
  return Number.isFinite(time) ? text : null;
}

function portfolioStartDate(portfolio) {
  return [
    ...(portfolio.activities || []).map(activity => eventDate(activity.date)),
    ...(portfolio.transactions || []).map(transaction => eventDate(transaction.date))
  ].filter(Boolean).sort()[0] || null;
}

function saleBenchmarkStartDates(portfolio) {
  return [...new Set((portfolio.salesLog || [])
    .map(sale => String(sale['Sale Date'] || '').slice(0, 10))
    .filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value)))]
    .sort()
    .slice(0, 80);
}

function livePriceSymbols(portfolio) {
  return [...new Set([
    ...(portfolio.holdings || []).filter(h => !isCash(h)).map(quoteSymbol),
    ...(portfolio.salesLog || []).map(sale => saleQuoteSymbol(sale.Ticker))
  ])].filter(Boolean);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const type = response.headers.get('content-type') || '';
  if (!type.includes('json')) {
    const text = await response.text();
    throw new Error(`Expected JSON from ${url}, received ${type || 'unknown'}: ${text.slice(0, 80)}`);
  }
  return response.json();
}

async function loadPortfolio() {
  const candidates = [
    `${source}/src/data/portfolio.json`,
    `${source}/data/portfolio.json`,
    `${source}/portfolio.json`
  ];
  let lastError;
  for (const url of candidates) {
    try {
      return await fetchJson(url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Could not load Portfolio OS portfolio JSON');
}

async function loadPrices(portfolio) {
  const symbols = livePriceSymbols(portfolio);
  if (!symbols.length) return null;
  const startDate = portfolioStartDate(portfolio);
  const benchmarkStarts = saleBenchmarkStartDates(portfolio);
  const params = new URLSearchParams({ symbols: symbols.join(',') });
  if (startDate) params.set('benchmarkStart', startDate);
  if (benchmarkStarts.length) params.set('benchmarkStarts', benchmarkStarts.join(','));
  try {
    return await fetchJson(`${source}/_api/prices?${params}`);
  } catch (error) {
    console.warn(`Live pricing unavailable; using Portfolio OS snapshot values. ${error.message}`);
    return null;
  }
}

function deriveModel(portfolio, priceData) {
  const liveHoldings = (portfolio.holdings || []).map(holding => {
    const symbol = quoteSymbol(holding);
    const quote = priceData?.quotes?.[symbol];
    const shares = asNumber(holding.Shares);
    const costBasis = asNumber(holding['Cost Basis CAD']);
    if (!quote || !quote.priceCad || isCash(holding)) return { ...holding };
    const currentValue = shares * quote.priceCad;
    const unrealized = currentValue - costBasis;
    const dailyPnl = quote.previousCloseCad ? shares * (quote.priceCad - quote.previousCloseCad) : null;
    return {
      ...holding,
      'Live Price Snapshot': quote.price,
      'Live Price Currency': quote.currency,
      'Live Price CAD': quote.priceCad,
      'Previous Close CAD': quote.previousCloseCad ?? null,
      'Daily P/L CAD': dailyPnl,
      'Live Price Provider': quote.provider,
      'Live Price As Of': quote.asOf,
      'Current Value (Native)': shares * quote.price,
      'Current Value CAD': currentValue,
      'Unrealized P/L CAD': unrealized,
      'Unrealized P/L %': costBasis ? unrealized / costBasis : 0
    };
  });

  const totalValue = liveHoldings.reduce((sum, h) => sum + asNumber(h['Current Value CAD']), 0);
  const holdings = liveHoldings.map(h => ({ ...h, 'Portfolio Weight %': totalValue ? asNumber(h['Current Value CAD']) / totalValue : 0 }));
  const costBasis = holdings.reduce((sum, h) => sum + asNumber(h['Cost Basis CAD']), 0);
  const realized = (portfolio.salesLog || []).reduce((sum, s) => sum + asNumber(s['Realized P/L CAD']), 0);
  const investmentGainCad = totalValue - costBasis + realized;
  const capitalBase = costBasis;
  const sinceStartReturn = capitalBase > 0 ? investmentGainCad / capitalBase : null;
  const cashValue = holdings.filter(isCash).reduce((sum, h) => sum + asNumber(h['Current Value CAD']), 0);
  return { holdings, totalValue, costBasis, realized, investmentGainCad, sinceStartReturn, cashValue, pricing: priceData };
}

const bucketRules = [
  ['Cash / dry powder', h => isCash(h)],
  ['AI platforms / compute / software', h => new Set(['AI compute', 'Cloud / AI / commerce', 'Edge AI / semis', 'Enterprise workflow AI', 'Broad technology', 'Cloud / AI software']).has(h.Theme)],
  ['Digital assets / tokenization', h => new Set(['Crypto / AI infrastructure', 'Bitcoin', 'Ethereum', 'Stablecoins / fintech', 'Blockchain', 'Digital assets infrastructure']).has(h.Theme)],
  ['Physical AI / robotics', h => /robot/i.test(`${h.Theme || ''} ${h.Name || ''} ${h.Ticker || ''}`)],
  ['Biotech / health innovation', h => /biotech|health|psychedelic/i.test(`${h.Theme || ''} ${h.Name || ''}`)],
  ['Mobility / media / other', () => true]
];

function groupedWeights(holdings, totalValue) {
  const buckets = new Map(bucketRules.map(([label]) => [label, 0]));
  for (const h of holdings) {
    const [, , label] = bucketRules.map(([name, test]) => test(h) ? name : null).find(Boolean) || [];
    const key = label || bucketRules.find(([, test]) => test(h))?.[0] || 'Mobility / media / other';
    buckets.set(key, (buckets.get(key) || 0) + asNumber(h['Current Value CAD']));
  }
  // The map above intentionally preserves public display order.
  return [...buckets.entries()].map(([label, value]) => ({ label, value, weight: totalValue ? value / totalValue : 0 }));
}

function allocationBuckets(holdings, totalValue) {
  const rows = bucketRules.map(([label, test]) => ({ label, value: holdings.filter(test).reduce((sum, h) => sum + asNumber(h['Current Value CAD']), 0) }));
  let claimed = rows.slice(0, -1).reduce((sum, row) => sum + row.value, 0);
  rows[rows.length - 1].value = Math.max(0, totalValue - claimed);
  return rows.map(row => ({ ...row, weight: totalValue ? row.value / totalValue : 0 }));
}

function assetMix(holdings, totalValue) {
  const map = new Map();
  for (const h of holdings) {
    const label = h['Asset Class'] || (isCash(h) ? 'Cash' : 'Equity');
    map.set(label, (map.get(label) || 0) + asNumber(h['Current Value CAD']));
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value, weight: totalValue ? value / totalValue : 0 }))
    .sort((a, b) => b.value - a.value);
}

function publicTicker(holding) {
  if (isCash(holding)) return 'CAD';
  return String(holding.Ticker || '').toUpperCase();
}

function convictionLabel(value) {
  const clean = String(value || 'TBD').trim();
  if (/cash|tactical/i.test(clean)) return clean.replace(/\b\w/g, c => c.toUpperCase());
  const label = clean.replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase()).replace('Tbd', 'TBD');
  return `${label} conviction`;
}

function holdingCard(holding) {
  const risk = holding['Key Risk'] || holding['Kill Criteria'] || holding['Bear Case'] || 'Reassess if the original thesis stops matching the evidence.';
  return `<article class="holding-card"><div class="holding-top"><div><span class="ticker">${escapeHtml(publicTicker(holding))}</span><h3>${escapeHtml(holding.Name || publicTicker(holding))}</h3></div><strong>${pct(holding['Portfolio Weight %'])}</strong></div><div class="holding-tags"><span>${escapeHtml(holding.Theme || 'Uncategorized')}</span><span>${escapeHtml(convictionLabel(holding.Conviction))}</span><span>Reviewed ${escapeHtml(String(holding['Last Reviewed'] || 'TBD').slice(0, 10))}</span></div><p>${paragraph(holding['Thesis TLDR'] || holding.Thesis)}</p><div class="risk-note"><span class="kicker">What could change the view</span><p>${paragraph(risk)}</p></div></article>`;
}

function localDate(isoOrDate = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(isoOrDate));
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function render({ portfolio, model }) {
  const generatedDate = localDate(model.pricing?.asOf || new Date());
  const pageTitle = scope === 'stocks' || scope === 'stock' ? 'Current stock portfolio.' : 'Current portfolio.';
  const leadText = scope === 'stocks' || scope === 'stock'
    ? 'What Edge Investing owns in the public stock portfolio, roughly how it is weighted, and the thesis behind each position. Direct crypto wallet/exchange holdings are excluded from this snapshot.'
    : 'What Edge Investing owns, roughly how it is weighted, and the thesis behind each position. Updated from the current Portfolio OS holdings export.';
  const holdings = [...model.holdings].sort((a, b) => asNumber(b['Current Value CAD']) - asNumber(a['Current Value CAD']));
  const allocations = allocationBuckets(holdings, model.totalValue);
  const assets = assetMix(holdings, model.totalValue);
  const largest = holdings[0];
  const largestActive = holdings.find(h => !isCash(h));
  const returnText = model.sinceStartReturn === null ? '—' : signedPct(model.sinceStartReturn);
  const provider = model.pricing?.provider || 'snapshot';

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Current Portfolio · Edge Investing</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="A current public snapshot of the Edge Investing portfolio: approximate weights, themes, thesis notes, and portfolio change history."><link rel="stylesheet" href="/brand/colors_and_type.css"><style>
  .portfolio-hero{padding:92px 0 70px;border-bottom:1px solid var(--rule);position:relative;overflow:hidden}.portfolio-hero:after{content:"";position:absolute;right:4vw;top:80px;width:360px;height:360px;background:url('/brand/assets/logo-monogram.svg') center/contain no-repeat;opacity:.045;pointer-events:none}.hero-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:56px;align-items:end;position:relative;z-index:1}.hero-copy h1{max-width:900px}.hero-copy .lead{margin-top:26px;max-width:760px}.snapshot-card{background:var(--ink);color:var(--paper);border:1px solid var(--ink);padding:30px;box-shadow:12px 12px 0 rgba(11,15,14,.10)}.snapshot-card .kicker{color:rgba(244,241,236,.62)}.big-return{font-family:var(--mono);font-size:clamp(48px,7vw,82px);line-height:.95;margin:18px 0 10px;color:var(--edge);font-weight:600;letter-spacing:-.05em}.snapshot-card p{color:rgba(244,241,236,.72);line-height:1.55}.summary-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid var(--rule);border-top:1px solid var(--rule)}.summary-strip div{padding:24px;border-right:1px solid var(--rule);background:var(--paper-2)}.summary-strip div:last-child{border-right:none}.summary-strip span{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}.summary-strip strong{display:block;margin-top:8px;font-family:var(--mono);font-size:24px;font-variant-numeric:tabular-nums}.method-note{padding:20px 0;border-bottom:1px solid var(--rule);color:var(--muted);font-size:14px;line-height:1.55}.method-note a{color:var(--edge-deep);font-weight:700;text-decoration:none}.alloc-section{padding:74px 0;border-bottom:1px solid var(--rule)}.alloc-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:24px;margin-top:28px}.alloc-stack{display:grid;gap:10px}.alloc-card{background:var(--paper);border:1px solid var(--rule);padding:16px 18px}.alloc-card span{display:block;color:var(--ink-2)}.alloc-card strong{display:block;margin-top:5px;font-family:var(--mono);font-size:22px}.alloc-bar{height:10px;background:var(--paper-3);margin-top:12px}.alloc-bar i{display:block;height:100%;background:var(--edge-deep)}.asset-box{background:var(--paper-2);border:1px solid var(--rule);padding:24px}.asset-box h3{margin-bottom:16px}.asset-box div div{display:flex;justify-content:space-between;gap:18px;border-top:1px solid var(--rule);padding:13px 0;font-family:var(--mono);font-size:13px}.change-section{padding:74px 0;border-bottom:1px solid var(--rule);background:var(--paper-2)}.change-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:28px}.change-card{background:var(--paper);border:1px solid var(--rule);padding:22px}.change-card strong{display:block;font-family:var(--mono);font-size:28px;color:var(--edge-deep)}.change-card p{margin-top:10px;color:var(--ink-2);line-height:1.5}.holdings-section{padding:82px 0}.holdings-head{display:flex;justify-content:space-between;gap:28px;align-items:end;margin-bottom:28px}.holdings-head p{max-width:560px;color:var(--ink-2)}.holdings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.holding-card{background:var(--paper);border:1px solid var(--rule);padding:24px;display:flex;flex-direction:column;gap:16px}.holding-card:hover{border-color:var(--ink)}.holding-top{display:flex;justify-content:space-between;align-items:start;gap:20px;border-bottom:1px solid var(--rule);padding-bottom:14px}.holding-top strong{font-family:var(--mono);font-size:28px;color:var(--edge-deep);font-variant-numeric:tabular-nums}.ticker{font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--muted)}.holding-card h3{margin-top:4px;font-size:30px}.holding-tags{display:flex;gap:8px;flex-wrap:wrap}.holding-tags span{background:var(--paper-2);border:1px solid var(--rule);padding:6px 8px;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2)}.holding-card>p{font-size:16px;line-height:1.55;color:var(--ink-2)}.risk-note{margin-top:auto;background:var(--paper-2);border-left:4px solid var(--rust);padding:14px}.risk-note p{margin-top:6px;color:var(--ink-2);font-size:14px;line-height:1.5}.disclosure{background:var(--ink);color:var(--paper);padding:52px 0}.disclosure p{max-width:920px;color:rgba(244,241,236,.72);line-height:1.65}@media(max-width:900px){.hero-grid,.alloc-grid,.holdings-grid,.change-grid{grid-template-columns:1fr}.summary-strip{grid-template-columns:1fr 1fr}.holdings-head{display:block}}@media(max-width:560px){.portfolio-hero{padding:64px 0 46px}.summary-strip{grid-template-columns:1fr}.summary-strip div{border-right:none;border-bottom:1px solid var(--rule)}.summary-strip div:last-child{border-bottom:none}}
</style></head><body><header class="nav"><div class="nav-in"><a href="/"><img class="brand-logo" src="/brand/assets/logo-lockup.svg" alt="The Edge Investing Research"></a><details class="nav-menu"><summary>Menu</summary><div class="nav-menu-panel"><a href="/">Home</a><a href="/portfolio/">Current Portfolio</a><a href="/portfolio/archive/">Portfolio Archive</a><a href="/research/thesis/">Philosophy</a><div class="nav-section"><span>Research</span><div class="nav-sub"><a href="/research/">All research</a><a href="/research/#primers">Primers</a><a href="/research/#thesis-briefs">Thesis</a><a href="/research/#research-boards">Research boards</a></div></div><a href="/articles/">Articles</a><a href="https://x.com/Theedge698598" target="_blank" rel="noopener noreferrer">Follow on X</a></div></details></div></header><main><section class="portfolio-hero"><div class="shell hero-grid"><div class="hero-copy"><span class="kicker">Public portfolio snapshot · percentages only</span><h1>${pageTitle}</h1><p class="lead">${leadText}</p></div><aside class="snapshot-card"><span class="kicker">Estimated tracked return</span><div class="big-return">${returnText}</div><p>Based on the Portfolio OS current records. This is an estimate, not a brokerage statement.</p></aside></div></section><section class="summary-strip"><div><span>Portfolio lines</span><strong>${holdings.length}</strong></div><div><span>Largest line</span><strong>${escapeHtml(publicTicker(largest))} · ${pct(largest['Portfolio Weight %'])}</strong></div><div><span>Price snapshot</span><strong>${generatedDate}</strong></div><div><span>Last generated</span><strong>${generatedDate}</strong></div></section><div class="shell method-note"><a href="/portfolio/archive/">View portfolio archive →</a><br><br>Method: weights are based on the current Portfolio OS holdings export and rounded for public display. The allocation map consolidates related holdings into larger thesis buckets. Holdings may change without notice. No share counts, dollar values, average cost, or exact trade prices are published. Pricing source: ${escapeHtml(provider)}.</div><section class="alloc-section"><div class="shell"><div class="section-head"><span class="kicker">Allocation map</span><div><h2>Where the portfolio is pointed.</h2><p>Concentrated by design. These are grouped by thesis, not by individual ticker, so related positions roll up into the bigger portfolio bets.</p></div></div><div class="alloc-grid"><div class="alloc-stack">${allocations.map(row => `<div class="alloc-card"><span>${escapeHtml(row.label)}</span><strong>${pct(row.weight)}</strong><div class="alloc-bar"><i style="width:${pct(row.weight)}"></i></div></div>`).join('\n')}</div><aside class="asset-box"><h3>Asset mix</h3><div>${assets.map(row => `<div><span>${escapeHtml(row.label)}</span><strong>${pct(row.weight)}</strong></div>`).join('')}</div></aside></div></div></section><section class="change-section"><div class="shell"><div class="section-head"><span class="kicker">Latest portfolio changes</span><div><h2>What changed since the last snapshot.</h2><p>The current snapshot reflects the latest Portfolio OS data from ${generatedDate}, including live/snapshot pricing, public weights, and current thesis notes.</p></div></div><div class="change-grid"><article class="change-card"><strong>${escapeHtml(publicTicker(largest))} remains largest</strong><p>${escapeHtml(largest.Name || publicTicker(largest))} is currently the largest line at about ${pct(largest['Portfolio Weight %'])}.</p></article><article class="change-card"><strong>${escapeHtml(publicTicker(largestActive))} leads active positions</strong><p>The largest non-cash position is ${escapeHtml(largestActive.Name || publicTicker(largestActive))} at about ${pct(largestActive['Portfolio Weight %'])}.</p></article><article class="change-card"><strong>Portfolio lines refreshed</strong><p>The public page now includes the current ${holdings.length}-line portfolio and updated public allocation map.</p></article></div></div></section><section class="holdings-section"><div class="shell"><div class="holdings-head"><div><span class="kicker">Portfolio lines by weight</span><h2>Owned for a reason.</h2></div><p>Each card shows approximate portfolio weight, thesis, conviction/status, and the main risk that would force a rethink. Cash is shown as dry powder, not a security.</p></div><div class="holdings-grid">${holdings.map(holdingCard).join('\n')}</div></div></section><section class="disclosure"><div class="shell"><span class="kicker">Disclosure</span><p>This page is for transparency and research context only. It is not investment advice, a recommendation, or a solicitation to buy or sell securities. Edge Investing may buy, sell, trim, add to, or exit any position without updating this page immediately.</p></div></section></main><section class="follow-cta"><div class="follow-cta-in"><div><span class="handle">@Theedge698598</span><h2>Follow The Edge on X.</h2><p>Get new research, thesis updates, catalyst notes, and risk checks as they publish.</p></div><a class="btn primary" href="https://x.com/Theedge698598" target="_blank" rel="noopener noreferrer">Follow on X →</a></div></section><footer class="site-footer"><div class="site-footer-grid"><div class="footer-brand"><img class="footer-logo" src="/brand/assets/logo-lockup.svg" alt="The Edge Investing Research"><p>Edge Investing publishes plain-English research for serious retail investors. Not investment advice.</p></div><nav class="footer-column" aria-label="Footer research"><span class="kicker">Research</span><a href="/research/ai-agent-control-tower/">AI Agent Control Tower</a><a href="/research/maple/">Maple Finance</a><a href="/research/qcom/">Qualcomm</a><a href="/research/galaxy/">Galaxy Digital</a><a href="/research/ai/">AI Alpha Leaderboard</a></nav><nav class="footer-column" aria-label="Footer site"><span class="kicker">Site</span><a href="/portfolio/">Current Portfolio</a><a href="/portfolio/archive/">Portfolio Archive</a><a href="/research/">Research Library</a><a href="/research/thesis/">Investment Philosophy</a><a href="/articles/">Articles</a></nav><nav class="footer-column" aria-label="Footer social"><span class="kicker">Follow</span><a href="https://x.com/Theedge698598" target="_blank" rel="noopener noreferrer">X / Twitter</a><a href="https://x.com/Theedge698598" target="_blank" rel="noopener noreferrer">@Theedge698598</a></nav></div><div class="site-footer-bottom"><span>© 2026 Edge Investing, Inc.</span><span>Made for retail investors, by retail investors.</span></div></footer></body></html>`;
}

const portfolio = filterPortfolioByScope(await loadPortfolio());
const prices = await loadPrices(portfolio);
const model = deriveModel(portfolio, prices);
const html = render({ portfolio, model });
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, html);
console.log(`Generated ${output}`);
console.log(`Source: ${source}`);
console.log(`Scope: ${scope}`);
console.log(`Lines: ${model.holdings.length}; total CAD: ${money.format(model.totalValue)}; return: ${model.sinceStartReturn === null ? '—' : signedPct(model.sinceStartReturn)}; pricing: ${prices?.provider || 'snapshot'}`);
