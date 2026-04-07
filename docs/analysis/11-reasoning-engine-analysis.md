# 11 — 推理引擎深度剖析

## 概述

推理引擎是设计系统生成器的"大脑"。它不只是搜索——它**理解产品类型**，然后用**预设的决策规则**指导风格、配色、字体的选择。

---

## 推理数据源：ui-reasoning.csv

### 结构

```csv
No, UI_Category, Recommended_Pattern, Style_Priority, Color_Mood,
Typography_Mood, Key_Effects, Decision_Rules, Anti_Patterns, Severity
```

### 161 条规则覆盖的行业

| 行业大类 | 产品类型数量 | 典型代表 |
|---------|-------------|---------|
| 技术与 SaaS | ~20 | SaaS, Micro SaaS, B2B, Developer Tools |
| 金融 | ~10 | Banking, Insurance, Crypto, Investment |
| 医疗健康 | ~8 | Healthcare, Dental, Pharmacy, Mental Health |
| 电商零售 | ~8 | E-commerce, Luxury, Marketplace, Grocery |
| 教育 | ~6 | EdTech, Online Course, Flashcard, Coding Bootcamp |
| 生活服务 | ~15 | Food Delivery, Ride Sharing, Hotel, Travel |
| 社交娱乐 | ~12 | Chat, Dating, Gaming, Streaming, Podcast |
| 创意产业 | ~8 | Photography, Portfolio, Design Studio, Museum |
| 健康生活 | ~10 | Fitness, Meditation, Sleep, Fasting, Habit |
| 专业服务 | ~10 | Legal, Construction, Real Estate, Logistics |
| 新兴领域 | ~8 | VPN, Meme, NFT, Coworking, Senior Care |

---

## 推理匹配算法

### 三级匹配策略

```python
def _find_reasoning_rule(self, category):
    # Level 1: 精确匹配
    for rule in self.reasoning_data:
        if rule["UI_Category"].lower() == category.lower():
            return rule

    # Level 2: 包含匹配
    for rule in self.reasoning_data:
        if ui_cat in category or category in ui_cat:
            return rule

    # Level 3: 关键词匹配
    for rule in self.reasoning_data:
        keywords = ui_cat.replace("/", " ").split()
        if any(kw in category for kw in keywords):
            return rule

    # Level 4: 默认回退
    return {}
```

---

## 推理规则示例

### SaaS (General)

| 字段 | 值 | 影响 |
|------|-----|------|
| Recommended_Pattern | Hero + Features + CTA | 着陆页结构 |
| Style_Priority | Glassmorphism + Flat Design | 搜索风格时优先匹配 |
| Color_Mood | Trust blue + Accent contrast | 引导配色方向 |
| Typography_Mood | Professional + Hierarchy | 引导字体选择 |
| Key_Effects | Subtle hover (200-250ms) | 动效建议 |
| Anti_Patterns | Excessive animation | 告诉 AI 不要做什么 |
| Decision_Rules | `{"if_ux_focused": "prioritize-minimalism"}` | 条件逻辑 |
| Severity | HIGH | 规则优先级 |

---

## Decision_Rules 字段

JSON 对象，键是条件，值是动作：

```json
{
  "if_ux_focused": "prioritize-minimalism",
  "if_data_heavy": "add-glassmorphism",
  "if_luxury": "switch-to-liquid-glass",
  "if_checkout": "emphasize-trust",
  "if_pre_launch": "use-waitlist-pattern"
}
```

这些规则**传递给 AI 上下文**，由 AI 理解并酌情应用——而非硬编码执行。这是有意的设计选择：AI 更擅长理解自然语言条件。

---

## 推理如何影响搜索

推理规则**影响搜索过程**而非直接返回结果：

```
Step 1: search("beauty spa", "product") -> "Beauty / Spa / Salon"
Step 2: reasoning["Beauty / Spa / Salon"] -> style_priority=["Soft UI", "Minimalism"]
Step 3: search("beauty spa Soft UI Minimalism", "style")
                              ^^^^^^^^^^^^^^^^
                              推理引擎注入的搜索词
```

---

## 与搜索引擎的协作

```
ui-reasoning.csv (161 条规则)
         |
         | _apply_reasoning()
         v
  style_priority + color_mood + typography_mood + effects + anti_patterns
         |
         | 注入到搜索查询
         v
  BM25 多域搜索 (core.py) -> style: 3结果, color: 2结果, typography: 2结果
         |
         | _select_best_match()
         v
  最终设计系统 (综合推理 + 搜索结果)
```

---

## 默认回退值

当推理引擎找不到匹配规则时：

```python
{
    "pattern": "Hero + Features + CTA",
    "style_priority": ["Minimalism", "Flat Design"],
    "color_mood": "Professional",
    "typography_mood": "Clean",
    "key_effects": "Subtle hover transitions",
    "anti_patterns": "",
    "decision_rules": {},
    "severity": "MEDIUM"
}
```

确保即使遇到未知产品类型，也能生成合理的设计系统。
