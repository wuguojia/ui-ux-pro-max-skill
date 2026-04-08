# TypeScript Skill Template - Roadmap

## v1.0 ✅ (Current - Completed)

**Goal**: External AI-assisted data import with manual validation

### Features Implemented
- ✅ SKILL-DATA-IMPORT.md - Comprehensive AI assistant guide
- ✅ Schema-driven validation (4 schemas: components, patterns, knowledge, tips)
- ✅ CLI validate command (`npm run validate`)
- ✅ CLI import command (`npm run import`)
- ✅ Automatic backup and renumbering
- ✅ Dry-run mode for safe preview
- ✅ Example CSV files (components.csv, patterns.csv)
- ✅ Zero AI API cost (uses external tools like Claude Code/Cursor)

### Current Workflow
1. AI reads SKILL-DATA-IMPORT.md
2. AI extracts data from source files → generates CSV
3. User reviews CSV manually
4. User runs `npm run validate` → checks schema compliance
5. User runs `npm run import` → merges into knowledge base

### Limitations
- Manual review required for every import
- AI must regenerate entire CSV if errors found
- No incremental import capability
- No automatic deduplication
- No batch processing
- No progress tracking for large imports
- No rollback mechanism beyond backups

---

## v2.0 🚀 (Future Optimization)

**Goal**: Semi-automated import with smart validation and incremental updates

### Phase 1: Enhanced Validation & Error Recovery

#### 1.1 Interactive Error Fixing
**Problem**: If validation fails, AI must regenerate entire CSV

**Solution**: Add `--fix` mode to validation
```bash
npm run validate components-draft.csv --schema components --fix
```

Features:
- Point to exact line and field with errors
- Suggest fixes for common issues
- Allow incremental corrections
- Re-validate only changed rows

**Implementation**:
```typescript
// src/cli/commands/validate.ts
interface ValidationFix {
  row: number;
  field: string;
  currentValue: string;
  suggestedValue: string;
  reason: string;
}

function suggestFixes(errors: ValidationError[]): ValidationFix[] {
  // Auto-detect common issues:
  // - Missing quotes in CSV fields
  // - Inconsistent category names
  // - Invalid field types
  // - Empty required fields
}
```

#### 1.2 Advanced Validation Rules
Add optional validation rules:
- Cross-field validation (e.g., Example must match Framework syntax)
- Uniqueness checks (prevent duplicate components)
- Referential integrity (e.g., Category must exist in predefined list)
- Format validation (e.g., Keywords must be comma-separated without spaces)

**Configuration**:
```typescript
// src/config/schemas.ts
export const SCHEMAS = {
  components: {
    fields: [...],
    rules: [
      { type: 'unique', fields: ['Component_Name', 'Framework'] },
      { type: 'enum', field: 'Category', values: ['UI', 'Layout', 'Form', 'Data'] },
      { type: 'format', field: 'Keywords', pattern: /^[a-z,]+$/ },
    ],
  },
};
```

### Phase 2: Smart Import & Deduplication

#### 2.1 Automatic Deduplication
**Problem**: Importing same component multiple times creates duplicates

**Solution**: Smart merge with conflict resolution
```bash
npm run import components-draft.csv --domain components --merge-strategy smart
```

Merge strategies:
- `skip`: Skip duplicates (keep existing)
- `replace`: Replace duplicates (use new)
- `smart`: Compare and choose better quality entry
- `interactive`: Ask user for each conflict

**Smart comparison criteria**:
- More complete fields (fewer empty values)
- Longer descriptions
- More detailed examples
- Newer timestamp (if tracked)

#### 2.2 Incremental Import
**Problem**: Must import entire file, even if only 1 new row

**Solution**: Track import history
```typescript
// .import-history.json
{
  "components-draft.csv": {
    "lastImported": "2024-01-15T10:30:00Z",
    "checksum": "a1b2c3d4...",
    "rowsImported": 15
  }
}
```

Then:
```bash
npm run import components-draft.csv --domain components --incremental
# Only imports rows added since last import
```

### Phase 3: Batch Processing & Monitoring

#### 3.1 Batch Import
**Problem**: Must import one file at a time

**Solution**: Batch import with progress tracking
```bash
npm run import:batch --config import-config.json
```

Config file:
```json
{
  "imports": [
    { "file": "components-draft.csv", "domain": "components", "strategy": "smart" },
    { "file": "patterns-draft.csv", "domain": "patterns", "strategy": "skip" },
    { "file": "knowledge-draft.csv", "domain": "knowledge", "strategy": "replace" }
  ],
  "options": {
    "parallel": false,
    "stopOnError": true,
    "backup": true
  }
}
```

