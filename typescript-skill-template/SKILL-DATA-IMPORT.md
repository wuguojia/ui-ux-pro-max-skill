---
name: data-import-assistant
description: "AI assistant for extracting structured data from HTML, code, and documents into CSV format for the knowledge base. Helps convert components, patterns, and documentation into searchable data."
---

# Data Import Assistant

This skill helps you extract information from various sources (HTML, React/Vue components, Markdown docs) and convert them into CSV format for the knowledge base.

## When to Use

Use this skill when you want to:
- Import component library documentation into CSV
- Extract design patterns from existing code
- Convert HTML examples to searchable data
- Build knowledge base from documentation files

## Available Schemas

### 1. Components Schema (`components.csv`)

**Use for**: React/Vue/Svelte components, UI libraries, design systems

**Required columns**:
- `No`: Sequential number (auto-increment, system will renumber)
- `Component_Name`: Component name (e.g., "Button", "Card", "Modal")
- `Framework`: Framework name (React, Vue, Svelte, Angular, etc.)
- `Props`: Comma-separated prop names (e.g., "variant size disabled")
- `Description`: One sentence explaining what the component does
- `Usage`: When to use this component
- `Example`: Code example showing usage
- `Category`: Component category (UI, Layout, Form, Data, Navigation, etc.)
- `Keywords`: Search keywords comma-separated (e.g., "button,action,cta,click")

**Example row**:
```csv
No,Component_Name,Framework,Props,Description,Usage,Example,Category,Keywords
1,Button,React,"variant size disabled","Primary action button","Use for main CTAs and important actions","<Button variant='primary' size='lg'>Click Me</Button>",UI,"button,action,cta,click"
```

### 2. Patterns Schema (`patterns.csv`)

**Use for**: Design patterns, architectural patterns, code patterns, best practices

**Required columns**:
- `No`: Sequential number
- `Pattern_Name`: Pattern name (e.g., "Observer Pattern", "Hero + Features Layout")
- `Category`: Pattern category (Design, Code, Architecture, UI, etc.)
- `Problem`: What problem it solves
- `Solution`: How it solves the problem
- `When_To_Use`: Usage scenarios
- `Example`: Code or design example
- `Keywords`: Search keywords comma-separated

**Example row**:
```csv
No,Pattern_Name,Category,Problem,Solution,When_To_Use,Example,Keywords
1,Observer Pattern,Code,"Need to notify multiple objects of state changes","Define one-to-many dependency between objects","When one object change should update many dependents","class Subject { observers = []; notify() {...} }","observer,pattern,pubsub,events"
```

### 3. Knowledge Schema (`knowledge.csv`)

**Use for**: Technical knowledge, programming concepts, framework features

**Required columns**:
- `No`: Sequential number
- `Name`: Topic name
- `Category`: Technology/framework (React, TypeScript, CSS, etc.)
- `Keywords`: Search keywords comma-separated
- `Description`: Detailed explanation
- `Best_Practice`: Recommended approach (optional)
- `Anti_Pattern`: What to avoid (optional)
- `Example`: Code example (optional)

**Example row**:
```csv
No,Name,Category,Keywords,Description,Best_Practice,Anti_Pattern,Example
1,React Hooks,React,"react,hooks,useState,useEffect","Modern state management in React functional components","Use functional components with hooks for cleaner code","Don't use class components for new code","const [count, setCount] = useState(0)"
```

### 4. Tips Schema (`tips.csv`)

**Use for**: Best practices, guidelines, dos and don'ts

**Required columns**:
- `No`: Sequential number
- `Name`: Tip name
- `Category`: Category (Accessibility, Performance, Security, UX, etc.)
- `Keywords`: Search keywords comma-separated
- `Description`: Detailed description
- `Do`: What to do (recommended actions)
- `Dont`: What NOT to do (actions to avoid)
- `Severity`: Critical/High/Medium/Low

