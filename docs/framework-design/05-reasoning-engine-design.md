# 05 — 推理引擎设计

## 推理引擎是什么

> 搜索引擎回答"有什么"，推理引擎回答"该用什么"。

```
没有推理:  search("SaaS") → 返回 3 个风格 → AI 随机选一个
有推理:    search("SaaS") → 推理引擎说"SaaS 应优先 Glassmorphism" → 搜索时注入优先词 → 返回排序后的最佳匹配
```

---

## 推理数据结构

### reasoning.csv Schema

```csv
No,Category,Recommended_Strategy,Priority_Hints,Key_Rules,Decision_Rules,Anti_Patterns,Severity
```

| 列 | 类型 | 说明 | 示例 |
|----|------|------|------|
| No | 序号 | 自增 | 1, 2, 3... |
| Category | 字符串 | 与主分类表 1:1 映射 | "SaaS (General)" |
| Recommended_Strategy | 字符串 | 推荐策略/模式 | "Hero + Features + CTA" |
| Priority_Hints | 字符串 | 搜索优先级关键词 | "Glassmorphism, Flat Design" |
| Key_Rules | 字符串 | 关键规则描述 | "优先信任蓝配色" |
| Decision_Rules | JSON 字符串 | 条件-动作规则集 | `{"if_ux_focused": "prioritize-minimalism"}` |
| Anti_Patterns | 字符串 | 反模式警告 | "Excessive animation" |
| Severity | 枚举 | 规则优先级 | HIGH / MEDIUM / LOW |

---

## 三级匹配算法

推理引擎通过分类名称匹配推理规则，使用从精确到模糊的三级策略：

```python
def find_reasoning_rule(category: str, reasoning_data: list[dict]) -> dict:
    """
    三级匹配策略，越精确优先级越高。

    Args:
        category: 产品/知识类型名称（来自搜索结果）
        reasoning_data: 推理规则 CSV 的全部行

    Returns:
        匹配到的推理规则行，或空 dict（未匹配时）
    """

    category_lower = category.lower().strip()

    # Level 1: 精确匹配（最高优先级）
    for rule in reasoning_data:
        if rule["Category"].lower().strip() == category_lower:
            return rule

    # Level 2: 包含匹配
    for rule in reasoning_data:
        rule_cat = rule["Category"].lower().strip()
        if rule_cat in category_lower or category_lower in rule_cat:
            return rule

    # Level 3: 关键词匹配（最低优先级）
    for rule in reasoning_data:
        rule_cat = rule["Category"].lower().strip()
        # 按 "/" 和 "-" 和空格拆分
        keywords = re.split(r'[/\-\s]+', rule_cat)
        keywords = [kw for kw in keywords if len(kw) >= 3]
        if any(kw in category_lower for kw in keywords):
            return rule

    # 未匹配: 返回空 dict，由调用者使用默认值
    return {}
```

### 匹配示例

```
输入: "SaaS (General)"
Level 1: ✅ 精确匹配 reasoning["SaaS (General)"]

输入: "E-commerce Platform"
Level 1: ❌ 无精确匹配
Level 2: ✅ "E-commerce" 包含在 "E-commerce Platform" 中

输入: "Online Grocery Delivery"
Level 1: ❌
Level 2: ❌
Level 3: ✅ reasoning["Food Delivery / Grocery"] 中的 "grocery" 匹配
```

---

## Decision_Rules 设计

### 数据格式

JSON 对象，键是条件（自然语言），值是动作（自然语言）：

```json
{
    "if_ux_focused": "prioritize-minimalism",
    "if_data_heavy": "add-glassmorphism-for-panels",
    "if_checkout": "emphasize-trust-signals",
    "if_luxury": "switch-to-liquid-glass",
    "if_pre_launch": "use-waitlist-pattern",
    "if_mobile_first": "reduce-animation-complexity"
}
```

### 解析与应用

```python
import json

def apply_reasoning(category: str, reasoning_data: list[dict]) -> dict:
    """
    应用推理规则，返回推理结果。

    Returns:
        {
            "strategy": str,           # 推荐策略
            "priority_hints": list,    # 搜索优先词
            "key_rules": str,          # 关键规则
            "decision_rules": dict,    # 条件-动作映射
            "anti_patterns": str,      # 反模式
            "severity": str            # 优先级
        }
    """
    rule = find_reasoning_rule(category, reasoning_data)

    if not rule:
        return DEFAULT_REASONING  # 使用默认推理结果

    # 解析 Decision_Rules JSON
    decision_rules = {}
    try:
        raw = rule.get("Decision_Rules", "{}")
        decision_rules = json.loads(raw) if raw else {}
    except json.JSONDecodeError:
        decision_rules = {}

    # 解析 Priority_Hints 为列表
    hints_str = rule.get("Priority_Hints", "")
    priority_hints = [h.strip() for h in hints_str.split(",") if h.strip()]

    return {
        "strategy": rule.get("Recommended_Strategy", ""),
        "priority_hints": priority_hints,
        "key_rules": rule.get("Key_Rules", ""),
        "decision_rules": decision_rules,
        "anti_patterns": rule.get("Anti_Patterns", ""),
        "severity": rule.get("Severity", "MEDIUM"),
    }
```

