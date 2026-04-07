# 06 — 设计系统生成器

## 概述

生成器是框架最高级的功能：它将搜索引擎、推理引擎、多域聚合三个能力组合，从一个简单查询生成**完整的结构化知识推荐**。

---

## 生成器架构

```
┌──────────────────────────────────────────────────────┐
│                  Generator                            │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐   │
│  │ 产品搜索  │ →  │ 推理引擎  │ →  │ 多域增强搜索  │   │
│  │ (Step 1)  │    │ (Step 2)  │    │ (Step 3)     │   │
│  └──────────┘    └──────────┘    └──────┬───────┘   │
│                                         │            │
│  ┌──────────┐    ┌──────────┐    ┌──────▼───────┐   │
│  │ 输出格式化│ ←  │ 持久化    │ ←  │ 最佳匹配选择 │   │
│  │ (Step 6)  │    │ (Step 5)  │    │ (Step 4)     │   │
│  └──────────┘    └──────────┘    └──────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## 完整生成流程

### Step 1: 产品/类型识别

```python
# 输入: "beauty spa booking system"
product_result = search(query, "product", max_results=1)
category = product_result[0]["Category"]  # → "Beauty / Spa / Salon"
```

### Step 2: 推理规则加载

```python
reasoning = apply_reasoning(category, reasoning_data)
# → {
#     strategy: "Hero + Gallery + Booking CTA",
#     priority_hints: ["Soft UI", "Minimalism"],
#     decision_rules: {"if_luxury": "switch-to-liquid-glass"},
#     anti_patterns: "Overly corporate look",
#     severity: "HIGH"
# }
```

### Step 3: 多域增强搜索

```python
SEARCH_CONFIG = {
    "product":    {"max_results": 1, "inject_hints": False},
    "style":      {"max_results": 3, "inject_hints": True},
    "color":      {"max_results": 2, "inject_hints": False},  # 颜色按产品类型匹配
    "typography": {"max_results": 2, "inject_hints": True},
    "landing":    {"max_results": 2, "inject_hints": True},
}

results = {}
for domain, config in SEARCH_CONFIG.items():
    search_query = query
    if config["inject_hints"]:
        search_query += " " + " ".join(reasoning["priority_hints"])

    results[domain] = search(search_query, domain, config["max_results"])
```

### Step 4: 最佳匹配选择

```python
# 对每个返回多结果的域，选择与推理最匹配的
best_style = select_best_match(results["style"], reasoning["priority_hints"])
best_typography = select_best_match(results["typography"], reasoning["priority_hints"])
best_landing = results["landing"][0] if results["landing"] else {}
best_color = results["color"][0] if results["color"] else {}
```

### Step 5: 结构组装

```python
design_system = {
    "project_name": project_name,
    "category": category,
    "pattern": {
        "name": reasoning["strategy"],
        "sections": best_landing.get("Sections", ""),
        "cta_placement": best_landing.get("CTA_Strategy", ""),
    },
    "style": {
        "name": best_style.get("Name", ""),
        "type": best_style.get("Type", ""),
        "effects": best_style.get("Effects", ""),
        "keywords": best_style.get("Keywords", ""),
        "performance": best_style.get("Performance", ""),
        "accessibility": best_style.get("Accessibility", ""),
    },
    "colors": {
        "primary": best_color.get("Primary", ""),
        "on_primary": best_color.get("On_Primary", ""),
        "secondary": best_color.get("Secondary", ""),
        "accent": best_color.get("Accent", ""),
        "background": best_color.get("Background", ""),
        "foreground": best_color.get("Foreground", ""),
        "border": best_color.get("Border", ""),
        "destructive": best_color.get("Destructive", ""),
        "notes": best_color.get("Notes", ""),
    },
    "typography": {
        "heading": best_typography.get("Heading", ""),
        "body": best_typography.get("Body", ""),
        "mood": best_typography.get("Mood", ""),
        "import_url": best_typography.get("Google_Fonts_URL", ""),
    },
    "key_effects": reasoning.get("key_rules", ""),
    "anti_patterns": reasoning.get("anti_patterns", ""),
    "decision_rules": reasoning.get("decision_rules", {}),
    "severity": reasoning.get("severity", "MEDIUM"),
}
```

### Step 6: 输出格式化

```python
if output_format == "ascii":
    return format_ascii_box(design_system)
elif output_format == "markdown":
    return format_markdown(design_system)
elif output_format == "json":
    return json.dumps(design_system, indent=2)