#### 3.2 Import Progress & Logging
Add detailed logging and progress tracking:
```bash
npm run import large-file.csv --domain components --verbose

📥 Importing data...
[1/100] Validating row 1... ✅
[2/100] Validating row 2... ✅
[3/100] Validating row 3... ⚠️  Warning: Empty optional field 'Usage'
...
[100/100] Validating row 100... ✅

✅ Validation passed: 100/100 rows
⚠️  Warnings: 15 rows with missing optional fields
📊 Starting import...
[====>    ] 45% (45/100 rows imported)
```

### Phase 4: AI-Powered Enhancements

#### 4.1 Smart Schema Detection
**Problem**: User must manually specify `--schema`

**Solution**: Auto-detect schema from CSV headers
```bash
npm run import components-draft.csv --auto-detect
# Analyzes headers and suggests: "Detected schema: components (95% confidence)"
```

#### 4.2 Data Quality Scoring
Add quality metrics to help AI improve extraction:
```bash
npm run analyze components-draft.csv

📊 Data Quality Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Score: 78/100 (Good)

Completeness: 85/100
  ✅ All required fields present
  ⚠️  12 rows missing optional 'Usage' field

Consistency: 70/100
  ⚠️  Category names inconsistent: "UI", "ui", "User Interface"
  ⚠️  Framework names inconsistent: "React", "ReactJS"

Examples: 80/100
  ✅ All examples contain code
  ⚠️  3 examples exceed 200 characters

Keywords: 75/100
  ✅ All rows have keywords
  ⚠️  5 rows have spaces in keyword lists

Suggestions:
1. Standardize category names → Use "UI" consistently
2. Standardize framework names → Use "React" not "ReactJS"
3. Simplify long examples in rows: 15, 23, 47
4. Remove spaces from keywords in rows: 8, 12, 33, 56, 89
```

#### 4.3 Enhanced SKILL.md with Quality Feedback
Update SKILL-DATA-IMPORT.md to include quality checklist:

```markdown
## After Generation - Quality Self-Check

Before saving CSV, verify:
- [ ] All category names use EXACT same spelling (case-sensitive)
- [ ] All framework names standardized (React not ReactJS, Vue not VueJS)
- [ ] Keywords have NO spaces after commas (button,action,cta ✅ not button, action, cta ❌)
- [ ] Examples are under 150 characters when possible
- [ ] No duplicate Component_Name + Framework combinations
- [ ] All required fields non-empty
```

### Phase 5: Rollback & Version Control

#### 5.1 Named Backups
**Problem**: Backups use timestamp, hard to identify

**Solution**: Named backup with description
```bash
npm run import components-draft.csv --domain components --backup-name "shadcn-ui-import"
# Creates: components.csv.backup-shadcn-ui-import
```

#### 5.2 Rollback Command
```bash
npm run rollback components --to shadcn-ui-import
# Restores components.csv from backup

npm run rollback components --list
# Shows all available backups:
# 1. backup-shadcn-ui-import (2024-01-15, 45 rows)
# 2. backup-1705315200000 (2024-01-14, 30 rows)
```

#### 5.3 Git Integration (Optional)
Auto-commit after successful import:
```bash
npm run import components-draft.csv --domain components --git-commit
# Automatically runs:
# git add src/data/components.csv
# git commit -m "Import: Added 15 components from shadcn-ui"
```

---

## v3.0 🔮 (Advanced Features)

**Goal**: Fully automated AI-powered data pipeline

### 3.1 Watch Mode
Auto-import when files change:
```bash
npm run import:watch --dir ./drafts --domain components
# Watches ./drafts/*.csv
# Auto-validates and imports on file save
```

### 3.2 Web UI (Optional)
Simple web interface for:
- Drag-and-drop CSV upload
- Visual validation errors with inline editing
- Preview before import
- Rollback management
- Data quality dashboard

### 3.3 LLM-Powered Auto-Fix
Integrate LLM API (optional, opt-in) to auto-fix validation errors:
```bash
npm run validate components-draft.csv --auto-fix --llm claude
# Uses Claude API to automatically fix:
# - Standardize category names
# - Fix keyword formatting
# - Improve example quality
# - Fill missing optional fields
```

**Cost control**:
- Dry-run first to estimate tokens
- Set max cost limit
- Cache common fixes

### 3.4 Multi-Source Import
Import from multiple formats:
```bash
npm run extract --source https://ui.shadcn.com/docs --domain components --format html
npm run extract --source ./src/components/*.tsx --domain components --format react
npm run extract --source ./docs/*.md --domain knowledge --format markdown
npm run extract --source ./figma-export.json --domain patterns --format figma
```

### 3.5 Search Index Optimization
- Add fuzzy search support
- Build inverted index for faster queries
- Add search result caching
- Support boolean queries (AND, OR, NOT)
- Add search analytics (track common queries)

