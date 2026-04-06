# 03 — 数据层设计：CSV 知识库规范

## 设计目标

> 让非开发者也能维护知识库：用 Excel 编辑 CSV，用 Git 追踪变更。

---

## 为什么选 CSV

| 对比维度 | CSV | JSON | SQLite | YAML |
|---------|-----|------|--------|------|
| Excel 兼容 | ✅ 原生打开 | ❌ 需工具 | ❌ 需工具 | ❌ 需工具 |
| Git diff | ✅ 行级 diff | ⚠️ 嵌套噪音 | ❌ 二进制 | ✅ 行级 |
| 解析依赖 | ✅ Python csv 标准库 | ✅ json 标准库 | ❌ sqlite3 | ❌ 需 PyYAML |
| 类型系统 | ❌ 全是字符串 | ✅ 类型丰富 | ✅ 类型丰富 | ✅ 类型丰富 |
| 嵌套结构 | ❌ 扁平 | ✅ 任意嵌套 | ✅ 关系型 | ✅ 任意嵌套 |
| 适合大小 | <100MB | <10MB | 任意 | <10MB |

**结论**：CSV 在"人类可编辑性"和"机器可解析性"之间取得最佳平衡。

---

## CSV 设计规范

### 基础规范

```
规则 1: 编码必须是 UTF-8（无 BOM）
规则 2: 第一行是列头（Header Row）
规则 3: 第一列是序号（No），从 1 开始递增
规则 4: 必须有至少一个可搜索列（Keywords / Name / Category）
规则 5: 字段值用双引号包裹（当值包含逗号时）
规则 6: 每行代表一个独立的知识单元（不依赖上下行）
规则 7: 空值用空字符串 "" 表示，不用 NULL 或 N/A
```

### 列类型分类

| 列类型 | 用途 | 示例列名 | 说明 |
|--------|------|---------|------|
| 标识列 | 唯一标识 | No, ID | 序号或唯一 ID |
| 名称列 | 人可读名称 | Name, Title, Category | 显示用 |
| 搜索列 | BM25 索引 | Keywords, Tags, Description | 越丰富搜索越准 |
| 内容列 | 知识正文 | Instructions, Details, Notes | 可较长 |
| 分类列 | 分类标签 | Type, Category, Severity | 枚举值 |
| 代码列 | 代码片段 | Code_Good, Code_Bad, CSS | 技术内容 |
| 链接列 | 外部引用 | URL, Docs_URL, Image | 链接地址 |
| 元数据列 | 辅助信息 | Severity, Priority, Score | 排序/过滤用 |

### 命名规范

```
文件名:    kebab-case.csv           例: ui-reasoning.csv
列名:      Title_Case 或 PascalCase  例: Product_Type, Keywords, Best_For
枚举值:    大写或首字母大写           例: HIGH, MEDIUM, LOW
多值分隔:  逗号 + 空格               例: "React, Vue, Angular"
```

---

## 域数据 CSV 模板

### 通用主域模板

```csv
No,Name,Category,Keywords,Description,Best_For,Notes
1,Example Item,Category A,"keyword1, keyword2, keyword3",This is a description,Scenario A + Scenario B,Additional notes
```

### 推理规则 CSV 模板

```csv
No,Category,Recommended_Strategy,Priority_Hints,Key_Rules,Decision_Rules,Anti_Patterns,Severity
1,Category A,Strategy X + Strategy Y,"hint1, hint2",Rule description here,"{""if_condition_a"": ""action_a"", ""if_condition_b"": ""action_b""}","Don't do X, Don't do Y",HIGH
```

**Decision_Rules 列特殊处理**：
- 值是 JSON 字符串，用双引号转义：`""`
- 由逻辑层解析为 dict
- 传递给 AI 上下文，由 AI 酌情应用

### 技术栈 CSV 模板

```csv
No,Category,Guideline,Description,Do,Don't,Code_Good,Code_Bad,Severity,Docs_URL
1,State Management,Use useState for local state,Simple state should use useState,useState for forms,Class component state,"const [x, setX] = useState(0)","this.state = {x: 0}",Medium,https://react.dev/...
```

