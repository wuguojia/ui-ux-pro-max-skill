# 04 — 设计系统生成器分析

## 概述

设计系统生成器（`design_system.py`，1149 行）是 v2.0 的旗舰功能。它将多个域的搜索结果通过推理规则聚合，生成一个完整的、可直接使用的设计系统推荐。

---

## 核心流程：5 步生成法

```
        输入: "beauty spa wellness service"
                      │
    ┌─────────────────┼─────────────────┐
    │     Step 1: 产品分类               │
    │     search("beauty...", "product") │
    │     → "Beauty / Spa / Salon"       │
    └─────────────────┼─────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │     Step 2: 推理匹配               │
    │     ui-reasoning.csv 查找规则      │
    │     → style_priority, color_mood,  │
    │       anti_patterns, effects       │
    └─────────────────┼─────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │     Step 3: 多域搜索               │
    │     product(1) + style(3) +        │
    │     color(2) + landing(2) +        │
    │     typography(2)                  │
    └─────────────────┼─────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │     Step 4: 优先匹配选择            │
    │     用 style_priority 从结果中      │
    │     选最佳匹配                      │
    └─────────────────┼─────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │     Step 5: 组装设计系统            │
    │     pattern + style + colors +      │
    │     typography + effects + avoid     │
    └─────────────────┼─────────────────┘
                      │
                      ▼
            完整设计系统 JSON
```

---

## 搜索配置 (SEARCH_CONFIG)

```python
SEARCH_CONFIG = {
    "product":    {"max_results": 1},   # 只要最匹配的产品类型
    "style":      {"max_results": 3},   # 取 3 个风格供选择
    "color":      {"max_results": 2},   # 取 2 个备选配色
    "landing":    {"max_results": 2},   # 取 2 个着陆页模式
    "typography": {"max_results": 2}    # 取 2 个字体配对
}
```

**为什么不同的域取不同数量？**
- `product` 只取 1 个：产品分类应该是唯一的
- `style` 取 3 个：提供更多选择给优先匹配算法
- 其他取 2 个：平衡信息量和噪音

---

## 推理引擎详解

### 推理规则结构 (ui-reasoning.csv)

```csv
No, UI_Category, Recommended_Pattern, Style_Priority, Color_Mood,
Typography_Mood, Key_Effects, Decision_Rules, Anti_Patterns, Severity
```

**示例**: SaaS (General)

| 字段 | 值 |
|------|-----|
| Recommended_Pattern | Hero + Features + CTA |
| Style_Priority | Glassmorphism + Flat Design |
| Color_Mood | Trust blue + Accent contrast |
| Typography_Mood | Professional + Hierarchy |
| Key_Effects | Subtle hover (200-250ms) + Smooth transitions |
| Decision_Rules | `{"if_ux_focused": "prioritize-minimalism", "if_data_heavy": "add-glassmorphism"}` |
| Anti_Patterns | Excessive animation + Dark mode by default |
| Severity | HIGH |

### 规则匹配逻辑

```python
def _find_reasoning_rule(self, category):
    # 三级匹配策略:
    
    # 1. 精确匹配: "Beauty / Spa / Salon" == "Beauty / Spa / Salon"
    for rule in self.reasoning_data:
        if rule["UI_Category"].lower() == category.lower():
            return rule
    
    # 2. 包含匹配: "Beauty" in "Beauty / Spa / Salon"
    for rule in self.reasoning_data:
        if ui_cat in category_lower or category_lower in ui_cat:
            return rule
    
    # 3. 关键词匹配: "beauty" in "beauty/spa/salon".split("/")
    for rule in self.reasoning_data:
        keywords = ui_cat.replace("/", " ").replace("-", " ").split()
        if any(kw in category_lower for kw in keywords):
            return rule
    
    # 4. 无匹配: 返回默认规则
    return {}  # → 使用 Minimalism + Flat Design 默认
```

### 决策规则 (Decision_Rules)

这是一个 JSON 字段，包含条件逻辑：

```json
{
  "if_luxury": "switch-to-liquid-glass",
  "if_conversion_focused": "add-urgency-colors",
  "if_checkout": "emphasize-trust"
}
```

**当前状态**: 这些规则目前存储在 CSV 中但**未被代码自动执行**。它们作为提示信息传递给 AI，由 AI 在生成代码时参考。这是一个有意的设计选择——让 AI 做最终决策，而不是硬编码条件分支。

---

## 优先匹配选择算法

当推理规则说 "style_priority = Glassmorphism + Flat Design" 时，如何从 3 个搜索结果中选最佳匹配？

