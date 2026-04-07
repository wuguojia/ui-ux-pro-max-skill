# 03 — BM25 搜索引擎分析

## 概述

搜索引擎是整个项目的核心，位于 `src/ui-ux-pro-max/scripts/core.py`。它使用 **BM25 (Best Matching 25)** 算法对 CSV 数据进行全文搜索排名。

---

## BM25 算法原理

### 什么是 BM25？

BM25 是信息检索领域最经典的排名算法之一，被 Elasticsearch、Lucene 等搜索引擎广泛使用。它的核心思想是：

> **一个词在文档中出现得越频繁、在整个语料库中出现得越稀有，这个词对文档的重要性就越高。**

### 数学公式

```
Score(D, Q) = Σ IDF(qi) × f(qi, D) × (k1 + 1)
               ─────────────────────────────────
               f(qi, D) + k1 × (1 - b + b × |D| / avgdl)
```

其中：
- `D` = 文档
- `Q` = 查询
- `qi` = 查询中的第 i 个词
- `f(qi, D)` = 词 qi 在文档 D 中的出现频率 (TF)
- `|D|` = 文档 D 的长度
- `avgdl` = 语料库中所有文档的平均长度
- `k1` = TF 饱和参数 (本项目用 1.5)
- `b` = 长度归一化参数 (本项目用 0.75)
- `IDF(qi)` = 逆文档频率 = log((N - n(qi) + 0.5) / (n(qi) + 0.5) + 1)

### 参数含义

| 参数 | 值 | 作用 |
|------|-----|------|
| `k1 = 1.5` | TF 饱和度 | 控制词频的影响力。k1 越大，高频词的加分越多；k1=0 则完全不考虑频率 |
| `b = 0.75` | 长度归一化 | 控制文档长度的影响。b=1 完全归一化；b=0 不考虑长度 |

---

## 代码逐行解读

### 1. 分词器 (`tokenize`)

```python
def tokenize(self, text):
    text = re.sub(r'[^\w\s]', ' ', str(text).lower())
    return [w for w in text.split() if len(w) > 2]
```

**做了什么**：
1. 转小写
2. 去除标点符号（保留字母、数字、空格）
3. 按空格分割
4. 过滤长度 ≤ 2 的词（如 "a", "to", "ui"）

**注意**: `\w` 匹配 `[a-zA-Z0-9_]`，但也匹配 Unicode 字母。中文字符会保留但不会被空格分割——所以本引擎**对中文查询效果有限**，主要面向英文关键词搜索。

**过滤影响**: 像 "ui", "ux" 这样的 2 字母词会被过滤掉。这是一个有意的设计权衡：减少噪音 vs 丢失部分短缩写。实际使用中，用户通常会输入更长的描述如 "minimalism dark mode"。

### 2. 索引构建 (`fit`)

```python
def fit(self, documents):
    # 分词
    self.corpus = [self.tokenize(doc) for doc in documents]
    self.N = len(self.corpus)
    
    # 计算文档长度和平均长度
    self.doc_lengths = [len(doc) for doc in self.corpus]
    self.avgdl = sum(self.doc_lengths) / self.N
    
    # 统计文档频率 (DF): 每个词在多少个文档中出现
    for doc in self.corpus:
        seen = set()
        for word in doc:
            if word not in seen:
                self.doc_freqs[word] += 1
                seen.add(word)
    
    # 计算 IDF
    for word, freq in self.doc_freqs.items():
        self.idf[word] = log((self.N - freq + 0.5) / (freq + 0.5) + 1)
```

**关键设计决策**：
- 使用 `set()` 确保每个词在每个文档中只计数一次（DF 不是 TF）
- IDF 公式末尾 `+1` 防止负值（当词出现在超过一半文档中时）

### 3. 评分 (`score`)

```python
def score(self, query):
    query_tokens = self.tokenize(query)
    scores = []
    
    for idx, doc in enumerate(self.corpus):
        score = 0
        doc_len = self.doc_lengths[idx]
        
        # 计算当前文档中每个词的 TF
        term_freqs = defaultdict(int)
        for word in doc:
            term_freqs[word] += 1
        
        # 对查询中每个词计算 BM25 分数
        for token in query_tokens:
            if token in self.idf:
                tf = term_freqs[token]
                idf = self.idf[token]
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * doc_len / self.avgdl)
                score += idf * numerator / denominator
        
        scores.append((idx, score))
    
    return sorted(scores, key=lambda x: x[1], reverse=True)
```