## How to Extract Data

When user provides source files, follow these steps:

### Step 1: Read and Analyze Source Files

```typescript
// Example: Read all React components
const files = glob.sync('src/components/**/*.tsx');
```

For each file:
1. **Identify the content type**: Component, pattern, documentation, etc.
2. **Extract key information**:
   - For components: Name, props, JSDoc comments, examples
   - For docs: Headings, code blocks, descriptions
   - For HTML: Classes, structure, patterns

### Step 2: Generate CSV Content

Create CSV with proper format:

**Important CSV rules**:
- Use double quotes for fields containing commas: `"variant, size, disabled"`
- Escape internal quotes by doubling: `"He said ""Hello"""`
- Keep each row on ONE line (no newlines inside fields)
- Keywords must be comma-separated WITHOUT spaces: `"button,action,cta"`

**Example generation**:

```csv
No,Component_Name,Framework,Props,Description,Usage,Example,Category,Keywords
1,Button,React,"variant size disabled","Primary action button","Use for CTAs and important actions","<Button variant='primary'>Click</Button>",UI,"button,cta,action"
2,Card,React,"title children className","Content container","Group related content visually","<Card title='Info'><p>Content</p></Card>",Layout,"card,container,box"
3,Modal,React,"isOpen onClose title children","Overlay dialog component","Show important info or get user input","<Modal isOpen={true} title='Confirm'>...</Modal>",UI,"modal,dialog,overlay,popup"
```

### Step 3: Validation Checklist

Before outputting CSV, verify:
- [ ] All required columns are present
- [ ] No required field is empty
- [ ] Keywords are comma-separated (no spaces after commas)
- [ ] Examples are properly escaped (quotes doubled if needed)
- [ ] No column contains in `No` (will be auto-renumbered)
- [ ] Category values are consistent (UI, Layout, Form, Data, etc.)
- [ ] Framework names are consistent (React, Vue, not react, ReactJS, etc.)

### Step 4: Output Instructions

1. **Save the CSV** to a file named `<domain>-draft.csv`:
   - Components → `components-draft.csv`
   - Patterns → `patterns-draft.csv`
   - Knowledge → `knowledge-draft.csv`
   - Tips → `tips-draft.csv`

2. **Tell the user** to run:
   ```bash
   # Validate
   npm run validate <domain>-draft.csv --schema <domain>

   # If valid, import
   npm run import <domain>-draft.csv --domain <domain>

   # Test search
   npm run search "query" --domain <domain>
   ```

## Example Workflows

### Workflow 1: Import React Components

**User request**:
```
"帮我从 src/components/ 目录提取所有 React 组件到 components.csv"
```

**Your process**:

1. **Read all component files**:
```typescript
const componentFiles = [
  'src/components/Button.tsx',
  'src/components/Card.tsx',
  'src/components/Modal.tsx',
  // ... etc
];
```

2. **Extract information from each file**:
   - Component name from export
   - Props from TypeScript interface or PropTypes
   - Description from JSDoc comments
   - Usage examples from comments or stories

3. **Generate CSV**:
```csv
No,Component_Name,Framework,Props,Description,Usage,Example,Category,Keywords
1,Button,React,"variant size disabled","Primary action button","Use for main CTAs","<Button variant='primary'>Click</Button>",UI,"button,action,cta"
2,Card,React,"title children className","Container for grouping content","Group related information","<Card title='User'><p>Info</p></Card>",Layout,"card,container,box"
3,Modal,React,"isOpen onClose title","Overlay dialog component","Show dialogs and confirmations","<Modal isOpen={show}>Content</Modal>",UI,"modal,dialog,overlay"
```

4. **Save and instruct**:
```
✅ Generated components-draft.csv with 15 components

Next steps:
1. Review the file to ensure accuracy
2. Run: npm run validate components-draft.csv --schema components
3. If valid, run: npm run import components-draft.csv --domain components
4. Test: npm run search "Button component" --domain components
```