```python
def _select_best_match(self, results, priority_keywords):
    # 1. 精确名称匹配
    for priority in priority_keywords:
        for result in results:
            if priority.lower() in result["Style Category"].lower():
                return result  # 直接返回，最高优先
    
    # 2. 加权评分
    for result in results:
        score = 0
        for kw in priority_keywords:
            if kw in result["Style Category"]:  score += 10  # 名称匹配
            elif kw in result["Keywords"]:       score += 3   # 关键词匹配
            elif kw in str(result):              score += 1   # 任意字段匹配
    
    # 3. 返回最高分，或默认第一个
    return sorted_by_score[0] if best_score > 0 else results[0]
```

**评分权重**: 名称匹配 (10) >> 关键词匹配 (3) >> 任意匹配 (1)

---

## 输出格式化

### ASCII Box 格式 (默认)

```
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║  TARGET: Serenity Spa - RECOMMENDED DESIGN SYSTEM                                    ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
┌─────────────────────────────────────────────────────────────────────────────────────────┐
├─── PATTERN ─────────────────────────────────────────────────────────────────────────────┤
│  Name: Hero-Centric + Social Proof                                                      │
├─── STYLE ───────────────────────────────────────────────────────────────────────────────┤
│  Name: Soft UI Evolution                                                                │
├─── COLORS ──────────────────────────────────────────────────────────────────────────────┤
│     ██ Primary:     #E8B4B8   (--color-primary)                                         │
├─── TYPOGRAPHY ──────────────────────────────────────────────────────────────────────────┤
│  Cormorant Garamond / Montserrat                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**技术细节**:
- `hex_to_ansi()`: 将 HEX 颜色转为 ANSI True Color 色块 `██`
- `ansi_ljust()`: 考虑 ANSI 转义序列的零宽度特性进行对齐
- `section_header()`: Unicode box-drawing 字符构建分隔线
- `wrap_text()`: 长文本自动换行（保持 box 宽度）

### Markdown 格式

标准 Markdown 表格和列表，适合保存为文档。

---

## 持久化系统 (Master + Overrides)

### 设计理念

```
design-system/
├── my-project/
│   ├── MASTER.md        ← 全局规则（所有页面都遵循）
│   └── pages/
│       ├── dashboard.md  ← 仪表盘页面的覆盖规则
│       ├── checkout.md   ← 结账页面的覆盖规则
│       └── settings.md   ← 设置页面的覆盖规则
```

### 使用逻辑

```
构建某个页面时:
1. 读取 MASTER.md (全局规则)
2. 检查 pages/{page-name}.md 是否存在
3. 如果存在 → 该文件的规则覆盖 MASTER
4. 如果不存在 → 仅使用 MASTER 规则
```

### MASTER.md 内容

自动生成的完整设计系统文档，包含：
- 配色方案（含 CSS 变量名）
- 字体配置（含 Google Fonts URL 和 CSS Import）
- 间距变量表 (4px → 64px)
- 阴影深度表 (sm → xl)
- 按钮 CSS 规范
- 卡片 CSS 规范
- 输入框 CSS 规范
- 模态框 CSS 规范
- 风格指南
- 反模式清单
- 交付前检查清单

### 页面覆盖文件的智能生成

`_generate_intelligent_overrides()` 不是简单的空模板，而是：

1. **搜索相关风格**: `search(page_context, "style", 1)`
2. **搜索 UX 指南**: `search(page_context, "ux", 3)`
3. **搜索着陆页模式**: `search(page_context, "landing", 1)`
4. **检测页面类型**: 基于关键词匹配 10 种页面类型
5. **生成针对性覆盖**: 根据页面类型生成布局、间距、组件建议

```python
page_patterns = [
    (["dashboard", "admin", ...], "Dashboard / Data View"),
    (["checkout", "payment", ...], "Checkout / Payment"),
    (["settings", "profile", ...], "Settings / Profile"),
    (["landing", "marketing", ...], "Landing / Marketing"),
    (["login", "signin", ...], "Authentication"),
    ...
]
```

---

## 关键设计决策

| 决策 | 选择 | 为什么 |
|------|------|--------|
| 先搜产品再搜其他 | 是 | 产品类型决定了推理规则，推理规则影响风格优先级 |
| 推理规则外置 CSV | 是 | 非开发者可以编辑；新增产品类型只需加一行 |
| 默认 ASCII 格式 | 是 | 终端直接可读，不需要 Markdown 渲染器 |
| ANSI 颜色色块 | 是 | 让用户直观看到推荐的颜色 |
| Master+Override 模式 | 是 | 支持多页面项目，每个页面可以有例外 |
