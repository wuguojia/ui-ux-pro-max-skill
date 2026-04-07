## Quick Reference

### Common Search Patterns

```bash
# Find React best practices
npx tsx scripts/search.ts "React component patterns"

# Find TypeScript tips
npx tsx scripts/search.ts "TypeScript interfaces generics"

# Find accessibility guidelines
npx tsx scripts/search.ts "accessibility keyboard navigation"

# Find performance tips
npx tsx scripts/search.ts "performance optimization"
```

### BM25 Search Algorithm

This skill uses BM25 (Best Matching 25) algorithm for relevance ranking:
- Handles term frequency saturation
- Normalizes for document length
- Zero external dependencies
- Fast: 30-50ms for 1000+ documents

### Data Format

All knowledge is stored in CSV files:
- Human-readable and editable in Excel/Sheets
- Git-friendly (text format)
- AI-friendly (structured data)
- Easy to maintain and version control
