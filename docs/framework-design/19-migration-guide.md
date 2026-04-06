# 19 — 迁移指南：将框架应用到新领域

## 概述

本指南教你如何将 AI Skill 通用框架应用到**任何知识领域**。我们以 3 个不同领域的迁移为例，展示完整的 step-by-step 流程。

---

## 迁移前评估

### 你的领域适合吗？

```
☐ 知识可以表达为 "条目"（行）和 "属性"（列）？
☐ 用户会用自然语言查询这些知识？
☐ 查询结果可以排序（有"更相关"和"较不相关"之分）？
☐ 数据量在 100K 行以内？
☐ 知识相对稳定（不需要实时更新）？
```

如果以上全部 ✅，你的领域非常适合。

---

## 迁移 6 步法

### Step 1: 知识建模 — 定义域和 Schema

**问题**: 你的知识可以分成几个域（CSV 文件）？

**思考方法**:
```
你的用户会问什么类型的问题？
  → 每种类型的问题对应一个域

例:
  "推荐一个食谱"      → recipe 域
  "这个食材的营养"     → ingredient 域
  "如何正确切洋葱"     → technique 域
```

**输出**: 域列表 + 每个域的列定义

```python
# 你需要定义:
MY_DOMAINS = {
    "recipe": {
        "columns": ["No", "Name", "Cuisine", "Category", "Ingredients", "Keywords",
                    "Difficulty", "Time", "Instructions", "Tips"],
        "search_cols": ["Name", "Cuisine", "Ingredients", "Keywords"],
        "output_cols": ["Name", "Cuisine", "Difficulty", "Time", "Ingredients"],
    },
    "technique": {
        "columns": ["No", "Name", "Category", "Keywords", "Description",
                    "Common_Mistakes", "Tips"],
        "search_cols": ["Name", "Category", "Keywords"],
        "output_cols": ["Name", "Description", "Tips"],
    },
}
```

### Step 2: 数据准备 — 填充 CSV

**原则**:
- 每行一个独立知识单元
- Keywords 列放尽可能多的同义词
- 用 Excel/Numbers 编辑更方便

```csv
No,Name,Cuisine,Category,Ingredients,Keywords,Difficulty,Time
1,Spaghetti Carbonara,Italian,Pasta,"eggs,pecorino,guanciale","pasta,italian,carbonara,quick,classic,roman",Medium,30min
2,Pad Thai,Thai,Noodles,"rice noodles,shrimp,peanuts","thai,noodles,stir-fry,street-food,wok",Medium,25min
```

**最低要求**: 每个域至少 10 行数据才能让 BM25 有意义。

### Step 3: 推理规则 — 可选但推荐

如果你的领域有"分类→推荐"的逻辑，创建推理 CSV:

```csv
No,Category,Recommended_Approach,Priority_Hints,Key_Rules,Decision_Rules,Anti_Patterns,Severity
1,Italian,"Al dente pasta, Fresh herbs","Simplicity, Quality","Use San Marzano tomatoes","{""if_quick"": ""use-fresh-pasta""}","Overcooking, Heavy cream sauce",HIGH
```

### Step 4: 配置搜索引擎

复制 `core.py` 并修改三个配置:

```python
# 1. CSV_CONFIG — 注册域
CSV_CONFIG = {
    "recipe": {
        "file": "recipes.csv",
        "search_cols": ["Name", "Cuisine", "Ingredients", "Keywords"],
        "output_cols": ["Name", "Cuisine", "Difficulty", "Time", "Ingredients"],
    },
    "technique": {
        "file": "techniques.csv",
        "search_cols": ["Name", "Category", "Keywords"],
        "output_cols": ["Name", "Description", "Tips"],
    },
}

# 2. DOMAIN_KEYWORDS — 自动检测
DOMAIN_KEYWORDS = {
    "recipe": r"recipe|cook|make|dish|meal|food|eat|dinner|lunch",
    "technique": r"technique|method|how to|cut|chop|fry|bake|boil",
}

# 3. DEFAULT_DOMAIN
DEFAULT_DOMAIN = "recipe"
```

### Step 5: 创建 Skill 模板

编辑 `templates/base/skill-content.md`:

```markdown
# {{TITLE}}

{{DESCRIPTION}}

## How to Use This {{SKILL_OR_WORKFLOW}}

### Search for Recipes
\`\`\`bash
python3 {{SCRIPT_PATH}} "italian pasta quick" --domain recipe
\`\`\`

### Search for Techniques
\`\`\`bash
python3 {{SCRIPT_PATH}} "knife skills julienne" --domain technique
\`\`\`

### Search Domains

| Domain | Description | Example |
|--------|-------------|---------|
| recipe | 食谱搜索 | "Thai curry quick" |
| technique | 烹饪技巧 | "how to sear steak" |

{{QUICK_REFERENCE}}
```

### Step 6: 测试和发布

```bash
# 测试搜索
python3 scripts/search.py "quick italian" --domain recipe
python3 scripts/search.py "knife skills"  # 自动检测

# 创建 symlink 测试
mkdir -p .claude/skills/cooking-pro-max
ln -s ../../../src/cooking-pro-max/data .claude/skills/cooking-pro-max/data
ln -s ../../../src/cooking-pro-max/scripts .claude/skills/cooking-pro-max/scripts

# 同步到 CLI assets
cp -r src/cooking-pro-max/data/* cli/assets/data/
cp -r src/cooking-pro-max/scripts/* cli/assets/scripts/
cp -r src/cooking-pro-max/templates/* cli/assets/templates/

# 构建和发布
cd cli && bun run build && npm publish
```

---

## 迁移案例

### 案例 A: API 设计规范 Skill

```python
CSV_CONFIG = {
    "endpoint": {"file": "endpoints.csv", "search_cols": ["Pattern", "Keywords", "Description"]},
    "status":   {"file": "status-codes.csv", "search_cols": ["Code", "Name", "Keywords"]},
    "auth":     {"file": "auth-patterns.csv", "search_cols": ["Pattern", "Keywords"]},
}
DOMAIN_KEYWORDS = {
    "endpoint": r"endpoint|route|path|api|rest|crud|get|post|put|delete",
    "status":   r"status|code|error|success|redirect|4\d\d|5\d\d",
    "auth":     r"auth|jwt|oauth|token|session|login|credential",
}
```

### 案例 B: 代码规范 Skill

```python
CSV_CONFIG = {
    "naming":   {"file": "naming.csv", "search_cols": ["Context", "Convention", "Keywords"]},
    "pattern":  {"file": "patterns.csv", "search_cols": ["Pattern", "Category", "Keywords"]},
    "testing":  {"file": "testing.csv", "search_cols": ["Guideline", "Category", "Keywords"]},
}
DOMAIN_KEYWORDS = {
    "naming":   r"name|naming|variable|function|class|constant|convention",
    "pattern":  r"pattern|design pattern|singleton|factory|observer|strategy",
    "testing":  r"test|testing|unit|integration|mock|assert|coverage",
}
```

### 案例 C: 数据库建模 Skill

```python
CSV_CONFIG = {
    "schema":    {"file": "schemas.csv", "search_cols": ["Model", "Keywords", "Industry"]},
    "index":     {"file": "indexes.csv", "search_cols": ["Type", "Keywords", "Use_Case"]},
    "migration": {"file": "migrations.csv", "search_cols": ["Operation", "Keywords"]},
}
```

---

## 迁移检查清单

```
Phase 1: 建模
  ☐ 定义了至少 1 个域
  ☐ 每个域有明确的 Schema
  ☐ Keywords 列设计完成

Phase 2: 数据
  ☐ 每个域至少 10 行数据
  ☐ CSV 格式正确 (UTF-8, 无 BOM)
  ☐ Keywords 包含足够的同义词

Phase 3: 配置
  ☐ CSV_CONFIG 已更新
  ☐ DOMAIN_KEYWORDS 已更新
  ☐ DEFAULT_DOMAIN 已设定

Phase 4: 模板
  ☐ skill-content.md 已适配
  ☐ 至少 1 个平台 JSON 已创建
  ☐ 搜索命令示例正确

Phase 5: 测试
  ☐ 每个域的搜索返回合理结果
  ☐ 自动检测正确工作
  ☐ Symlink 测试通过

Phase 6: 发布
  ☐ CLI assets 已同步
  ☐ package.json 版本号已更新
  ☐ npm publish 成功
```
