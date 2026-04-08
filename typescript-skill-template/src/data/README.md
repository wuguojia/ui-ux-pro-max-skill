# Example Data Files

This directory contains example CSV data files for the skill template.

## Files

### knowledge.csv
Example knowledge base with programming best practices, covering:
- React hooks and patterns
- TypeScript features
- JavaScript async patterns
- HTML/CSS best practices
- Performance optimization

**Columns:**
- No: Unique ID
- Name: Topic name
- Category: Technology category
- Keywords: Search keywords (comma-separated)
- Description: Detailed description
- Best_Practice: What to do
- Anti_Pattern: What to avoid
- Example: Code example

### tips.csv
Example tips and guidelines for web development, covering:
- Accessibility guidelines
- Performance optimization
- Security best practices
- UX patterns
- Code quality standards

**Columns:**
- No: Unique ID
- Name: Tip name
- Category: Tip category
- Keywords: Search keywords
- Description: Detailed description
- Do: Recommended actions
- Dont: Actions to avoid
- Severity: Critical/High/Medium/Low

## Creating Your Own Data

1. **Decide on your domain** - What knowledge do you want to capture?
2. **Define your schema** - What columns do you need?
3. **Create CSV file** - Use Excel, Google Sheets, or text editor
4. **Update config.ts** - Add your CSV to CSV_CONFIGS
5. **Test search** - Run `npm run search "your query"`

## CSV Format Guidelines

- First row must be headers
- Use double quotes for fields containing commas or newlines
- Escape quotes inside quoted fields by doubling them: `"He said ""Hello"""`
- Keep consistent column structure across all rows
- Use UTF-8 encoding

## Example Custom CSV

```csv
No,Component_Name,Framework,Props,Usage,Example
1,Button,React,"variant size disabled","Primary action button","<Button variant='primary'>Click</Button>"
2,Card,React,"title children className","Content container","<Card title='Hello'><p>Content</p></Card>"
```

Then update `src/config.ts`:

```typescript
export const CSV_CONFIGS = {
  components: {
    file: 'components.csv',
    searchColumns: ['Component_Name', 'Framework', 'Props', 'Usage'],
    outputColumns: ['Component_Name', 'Props', 'Usage', 'Example'],
  },
};
```
