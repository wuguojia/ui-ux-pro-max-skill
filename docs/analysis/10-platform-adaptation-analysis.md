# 10 — 18 平台适配机制剖析

## 核心设计

一份 Skill 内容 + 18 份平台配置 = 18 个平台的完美适配

```
                  skill-content.md (529 行)
                         │
                         │ 一份内容
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
 claude.json       cursor.json        copilot.json    ... (x18)
    │                    │                    │
    ▼                    ▼                    ▼
 .claude/            .cursor/            .github/
 skills/             skills/             prompts/
 SKILL.md            SKILL.md            PROMPT.md
```

---

## 平台配置 JSON 结构

每个平台有一个 JSON 文件（`templates/platforms/{platform}.json`），定义：

```json
{
  "platform": "claude",
  "displayName": "Claude Code",
  "installType": "full",
  "folderStructure": {
    "root": ".claude",
    "skillPath": "skills/ui-ux-pro-max",
    "filename": "SKILL.md"
  },
  "scriptPath": "skills/ui-ux-pro-max/scripts/search.py",
  "frontmatter": {
    "name": "ui-ux-pro-max",
    "description": "UI/UX design intelligence..."
  },
  "sections": {
    "quickReference": true
  },
  "title": "UI/UX Pro Max - Design Intelligence",
  "description": "Comprehensive design guide...",
  "skillOrWorkflow": "Skill"
}
```

---

## 平台差异矩阵

### 文件夹差异

| 平台 | 根目录 | 技能路径 | 文件名 |
|------|--------|---------|--------|
| Claude | `.claude` | `skills/ui-ux-pro-max` | `SKILL.md` |
| Cursor | `.cursor` | `skills/ui-ux-pro-max` | `SKILL.md` |
| Windsurf | `.windsurf` | `skills/ui-ux-pro-max` | `SKILL.md` |
| **Copilot** | `.github` | **`prompts/ui-ux-pro-max`** | **`PROMPT.md`** |
| **Kiro** | `.kiro` | **`steering/ui-ux-pro-max`** | `SKILL.md` |
| **Droid** | `.factory` | `skills/ui-ux-pro-max` | `SKILL.md` |
| Antigravity | `.agents` | `skills/ui-ux-pro-max` | `SKILL.md` |
| 其他 11 个 | `.{name}` | `skills/ui-ux-pro-max` | `SKILL.md` |

### 功能差异

| 特性 | Claude | Cursor | Copilot | 其他 |
|------|--------|--------|---------|------|
| YAML Frontmatter | ✅ | ✅ | ✅ | ✅ |
| Quick Reference (297行) | ✅ | ❌ | ❌ | ❌ |
| 术语 | Skill | Skill | **Workflow** | Skill |

### 为什么 Claude 有 Quick Reference？

Claude Code 是项目最主要的目标平台，且它的 Skill 系统支持更大的 context window。Quick Reference 包含 200+ 条内联规则，会显著增加 token 消耗。其他平台的 context 限制更严，所以省略。

---

## 添加新平台的步骤

**只需 3 步，零代码修改**：

### 1. 创建平台配置

```bash
# 复制现有配置作为模板
cp src/ui-ux-pro-max/templates/platforms/cursor.json \
   src/ui-ux-pro-max/templates/platforms/newplatform.json
```

编辑 `newplatform.json`：
```json
{
  "platform": "newplatform",
  "displayName": "New Platform",
  "folderStructure": {
    "root": ".newplatform",
    "skillPath": "skills/ui-ux-pro-max",
    "filename": "SKILL.md"
  },
  ...
}
```

### 2. 注册平台类型

在 `cli/src/types/index.ts` 中：
```typescript
type AIType = '...' | 'newplatform' | 'all';
const AI_TYPES = ['...', 'newplatform'];
const AI_FOLDERS = { ..., newplatform: ['.newplatform'] };
```

### 3. 添加检测规则

在 `cli/src/utils/detect.ts` 中：
```typescript
const detectionMap = { ..., '.newplatform': 'newplatform' };
```

---

## Copilot 的特殊处理

GitHub Copilot 与其他平台有三处不同：

1. **文件夹路径**: `.github/prompts/` 而非 `.{name}/skills/`
2. **文件名**: `PROMPT.md` 而非 `SKILL.md`
3. **术语**: "Workflow" 而非 "Skill"

这些差异完全由配置 JSON 驱动，不需要任何特殊代码逻辑。

---

## 安装后的目录结构

### Claude Code
```
项目根目录/
└── .claude/
    └── skills/
        └── ui-ux-pro-max/
            ├── SKILL.md        ← 包含 frontmatter + quick-reference
            ├── scripts/
            │   ├── core.py
            │   ├── search.py
            │   └── design_system.py
            └── data/
                ├── styles.csv
                ├── colors.csv
                └── ... (42 个 CSV)
```

### GitHub Copilot
```
项目根目录/
└── .github/
    └── prompts/
        └── ui-ux-pro-max/
            ├── PROMPT.md       ← 无 quick-reference，术语为 "Workflow"
            ├── scripts/
            └── data/
```

---

## 测试建议

如需验证某个平台的安装是否正确：

```bash
# 安装到指定平台
npx uipro-cli init --ai claude --force

# 验证文件是否生成
ls -la .claude/skills/ui-ux-pro-max/
cat .claude/skills/ui-ux-pro-max/SKILL.md | head -20

# 验证搜索功能
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --domain product
```