---

## 推理如何引导搜索

### 搜索注入机制

推理引擎不直接返回最终结果，而是**修改搜索查询**来影响结果排序：

```python
def reasoning_guided_search(query: str, category: str):
    # Step 1: 正常搜索产品域
    product_result = search(query, "product", max_results=1)
    detected_category = product_result[0]["Category"]  # e.g., "SaaS (General)"

    # Step 2: 获取推理规则
    reasoning = apply_reasoning(detected_category, reasoning_data)
    priority_hints = reasoning["priority_hints"]  # e.g., ["Glassmorphism", "Flat Design"]

    # Step 3: 将推理优先词注入搜索查询
    enhanced_query = query + " " + " ".join(priority_hints)
    #  原始: "SaaS dashboard"
    #  增强: "SaaS dashboard Glassmorphism Flat Design"

    # Step 4: 用增强查询搜索其他域
    style_results = search(enhanced_query, "style", max_results=3)
    color_results = search(enhanced_query, "color", max_results=2)
    # ...

    return {
        "category": detected_category,
        "reasoning": reasoning,
        "style": select_best_match(style_results, priority_hints),
        "colors": color_results[0],
        # ...
    }
```

### 搜索注入的效果

```
无推理:
  search("SaaS dashboard", "style") → [Minimalism, Glassmorphism, Flat Design]
                                        (按通用 BM25 排序)

有推理:
  推理引擎说: priority_hints = ["Glassmorphism", "Flat Design"]
  search("SaaS dashboard Glassmorphism Flat Design", "style") → [Glassmorphism, Flat Design, Minimalism]
                                                                  ↑ 推理引擎使其排名提升
```

---

## 最佳匹配选择

```python
def select_best_match(results: list[dict], priority_keywords: list[str]) -> dict:
    """
    从搜索结果中选择与推理优先词最匹配的结果。

    策略:
    1. 对每个结果计算"优先词命中数"
    2. 命中数最多的结果优先
    3. 命中数相同时，取 BM25 分数更高的
    """
    if not results:
        return {}
    if not priority_keywords:
        return results[0]  # 无推理时返回 BM25 第一名

    best = results[0]
    best_hits = 0

    for result in results:
        # 将结果所有值拼成一个字符串
        result_text = " ".join(str(v) for v in result.values()).lower()

        # 计算优先词命中数
        hits = sum(1 for kw in priority_keywords if kw.lower() in result_text)

        if hits > best_hits:
            best_hits = hits
            best = result

    return best
```

---

## 默认回退值

当推理引擎未找到匹配规则时，使用安全的默认值：

```python
DEFAULT_REASONING = {
    "strategy": "Standard Layout",
    "priority_hints": ["Minimalism", "Clean Design"],
    "key_rules": "Follow standard best practices",
    "decision_rules": {},
    "anti_patterns": "",
    "severity": "MEDIUM",
}
```

**设计原则**：默认值应该是最通用、最安全的选择，不会对任何行业产生负面影响。

---

## 推理与搜索的完整流程

```
用户: "做一个美容 Spa 预约系统"
  │
  ▼
Step 1: search("beauty spa", "product")
  → 匹配: "Beauty / Spa / Salon"
  │
  ▼
Step 2: find_reasoning_rule("Beauty / Spa / Salon")
  → Level 1 精确匹配
  → priority_hints: ["Soft UI", "Minimalism"]
  → decision_rules: {"if_luxury": "switch-to-liquid-glass"}
  → anti_patterns: "Overly corporate look"
  │
  ▼
Step 3: 增强搜索
  → search("beauty spa Soft UI Minimalism", "style")
  → search("beauty spa", "color")  # 颜色不注入风格词
  → search("beauty spa Soft UI Minimalism", "typography")
  │
  ▼
Step 4: select_best_match()
  → 风格: Soft UI Evolution (命中 "Soft UI")
  → 配色: Beauty/Spa palette (柔和粉色系)
  → 字体: 优雅衬线 + 无衬线搭配
  │
  ▼
Step 5: 组装输出
  → {category, reasoning, style, colors, typography, effects, anti_patterns}
```
