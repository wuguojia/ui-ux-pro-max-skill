# 04 — BM25 搜索引擎设计

## 为什么选 BM25

| 对比 | BM25 | TF-IDF | 向量 Embedding |
|------|------|--------|---------------|
| 外部依赖 | ✅ 零 | ✅ 零 | ❌ 需要模型 |
| 可预测性 | ✅ 同输入同输出 | ✅ 同输入同输出 | ⚠️ 模型版本影响 |
| 语义理解 | ❌ 关键词匹配 | ❌ 关键词匹配 | ✅ 语义相似 |
| 实现复杂度 | ~80 行 | ~50 行 | ~500+ 行 |
| 计算成本 | 极低 | 极低 | 较高 |
| 适合场景 | 结构化 CSV 搜索 | 简单文本搜索 | 自然语言理解 |

**结论**：对于 CSV 知识库搜索，BM25 是性价比最高的选择。

---

## 算法详解

### BM25 数学公式

```
BM25(Q, D) = Σ_{i=1}^{|Q|} IDF(q_i) × TF_component(q_i, D)

其中:
  IDF(q_i) = log( (N - n(q_i) + 0.5) / (n(q_i) + 0.5) + 1 )

  TF_component(q_i, D) = f(q_i, D) × (k1 + 1)
                          ─────────────────────────────────────────
                          f(q_i, D) + k1 × (1 - b + b × |D| / avgdl)

参数说明:
  Q       = 用户查询（分词后的列表）
  D       = 一个文档（CSV 一行的搜索列拼接）
  q_i     = 查询中的第 i 个词
  f(q_i,D)= 词 q_i 在文档 D 中出现的次数
  |D|     = 文档 D 的长度（token 数）
  avgdl   = 所有文档的平均长度
  N       = 文档总数
  n(q_i)  = 包含词 q_i 的文档数
  k1      = 1.5（词频饱和度参数）
  b       = 0.75（文档长度归一化参数）
```

### 参数调优指南

| 参数 | 默认值 | 调高效果 | 调低效果 | 建议范围 |
|------|--------|---------|---------|---------|
| k1 | 1.5 | 更重视高频词 | 更平衡、饱和更快 | 1.2 - 2.0 |
| b | 0.75 | 更惩罚长文档 | 更宽容长文档 | 0.0 - 1.0 |

- `k1 = 0`: 所有非零词频相同权重（退化为布尔匹配）
- `b = 0`: 完全忽略文档长度差异
- `b = 1`: 完全按长度归一化

---

## 完整实现

### BM25 类

```python
import math
import re
from collections import Counter

class BM25:
    """
    零外部依赖的 BM25 搜索引擎。

    用法:
        bm25 = BM25()
        bm25.fit(["document 1 text", "document 2 text", ...])
        results = bm25.score("search query")
        # results = [(index, score), ...] 按分数降序
    """

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: list[list[str]] = []
        self.doc_lengths: list[int] = []
        self.avgdl: float = 0
        self.idf: dict[str, float] = {}
        self.doc_freqs: dict[str, int] = {}
        self.N: int = 0

    def tokenize(self, text: str) -> list[str]:
        """
        分词器: 小写化 → 移除标点 → 过滤短词(<3字符)
        """
        text = text.lower()
        tokens = re.findall(r'\b\w+\b', text)
        return [t for t in tokens if len(t) >= 3]

    def fit(self, documents: list[str]) -> None:
        """
        建立索引: 分词 → 计算 IDF → 准备评分
        时间复杂度: O(N × L)，N=文档数，L=平均文档长度
        """
        self.corpus = [self.tokenize(doc) for doc in documents]
        self.N = len(self.corpus)
        self.doc_lengths = [len(doc) for doc in self.corpus]
        self.avgdl = sum(self.doc_lengths) / max(self.N, 1)

        # 计算每个词的文档频率 (DF)
        self.doc_freqs = {}
        for doc in self.corpus:
            seen = set()
            for word in doc:
                if word not in seen:
                    self.doc_freqs[word] = self.doc_freqs.get(word, 0) + 1
                    seen.add(word)

        # 计算 IDF
        self.idf = {}
        for word, freq in self.doc_freqs.items():
            self.idf[word] = math.log(
                (self.N - freq + 0.5) / (freq + 0.5) + 1
            )

    def score(self, query: str) -> list[tuple[int, float]]:
        """
        对所有文档评分，返回 [(index, score), ...] 按分数降序。
        时间复杂度: O(|Q| × N)，|Q|=查询词数，N=文档数
        """
        query_tokens = self.tokenize(query)
        scores = []

        for idx, doc in enumerate(self.corpus):
            doc_score = 0.0
            doc_len = self.doc_lengths[idx]
            tf_counter = Counter(doc)

            for token in query_tokens:
                if token not in self.idf:
                    continue

                tf = tf_counter.get(token, 0)
                idf = self.idf[token]

                # BM25 TF 分量
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (
                    1 - self.b + self.b * doc_len / self.avgdl
                )
                doc_score += idf * (numerator / denominator)

            if doc_score > 0:
                scores.append((idx, doc_score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores
```

