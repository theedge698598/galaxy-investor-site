# galaxy-investor-site
Galaxy Digital Coverage

## Current portfolio page

Regenerate the public current-portfolio page from the active Portfolio OS instance:

```bash
node scripts/generate-current-portfolio.mjs --source=http://127.0.0.1:5201
```

The script writes `portfolio/index.html`, publishes percentages only, and uses Portfolio OS live pricing when `/_api/prices` is available. Override the source with `PORTFOLIO_OS_SOURCE` if Portfolio OS is running on another port.