---

## 数据关系设计

### 1:1 映射（推理规则 ↔ 主分类）

```
products.csv                    reasoning.csv
┌────────────────────┐          ┌────────────────────┐
│ No │ Product_Type   │          │ No │ Category       │
├────┼────────────────┤          ├────┼────────────────┤
│ 1  │ SaaS (General) │ ◄──1:1──► │ 1  │ SaaS (General) │
│ 2  │ E-commerce     │ ◄──1:1──► │ 2  │ E-commerce     │
│ 3  │ Healthcare     │ ◄──1:1──► │ 3  │ Healthcare     │
└────┴────────────────┘          └────┴────────────────┘
```

**约束**：每个产品类型必须有且只有一条推理规则。

### 1:1 映射（产品 ↔ 配色）

```
products.csv                    colors.csv
┌────────────────────┐          ┌────────────────────┐
│ No │ Product_Type   │          │ No │ Product_Type   │
├────┼────────────────┤          ├────┼────────────────┤
│ 1  │ SaaS (General) │ ◄──1:1──► │ 1  │ SaaS (General) │
└────┴────────────────┘          └────┴────────────────┘
```

### 独立域（无外键）

```
styles.csv    ← 独立搜索，不通过外键关联
typography.csv ← 独立搜索
charts.csv    ← 独立搜索
```

独立域通过 BM25 搜索关联，而非数据库外键。

---

## 数据质量保障

### 一致性检查脚本

```python
# _sync_all.py 的核心逻辑（伪代码）
def validate_data():
    products = load_csv("products.csv")
    colors = load_csv("colors.csv")
    reasoning = load_csv("reasoning.csv")

    # 检查 1: 三表行数一致
    assert len(products) == len(colors) == len(reasoning)

    # 检查 2: 产品类型 1:1 对应
    product_types = {r["Product_Type"] for r in products}
    color_types = {r["Product_Type"] for r in colors}
    reasoning_types = {r["Category"] for r in reasoning}
    assert product_types == color_types == reasoning_types

    # 检查 3: 无重复产品类型
    assert len(product_types) == len(products)

    # 检查 4: 颜色格式验证
    for row in colors:
        for col in ["Primary", "Secondary", "Accent"]:
            assert re.match(r'^#[0-9A-Fa-f]{6}$', row[col])

    # 检查 5: Severity 枚举验证
    valid_severities = {"HIGH", "MEDIUM", "LOW"}
    for row in reasoning:
        assert row["Severity"] in valid_severities
```

### WCAG 色彩对比检查

```python
def check_contrast(fg: str, bg: str) -> float:
    """计算两个颜色的 WCAG 对比度"""
    l1 = relative_luminance(fg)
    l2 = relative_luminance(bg)
    ratio = (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)
    return ratio  # ≥ 3.0 for AA (large), ≥ 4.5 for AA (normal), ≥ 7.0 for AAA

# 对每条配色记录:
# - Primary vs OnPrimary ≥ 4.5:1
# - Accent vs Background ≥ 3.0:1
# - Foreground vs Background ≥ 7.0:1
```

---

## 数据扩展指南

### 添加新域

1. 创建 `data/{new-domain}.csv`
2. 在 `core.py` 的 `CSV_CONFIG` 中注册
3. 在 `core.py` 的 `DOMAIN_KEYWORDS` 中添加检测规则
4. 更新 Skill 模板中的搜索参考表

### 添加新行

直接在 CSV 末尾追加新行，更新 `No` 列序号。

### 添加新列

1. 在 CSV 表头添加新列
2. 如需搜索：在 `CSV_CONFIG` 的 `search_cols` 中添加
3. 如需显示：在 `CSV_CONFIG` 的 `output_cols` 中添加

### 数据量上限建议

| 规模 | 搜索性能 | 加载时间 | 建议 |
|------|---------|---------|------|
| <1K 行 | <10ms | <50ms | 无忧 |
| 1K-10K 行 | <50ms | <200ms | 良好 |
| 10K-100K 行 | <500ms | <2s | 考虑分域拆文件 |
| >100K 行 | >5s | >20s | 需要索引/数据库 |
