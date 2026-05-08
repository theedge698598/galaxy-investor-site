---
version: alpha
name: Edge Investing
description: Agent-readable design contract for Edge Investing. Edge is a premium retail-investor research brand: warm editorial trust, sharp data discipline, and calm conviction. The system combines a warm paper/ink editorial canvas, the wedge “E” mark, Fraunces display typography, Inter Tight UI/body typography, JetBrains Mono data/metadata typography, and a restrained financial data palette led by signature Edge Green, Rust, Gold, and Sky. Use this file to generate Edge-native UI; treat the HTML/React brand bible in this directory as the canonical visual source.

colors:
  ink: "#0B0F0E"
  ink-2: "#1A201E"
  ink-3: "#2A302E"
  paper: "#F4F1EC"
  paper-2: "#ECE7DF"
  paper-3: "#E2DCD2"
  rule: "#D6CFC2"
  muted: "#6B6962"
  edge: "oklch(72% 0.17 145)"
  edge-deep: "oklch(46% 0.13 150)"
  edge-soft: "oklch(92% 0.06 145)"
  rust: "oklch(62% 0.16 45)"
  rust-soft: "oklch(92% 0.05 50)"
  gold: "oklch(78% 0.13 85)"
  sky: "oklch(70% 0.10 230)"
  on-ink: "#F4F1EC"
  on-paper: "#0B0F0E"

typography:
  display-01:
    fontFamily: "Fraunces, Times New Roman, serif"
    fontSize: 144px
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
    fontVariationSettings: "opsz 144"
  display-02:
    fontFamily: "Fraunces, Times New Roman, serif"
    fontSize: 84px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: "-0.02em"
    fontVariationSettings: "opsz 144"
  h1:
    fontFamily: "Fraunces, Times New Roman, serif"
    fontSize: 56px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariationSettings: "opsz 144"
  h2:
    fontFamily: "Fraunces, Times New Roman, serif"
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
    fontVariationSettings: "opsz 144"
  h3:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  body-sm:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  caption:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0"
  data-metric:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "0"
    fontVariantNumeric: "tabular-nums"
  mono-label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.15em"
    textTransform: "uppercase"

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 24px
  icon: 32px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 120px

components:
  page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  section-editorial:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    borderTop: "1px solid {colors.rule}"
    padding: "120px 80px"
  section-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    borderTop: "1px solid rgba(244,241,236,.12)"
    padding: "120px 80px"
  card-editorial:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.rule}"
    rounded: "{rounded.none}"
    padding: 28px
  card-muted:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.rule}"
    rounded: "{rounded.none}"
    padding: 24px
  card-dark:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    border: "1px solid rgba(244,241,236,.10)"
    rounded: "{rounded.none}"
    padding: 28px
  button-primary:
    backgroundColor: "{colors.edge}"
    textColor: "{colors.ink}"
    typography: "{typography.mono-label}"
    rounded: "{rounded.none}"
    padding: "14px 18px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    border: "1px solid {colors.ink}"
    typography: "{typography.mono-label}"
    rounded: "{rounded.none}"
    padding: "14px 18px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.mono-label}"
    rounded: "{rounded.none}"
    padding: "14px 18px"
  eyebrow:
    textColor: "{colors.muted}"
    typography: "{typography.mono-label}"
  data-chip-positive:
    backgroundColor: "{colors.edge-soft}"
    textColor: "{colors.edge-deep}"
    typography: "{typography.mono-label}"
    rounded: "{rounded.none}"
    padding: "8px 10px"
  data-chip-risk:
    backgroundColor: "{colors.rust-soft}"
    textColor: "{colors.rust}"
    typography: "{typography.mono-label}"
    rounded: "{rounded.none}"
    padding: "8px 10px"
  article-header:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    borderBottom: "1px solid {colors.rule}"
    padding: "64px 80px 48px"
  thesis-sidebar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.ink}"
    padding: 24px
  dashboard-panel:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    border: "1px solid rgba(244,241,236,.10)"
    rounded: "{rounded.none}"
    padding: 24px
  sparkline-positive:
    strokeColor: "{colors.edge-deep}"
    fillColor: "{colors.edge-soft}"
  sparkline-risk:
    strokeColor: "{colors.rust}"
    fillColor: "{colors.rust-soft}"
