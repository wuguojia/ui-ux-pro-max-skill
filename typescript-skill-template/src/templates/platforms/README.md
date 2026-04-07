# Platform Configuration Templates

This directory contains JSON configuration files for different AI coding assistant platforms.

## Available Platforms

- **claude.json** - Claude Code (supports skills)
- **cursor.json** - Cursor (supports skills)

## Configuration Schema

```typescript
interface PlatformConfig {
  platform: string;              // Platform identifier
  displayName: string;           // Human-readable name
  installType: 'full' | 'workflow';  // Installation type
  folderStructure: {
    root: string;                // Root directory (e.g., ".claude")
    skillPath: string;           // Path to skill folder
    filename: string;            // Main file name
  };
  scriptPath: string;            // Path to search script
  frontmatter?: Record<string, any>;  // Platform-specific metadata
  supportsQuickReference?: boolean;   // Whether to include quick reference
}
```

## Adding a New Platform

1. Create `your-platform.json` in this directory
2. Follow the schema above
3. No code changes needed - the CLI will auto-detect it

Example:

```json
{
  "platform": "windsurf",
  "displayName": "Windsurf",
  "installType": "full",
  "folderStructure": {
    "root": ".windsurf",
    "skillPath": "skills/my-skill",
    "filename": "skill.md"
  },
  "scriptPath": "skills/my-skill/scripts/search.ts",
  "supportsQuickReference": false
}
```

## Template Variables

Templates support placeholder replacement:

- `{{TITLE}}` - Skill title
- `{{DESCRIPTION}}` - Skill description
- `{{SKILL_OR_WORKFLOW}}` - "Skill" or "Workflow" based on installType
- `{{SCRIPT_PATH}}` - Path to search script
- `{{QUICK_REFERENCE}}` - Quick reference section (Claude only)

## Notes

- **full** install type: Creates complete skill folder with data and scripts
- **workflow** install type: Creates workflow file only (script in shared location)
- Frontmatter varies by platform - check platform docs for supported fields
