# Quick Start Guide

Get started with the TypeScript Skill Template in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Basic knowledge of TypeScript/JavaScript
- A text editor

## Step 1: Clone or Download

```bash
# Option A: Clone this repo
git clone https://github.com/your-repo/ui-ux-pro-max-skill
cd ui-ux-pro-max-skill/typescript-skill-template

# Option B: Download and extract
# Download ZIP, extract, and cd into typescript-skill-template/
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- TypeScript compiler
- tsx (TypeScript execution)
- @types/node (Node.js types)

## Step 3: Test the Search

Try searching the example knowledge base:

```bash
# Search for React knowledge
npm run search "React hooks"

# Search for best practices
npm run search "accessibility"

# Specify domain
npm run search "TypeScript" --domain knowledge

# Limit results
npm run search "performance" -n 5
```

You should see output like:

```
## Search Results
Domain: knowledge | Query: "React hooks" | Results: 3

### Result #1 (score: 4.23)
  Name: React Hooks
  Category: React
  Description: Modern React state management...
  ...
```

## Step 4: Add Your Own Data

### Create a new CSV file

Create `src/data/my-knowledge.csv`:

```csv
No,Name,Category,Keywords,Description,Answer,Example
1,Git Rebase,Git,"git,rebase,merge,history",Rewrite commit history,Use interactive rebase to clean up commits,"git rebase -i HEAD~3"
2,Docker Compose,Docker,"docker,compose,container,orchestration",Multi-container Docker apps,Define services in docker-compose.yml,"version: '3.8' services: web: ..."
```

### Configure the domain

Edit `src/config.ts`:

```typescript
export const CSV_CONFIGS: DomainConfig = {
  // ... existing configs

  'my-knowledge': {
    file: 'my-knowledge.csv',
    searchColumns: ['Name', 'Category', 'Keywords', 'Description'],
    outputColumns: ['Name', 'Description', 'Answer', 'Example'],
  },
};

export const DOMAIN_KEYWORDS: DomainKeywords = {
  // ... existing keywords

  'my-knowledge': /git|docker|kubernetes|devops/i,
};
```

### Test your domain

```bash
npm run search "git rebase" --domain my-knowledge
```

## Step 5: Install to Your AI Assistant

### For Claude Code

```bash
# Create skill directory
mkdir -p ~/.claude/skills/my-skill

# Copy files
cp -r src/* ~/.claude/skills/my-skill/

# Create SKILL.md from template
cp src/templates/base/skill-content.md ~/.claude/skills/my-skill/SKILL.md

# Replace placeholders in SKILL.md
# {{TITLE}} → My Skill
# {{SCRIPT_PATH}} → skills/my-skill/scripts/search.ts
```

### For Cursor

```bash
mkdir -p .cursor/skills/my-skill
cp -r src/* .cursor/skills/my-skill/
```

## Step 6: Use in AI Conversations

In Claude Code or Cursor, you can now ask:

```
"Search for React hooks best practices"
"What's the best way to handle TypeScript errors?"
"Show me accessibility guidelines"
```

The AI will automatically call your search script and use the results to provide better answers.

## Common Tasks

### Add more entries to existing CSV

1. Open CSV in Excel/Google Sheets
2. Add new rows following the existing format
3. Save (no code changes needed!)
4. Test: `npm run search "your new entry"`

### Change BM25 parameters

Edit `src/config.ts`:

```typescript
export const BM25_PARAMS = {
  k1: 1.5,  // ↑ = more weight on term frequency
  b: 0.75,  // ↑ = more length normalization
};
```

### Build TypeScript

```bash
npm run build
# Output in dist/
```

### Run without npm

```bash
npx tsx src/scripts/search.ts "your query"
```

## Troubleshooting

### "Cannot find module" error

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CSV parse error

- Check for unescaped quotes in your CSV
- Quote fields containing commas: `"value, with, commas"`
- Escape quotes inside quoted fields: `"He said ""Hello"""`

### No search results

- Check your query matches Keywords column
- Try broader search terms
- Verify CSV file is in `src/data/`
- Check domain configuration in `config.ts`

## Next Steps

1. **Explore examples** - Check `examples/` for real-world use cases
2. **Read ANALYSIS.md** - Deep dive into BM25 and architecture
3. **Customize templates** - Modify `src/templates/` for your platforms
4. **Build a CLI** - Package as npm module for easy distribution

## Resources

- [Full README](README.md) - Complete documentation
- [Technical Analysis](ANALYSIS.md) - Architecture deep dive
- [Example Data](src/data/README.md) - CSV format guide
- [BM25 Algorithm](https://en.wikipedia.org/wiki/Okapi_BM25) - Search theory

## Getting Help

- Check [examples/](examples/) for reference implementations
- Review [src/data/README.md](src/data/README.md) for CSV guidelines
- Read [ANALYSIS.md](ANALYSIS.md) for how everything works

---

**Ready to build your own AI skill? Start with Step 4 above! 🚀**