---

# Edge Investing DESIGN.md

## 1. Visual Theme & Atmosphere

Edge Investing should feel like a premium financial magazine with a live research terminal quietly underneath it. The brand is not generic fintech, not a neon trading app, and not cold enterprise SaaS. It is warm, literate, sharp, and useful.

The default surface is warm paper (`{colors.paper}`), not pure white. Text is near-black ink (`{colors.ink}`), supported by soft paper tiers (`{colors.paper-2}`, `{colors.paper-3}`) and precise rule lines (`{colors.rule}`). The visual system should feel printed and editorial: structured columns, hairline dividers, generous margins, serious typography, and no decorative fluff.

The product/data side appears through disciplined use of JetBrains Mono, tabular numbers, small uppercase labels, compact charts, thesis sidebars, catalyst trackers, risk checklists, and scenario tables. Data color carries meaning. It is not confetti.

**Key characteristics:**
- Warm paper and ink editorial foundation.
- Wedge “E” mark: three bars clipped by a diagonal edge; reads as E, upward chart, and sharpened edge.
- Fraunces display type for high-trust editorial weight.
- Inter Tight for readable UI, cards, body, nav, and product surfaces.
- JetBrains Mono for tickers, metadata, dates, labels, financial data, and source notes.
- Signature Edge Green for confirmed positive signal/action.
- Rust for downside/risk; Gold for watch/caution/catalysts; Sky for neutral benchmark/peer/market lines.
- Square, rule-driven layouts. Avoid bubbly SaaS rounding.
- Premium retail clarity: smart without institutional jargon overload.

## 2. Color Palette & Roles

### Core surfaces
- **Ink** (`{colors.ink}` — `#0B0F0E`): Primary text, dark backgrounds, high-emphasis rules.
- **Ink 2** (`{colors.ink-2}` — `#1A201E`): Secondary dark panels and secondary body text.
- **Ink 3** (`{colors.ink-3}` — `#2A302E`): Raised dark panels and chart/dash surfaces.
- **Paper** (`{colors.paper}` — `#F4F1EC`): Default page background.
- **Paper 2** (`{colors.paper-2}` — `#ECE7DF`): Muted cards, callouts, table rows.
- **Paper 3** (`{colors.paper-3}` — `#E2DCD2`): Raised/selected surfaces, subtle chart range fills.
- **Rule** (`{colors.rule}` — `#D6CFC2`): Hairline borders and editorial dividers.
- **Muted** (`{colors.muted}` — `#6B6962`): Metadata, source notes, timestamps, quiet labels.

### Accent/data semantics
- **Edge Green** (`{colors.edge}`): Brand/action color and confirmed bullish/up signal. Use sparingly.
- **Edge Deep** (`{colors.edge-deep}`): Accessible positive text on paper; use when green must carry text meaning.
- **Edge Soft** (`{colors.edge-soft}`): Bull-case fills, scenario bands, positive chip backgrounds.
- **Rust** (`{colors.rust}`): Bear case, downside, risk, thesis concern. Reads as concern, not panic.
- **Rust Soft** (`{colors.rust-soft}`): Bear-case fills and risk-chip backgrounds.
- **Gold** (`{colors.gold}`): Watch, caution, catalyst pending, earnings/event markers.
- **Sky** (`{colors.sky}`): Neutral benchmark, peer average, market index, comparison line.

### Accessibility rules
- Ink on Paper is the default high-contrast pairing.
- Never set long body text in Edge Green on Paper; use Edge Deep for green text.
- Do not use accent colors for ordinary numbers. Accents must encode meaning.
- In dark mode, keep Edge Green unchanged but use Paper for all main text.