---

## 域配置系统

### CSV_CONFIG 字典

```python
CSV_CONFIG = {
    "{domain-name}": {
        "file": "{domain}.csv",            # CSV 文件名
        "search_cols": [                    # 搜索时拼接这些列
            "Name",
            "Keywords",
            "Category",
            "Description",
        ],
        "output_cols": [                    # 输出时显示这些列
            "Name",
            "Category",
            "Description",
            "Best_For",
            "Notes",
        ],
    },
    # ... 更多域
}
```

### 搜索流程

```
1. 用户输入: query="SaaS dark mode", domain="style"

2. 加载 CSV:
   rows = load_csv("styles.csv")  # → [{"Name": ..., "Keywords": ...}, ...]

3. 构建文档:
   documents = []
   for row in rows:
       doc = " ".join(row[col] for col in search_cols)
       documents.append(doc)
   # → ["Glassmorphism glass, frost, blur...", "Minimalism clean, simple...", ...]

4. BM25 建索引:
   bm25 = BM25()
   bm25.fit(documents)

5. 评分:
   results = bm25.score("SaaS dark mode")
   # → [(12, 3.42), (7, 2.18), (3, 1.95), ...]

6. 取 Top N:
   top_n = results[:max_results]  # → [(12, 3.42), (7, 2.18), (3, 1.95)]

7. 组装输出:
   output = []
   for idx, score in top_n:
       result = {col: rows[idx][col] for col in output_cols}
       result["_score"] = score
       output.append(result)
```

---

## 域自动检测

### 关键词映射

```python
DOMAIN_KEYWORDS = {
    "{domain-a}": r"keyword1|keyword2|keyword3|keyword4",
    "{domain-b}": r"color|palette|hex|rgb|theme|scheme",
    "{domain-c}": r"font|typography|heading|body|pairing",
    # ...
}

def detect_domain(query: str) -> str:
    """
    根据查询中的关键词检测应搜索哪个域。
    匹配规则: 哪个域的关键词在查询中命中最多，选哪个域。
    无命中时返回默认域。
    """
    query_lower = query.lower()
    best_domain = DEFAULT_DOMAIN
    best_count = 0

    for domain, pattern in DOMAIN_KEYWORDS.items():
        matches = re.findall(pattern, query_lower)
        if len(matches) > best_count:
            best_count = len(matches)
            best_domain = domain

    return best_domain
```

### 自动检测 vs 显式指定

| 方式 | 命令 | 适用场景 |
|------|------|---------|
| 自动检测 | `search.py "query"` | 快速搜索，用户不需要知道域 |
| 显式指定 | `search.py "query" --domain style` | 精确搜索，避免误检测 |
| 技术栈 | `search.py "query" --stack react` | 搜索特定技术栈 |

---

## 技术栈搜索

### STACK_CONFIG

```python
STACK_CONFIG = {
    "react": "stacks/react.csv",
    "vue": "stacks/vue.csv",
    "flutter": "stacks/flutter.csv",
    # ... 16 个技术栈
}
```

技术栈 CSV 使用统一 Schema：
```csv
Category,Guideline,Description,Do,Don't,Code_Good,Code_Bad,Severity,Docs_URL
```

搜索列固定为: `Category + Guideline + Description + Do + Don't`

---

## 输出格式化

### 搜索结果格式

```markdown
## Domain: style | Query: "SaaS dark mode" | Results: 3

### #1 — Glassmorphism (score: 3.42)
| Field | Value |
|-------|-------|
| Type | General |
| Keywords | glass, frost, blur, transparency, modern |
| Best For | SaaS dashboards, modern web apps |
| Effects | backdrop-filter: blur(10px), rgba backgrounds |

### #2 — Dark UI Mastery (score: 2.18)
...
```

### Token 优化

AI 助手的 context window 有限，输出需要优化：
- 截断超长值 (>300 字符加 `...`)
- 省略空值列
- 只输出 `output_cols` 指定的列
