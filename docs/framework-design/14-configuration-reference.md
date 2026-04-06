# 14 — 配置参考

## 概述

本文档汇总了框架中所有配置项的定义、默认值和调整建议。

---

## 1. BM25 搜索参数

| 参数 | 位置 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| `k1` | core.py BM25.__init__ | 1.5 | 1.2 - 2.0 | 词频饱和度 |
| `b` | core.py BM25.__init__ | 0.75 | 0.0 - 1.0 | 文档长度归一化 |
| `min_token_length` | core.py tokenize | 3 | 1 - 5 | 最短词长度 |
| `max_results` | search.py argparse | 3 | 1 - 100 | 默认返回结果数 |

### 调优场景

| 场景 | 建议调整 |
|------|---------|
| 短文档多（<20 tokens/row） | b=0.5（减少长度惩罚） |
| 关键词丰富 | k1=1.2（更快饱和，避免重复词过度加权） |
| 需要匹配短词（如 "AI", "UI"） | min_token_length=2 |
| 返回更多候选 | max_results=5 或 10 |

---

## 2. CSV 域配置 (CSV_CONFIG)

```python
CSV_CONFIG = {
    "{domain}": {
        # 必需
        "file": str,               # CSV 文件名 (相对于 data/)
        "search_cols": list[str],  # 搜索时使用的列名列表
        "output_cols": list[str],  # 输出时显示的列名列表

        # 可选
        "max_default": int,        # 该域默认最大结果数 (覆盖全局 max_results)
    },
}
```

### 配置示例

```python
CSV_CONFIG = {
    "style": {
        "file": "styles.csv",
        "search_cols": ["Style Category", "Keywords", "Best For", "Type", "AI Prompt Keywords"],
        "output_cols": ["Style Category", "Type", "Keywords", "Primary Colors",
                       "Effects & Animation", "Best For", "Performance", "Accessibility"],
    },
    "color": {
        "file": "colors.csv",
        "search_cols": ["Product Type", "Notes"],
        "output_cols": ["Product Type", "Primary", "On Primary", "Secondary",
                       "Accent", "Background", "Foreground", "Border", "Notes"],
    },
    "product": {
        "file": "products.csv",
        "search_cols": ["Product Type", "Keywords", "Key Considerations"],
        "output_cols": ["Product Type", "Primary Style Recommendation",
                       "Landing Page Pattern", "Color Palette Focus"],
    },
}
```

---

## 3. 域自动检测配置 (DOMAIN_KEYWORDS)

```python
DOMAIN_KEYWORDS = {
    "{domain}": r"regex_pattern",
    # 模式中的词用 | 分隔，正则不区分大小写
}
```

### 配置示例

```python
DOMAIN_KEYWORDS = {
    "style": r"style|glass|morph|minimal|brut|neu|skeu|flat|gradient|shadow",
    "color": r"color|palette|hex|rgb|hsl|theme|scheme|contrast|tone",
    "typography": r"font|typo|heading|body|serif|sans|pairing|google fonts",
    "product": r"saas|ecommerce|fintech|health|education|social|startup",
    "ux": r"button|input|form|modal|toast|table|card|nav|accessibility",
    "landing": r"landing|hero|cta|conversion|above fold|pricing|testimonial",
    "chart": r"chart|graph|bar|line|pie|donut|area|scatter|visualization",
}
```

### 匹配算法

```python
DEFAULT_DOMAIN = "style"  # 无命中时的默认域

# 匹配逻辑: 统计每个域的关键词在查询中命中次数，选最多的
# 多个域命中数相同时，使用 DOMAIN_KEYWORDS 中的顺序（先定义的优先）
```

---

## 4. 技术栈配置 (STACK_CONFIG)

```python
STACK_CONFIG = {
    "{stack-name}": "{filename}.csv",
    # stack-name: CLI 参数值
    # filename: stacks/ 目录下的文件名
}
```

### 配置示例

```python
STACK_CONFIG = {
    "react": "react.csv",
    "nextjs": "nextjs.csv",
    "vue": "vue.csv",
    "svelte": "svelte.csv",
    "flutter": "flutter.csv",
    "swiftui": "swiftui.csv",
    "react-native": "react-native.csv",
    "html-tailwind": "html-tailwind.csv",
    "shadcn": "shadcn.csv",
    "jetpack-compose": "jetpack-compose.csv",
}
```

---

## 5. 多域搜索配置 (SEARCH_CONFIG)

```python
SEARCH_CONFIG = {
    "{domain}": {
        "max_results": int,       # 该域的搜索结果数
        "inject_hints": bool,     # 是否注入推理优先词
    },
}
```

### 配置示例

```python
SEARCH_CONFIG = {
    "product":    {"max_results": 1, "inject_hints": False},
    "style":      {"max_results": 3, "inject_hints": True},
    "color":      {"max_results": 2, "inject_hints": False},
    "typography": {"max_results": 2, "inject_hints": True},
    "landing":    {"max_results": 2, "inject_hints": True},
}
```

---

## 6. 平台配置 JSON

详见 [07-template-rendering-engine.md](07-template-rendering-engine.md) 和 [09-multi-platform-adaptation.md](09-multi-platform-adaptation.md)。

关键配置项速查:

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `platform` | string | 平台标识 |
| `displayName` | string | 显示名称 |
| `installType` | 'full' \| 'reference' | 安装类型 |
| `folderStructure.root` | string | 根目录名 |
| `folderStructure.skillPath` | string | Skill 子路径 |
| `folderStructure.filename` | string | 文件名 |
| `scriptPath` | string | 脚本相对路径 |
| `frontmatter` | object \| null | YAML 头 |
| `sections.quickReference` | boolean | 含速查表？ |
| `title` | string | Skill 标题 |
| `description` | string | Skill 描述 |
| `skillOrWorkflow` | string | 平台术语 |

---

## 7. CLI package.json 配置

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `name` | npm 包名 | "my-skill-cli" |
| `version` | 语义版本 | "1.0.0" |
| `bin` | CLI 命令映射 | `{"myskill": "./dist/index.js"}` |
| `files` | 发布包含的文件 | `["dist", "assets"]` |
| `type` | 模块类型 | "module" |

---

## 8. Skill 元数据 (skill.json)

```json
{
    "name": "{your-skill}",
    "version": "1.0.0",
    "description": "Your skill description",
    "author": "Your Name",
    "license": "MIT",
    "repository": "https://github.com/...",
    "keywords": ["ai-skill", "knowledge-base"],
    "engines": {
        "python": ">=3.6",
        "node": ">=18"
    }
}
```