## 3. Typography Rules

### Font families
- **Display/editorial:** `Fraunces`, fallback `Times New Roman`, serif.
- **Body/UI:** `Inter Tight`, fallback system sans.
- **Data/metadata:** `JetBrains Mono`, fallback `ui-monospace`.

### Hierarchy

| Role | Font | Size | Weight | Line height | Tracking | Use |
|---|---|---:|---:|---:|---:|---|
| Display 01 | Fraunces | 144px | 400 | .95 | -3% | Hero statements, brand moments |
| Display 02 | Fraunces Italic/Roman | 84px | 400 | 1.0 | -2% | Section leads, large editorial pages |
| H1 | Fraunces | 56px | 400 | 1.1 | -2% | Article/page titles |
| H2 | Fraunces | 36px | 400 | 1.15 | -1% | Article sections, major cards |
| H3 | Inter Tight | 22px | 600 | 1.4 | 0 | UI/content section titles |
| Body | Inter Tight | 17px | 400 | 1.55 | 0 | Research copy and page body |
| Body Small | Inter Tight | 14px | 400 | 1.55 | 0 | Cards, footnotes, dense UI |
| Caption | Inter Tight | 13px | 400 | 1.45 | 0 | Source notes, captions |
| Data Metric | JetBrains Mono | 32px | 500 | 1.1 | 0 | Returns, valuation, confidence, key metrics |
| Mono Label | JetBrains Mono | 11px | 400 | 1.4 | .15em | Uppercase metadata, dates, tickers, sections |

### Typography principles
- Fraunces carries the editorial authority. Use it for headlines, pull quotes, article openers, and thesis statements.
- Inter Tight carries the product clarity. Use it for body, nav, controls, cards, and dashboard labels.
- JetBrains Mono carries data credibility. Use it for tickers, dates, percentages, prices, confidence scores, and source/catalyst metadata.
- Use tabular figures for financial data.
- Avoid heavy bolding. Create hierarchy with size, spacing, rules, and typeface role.

## 4. Component Stylings

### Buttons
- Primary buttons use Edge Green, square corners, and mono uppercase labels.
- Secondary buttons are transparent or paper-backed with a 1px Ink border.
- Dark buttons use Ink background with Paper text.
- Avoid pill buttons unless the component is explicitly a small data/status chip.

### Cards
- Default cards are editorial blocks: Paper background, 1px Rule border, square corners, no shadow.
- Muted cards use Paper 2 and are best for thesis updates, earnings snapshots, watchlist notes, and warnings.
- Dark cards use Ink 2 with subtle paper-alpha borders for dashboards/product surfaces.
- Do not use generic SaaS “floating cards” with soft shadows.

### Article template
Use a two-column research layout:
- Left column: editorial article body.
- Right column: sticky thesis/sidebar containing thesis bullets, scenarios, risk notes, confidence, and disclosure.
- Article header includes metadata row, large Fraunces headline, serif deck, and a four-column fact strip.
- Published date is required. If meaningfully updated, include both published and updated dates.

### Data components
- **Scenario table:** Bull/Base/Bear rows. Bull uses Edge Deep/Edge Soft, Bear uses Rust/Rust Soft, Base uses Ink/Paper.
- **Risk checklist:** square checkboxes, rule lines, short direct labels.
- **Catalyst tracker:** date, ticker/event, small Gold dot for pending or high-attention events.
- **Valuation range:** neutral base range with Edge Soft/Rust Soft fills only when bull/bear meaning is explicit.
- **Sparklines:** thin strokes, restrained fills, no glossy chart effects.

### Logo/mark
- Use the wedge “E” mark from `src/logo.jsx`.
- The mark should usually be Ink on Paper, Paper on Ink, or Edge Green on Ink.
- Do not redraw the mark with rounded bars, gradients, outlines, or decorative effects.

## 5. Layout Principles

