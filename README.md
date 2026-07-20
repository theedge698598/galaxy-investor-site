# galaxy-investor-site
Galaxy Digital Coverage

## Current portfolio page

Regenerate the public current-portfolio page from the active Portfolio OS instance:

```bash
node scripts/generate-current-portfolio.mjs --source=http://127.0.0.1:5175 --scope=stocks
```

The script writes `portfolio/index.html`, publishes the stock-only portfolio percentages, and uses Portfolio OS live pricing when `/_api/prices` is available. Override the source with `PORTFOLIO_OS_SOURCE` if Portfolio OS is running on another port. Use `--scope=combined` only for a deliberate combined stock-plus-crypto snapshot.