---

## Implementation Priority

### High Priority (v2.0 Phase 1-2)
1. ✅ Interactive error fixing - Saves AI regeneration time
2. ✅ Smart deduplication - Prevents data quality issues
3. ✅ Advanced validation rules - Catches more errors early

### Medium Priority (v2.0 Phase 3-4)
4. Batch import - Useful for large-scale imports
5. Data quality scoring - Helps AI improve
6. Schema auto-detection - Better UX

### Low Priority (v2.0 Phase 5)
7. Rollback mechanism - Nice to have
8. Git integration - Convenience feature

### Future (v3.0)
9. Watch mode - For active development
10. Web UI - If CLI becomes too complex
11. LLM auto-fix - Only if user wants to pay for API
12. Multi-source import - Advanced use case

---

## Migration Path

### v1 → v2 Migration
- Fully backward compatible
- All v1 commands still work
- New features opt-in via flags
- No breaking changes to SKILL.md format
- Existing CSV files work as-is

### v2 → v3 Migration
- May require schema updates for new features
- Migration tool provided: `npm run migrate v2-to-v3`
- Legacy mode available for 6 months

---

## Technology Choices for v2

### Why NOT Add These (Keep Simple)
- ❌ Database (SQLite, PostgreSQL) - CSV is the source of truth
- ❌ ORM (Prisma, TypeORM) - Adds complexity
- ❌ GraphQL API - Overkill for search
- ❌ React/Vue UI - CLI-first approach
- ❌ Docker/Kubernetes - Local tool, not a service

### Why ADD These (Enhance Core)
- ✅ CSV diffing library - For smart merge
- ✅ Chalk/Ora - Better CLI output
- ✅ Inquirer - Interactive prompts
- ✅ Zod - Runtime validation
- ✅ Commander.js - Better CLI arg parsing

---

## Success Metrics

### v2.0 Goals
- Reduce validation failures by 80%
- Reduce import time by 50% (via incremental)
- Reduce duplicate entries by 100% (via smart merge)
- Improve data quality score from 70 → 90 average

### User Experience Goals
- Zero manual CSV editing needed
- One-command import for common cases
- Clear error messages with actionable fixes
- Fast feedback loop (under 5 seconds for validation)

---

## Questions for User (Before v2 Development)

1. **Import Volume**: How many rows per import typically? (affects batch priority)
2. **Frequency**: Daily imports or one-time setup? (affects watch mode priority)
3. **Team Size**: Solo or team? (affects Git integration priority)
4. **Budget**: Willing to pay for LLM API auto-fix? (affects v3 features)
5. **Complexity**: Need web UI or CLI is enough? (affects v3 scope)

---

## Example v2 Workflow

```bash
# 1. AI extracts data using SKILL-DATA-IMPORT.md
# Generates: components-draft.csv

# 2. User validates with auto-fix suggestions
npm run validate components-draft.csv --schema components --fix

# Output:
# ❌ Validation failed!
#
# Row 5: Field 'Category' has inconsistent value 'ui' (expected 'UI')
#   Suggested fix: Change 'ui' → 'UI'
#
# Row 12: Field 'Keywords' has spaces 'button, action, cta'
#   Suggested fix: Remove spaces → 'button,action,cta'
#
# Apply all fixes? (y/n): y
# ✅ All fixes applied. Re-validating...
# ✅ Validation passed!

# 3. User imports with smart deduplication
npm run import components-draft.csv --domain components --merge-strategy smart

# Output:
# 📥 Importing data...
#
# Found 3 duplicates:
#   - Button/React: Using new version (better quality score: 92 vs 85)
#   - Card/React: Using existing version (better quality score: 95 vs 88)
#   - Modal/React: Conflict detected
#     Existing: 8 fields complete, 120 char example
#     New:      9 fields complete, 95 char example
#     Choose: [e]xisting / [n]ew / [m]erge / [s]kip ? m
#
# ✅ Import completed!
# Added: 12 new rows
# Updated: 2 rows
# Skipped: 1 row
# Total: 45 rows
# Backup: components.csv.backup-shadcn-ui-import

# 4. Verify quality
npm run analyze components.csv

# Output:
# 📊 Data Quality Report
# Overall Score: 94/100 (Excellent)
# ✅ All validation rules passed
# ✅ Zero duplicates
# ✅ 100% field completeness
```

---

## Conclusion

**v1** provides a solid foundation with external AI-assisted import and manual validation. It's production-ready for small-to-medium imports.

**v2** focuses on automation, error recovery, and data quality - making the import process 80% faster and 100% more reliable.

**v3** adds advanced features for power users and teams managing large knowledge bases.

The roadmap is designed to be **incremental** - each phase builds on the previous one without breaking changes.
