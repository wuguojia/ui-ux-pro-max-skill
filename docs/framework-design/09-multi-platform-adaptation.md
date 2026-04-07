# 09 — 多平台适配矩阵

## 概述

一份知识库内容适配 N 个 AI 平台，核心通过**平台配置 JSON** 实现差异化。

---

## 平台差异维度

| 维度 | 说明 | 影响 |
|------|------|------|
| 根目录 | `.claude`, `.cursor`, `.github` 等 | 文件输出路径 |
| 文件名 | `SKILL.md`, `skill.md`, `rules.md` | 输出文件名 |
| Frontmatter | 有/无 YAML 头 | 文件内容前缀 |
| Quick Reference | 有/无速查表 | 文件长度差异 |
| 安装类型 | full / reference | 是否复制数据和脚本 |
| 术语 | Skill / Workflow / Rule | 文档内文本 |
| 脚本路径 | 相对路径因目录深度而异 | 命令中的路径 |

---

## 适配矩阵模板

| 平台 | 根目录 | Skill 路径 | 文件名 | 安装类型 | Frontmatter | Quick Ref | 术语 |
|------|--------|-----------|--------|---------|-------------|-----------|------|
| claude | .claude | skills/{skill} | SKILL.md | full | ✅ YAML | ✅ | Skill |
| cursor | .cursor | rules | {skill}.md | full | ❌ | ❌ | Rule |
| windsurf | .windsurf | rules | {skill}.md | full | ❌ | ❌ | Rule |
| copilot | .github | copilot | {skill}.md | full | ✅ YAML | ❌ | Instruction |
| kiro | .kiro | skills/{skill} | SKILL.md | full | ❌ | ❌ | Skill |
| roocode | .roo | skills/{skill} | SKILL.md | full | ❌ | ❌ | Skill |
| continue | .continue | config | {skill}.md | full | ❌ | ❌ | Config |
| codex | .codex | context | {skill}.md | reference | ❌ | ❌ | Context |
| (更多...) | ... | ... | ... | ... | ... | ... | ... |

---

## 添加新平台（零代码流程）

### Step 1: 调研平台规范

```
需要确认:
☐ AI 工具在项目中使用哪个隐藏目录? (例: .claude)
☐ Skill/Rule/Workflow 文件放在哪个子目录?
☐ 文件名有什么要求? (大小写、扩展名)
☐ 是否需要 YAML Frontmatter?
☐ 文件大小有限制吗? (决定是否包含 Quick Reference)
☐ 是否需要完整安装(data+scripts)还是仅引用?
☐ 平台用什么术语称呼这种文件? (Skill/Workflow/Rule)
```

### Step 2: 创建配置文件

```bash
# 复制最接近的现有配置作为模板
cp templates/platforms/claude.json templates/platforms/newplatform.json
```

编辑关键字段:
```json
{
    "platform": "newplatform",
    "displayName": "New Platform Name",
    "installType": "full",
    "folderStructure": {
        "root": ".newplatform",
        "skillPath": "skills/{your-skill}",
        "filename": "SKILL.md"
    },
    "scriptPath": "skills/{your-skill}/scripts/search.py",
    "frontmatter": null,
    "sections": {
        "quickReference": false
    },
    "title": "Your Skill - Intelligence",
    "description": "Description...",
    "skillOrWorkflow": "Skill"
}
```

### Step 3: 注册平台类型

```typescript
// types/index.ts
export type AIType =
    | 'claude'
    | 'cursor'
    // ...
    | 'newplatform';  // ← 添加

export const AI_TYPES: AIType[] = [
    'claude',
    'cursor',
    // ...
    'newplatform',  // ← 添加
];
```

### Step 4: 添加自动检测

```typescript
// utils/detect.ts
const AI_FOLDERS: Record<string, AIType> = {
    '.claude': 'claude',
    '.cursor': 'cursor',
    // ...
    '.newplatform': 'newplatform',  // ← 添加
};
```

### Step 5: 测试

```bash
# 验证生成
{cli-name} init --ai newplatform --force

# 检查输出
cat .newplatform/skills/{your-skill}/SKILL.md
ls .newplatform/skills/{your-skill}/data/
ls .newplatform/skills/{your-skill}/scripts/
```

---

## 平台特殊处理

### Frontmatter 差异

```markdown
<!-- Claude: 有 YAML Frontmatter -->
---
name: "my-skill"
description: "My skill description"
---

# My Skill Title

<!-- Cursor: 无 Frontmatter -->
# My Skill Title
```

### 路径深度差异

```
Claude:   .claude/skills/my-skill/scripts/search.py
          → scriptPath: "skills/my-skill/scripts/search.py"

Cursor:   .cursor/rules/my-skill/scripts/search.py
          → scriptPath: "rules/my-skill/scripts/search.py"

Codex:    .codex/context/search.py (reference 模式，只有脚本引用)
          → scriptPath: "context/search.py"
```

### Reference vs Full 安装

```
Full 安装:
.claude/skills/my-skill/
├── SKILL.md          ← 渲染的 Skill 文件
├── data/             ← 完整 CSV 知识库副本
│   ├── domain-a.csv
│   └── stacks/
└── scripts/          ← 完整 Python 脚本副本
    ├── core.py
    └── search.py

Reference 安装:
.codex/context/
├── my-skill.md       ← 渲染的 Skill 文件（包含内联知识摘要）
└── (无 data/ 和 scripts/)
```

---

## 验证清单

新平台接入后的验证项目:

```
☐ platform.json 所有字段填写正确
☐ init 命令能成功生成文件
☐ 生成的文件路径正确
☐ Skill 文件内容渲染正确（占位符全部替换）
☐ Frontmatter 格式正确（如果需要）
☐ 搜索命令路径正确（python3 {path}）
☐ data/ 和 scripts/ 正确复制（full 模式）
☐ 自动检测能识别新平台
☐ --ai all 包含新平台
☐ uninstall 能正确清理
```