- Use editorial grids, not app-store landing-page blobs.
- Prefer clear columns, strict gutters, and visible rule lines.
- Default section padding: `120px 80px` on desktop.
- Section headers often use a two-column layout: mono eyebrow column + large Fraunces title column.
- Leave generous whitespace around major statements.
- Keep data-dense modules compact and aligned.
- Use square corners by default. Small radius is acceptable only for app/icon contexts.
- Let charts and research templates provide visual interest; do not decorate the chrome.

## 6. Depth & Elevation

Edge mostly avoids elevation. Hierarchy comes from:
- surface changes: Paper → Paper 2 → Paper 3, or Ink → Ink 2 → Ink 3;
- 1px rule lines;
- typography scale;
- spacing and column structure;
- data color semantics.

Do not use glassmorphism, blur panels, heavy drop shadows, neon glows, or glossy gradients.

## 7. Do’s and Don’ts

### Do
- Make it feel like serious investing research for smart retail investors.
- Use warm paper backgrounds.
- Use Fraunces for editorial authority.
- Use JetBrains Mono for every ticker, date, price, percentage, source label, and confidence score.
- Use Edge Green only when something is actually positive/actionable.
- Use Rust for downside/risk and Gold for watch/caution/catalysts.
- Show the “why” behind investment ideas: thesis, catalysts, risks, valuation, and what would disprove the thesis.
- Keep language clear and retail-investor friendly.

### Don’t
- Don’t make it look like generic fintech, crypto, trading, or AI SaaS.
- Don’t use cold white/gray default dashboards unless intentionally contrasted with Edge paper.
- Don’t overuse green. Green is signal, not decoration.
- Don’t use red panic UI for ordinary downside. Use Rust.
- Don’t use rounded bubbly cards, glass panels, random gradients, emoji-heavy visuals, or neon terminal aesthetics.
- Don’t hide data meaning behind vague pretty charts.
- Don’t use institutional jargon unless explained plainly.

## 8. Responsive Behavior

- Desktop: retain editorial two-column layouts where possible.
- Tablet: collapse section header grids from eyebrow/title columns into stacked blocks; reduce section padding to ~72px 32px.
- Mobile: single-column articles and cards; sticky thesis sidebar becomes an inline thesis block below the deck.
- Minimum tap target: 44px.
- Tables should collapse into stacked rows or horizontally scroll only when preserving numeric comparison matters.
- Keep metadata readable; do not shrink mono labels below 10px.
- Display type should scale aggressively down on mobile to avoid awkward wraps.

## 9. Agent Prompt Guide

When generating Edge UI, follow this checklist:

1. Start from warm Paper (`#F4F1EC`) and Ink (`#0B0F0E`).
2. Use Fraunces for headlines and article leads.
3. Use Inter Tight for body and UI.
4. Use JetBrains Mono for tickers, dates, numbers, metrics, confidence scores, and source notes.
5. Add visible rule lines instead of shadows.
6. Use square editorial cards, not rounded SaaS cards.
7. Use Edge Green, Rust, Gold, and Sky only as semantic data colors.
8. For research pages, include thesis, catalysts, valuation, risks, and failure conditions.
9. For article cards/index cards, always show published date; if applicable, also show updated date.
10. Make the page feel premium, calm, sharp, and retail-clear.

Example instruction:

> Build this as an Edge Investing page. Read DESIGN.md first. Use the Edge paper/ink editorial system, Fraunces headlines, Inter Tight body, JetBrains Mono metadata, square rule-driven cards, and semantic data colors. Avoid generic SaaS styling. Make it feel like premium investment research for smart retail investors.

## Source of Truth

This file is an agent-readable implementation guide. The canonical visual source remains the Edge brand bible in this directory:

- `index.html`
- `src/logo.jsx`
- `src/primitives.jsx`
- `src/sections-*.jsx`
- `Edge_Investing_Brand_Refresh.zip`

If this file conflicts with the brand bible, update this file to match the brand bible, not the other way around.