```

---

## 输出格式详解

### ASCII Box 格式

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🎨 DESIGN SYSTEM: Serenity Spa                                                        ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║  📦 PRODUCT TYPE                                                                        ║
║  Beauty / Spa / Salon                                                                   ║
║                                                                                         ║
║  🏗️ LAYOUT PATTERN                                                                      ║
║  Hero + Gallery + Booking CTA                                                           ║
║                                                                                         ║
║  🎭 STYLE                                                                               ║
║  Soft UI Evolution | Type: General                                                      ║
║  Effects: Subtle shadows, soft gradients, rounded corners                               ║
║                                                                                         ║
║  🎨 COLOR PALETTE                                                                       ║
║  ████ Primary:   #E8B4B8 (Dusty Rose)                                                  ║
║  ████ Secondary: #F5E6CC (Warm Cream)                                                   ║
║  ████ Accent:    #7B9E87 (Sage Green)                                                   ║
║  ████ Background:#FFF8F0 (Warm White)                                                   ║
║                                                                                         ║
║  📝 TYPOGRAPHY                                                                          ║
║  Heading: Cormorant Garamond (Serif, Elegant)                                           ║
║  Body: Lato (Sans-serif, Clean)                                                         ║
║                                                                                         ║
║  ⚠️ ANTI-PATTERNS                                                                       ║
║  Don't: Overly corporate look, harsh colors, cluttered layouts                          ║
║                                                                                         ║
║  📋 PRE-DELIVERY CHECKLIST                                                              ║
║  ☐ Color contrast ≥ 4.5:1 (WCAG AA)                                                    ║
║  ☐ Touch targets ≥ 44×44px                                                              ║
║  ☐ Responsive breakpoints: 320/768/1024/1440px                                          ║
║  ☐ Dark mode variant prepared                                                           ║
║  ☐ Loading states for all interactive elements                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝
```

### Markdown 格式

```markdown
# 🎨 Design System: Serenity Spa

## Product Type
Beauty / Spa / Salon

## Layout Pattern
Hero + Gallery + Booking CTA

## Style
| Property | Value |
|----------|-------|
| Name | Soft UI Evolution |
| Type | General |
| Effects | Subtle shadows, soft gradients |

## Color Palette
| Token | Hex | Description |
|-------|-----|-------------|
| Primary | #E8B4B8 | Dusty Rose |
| Secondary | #F5E6CC | Warm Cream |
| Accent | #7B9E87 | Sage Green |

## Typography
- **Heading**: Cormorant Garamond (Serif)
- **Body**: Lato (Sans-serif)
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=...')`

## Anti-Patterns
- ❌ Overly corporate look
- ❌ Harsh colors
- ❌ Cluttered layouts

## Decision Rules
- If luxury positioning → switch to Liquid Glass style
- If mobile-first → reduce animation complexity
```

---

## 持久化模式

### Master + Overrides

```
design-system/
├── MASTER.md              # 全局设计系统（项目级）
└── pages/
    ├── home.md            # 首页特殊规则
    ├── dashboard.md       # 仪表盘特殊规则
    └── checkout.md        # 结账页特殊规则
```

### MASTER.md 生成

```python
def persist_master(design_system: dict, output_dir: str):
    """将设计系统持久化为 MASTER.md"""
    content = format_markdown(design_system)
    filepath = os.path.join(output_dir, "design-system", "MASTER.md")
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
```

### 页面级覆写生成

```python
def persist_page_override(design_system: dict, page_name: str, output_dir: str):
    """为特定页面生成覆写文件"""
    # 只包含与 MASTER 不同的部分
    content = format_page_override(design_system, page_name)
    filepath = os.path.join(output_dir, "design-system", "pages", f"{page_name}.md")
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
```

### AI 使用持久化文件

```
AI 收到任务: "构建首页"
  1. 检查 design-system/pages/home.md → 存在
  2. 加载 MASTER.md + pages/home.md
  3. home.md 的规则覆盖 MASTER.md
  4. 按合并后的规则编码

AI 收到任务: "构建设置页"
  1. 检查 design-system/pages/settings.md → 不存在
  2. 只加载 MASTER.md
  3. 按 MASTER.md 规则编码
```

---

## Generator 完整类接口

```python
class DesignSystemGenerator:
    """
    多域聚合设计系统生成器。

    用法:
        generator = DesignSystemGenerator(data_dir="path/to/data")
        result = generator.generate("beauty spa", project_name="Serenity Spa")
        print(generator.format_ascii(result))
    """

    def __init__(self, data_dir: str):
        """加载推理规则到内存"""

    def generate(self, query: str, project_name: str = "MyProject") -> dict:
        """完整生成流程: 搜索 → 推理 → 聚合 → 组装"""

    def format_ascii(self, design_system: dict) -> str:
        """格式化为 ASCII Box"""

    def format_markdown(self, design_system: dict) -> str:
        """格式化为 Markdown"""

    def persist(self, design_system: dict, output_dir: str, page: str = None) -> str:
        """持久化到文件系统"""

    # 内部方法
    def _multi_domain_search(self, query: str, priority_hints: list) -> dict:
        """多域搜索"""

    def _find_reasoning_rule(self, category: str) -> dict:
        """三级匹配推理规则"""

    def _apply_reasoning(self, category: str) -> dict:
        """应用推理规则"""

    def _select_best_match(self, results: list, priority_keywords: list) -> dict:
        """从多个结果中选择最佳匹配"""
```