**时间复杂度**: O(N × Q × D_avg)
- N = 文档数量（通常 < 200）
- Q = 查询词数量（通常 < 10）
- D_avg = 平均文档长度

对于本项目的数据规模（最大 CSV ~1700 行），这完全在毫秒级内完成。

---

## 搜索文档的构建方式

搜索不是对 CSV 的所有列进行搜索，而是只搜索 `search_cols` 指定的列：

```python
# 将搜索列拼接成一个字符串作为"文档"
documents = [" ".join(str(row.get(col, "")) for col in search_cols) for row in data]
```

例如，对于 `style` 域：

| 原始 CSV 行 | 搜索文档 |
|-------------|----------|
| Style Category=Glassmorphism, Keywords=glass blur..., Type=Modern | "Glassmorphism glass blur transparency... Modern premium SaaS..." |

这种设计的好处是：
1. **控制搜索范围** — 不会被无关列（如 CSS 代码）干扰
2. **提高精度** — 搜索列是精心选择的高信号列
3. **输出与搜索分离** — 搜索用 5 列，但输出可以用 16 列

---

## 域自动检测 (`detect_domain`)

当用户不指定 `--domain` 时，系统自动检测最相关的域：

```python
domain_keywords = {
    "color": ["color", "palette", "hex", ...],
    "style": ["style", "design", "ui", "minimalism", ...],
    "product": ["saas", "ecommerce", "fintech", ...],
    ...
}

# 对每个域计算匹配分数
scores = {
    domain: sum(1 for kw in keywords 
                if re.search(r'\b' + re.escape(kw) + r'\b', query_lower))
    for domain, keywords in domain_keywords.items()
}
```

**检测策略**：
1. 将查询转小写
2. 用**词边界正则** `\b...\b` 匹配每个域的关键词
3. 每匹配一个关键词得 1 分
4. 选得分最高的域
5. 如果全部为 0，默认返回 `"style"`

**局限性**：
- `"typography"` 的关键词很少（只有 4 个），容易被 `"google-fonts"` 抢走（有 19 个关键词）
- 多义词可能导致误判（如 "dashboard" → product，但用户可能想搜 style）

---

## CSV 解析

项目使用 Python 标准库的 `csv.DictReader`，这是一个成熟的 RFC-4180 兼容解析器：

```python
def _load_csv(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f))
```

返回 `[{"col1": "val1", "col2": "val2"}, ...]` 格式。

---

## 搜索接口总结

### `search(query, domain?, maxResults?) → SearchResult`

- 自动检测域（如果未指定）
- 在指定域的 CSV 中执行 BM25 搜索
- 返回 top N 结果（默认 3）

### `search_stack(query, stack, maxResults?) → SearchResult`

- 在 `stacks/{stack}.csv` 中搜索
- 使用固定的搜索列和输出列
- 16 个可选技术栈

### 输出格式

```json
{
  "domain": "style",
  "query": "glassmorphism dark mode",
  "file": "styles.csv",
  "count": 3,
  "results": [
    {"Style Category": "Glassmorphism", "Keywords": "...", ...},
    {"Style Category": "Dark Mode Premium", ...},
    {"Style Category": "Aurora UI", ...}
  ]
}
```

---

## 为什么选 BM25 而不是向量搜索？

| 考量 | BM25 | 向量搜索 (Embedding) |
|------|------|---------------------|
| **依赖** | 零（纯 Python） | 需要 numpy/torch + 模型 |
| **安装成本** | 0 | 数百 MB |
| **适用场景** | 关键词精确匹配 | 语义模糊匹配 |
| **数据规模** | < 10000 行完全够用 | 百万级才需要 |
| **可解释性** | 高（可以看到哪个词匹配了） | 低（黑盒） |
| **部署环境** | 任何有 Python 的地方 | 需要特定运行时 |

**结论**: 对于 6000 行以下的结构化 CSV 数据，BM25 是最合适的选择——快速、零依赖、可解释。
