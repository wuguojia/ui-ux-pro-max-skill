# 05 — 定制化指南

## 快速定制矩阵

| 你想做什么 | 修改什么 | 难度 | 需要改代码？ |
|-----------|---------|------|------------|
| 换一个行业领域 | CSV 数据文件 | ★☆☆ | 否 |
| 添加新的搜索域 | core.py + CSV | ★★☆ | 少量 |
| 修改 Skill 文本 | skill-content.md | ★☆☆ | 否 |
| 添加新 AI 平台 | JSON + types.ts | ★☆☆ | 极少 |
| 添加推理引擎 | CSV + generator.py | ★★★ | 较多 |
| 修改搜索算法 | core.py | ★★★ | 较多 |

---

## 场景一：换领域 (只改数据)

### 1. 替换 CSV 文件

```bash
# 清空旧数据
rm src/my-skill/data/*.csv

# 放入新数据
cp my-recipes.csv src/my-skill/data/recipes.csv
cp my-techniques.csv src/my-skill/data/techniques.csv
```

### 2. 更新域配置

编辑 `core.py` 中的 `CSV_CONFIGS`:
```python
CSV_CONFIGS = {
    "recipe": {
        "file": "recipes.csv",
        "search_columns": ["Name", "Cuisine", "Keywords"],
        "output_columns": ["Name", "Cuisine", "Instructions"],
    },
}
```

### 3. 更新自动检测

```python
DOMAIN_KEYWORDS = {
    "recipe": r"recipe|cook|food|dish|meal",
}
```

---

## 场景二：添加新搜索域

### 1. 创建新 CSV

```csv
No,Ingredient,Category,Keywords,Nutrition,Substitutes
1,Butter,Dairy,"butter,fat,dairy,baking",717cal/100g,"ghee,margarine,coconut oil"
```

### 2. 在 core.py 注册

```python
CSV_CONFIGS["ingredient"] = {
    "file": "ingredients.csv",
    "search_columns": ["Ingredient", "Category", "Keywords"],
    "output_columns": ["Ingredient", "Nutrition", "Substitutes"],
}
```

### 3. 添加自动检测关键词

```python
DOMAIN_KEYWORDS["ingredient"] = r"ingredient|substitute|nutrition|calorie"
```

---

## 场景三：添加新 AI 平台

**只需 3 步，零核心代码修改**:

### 1. 创建平台配置

```bash
cp src/my-skill/templates/platforms/cursor.json \
   src/my-skill/templates/platforms/newplatform.json
```

修改字段:
```json
{
  "platform": "newplatform",
  "displayName": "New Platform",
  "folderStructure": {
    "root": ".newplatform",
    "skillPath": "skills/my-skill",
    "filename": "SKILL.md"
  }
}
```

### 2. 注册类型 (cli/src/types/index.ts)

```typescript
type AIType = '...' | 'newplatform';
const AI_TYPES = [..., 'newplatform'];
```

### 3. 添加检测 (cli/src/utils/detect.ts)

```typescript
detectionMap['.newplatform'] = 'newplatform';
```

---

## 场景四：修改 Skill 内容

编辑 `src/my-skill/templates/base/skill-content.md`，所有平台自动同步。

### 可用占位符

| 占位符 | 替换为 |
|--------|--------|
| `{{TITLE}}` | 平台 JSON 中的 title |
| `{{DESCRIPTION}}` | 平台 JSON 中的 description |
| `{{SCRIPT_PATH}}` | 脚本路径 |
| `{{QUICK_REFERENCE}}` | 速查表内容或空 |
| `{{SKILL_OR_WORKFLOW}}` | "Skill" 或 "Workflow" |

---

## 场景五：调整搜索参数

### BM25 参数

```python
# core.py 中:
class BM25:
    def __init__(self, k1=1.5, b=0.75):
        self.k1 = k1  # 词频饱和度 (1.2-2.0)
        self.b = b     # 文档长度归一化 (0.0-1.0)
```

| 参数 | 调高 | 调低 |
|------|------|------|
| k1 | 更重视高频词 | 更平衡 |
| b | 更惩罚长文档 | 更宽容长文档 |

### 搜索结果数

```bash
# search.py 默认返回 3 条
python3 search.py "query" --max-results 5
```

---

## 最佳实践

1. **Keywords 列越丰富越好** — 多放同义词、缩写、行话
2. **保持 CSV 每行独立** — 不要依赖上下行关系
3. **第一列用 No** — 方便排序和引用
4. **值不要太长** — BM25 对长文档有惩罚
5. **测试覆盖常见查询** — 用真实用户会说的话搜索
