# Contributing to TypeScript Skill Template

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- TypeScript knowledge

### Initial Setup

```bash
# Clone the repo
git clone https://github.com/your-repo/ui-ux-pro-max-skill
cd ui-ux-pro-max-skill/typescript-skill-template

# Install dependencies
npm install

# Run tests (when available)
npm test

# Build TypeScript
npm run build
```

## Project Structure

```
typescript-skill-template/
├── src/
│   ├── core/           # Core modules (BM25, CSV parser, etc.)
│   ├── scripts/        # CLI scripts
│   ├── data/           # Example data files
│   ├── templates/      # Platform templates
│   └── config.ts       # Configuration
├── examples/           # Example implementations
├── docs/              # Documentation
├── README.md          # Main documentation
├── ANALYSIS.md        # Technical deep dive
└── QUICKSTART.md      # Quick start guide
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feat/your-feature
# or
git checkout -b fix/your-bugfix
```

### 2. Make Your Changes

- Keep changes focused and atomic
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Test search functionality
npm run search "test query"

# Build TypeScript
npm run build

# Run linter (when available)
npm run lint
```

### 4. Commit

Follow conventional commit format:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in CSV parser"
git commit -m "docs: update README"
```

Commit types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feat/your-feature
```

Then create a Pull Request on GitHub.

## Code Style

### TypeScript

- Use TypeScript strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use meaningful variable names
- Add JSDoc comments for public APIs

Example:

```typescript
/**
 * Search the knowledge base
 * @param query - Search query string
 * @param domain - Domain to search in
 * @param maxResults - Maximum number of results
 * @returns Array of search results with scores
 */
export function search(
  query: string,
  domain: string,
  maxResults: number = 3
): SearchResult[] {
  // Implementation
}
```

### CSV Files

- First row must be headers
- Use consistent column structure
- Quote fields with commas or newlines
- Keep data clean and validated
- UTF-8 encoding only

### Documentation

- Keep README up to date
- Add examples for new features
- Document breaking changes
- Use clear, concise language

## Adding New Features

### Adding a Core Module

1. Create file in `src/core/`
2. Export types in `src/core/types.ts`
3. Add tests (future)
4. Document in README

### Adding Example Data

1. Create CSV in `src/data/`
2. Follow existing schema
3. Add configuration to `config.ts`
4. Document in `src/data/README.md`

### Adding Platform Support

1. Create JSON in `src/templates/platforms/`
2. Follow existing schema
3. Test installation process
4. Update README

## Testing Guidelines

Currently, the project relies on manual testing. Future contributions adding automated tests are welcome!

### Manual Testing Checklist

- [ ] Search works with example data
- [ ] Domain auto-detection works
- [ ] CSV parsing handles edge cases
- [ ] BM25 scoring is reasonable
- [ ] Documentation is accurate
- [ ] Examples run without errors

## Documentation

### What to Document

- All public APIs
- Configuration options
- CSV schema changes
- Breaking changes
- Examples and use cases

### Where to Document

- Code comments: Implementation details
- README.md: User-facing features
- ANALYSIS.md: Technical architecture
- QUICKSTART.md: Getting started guides
- Examples: Real-world use cases

## Pull Request Process

1. **Check existing issues** - Avoid duplicate work
2. **Discuss major changes** - Open an issue first
3. **Update documentation** - Keep docs in sync
4. **Test thoroughly** - Manual testing checklist
5. **Request review** - Tag maintainers

### PR Title Format

```
<type>: <short description>

feat: add reasoning engine for design recommendations
fix: resolve CSV parsing issue with quoted fields
docs: improve quick start guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed?

## Changes
- List of changes
- Another change

## Testing
How was this tested?

## Breaking Changes
Any breaking changes?

## Related Issues
Fixes #123
```

## Code Review

### As a Reviewer

- Be constructive and respectful
- Test the changes locally
- Check for edge cases
- Suggest improvements
- Approve when ready

### As an Author

- Respond to feedback
- Make requested changes
- Ask questions if unclear
- Thank reviewers

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release
6. Publish to npm (if applicable)

## Getting Help

- Check existing documentation
- Search closed issues
- Ask in discussions
- Open a new issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes

Thank you for contributing! 🎉
