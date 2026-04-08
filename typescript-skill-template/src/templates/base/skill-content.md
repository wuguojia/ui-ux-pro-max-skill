# {{TITLE}}

{{DESCRIPTION}}

## How to Use This {{SKILL_OR_WORKFLOW}}

When the user asks for web development knowledge, best practices, or coding tips, search the knowledge base:

```bash
npx tsx {{SCRIPT_PATH}} "<query>" [--domain <domain>]
```

### Available Domains

| Domain | Description | Example Query |
|--------|-------------|---------------|
| knowledge | Programming knowledge base (React, TypeScript, JavaScript, etc.) | "React hooks with TypeScript" |
| tips | Best practices and guidelines | "accessibility best practices" |

### Domain Auto-Detection

The search will automatically detect the appropriate domain based on query keywords:
- Queries with "react", "typescript", "javascript", etc. → **knowledge** domain
- Queries with "best practice", "guideline", "tip", etc. → **tips** domain

You can override auto-detection with `--domain` flag.

### Search Examples

```bash
# Auto-detect domain (will use knowledge domain)
npx tsx {{SCRIPT_PATH}} "React hooks useState useEffect"

# Specify domain explicitly
npx tsx {{SCRIPT_PATH}} "error handling" --domain tips

# Limit number of results
npx tsx {{SCRIPT_PATH}} "TypeScript" -n 5

# Get help
npx tsx {{SCRIPT_PATH}} --help
```

### Output Format

Results are returned with relevance scores and all configured output columns:

```
## Search Results
Domain: knowledge | Query: "React hooks" | Results: 3

### Result #1 (score: 3.45)
  Name: React Hooks
  Category: React
  Description: Modern React state management using functional components
  Best_Practice: Use functional components with hooks instead of class components
  Example: const [count, setCount] = useState(0)
```

## Customization

### Adding Your Own Data

1. Create a CSV file in `src/data/your-data.csv`
2. Update `src/config.ts` to add your domain configuration
3. Test with: `npx tsx {{SCRIPT_PATH}} "your query" --domain your-domain`

See `src/data/README.md` for CSV format guidelines.

### Modifying Search Behavior

Edit `src/config.ts`:
- `CSV_CONFIGS` - Configure which columns to search and output
- `DOMAIN_KEYWORDS` - Customize domain auto-detection patterns
- `BM25_PARAMS` - Tune search algorithm parameters

{{QUICK_REFERENCE}}