### Workflow 2: Extract Patterns from HTML

**User request**:
```
"帮我从 examples/*.html 提取 UI 模式到 patterns.csv"
```

**Your process**:

1. **Read HTML files** and identify patterns:
   - Hero sections
   - Card grids
   - Navigation patterns
   - Form layouts

2. **Generate CSV**:
```csv
No,Pattern_Name,Category,Problem,Solution,When_To_Use,Example,Keywords
1,Hero + CTA,UI,"Need attention-grabbing landing section","Large heading with prominent CTA button","Landing pages and marketing sites","<section class='hero'><h1>Title</h1><button>CTA</button></section>","hero,landing,cta"
2,Card Grid,UI,"Display multiple items in organized grid","Responsive grid of card components","Product listings and content galleries","<div class='grid'><div class='card'>...</div></div>","grid,cards,layout"
```

### Workflow 3: Extract Knowledge from Markdown Docs

**User request**:
```
"从 docs/**/*.md 提取技术知识到 knowledge.csv"
```

**Your process**:

1. **Parse Markdown files**:
   - Extract headings as topic names
   - Code blocks as examples
   - Paragraphs as descriptions

2. **Generate CSV**:
```csv
No,Name,Category,Keywords,Description,Best_Practice,Anti_Pattern,Example
1,React Hooks,React,"react,hooks,state","Modern state management","Use useState for local state","Don't use class components","const [x, setX] = useState(0)"
2,CSS Grid,CSS,"css,grid,layout","Two-dimensional layout system","Use for page-level layouts","Don't use for simple rows","display: grid; grid-template-columns: 1fr 1fr"
```

## Tips for Accurate Extraction

### Component Extraction
- **Name**: Use exact export name (PascalCase)
- **Props**: List 3-5 most important props only
- **Description**: One clear sentence
- **Example**: Simplest working example
- **Category**: UI, Layout, Form, Data, Navigation, Feedback, etc.

### Pattern Extraction
- **Pattern_Name**: Descriptive name (e.g., "Hero + Features Layout")
- **Problem**: Clear problem statement
- **Solution**: How the pattern solves it
- **When_To_Use**: Specific scenarios
- **Example**: Minimal code showing the pattern

### Common Mistakes to Avoid

❌ **Don't**:
- Use newlines in CSV fields (keep on one line)
- Forget to quote fields with commas
- Leave required fields empty
- Use inconsistent category names
- Include too much detail in examples
- Add spaces after commas in keyword lists

✅ **Do**:
- Double-quote fields containing commas
- Keep examples concise and focused
- Use consistent naming (React not ReactJS)
- Validate before saving
- Review generated CSV manually

## After Generation

User will run these commands:

### 1. Validate
```bash
npm run validate <file> --schema <domain>
```

This checks:
- ✅ All required columns present
- ✅ No empty required fields
- ✅ Valid CSV format
- ✅ Consistent data types

If validation fails, **read the error** and regenerate the CSV with fixes.

### 2. Preview Import (Dry Run)
```bash
npm run import <file> --domain <domain> --dry-run
```

Shows what would be imported without actually modifying files.

### 3. Import
```bash
npm run import <file> --domain <domain>
```

Imports data with automatic:
- Sequential numbering
- Backup creation
- Deduplication (by key fields)

### 4. Search Test
```bash
npm run search "your query" --domain <domain>
```

Verifies imported data is searchable.

## Success Criteria

A successful import should:
- ✅ Pass validation without errors
- ✅ Have accurate and complete information
- ✅ Be searchable with relevant keywords
- ✅ Use consistent categories and naming
- ✅ Include helpful examples
- ✅ Follow CSV format rules correctly

## Remember

- Always save as `<domain>-draft.csv` for review
- Let user validate and import manually
- Focus on accuracy over quantity
- Keep examples simple and clear
- Use consistent terminology
