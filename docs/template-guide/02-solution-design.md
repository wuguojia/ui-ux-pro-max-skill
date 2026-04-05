# 02 — 方案设计

## 目标

将 UI/UX Pro Max 的架构抽象为一个**通用的 AI Skill 模板**，使任何领域的知识都能以相同方式封装和分发。

---

## 核心抽象

### 一个 Skill = 数据 + 搜索 + 表现

```
┌──────────────────────────────────────────────┐
│                 AI Skill 模板                  │
│                                              │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │ CSV 数据库 │  │ 搜索引擎   │  │ Skill 文件│ │
│  │ (知识)     │→│ (检索)     │→│ (指令)    │ │
│  └───────────┘  └───────────┘  └──────────┘ │
│                                              │
│  ┌───────────┐  ┌───────────┐               │
│  │ 推理规则   │  │ 设计系统   │               │
│  │ (可选)     │  │ 生成器     │               │
│  └───────────┘  └───────────┘               │
└──────────────────────────────────────────────┘
```

### 配置驱动适配

```json
// skill-config.json (概念示例)
{
  "name": "cooking-pro-max",
  "domains": [
    {"name": "recipe", "file": "recipes.csv", "searchCols": ["Name", "Cuisine", "Ingredients"]},
    {"name": "technique", "file": "techniques.csv", "searchCols": ["Name", "Category"]},
    {"name": "nutrition", "file": "nutrition.csv", "searchCols": ["Food", "Category"]}
  ],
  "reasoning": {
    "enabled": true,
    "file": "cooking-reasoning.csv"
  }
}
```

---

## 技术方案

### 方案一：配置驱动（推荐）

**核心思路**: 将 `core.py` 中硬编码的 CSV 配置提取为外部 JSON。

```python
# 现在的硬编码方式
CSV_CONFIGS = {
    "style": {"file": "styles.csv", "search_columns": ["Keywords", "Best For"]},
    "color": {"file": "colors.csv", "search_columns": ["Product Type"]},
    # ...
}

# 改为配置文件驱动
with open("skill-config.json") as f:
    config = json.load(f)
    CSV_CONFIGS = {d["name"]: d for d in config["domains"]}
```

**优点**: 改配置即可换领域，核心代码不变
**缺点**: 需要一次性重构

### 方案二：继承覆写

**核心思路**: 提供基类，新 Skill 通过继承覆写域配置。

```python
class BaseSkillEngine:
    CSV_CONFIGS = {}  # 子类必须覆写
    
class UIUXEngine(BaseSkillEngine):
    CSV_CONFIGS = {"style": ..., "color": ...}

class CookingEngine(BaseSkillEngine):
    CSV_CONFIGS = {"recipe": ..., "technique": ...}
```

### 方案三：脚手架工具

**核心思路**: `uipro create` 命令生成新 Skill 项目骨架。

```bash
uipro create my-cooking-skill
# → 生成完整项目结构:
#    my-cooking-skill/
#    ├── data/
#    ├── scripts/core.py  (BM25 引擎副本)
#    ├── scripts/search.py
#    └── templates/
```

---

## 抽象策略

### 需要抽象的部分

| 组件 | 当前状态 | 抽象方向 |
|------|---------|---------|
| CSV 域配置 | 硬编码在 core.py | 提取为 skill-config.json |
| 域自动检测 | 硬编码关键词 | 提取为 detection-rules.json |
| 设计系统生成 | UI/UX 特定 | 提取为可选的 "合成器" 模块 |
| Skill 文件模板 | UI/UX 内容 | 参数化所有领域特定内容 |
| CLI 安装器 | 绑定 "ui-ux-pro-max" | 参数化 Skill 名称和路径 |

### 不需要抽象的部分

| 组件 | 理由 |
|------|------|
| BM25 算法 | 通用，无需修改 |
| CSV 解析器 | 通用，无需修改 |
| 平台配置系统 | 通用，无需修改 |
| 模板渲染引擎 | 通用，无需修改 |
| GitHub API | 通用，无需修改 |

---

## 数据设计原则

### CSV 设计规范

```csv
# 好的 CSV 设计
No, Name, Keywords, Category, Description, Best_For, Code_Example, Notes

# 规则:
# 1. 第一列是序号 (No)
# 2. 必须有 Keywords 列 (搜索用)
# 3. 搜索列尽量多放同义词
# 4. 值过长时可以用 ... 截断
# 5. 保持每行独立，不依赖上下行
```

### 推理 CSV 设计规范

```csv
No, Category, Recommended_Strategy, Priority, Key_Rules, Decision_Rules, Anti_Patterns, Severity

# 规则:
# 1. Category 必须与主数据表的分类列 1:1 对应
# 2. Decision_Rules 是 JSON 字符串
# 3. Anti_Patterns 告诉 AI "不要做什么"
# 4. Severity 标注规则优先级
```
