# 18 — 测试策略

## 概述

框架的测试策略覆盖三层架构的每一层，从单元测试到端到端验证。

---

## 测试金字塔

```
          ╱ ╲
         ╱ E2E╲            少量: CLI 安装/搜索全流程
        ╱───────╲
       ╱ 集成测试 ╲         中量: 多域搜索、推理+搜索联动
      ╱─────────────╲
     ╱   单元测试     ╲     大量: BM25 算法、解析函数、配置加载
    ╱───────────────────╲
   ╱    数据质量检查      ╲  持续: CSV 格式、一致性、完整性
  ╱─────────────────────────╲
```

---

## Layer 1: 数据质量测试

### CSV 格式验证

```python
# test_data_quality.py

def test_csv_encoding():
    """所有 CSV 必须是 UTF-8 编码"""
    for csv_file in glob.glob("data/*.csv"):
        with open(csv_file, 'rb') as f:
            raw = f.read()
            # 检查无 BOM
            assert not raw.startswith(b'\xef\xbb\xbf'), f"{csv_file} has BOM"
            # 检查可 UTF-8 解码
            raw.decode('utf-8')

def test_csv_headers():
    """所有 CSV 第一列是 No"""
    for csv_file in glob.glob("data/*.csv"):
        with open(csv_file) as f:
            reader = csv.reader(f)
            headers = next(reader)
            assert headers[0].strip() in ("No", "no", "NO"), \
                f"{csv_file}: first column is '{headers[0]}', expected 'No'"

def test_csv_no_empty_rows():
    """CSV 不应有空行"""
    for csv_file in glob.glob("data/*.csv"):
        with open(csv_file) as f:
            for i, line in enumerate(f):
                assert line.strip(), f"{csv_file} line {i+1} is empty"
```

### 数据一致性验证

```python
def test_product_color_1to1():
    """产品表和配色表必须 1:1 对应"""
    products = load_csv("products.csv")
    colors = load_csv("colors.csv")

    product_types = {r["Product_Type"] for r in products}
    color_types = {r["Product_Type"] for r in colors}

    assert product_types == color_types, \
        f"Mismatch: {product_types.symmetric_difference(color_types)}"

def test_product_reasoning_1to1():
    """产品表和推理表必须 1:1 对应"""
    products = load_csv("products.csv")
    reasoning = load_csv("reasoning.csv")

    product_types = {r["Product_Type"] for r in products}
    reasoning_cats = {r["Category"] for r in reasoning}

    assert product_types == reasoning_cats

def test_no_duplicate_products():
    """产品类型不应重复"""
    products = load_csv("products.csv")
    types = [r["Product_Type"] for r in products]
    assert len(types) == len(set(types)), "Duplicate product types found"
```

### 色彩对比度验证

```python
def test_wcag_contrast():
    """所有配色必须满足 WCAG 对比度要求"""
    colors = load_csv("colors.csv")

    for row in colors:
        # Primary vs OnPrimary: ≥ 4.5:1 (WCAG AA)
        ratio = contrast_ratio(row["Primary"], row["On_Primary"])
        assert ratio >= 4.5, \
            f"{row['Product_Type']}: Primary/OnPrimary contrast {ratio:.1f} < 4.5"

        # Foreground vs Background: ≥ 7.0:1 (WCAG AAA)
        ratio = contrast_ratio(row["Foreground"], row["Background"])
        assert ratio >= 7.0, \
            f"{row['Product_Type']}: Fg/Bg contrast {ratio:.1f} < 7.0"
```

---

## Layer 2: 单元测试

### BM25 算法测试

```python
# test_bm25.py

def test_bm25_basic_ranking():
    """包含查询词的文档应排在前面"""
    bm25 = BM25()
    bm25.fit(["apple banana cherry", "dog cat fish", "apple pie crust"])

    results = bm25.score("apple")
    indices = [idx for idx, _ in results]

    assert 0 in indices  # "apple banana cherry"
    assert 2 in indices  # "apple pie crust"
    assert 1 not in indices  # "dog cat fish" 不含 apple

def test_bm25_term_frequency():
    """高频词应获得更高分数（在饱和范围内）"""
    bm25 = BM25()
    bm25.fit(["apple", "apple apple", "apple apple apple"])

    results = bm25.score("apple")
    scores = {idx: score for idx, score in results}

    # 更多 apple 的文档分数更高
    assert scores[2] >= scores[1] >= scores[0]

def test_bm25_empty_query():
    """空查询应返回空结果"""
    bm25 = BM25()
    bm25.fit(["some document"])
    assert bm25.score("") == []

def test_bm25_no_match():
    """查询词不在任何文档中应返回空"""
    bm25 = BM25()
    bm25.fit(["apple banana"])
    assert bm25.score("zebra") == []

def test_tokenize():
    """分词应小写化并过滤短词"""
    bm25 = BM25()
    tokens = bm25.tokenize("Hello World AI ML Test")
    assert "hello" in tokens
    assert "world" in tokens
    assert "test" in tokens
    assert "ai" not in tokens  # 太短 (<3)
    assert "ml" not in tokens  # 太短
```

