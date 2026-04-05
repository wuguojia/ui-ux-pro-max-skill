# 04 — 逐步实施指南

> 从 0 到 1 创建一个新的 AI Skill，以 "烹饪助手" 为例。

---

## Step 0: 环境准备

```bash
# 需要:
# - Python 3.x
# - Node.js 18+ (如果要发布 CLI)
# - Git
```

---

## Step 1: 创建项目结构

```bash
mkdir cooking-pro-max-skill
cd cooking-pro-max-skill
git init

# 创建源代码目录
mkdir -p src/cooking-pro-max/{data,scripts,templates/{base,platforms}}

# 创建 CLI 目录 (可选，如果要 npm 发布)
mkdir -p cli/{src/{commands,utils,types},assets/{data,scripts,templates}}
```

---

## Step 2: 准备数据

### 2.1 创建主数据 CSV

`src/cooking-pro-max/data/recipes.csv`:
```csv
No,Recipe Name,Cuisine,Category,Ingredients,Keywords,Difficulty,Time,Instructions
1,Spaghetti Carbonara,Italian,Pasta,"eggs,pecorino,guanciale,pepper","italian,pasta,carbonara,classic,quick",Medium,30min,"1. Boil pasta..."
2,Pad Thai,Thai,Noodles,"rice noodles,shrimp,tofu,peanuts","thai,noodles,stir-fry,street-food",Medium,25min,"1. Soak noodles..."
```

### 2.2 创建辅助数据

`src/cooking-pro-max/data/techniques.csv`:
```csv
No,Technique,Category,Keywords,Description,Common Mistakes,Tips
1,Julienne,Knife Skills,"cut,slice,julienne,matchstick",Cutting into thin strips,Uneven thickness,Use sharp knife
```

### 2.3 创建推理规则 (可选)

`src/cooking-pro-max/data/cooking-reasoning.csv`:
```csv
No,Cuisine_Category,Recommended_Techniques,Flavor_Priority,Key_Rules,Anti_Patterns,Severity
1,Italian,Pasta al dente + Fresh herbs,Simplicity + Quality ingredients,Use San Marzano tomatoes,Overcooking pasta,HIGH
```

---

## Step 3: 配置搜索引擎

### 3.1 复制 BM25 引擎

```bash
cp path/to/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/core.py \
   src/cooking-pro-max/scripts/core.py
```

### 3.2 修改域配置

编辑 `core.py`，修改 `CSV_CONFIGS`：

```python
CSV_CONFIGS = {
    "recipe": {
        "file": "recipes.csv",
        "search_columns": ["Recipe Name", "Cuisine", "Category", "Ingredients", "Keywords"],
        "output_columns": ["Recipe Name", "Cuisine", "Difficulty", "Time", "Ingredients"],
    },
    "technique": {
        "file": "techniques.csv",
        "search_columns": ["Technique", "Category", "Keywords"],
        "output_columns": ["Technique", "Description", "Tips"],
    },
}
```

### 3.3 修改域自动检测

```python
DOMAIN_KEYWORDS = {
    "recipe": r"recipe|cook|make|dish|meal|food|eat",
    "technique": r"technique|method|how to|skill|cut|chop|fry|bake",
}
```

### 3.4 复制并修改 search.py

```bash
cp path/to/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py \
   src/cooking-pro-max/scripts/search.py
```

修改 `search.py` 中的 argparse 参数描述即可。

---

## Step 4: 创建 Skill 模板

### 4.1 基础模板

`src/cooking-pro-max/templates/base/skill-content.md`:
```markdown
# {{TITLE}}

{{DESCRIPTION}}

## How to Use This {{SKILL_OR_WORKFLOW}}

| User Request | Action | Command |
|---|---|---|
| "帮我做一道意大利菜" | 搜索食谱 | python3 {{SCRIPT_PATH}} "italian" --domain recipe |
| "怎么切洋葱" | 搜索技巧 | python3 {{SCRIPT_PATH}} "onion cutting" --domain technique |

## Search Reference

| Domain | Description |
|---|---|
| recipe | 搜索食谱数据库 |
| technique | 搜索烹饪技巧 |
```

### 4.2 平台配置

`src/cooking-pro-max/templates/platforms/claude.json`:
```json
{
  "platform": "claude",
  "displayName": "Claude Code",
  "installType": "full",
  "folderStructure": {
    "root": ".claude",
    "skillPath": "skills/cooking-pro-max",
    "filename": "SKILL.md"
  },
  "scriptPath": "skills/cooking-pro-max/scripts/search.py",
  "frontmatter": {
    "name": "cooking-pro-max",
    "description": "AI-powered cooking intelligence"
  },
  "sections": { "quickReference": false },
  "title": "Cooking Pro Max - Culinary Intelligence",
  "description": "Professional cooking knowledge base",
  "skillOrWorkflow": "Skill"
}
```

---

## Step 5: 本地测试

```bash
# 测试搜索
python3 src/cooking-pro-max/scripts/search.py "pasta italian" --domain recipe

# 测试自动检测
python3 src/cooking-pro-max/scripts/search.py "how to julienne"

# 创建本地 symlink
mkdir -p .claude/skills/cooking-pro-max
ln -s ../../../src/cooking-pro-max/data .claude/skills/cooking-pro-max/data
ln -s ../../../src/cooking-pro-max/scripts .claude/skills/cooking-pro-max/scripts
```

---

## Step 6: 发布 (可选)

### 同步资源到 CLI

```bash
cp -r src/cooking-pro-max/data/* cli/assets/data/
cp -r src/cooking-pro-max/scripts/* cli/assets/scripts/
cp -r src/cooking-pro-max/templates/* cli/assets/templates/
```

### 构建和发布

```bash
cd cli
bun run build
npm publish
```

---

## 检查清单

- [ ] 至少有 1 个主域 CSV，含 Keywords 列
- [ ] core.py 中 CSV_CONFIGS 已更新
- [ ] core.py 中 DOMAIN_KEYWORDS 已更新
- [ ] search.py 能正常执行搜索
- [ ] 至少有 1 个平台配置 JSON
- [ ] skill-content.md 模板包含所有占位符
- [ ] 本地 symlink 测试通过