### 域检测测试

```python
def test_detect_domain_style():
    assert detect_domain("glassmorphism dark mode") == "style"

def test_detect_domain_color():
    assert detect_domain("blue color palette") == "color"

def test_detect_domain_default():
    """无明确关键词时返回默认域"""
    assert detect_domain("asdfghjkl") == DEFAULT_DOMAIN

def test_detect_domain_case_insensitive():
    assert detect_domain("GLASSMORPHISM") == "style"
```

### 推理匹配测试

```python
def test_reasoning_exact_match():
    rules = [{"Category": "SaaS (General)", "Severity": "HIGH"}]
    result = find_reasoning_rule("SaaS (General)", rules)
    assert result["Severity"] == "HIGH"

def test_reasoning_partial_match():
    rules = [{"Category": "E-commerce", "Severity": "HIGH"}]
    result = find_reasoning_rule("E-commerce Platform", rules)
    assert result["Severity"] == "HIGH"

def test_reasoning_keyword_match():
    rules = [{"Category": "Food Delivery / Grocery", "Severity": "MEDIUM"}]
    result = find_reasoning_rule("Online Grocery Service", rules)
    assert result["Severity"] == "MEDIUM"

def test_reasoning_no_match():
    rules = [{"Category": "SaaS", "Severity": "HIGH"}]
    result = find_reasoning_rule("Completely Unknown", rules)
    assert result == {}  # 空 dict
```

---

## Layer 2: 集成测试

### 搜索集成测试

```python
def test_search_returns_results():
    """搜索已知存在的条目应返回结果"""
    results = search("SaaS dashboard", "product", 3)
    assert len(results) > 0
    assert "Product_Type" in results[0]

def test_search_auto_detect():
    """自动检测域应正确工作"""
    results = search("glassmorphism", None, 3)
    assert len(results) > 0

def test_search_stack():
    """技术栈搜索应返回结果"""
    results = search_stack("useState", "react", 3)
    assert len(results) > 0
```

### 生成器集成测试

```python
def test_generator_complete():
    """生成器应返回完整设计系统"""
    gen = DesignSystemGenerator("data/")
    result = gen.generate("SaaS dashboard", "TestProject")

    assert result["project_name"] == "TestProject"
    assert result["category"]  # 非空
    assert result["style"]["name"]  # 非空
    assert result["colors"]["primary"]  # 非空
    assert re.match(r'^#[0-9A-Fa-f]{6}$', result["colors"]["primary"])
```

---

## Layer 3: E2E 测试

### CLI 安装测试

```bash
#!/bin/bash
# test_e2e_install.sh

set -e

# 在临时目录测试
TMPDIR=$(mktemp -d)
cd "$TMPDIR"

# 测试 Claude 安装
npx {cli-name} init --ai claude --force --offline
test -f .claude/skills/{your-skill}/SKILL.md || exit 1
test -d .claude/skills/{your-skill}/data/ || exit 1
test -f .claude/skills/{your-skill}/scripts/core.py || exit 1

# 测试搜索
python3 .claude/skills/{your-skill}/scripts/search.py "test" --domain product || exit 1

# 清理
rm -rf "$TMPDIR"
echo "✅ E2E test passed"
```

---

## 搜索质量测试

### 查询-期望结果对

```python
QUALITY_TEST_CASES = [
    # (查询, 域, 期望结果包含的关键词)
    ("SaaS", "product", ["SaaS"]),
    ("glassmorphism", "style", ["Glassmorphism"]),
    ("blue trust", "color", ["blue"]),
    ("React useState", "react", ["useState"]),
]

def test_search_quality():
    for query, domain, expected_keywords in QUALITY_TEST_CASES:
        results = search(query, domain, 3)
        result_text = " ".join(str(v) for r in results for v in r.values())

        for keyword in expected_keywords:
            assert keyword.lower() in result_text.lower(), \
                f"'{keyword}' not found in results for '{query}'"
```

---

## CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  data-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: python -m pytest tests/test_data_quality.py -v

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: python -m pytest tests/test_bm25.py tests/test_search.py -v

  e2e:
    runs-on: ubuntu-latest
    needs: [data-quality, unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd cli && npm install && npm run build
      - run: bash tests/test_e2e_install.sh
```
