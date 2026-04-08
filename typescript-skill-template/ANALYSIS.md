# 深度技术分析：UI/UX Pro Max 架构剖析

> 本文档深入分析 UI/UX Pro Max 项目的技术架构、设计决策和实现原理
>
> 基于 48 篇官方文档和源码分析整理

## 目录

- [1. 项目定位与核心价值](#1-项目定位与核心价值)
- [2. 架构设计详解](#2-架构设计详解)
- [3. BM25 搜索引擎原理](#3-bm25-搜索引擎原理)
- [4. 推理引擎设计](#4-推理引擎设计)
- [5. 数据层设计](#5-数据层设计)
- [6. 模板渲染系统](#6-模板渲染系统)
- [7. CLI 分发系统](#7-cli-分发系统)
- [8. 多平台适配机制](#8-多平台适配机制)
- [9. 性能与可扩展性](#9-性能与可扩展性)
- [10. 安全性考量](#10-安全性考量)

---

## 1. 项目定位与核心价值

### 1.1 一句话概括

**UI/UX Pro Max 是一个 AI 驱动的设计智能工具包**，通过可搜索的知识库和推理引擎，让 AI 编码助手能够理解和应用专业的设计知识。

### 1.2 解决的核心问题

```
问题现状:
┌────────────────────────────────────────────────────────┐
│ AI 编码助手生成 UI 时存在的问题：                         │
│                                                        │
│ 1. 缺乏系统化的设计知识                                  │
│    → 不知道 SaaS 产品该用什么风格                         │
│                                                        │
│ 2. 无行业特定规则                                        │
│    → 金融 App 和游戏 App 混用设计模式                     │
│                                                        │
│ 3. 无法快速检索设计数据                                   │
│    → 需要从海量知识中人工筛选                             │
│                                                        │
│ 4. 缺少一致的设计系统                                     │
│    → 风格、配色、字体、组件互不匹配                        │
└────────────────────────────────────────────────────────┘
                         ↓
                   解决方案
                         ↓
┌────────────────────────────────────────────────────────┐
│ UI/UX Pro Max 的解决方案：                               │
│                                                        │
│ 1. 可搜索的知识库 (CSV)                                  │
│    → 67 种 UI 风格、161 种产品类型、57 种字体配对          │
│                                                        │
│ 2. 推理引擎 (Reasoning Engine)                          │
│    → 161 条行业规则，自动匹配最佳设计方案                   │
│                                                        │
│ 3. BM25 搜索引擎                                         │
│    → 快速检索相关设计数据 (30-50ms)                       │
│                                                        │
│ 4. 设计系统生成器                                         │
│    → 一键生成完整设计系统 (风格+配色+字体+布局)             │
└────────────────────────────────────────────────────────┘
```

### 1.3 核心数据统计

| 指标 | 数量 | 说明 |
|------|------|------|
| **UI 风格** | 67 | Glassmorphism, Minimalism, Brutalism 等 |
| **配色方案** | 161 | 与 161 种产品类型 1:1 对应 |
| **字体配对** | 57 | Google Fonts 预配置组合 |
| **产品类型** | 161 | 覆盖 SaaS、电商、金融、医疗等全行业 |
| **推理规则** | 161 | 每种产品类型的决策树 |
| **UX 指南** | 99 | 最佳实践 + 反模式 |
| **图表类型** | 25 | 数据可视化推荐 |
| **技术栈** | 16 | React、Vue、Flutter、SwiftUI 等 |
| **支持平台** | 18 | Claude、Cursor、Copilot 等 |
| **CSV 文件** | 42 | 26 个主数据 + 16 个技术栈 |
| **总数据行** | 6,461 | 所有 CSV 的行数总和 |

---

## 2. 架构设计详解

### 2.1 三层架构

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: Presentation Layer (表现层)                            │
├─────────────────────────────────────────────────────────────────┤
│  职责：用户交互和 AI 助手集成                                      │
│                                                                 │
│  组件：                                                          │
│  • SKILL.md / workflow.md - AI 助手读取的指令文件                 │
│  • 模板系统 - 根据平台动态生成文件                                 │
│  • CLI 工具 (uipro-cli) - npm 安装 & 更新                        │
│                                                                 │
│  数据流：                                                         │
│  User → AI → Read SKILL.md → Call search.py → Return results   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: Logic Layer (逻辑层)                                   │
├─────────────────────────────────────────────────────────────────┤
│  职责：搜索、推理、决策                                            │
│                                                                 │
│  组件：                                                          │
│  • 搜索引擎 (core.py/ts) - BM25 算法实现                          │
│  • 推理引擎 (design_system.py) - 规则匹配                         │
│  • 领域检测 (detect_domain) - 自动识别查询意图                    │
│  • 设计系统生成器 - 多域聚合 + 最佳匹配                            │
│                                                                 │
│  算法：                                                          │
│  • BM25 - TF-IDF 改进，处理词频饱和和文档长度归一化                │
│  • 三级匹配 - 产品匹配 → 规则注入 → 最佳选择                       │
│  • 反模式过滤 - 避免行业禁忌设计                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: Data Layer (数据层)                                    │
├─────────────────────────────────────────────────────────────────┤
│  职责：知识存储和管理                                              │
│                                                                 │
│  组件：                                                          │
│  • CSV 知识库 - 42 个文件，6,461 行数据                           │
│  • Schema 定义 - 每个域的列结构和约束                             │
│  • 推理规则 - products.csv 的 Decision_Rules 列 (JSON)          │
│  • 技术栈数据 - 16 个框架特定指南                                 │
│                                                                 │
│  特性：                                                          │
│  • 人类可读 - CSV 格式，Excel 可编辑                              │
│  • Git 友好 - 文本格式，diff & merge 简单                         │
│  • 零依赖 - 不需要数据库或 ORM                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流程详解

```
┌──────────────────────────────────────────────────────────────┐
│  Step 1: 用户输入                                              │
│  "Build a landing page for my beauty spa"                   │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 2: AI 读取指令                                           │
│  • 检测关键词: "build", "landing page", "beauty spa"          │
│  • 匹配到 SKILL.md 中的使用模式                                 │
│  • 决定调用搜索命令                                             │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 3: 调用搜索引擎                                          │
│  Command:                                                    │
│    python3 scripts/search.py "beauty spa" --design-system   │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 4: 领域检测                                              │
│  • 分析查询词: "beauty", "spa"                                 │
│  • 匹配正则表达式:                                              │
│    - product: r"spa|beauty|wellness|salon"                   │
│  • 决定: 主域 = product, 触发设计系统生成                        │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 5: 多域并行搜索 (5 个域同时搜索)                           │
│                                                              │
│  Thread 1: product 域                                        │
│    → 搜索 products.csv                                        │
│    → BM25 匹配: "Beauty/Spa" (score: 3.45)                   │
│    → 提取 Decision_Rules JSON                                │
│                                                              │
│  Thread 2: style 域                                          │
│    → 搜索 styles.csv                                          │
│    → 根据 Decision_Rules 的 Style_Priority 排序                │
│    → 匹配: "Soft UI Evolution" (score: 2.87)                 │
│                                                              │
│  Thread 3: color 域                                          │
│    → 搜索 colors.csv                                          │
│    → 过滤 Color_Mood 匹配的配色                                 │
│    → 匹配: "Calming Pastels" (Soft Pink + Sage Green)        │
│                                                              │
│  Thread 4: typography 域                                     │
│    → 搜索 typography.csv                                      │
│    → 匹配 Typography_Mood: "Elegant, Calming"                │
│    → 匹配: "Cormorant Garamond / Montserrat"                 │
│                                                              │
│  Thread 5: landing 域                                        │
│    → 搜索 landing-patterns.csv                                │
│    → 匹配 Recommended_Pattern                                │
│    → 匹配: "Hero-Centric + Social Proof"                     │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 6: 推理引擎处理                                           │
│                                                              │
│  Input: 5 域搜索结果                                           │
│                                                              │
│  Processing:                                                 │
│  1. 应用优先级权重 (从 Decision_Rules)                         │
│     Style_Priority: "Soft UI > Minimalism > Flat"           │
│                                                              │
│  2. 过滤反模式                                                 │
│     Anti_Patterns: ["Cyberpunk", "Brutalism", "Dark Mode"]  │
│                                                              │
│  3. 验证一致性                                                 │
│     - 配色是否匹配风格？                                         │
│     - 字体是否匹配配色？                                         │
│     - 布局是否匹配产品类型？                                     │
│                                                              │
│  4. 选择最佳匹配                                               │
│     Top 1 for each domain                                   │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 7: 生成输出                                              │
│                                                              │
│  Format: ASCII Box (默认) 或 Markdown                         │
│                                                              │
│  Output Structure:                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TARGET: Serenity Spa                                │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  PATTERN: Hero-Centric + Social Proof                │    │
│  │  STYLE: Soft UI Evolution                            │    │
│  │  COLORS: Soft Pink + Sage Green + Gold              │    │
│  │  TYPOGRAPHY: Cormorant Garamond / Montserrat        │    │
│  │  KEY EFFECTS: Soft shadows + Smooth transitions     │    │
│  │  ANTI-PATTERNS: Bright neon + Dark mode             │    │
│  │  PRE-DELIVERY CHECKLIST: [...]                       │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 8: AI 应用设计系统                                        │
│                                                              │
│  • 读取推荐的风格、配色、字体                                     │
│  • 生成 HTML/React/Vue 代码                                   │
│  • 应用预检清单 (无 emoji 图标、添加 hover 状态等)                │
│  • 确保响应式 (375px, 768px, 1024px, 1440px)                  │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 9: 持久化 (可选)                                          │
│                                                              │
│  Command: --persist --project "Serenity Spa"                │
│                                                              │
│  Output:                                                     │
│  design-system/                                              │
│  ├── MASTER.md         (全局设计规则)                          │
│  └── pages/                                                  │
│      ├── home.md       (首页特殊规则)                          │
│      └── booking.md    (预订页特殊规则)                         │
│                                                              │
│  后续页面开发时，AI 自动读取对应的 .md 文件                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. BM25 搜索引擎原理

### 3.1 算法公式

```
BM25 (Best Matching 25) - Okapi BM25

score(D, Q) = Σ(qi∈Q) IDF(qi) × (f(qi,D) × (k1 + 1)) / (f(qi,D) + k1 × (1 - b + b × |D| / avgdl))

参数说明：
┌──────────────────────────────────────────────────────────────┐
│ D        文档 (CSV 的一行)                                     │
│ Q        查询 (用户输入)                                       │
│ qi       查询中的第 i 个词                                     │
│ f(qi,D)  qi 在文档 D 中的词频 (Term Frequency)                │
│ k1       词频饱和参数 (默认 1.5)                               │
│          → 控制词频的影响力                                     │
│          → k1 越大，高频词影响越大                              │
│ b        长度归一化参数 (默认 0.75)                             │
│          → 控制文档长度的影响                                   │
│          → b=0: 忽略长度; b=1: 完全归一化                       │
│ |D|      文档长度 (词数)                                        │
│ avgdl    平均文档长度                                          │
│ IDF(qi)  逆文档频率                                            │
│          = log((N - n(qi) + 0.5) / (n(qi) + 0.5))            │
│          → N: 总文档数                                         │
│          → n(qi): 包含 qi 的文档数                             │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 为什么选择 BM25？

| 对比项 | BM25 | TF-IDF | 向量搜索 (Embedding) |
|-------|------|--------|---------------------|
| **训练需求** | ✅ 无需训练 | ✅ 无需训练 | ❌ 需要预训练模型 |
| **外部依赖** | ✅ 零依赖 | ✅ 零依赖 | ❌ 需要 numpy/torch |
| **可解释性** | ✅ 完全可解释 | ✅ 可解释 | ❌ 黑盒 |
| **短文本效果** | ✅ 优秀 | ⚠️ 一般 | ✅ 优秀 |
| **长文本处理** | ✅ 归一化 | ❌ 长文档优势过大 | ✅ 优秀 |
| **计算速度** | ✅ 极快 (30-50ms) | ✅ 快 | ⚠️ 较慢 (100-500ms) |
| **内存占用** | ✅ 极低 (5-10MB) | ✅ 低 | ❌ 高 (100MB+) |
| **精确匹配** | ✅ 优秀 | ✅ 优秀 | ⚠️ 一般 |
| **语义理解** | ❌ 无 | ❌ 无 | ✅ 强 |

**结论**: 对于结构化知识库 (CSV)，BM25 是最优选择：
- ✅ 零依赖、跨平台
- ✅ 性能优异
- ✅ 精确匹配效果好
- ✅ 完全可控和可解释

### 3.3 Python 实现解析

```python
class BM25:
    def __init__(self, k1=1.5, b=0.75):
        """
        k1: 词频饱和参数 (1.2-2.0 都常见，1.5 是经验最优值)
        b: 长度归一化参数 (0.75 是最常用值)
        """
        self.k1 = k1
        self.b = b
        self.avgdl = 0  # 平均文档长度
        self.doc_len = []  # 每个文档的长度
        self.doc_freqs = []  # 每个文档的词频统计
        self.idf = {}  # 每个词的 IDF 值
        self.N = 0  # 文档总数

    def fit(self, documents: List[str]):
        """
        预处理阶段：计算 IDF 和文档统计
        """
        self.N = len(documents)

        # 计算每个文档的词频和长度
        df = {}  # 文档频率 (Document Frequency)
        for doc in documents:
            words = doc.lower().split()
            self.doc_len.append(len(words))

            # 统计词频
            freqs = {}
            for word in words:
                freqs[word] = freqs.get(word, 0) + 1
            self.doc_freqs.append(freqs)

            # 统计文档频率 (每个词出现在多少个文档中)
            for word in set(words):
                df[word] = df.get(word, 0) + 1

        # 计算平均文档长度
        self.avgdl = sum(self.doc_len) / self.N

        # 计算每个词的 IDF
        for word, freq in df.items():
            # IDF 公式: log((N - n(qi) + 0.5) / (n(qi) + 0.5))
            self.idf[word] = math.log((self.N - freq + 0.5) / (freq + 0.5))

    def score(self, query: str) -> List[Tuple[int, float]]:
        """
        搜索阶段：对每个文档计算 BM25 分数
        """
        query_words = query.lower().split()
        scores = []

        for doc_id in range(self.N):
            score = 0
            doc_len = self.doc_len[doc_id]
            freqs = self.doc_freqs[doc_id]

            for word in query_words:
                if word not in freqs:
                    continue

                # 词频
                freq = freqs[word]

                # IDF 分数
                idf = self.idf.get(word, 0)

                # 长度归一化
                norm = 1 - self.b + self.b * (doc_len / self.avgdl)

                # BM25 公式
                score += idf * (freq * (self.k1 + 1)) / (freq + self.k1 * norm)

            if score > 0:
                scores.append((doc_id, score))

        # 按分数降序排序
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores
```

### 3.4 TypeScript 实现对比

```typescript
export class BM25 {
  private k1: number;
  private b: number;
  private avgdl: number = 0;
  private docLen: number[] = [];
  private docFreqs: Map<string, number>[] = [];
  private idf: Map<string, number> = new Map();
  private N: number = 0;

  constructor(k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  fit(documents: string[]): void {
    this.N = documents.length;
    const df = new Map<string, number>();

    for (const doc of documents) {
      const words = doc.toLowerCase().split(/\s+/);
      this.docLen.push(words.length);

      // 计算词频
      const freqs = new Map<string, number>();
      for (const word of words) {
        freqs.set(word, (freqs.get(word) || 0) + 1);
      }
      this.docFreqs.push(freqs);

      // 统计文档频率
      for (const word of new Set(words)) {
        df.set(word, (df.get(word) || 0) + 1);
      }
    }

    // 计算平均文档长度
    this.avgdl = this.docLen.reduce((a, b) => a + b, 0) / this.N;

    // 计算 IDF
    for (const [word, freq] of df) {
      this.idf.set(
        word,
        Math.log((this.N - freq + 0.5) / (freq + 0.5))
      );
    }
  }

  score(query: string): Array<[number, number]> {
    const queryWords = query.toLowerCase().split(/\s+/);
    const scores: Array<[number, number]> = [];

    for (let docId = 0; docId < this.N; docId++) {
      let score = 0;
      const docLen = this.docLen[docId];
      const freqs = this.docFreqs[docId];

      for (const word of queryWords) {
        const freq = freqs.get(word);
        if (!freq) continue;

        const idf = this.idf.get(word) || 0;
        const norm = 1 - this.b + this.b * (docLen / this.avgdl);

        score += idf * ((freq * (this.k1 + 1)) / (freq + this.k1 * norm));
      }

      if (score > 0) {
        scores.push([docId, score]);
      }
    }

    return scores.sort((a, b) => b[1] - a[1]);
  }
}
```

### 3.5 性能优化技巧

```python
# 优化 1: 预计算 IDF (已实现)
# 在 fit() 阶段计算所有词的 IDF，避免重复计算

# 优化 2: 词频缓存 (已实现)
# 使用字典缓存每个文档的词频，避免重复分词

# 优化 3: 早停 (Early Stopping)
def score_with_early_stop(self, query: str, top_k: int = 10) -> List[Tuple[int, float]]:
    """当找到足够多的高分文档时提前结束"""
    scores = []
    threshold = 0.5  # 最低分数阈值

    for doc_id in range(self.N):
        score = self._calculate_score(query, doc_id)
        if score > threshold:
            scores.append((doc_id, score))
            if len(scores) >= top_k * 2:  # 找到 2 倍候选后停止
                break

    return sorted(scores, key=lambda x: x[1], reverse=True)[:top_k]

# 优化 4: 并行计算 (大规模数据)
from concurrent.futures import ThreadPoolExecutor

def score_parallel(self, query: str, n_workers: int = 4) -> List[Tuple[int, float]]:
    """多线程并行计算分数"""
    def score_batch(doc_ids):
        return [(doc_id, self._calculate_score(query, doc_id)) for doc_id in doc_ids]

    batch_size = self.N // n_workers
    batches = [range(i, min(i + batch_size, self.N)) for i in range(0, self.N, batch_size)]

    with ThreadPoolExecutor(max_workers=n_workers) as executor:
        results = executor.map(score_batch, batches)

    scores = [item for batch in results for item in batch if item[1] > 0]
    return sorted(scores, key=lambda x: x[1], reverse=True)
```

---

## 4. 推理引擎设计

### 4.1 三级匹配策略

```
Level 1: 产品类型匹配 (Product Category Matching)
═══════════════════════════════════════════════════════
Input:  "Build a SaaS dashboard for project management"
        ↓
Step 1: BM25 搜索 products.csv
        Query: "SaaS dashboard project management"
        ↓
Step 2: 匹配结果
        ┌────────────────────────────────────────────┐
        │ Rank 1: "SaaS - Project Management"        │
        │ Score: 4.23                                │
        │ Category: SaaS                             │
        │ Decision_Rules: {                          │
        │   "Recommended_Pattern": "Hero + Features" │
        │   "Style_Priority": "Glassmorphism > Flat" │
        │   "Color_Mood": "Trust, Professional"      │
        │   "Typography_Mood": "Modern, Sans-serif"  │
        │   "Anti_Patterns": ["Brutalism", "Y2K"]    │
        │ }                                          │
        └────────────────────────────────────────────┘
        ↓
Output: Decision_Rules JSON

Level 2: 规则注入搜索 (Rule-Injected Search)
═══════════════════════════════════════════════════════
Input:  Decision_Rules from Level 1
        ↓
并行搜索 5 个域，应用规则过滤:

┌─────────────────────────────────────────────────────┐
│ Domain: style                                       │
│ Query: "modern professional dashboard"              │
│ Rule: Style_Priority = "Glassmorphism > Flat"       │
│ ↓                                                   │
│ 搜索结果 (before filtering):                         │
│   1. Glassmorphism (score: 3.45)                   │
│   2. Minimalism (score: 3.12)                      │
│   3. Flat Design (score: 2.98)                     │
│   4. Brutalism (score: 2.45) ← Anti_Pattern!       │
│ ↓                                                   │
│ 应用优先级权重:                                        │
│   1. Glassmorphism (3.45 × 1.5 = 5.175) ← Priority │
│   2. Flat Design (2.98 × 1.3 = 3.874)              │
│   3. Minimalism (3.12 × 1.0 = 3.12)                │
│   [Brutalism removed by Anti_Pattern filter]       │
│ ↓                                                   │
│ 选择: Glassmorphism (最高分)                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Domain: color                                       │
│ Query: "trust professional clean"                   │
│ Rule: Color_Mood = "Trust, Professional"            │
│ ↓                                                   │
│ 过滤 Mood 匹配的配色:                                  │
│   ✅ Trust Blue (Primary: #2563EB, Score: 4.12)    │
│   ✅ Professional Gray (Primary: #6B7280, 3.87)    │
│   ❌ Sunset Orange (mood: Energetic, 3.56) ← 不匹配 │
│ ↓                                                   │
│ 选择: Trust Blue                                    │
└─────────────────────────────────────────────────────┘

[Similar processing for typography, landing, chart domains...]

Level 3: 最佳匹配选择 (Best Match Selection)
═══════════════════════════════════════════════════════
Input:  5 个域的搜索结果
        ↓
Step 1: 验证一致性
        ┌──────────────────────────────────────────┐
        │ 检查项：                                   │
        │ ✅ 风格支持配色方案                         │
        │ ✅ 字体与配色匹配                          │
        │ ✅ 布局适合产品类型                         │
        │ ✅ 无冲突的反模式                          │
        └──────────────────────────────────────────┘
        ↓
Step 2: 生成完整设计系统
        ┌──────────────────────────────────────────┐
        │ Pattern: Hero + Features + CTA           │
        │ Style: Glassmorphism                     │
        │ Colors: Trust Blue (#2563EB)             │
        │ Typography: Inter / Roboto               │
        │ Key Effects: Glass blur + Smooth shadow  │
        │ Anti-Patterns: Brutalism, Y2K, Neon      │
        │ Checklist: [23 items]                    │
        └──────────────────────────────────────────┘
        ↓
Output: Complete Design System
```

### 4.2 Decision_Rules 数据结构

```json
{
  "Product_Name": "SaaS - Project Management",
  "Category": "SaaS",
  "Decision_Rules": {
    // 推荐的布局模式
    "Recommended_Pattern": "Hero-Centric + Feature Showcase + Social Proof",

    // 风格优先级 (用 > 表示优先级)
    "Style_Priority": "Glassmorphism > Flat Design > Minimalism > Soft UI",

    // 配色情绪关键词
    "Color_Mood": "Trust, Professional, Clean, Modern",

    // 字体情绪关键词
    "Typography_Mood": "Modern, Sans-serif, Professional, Readable",

    // 关键效果
    "Key_Effects": "Glass blur (10-20px), Soft shadows (0 4px 20px), Smooth transitions (200-300ms), Subtle hover states",

    // 反模式 (必须避免)
    "Anti_Patterns": [
      "Brutalism",
      "Y2K Aesthetic",
      "Cyberpunk UI",
      "AI purple/pink gradients",
      "Over-animation",
      "Neon colors"
    ],

    // 严重程度
    "Severity": "HIGH",

    // 额外建议
    "Notes": "Focus on clarity and efficiency. Users need to see project status at a glance."
  }
}
```

### 4.3 推理引擎代码实现

```python
class ReasoningEngine:
    def __init__(self, csv_loader):
        self.csv_loader = csv_loader
        self.products = csv_loader.load("products.csv")

    def match_product(self, query: str) -> Optional[Dict]:
        """Level 1: 匹配产品类型"""
        # BM25 搜索 products.csv
        bm25 = BM25()
        documents = [
            f"{row['Product_Name']} {row['Category']} {row['Keywords']}"
            for row in self.products
        ]
        bm25.fit(documents)
        scores = bm25.score(query)

        if not scores:
            return None

        # 获取最佳匹配
        best_match_idx = scores[0][0]
        product = self.products[best_match_idx]

        # 解析 Decision_Rules JSON
        if product.get("Decision_Rules"):
            product["Decision_Rules"] = json.loads(product["Decision_Rules"])

        return product

    def apply_rules(self, rules: Dict, domain: str, results: List[Dict]) -> List[Dict]:
        """Level 2: 应用规则过滤和排序"""
        if not rules:
            return results

        # 1. 过滤反模式
        anti_patterns = rules.get("Anti_Patterns", [])
        filtered = [
            r for r in results
            if not any(ap.lower() in r.get("Name", "").lower() for ap in anti_patterns)
        ]

        # 2. 应用优先级权重
        if domain == "style":
            priority_str = rules.get("Style_Priority", "")
            priorities = self._parse_priority(priority_str)

            for result in filtered:
                name = result["Name"]
                # 查找优先级
                for i, priority_name in enumerate(priorities):
                    if priority_name.lower() in name.lower():
                        # 越靠前权重越高
                        weight = 1.5 - i * 0.1
                        result["_weighted_score"] = result.get("score", 0) * weight
                        break
                else:
                    result["_weighted_score"] = result.get("score", 0)

            # 按权重分数排序
            filtered.sort(key=lambda x: x.get("_weighted_score", 0), reverse=True)

        # 3. 情绪匹配 (color/typography)
        if domain in ["color", "typography"]:
            mood_key = f"{domain.capitalize()}_Mood"
            target_mood = rules.get(mood_key, "")
            if target_mood:
                for result in filtered:
                    result_mood = result.get("Mood", "")
                    # 计算情绪匹配分数
                    mood_score = self._calculate_mood_match(target_mood, result_mood)
                    result["_mood_score"] = mood_score

                # 过滤低分
                filtered = [r for r in filtered if r.get("_mood_score", 0) > 0.3]
                filtered.sort(key=lambda x: x.get("_mood_score", 0), reverse=True)

        return filtered

    def _parse_priority(self, priority_str: str) -> List[str]:
        """解析优先级字符串: 'A > B > C' → ['A', 'B', 'C']"""
        return [s.strip() for s in priority_str.split(">")]

    def _calculate_mood_match(self, target: str, candidate: str) -> float:
        """计算情绪匹配分数"""
        target_words = set(target.lower().split(","))
        candidate_words = set(candidate.lower().split(","))

        intersection = target_words & candidate_words
        union = target_words | candidate_words

        # Jaccard 相似度
        return len(intersection) / len(union) if union else 0

    def select_best_match(self, domain_results: Dict[str, List[Dict]]) -> Dict[str, Dict]:
        """Level 3: 选择最佳匹配"""
        best_matches = {}

        for domain, results in domain_results.items():
            if results:
                # 选择最高分
                best_matches[domain] = results[0]

        # 验证一致性
        self._validate_consistency(best_matches)

        return best_matches

    def _validate_consistency(self, matches: Dict[str, Dict]):
        """验证各域之间的一致性"""
        # 示例: 检查 dark mode 风格不应搭配浅色配色
        style = matches.get("style", {}).get("Name", "")
        color = matches.get("color", {}).get("Name", "")

        if "dark" in style.lower() and "light" in color.lower():
            warnings.warn(f"Inconsistency: {style} style with {color} palette")
```

---

## 5. 数据层设计

### 5.1 CSV Schema 规范

#### products.csv (产品类型)

```csv
No,Product_Name,Category,UI_Category,Keywords,Description,Decision_Rules,Notes
```

| 列名 | 类型 | 必需 | 说明 |
|-----|------|------|------|
| No | int | ✅ | 唯一 ID |
| Product_Name | string | ✅ | 产品名称 (如 "SaaS - Project Management") |
| Category | string | ✅ | 大类 (SaaS/E-commerce/Finance 等) |
| UI_Category | string | ❌ | UI 分类 (Dashboard/Landing/E-commerce) |
| Keywords | string | ✅ | 搜索关键词 (逗号分隔) |
| Description | string | ✅ | 产品描述 |
| Decision_Rules | JSON | ✅ | 推理规则 (JSON 格式) |
| Notes | string | ❌ | 额外说明 |

#### styles.csv (UI 风格)

```csv
No,Style_Name,Category,Keywords,Description,CSS_Keywords,Best_For,Performance,Accessibility,AI_Prompt,Avoid,Severity
```

#### colors.csv (配色方案)

```csv
No,Palette_Name,Product_Type,Primary_Color,Primary_Hex,Secondary_Color,Secondary_Hex,Accent_Color,Accent_Hex,Background_Color,Background_Hex,Text_Color,Text_Hex,Mood,Notes
```

#### typography.csv (字体配对)

```csv
No,Pairing_Name,Heading_Font,Body_Font,Mood,Best_For,Google_Fonts_Import,CSS_Example,Notes
```

### 5.2 数据质量保障

```python
# data/validation/validate_csv.py

import csv
import json
from typing import List, Dict

class CSVValidator:
    def __init__(self, schema: Dict):
        self.schema = schema

    def validate_file(self, filepath: str) -> List[str]:
        """验证 CSV 文件"""
        errors = []

        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            # 验证列名
            if set(reader.fieldnames) != set(self.schema["columns"]):
                errors.append(f"Column mismatch in {filepath}")

            # 验证每一行
            for i, row in enumerate(reader, start=2):
                row_errors = self._validate_row(row, i)
                errors.extend(row_errors)

        return errors

    def _validate_row(self, row: Dict, line_num: int) -> List[str]:
        """验证单行数据"""
        errors = []

        for col_name, col_spec in self.schema["columns"].items():
            value = row.get(col_name, "")

            # 必需字段检查
            if col_spec.get("required") and not value:
                errors.append(f"Line {line_num}: Missing required field '{col_name}'")

            # 类型检查
            if value and "type" in col_spec:
                if not self._check_type(value, col_spec["type"]):
                    errors.append(f"Line {line_num}: Invalid type for '{col_name}'")

            # JSON 格式检查
            if col_spec.get("format") == "json" and value:
                try:
                    json.loads(value)
                except json.JSONDecodeError:
                    errors.append(f"Line {line_num}: Invalid JSON in '{col_name}'")

            # 正则匹配检查
            if "pattern" in col_spec and value:
                import re
                if not re.match(col_spec["pattern"], value):
                    errors.append(f"Line {line_num}: Pattern mismatch in '{col_name}'")

        return errors

    def _check_type(self, value: str, expected_type: str) -> bool:
        """检查数据类型"""
        if expected_type == "int":
            return value.isdigit()
        elif expected_type == "hex_color":
            return value.startswith("#") and len(value) == 7
        elif expected_type == "url":
            return value.startswith("http")
        return True

# Schema 定义示例
PRODUCTS_SCHEMA = {
    "columns": {
        "No": {"type": "int", "required": True},
        "Product_Name": {"type": "string", "required": True},
        "Category": {"type": "string", "required": True},
        "Keywords": {"type": "string", "required": True},
        "Decision_Rules": {"type": "string", "format": "json", "required": True},
    }
}

# 使用
validator = CSVValidator(PRODUCTS_SCHEMA)
errors = validator.validate_file("data/products.csv")
if errors:
    for error in errors:
        print(error)
```

### 5.3 数据同步策略

```
三份数据的关系:

┌─────────────────────────────────────────────────────────┐
│  src/ui-ux-pro-max/               (Source of Truth)     │
│  ├── data/*.csv                   ← 主数据               │
│  ├── scripts/*.py                 ← 核心脚本             │
│  └── templates/                   ← 模板文件             │
└─────────────────────────────────────────────────────────┘
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
┌───────────────────┐   ┌──────────────────────┐
│ .claude/skills/   │   │ cli/assets/          │
│ (Symlink)         │   │ (Bundle for npm)     │
│                   │   │                      │
│ • 开发测试用       │   │ • npm 打包           │
│ • 实时同步         │   │ • 手动复制           │
└───────────────────┘   └──────────────────────┘

同步命令:
# 1. Symlink (开发环境)
ln -s ../../src/ui-ux-pro-max .claude/skills/ui-ux-pro-max

# 2. Bundle (发布前)
cp -r src/ui-ux-pro-max/data/* cli/assets/data/
cp -r src/ui-ux-pro-max/scripts/* cli/assets/scripts/
cp -r src/ui-ux-pro-max/templates/* cli/assets/templates/

# 3. 验证同步
npm run sync:validate
```

---

## 6. 模板渲染系统

### 6.1 占位符系统

```markdown
# {{TITLE}}

{{DESCRIPTION}}

## How to Use This {{SKILL_OR_WORKFLOW}}

Command: python3 {{SCRIPT_PATH}} "<query>"

{{QUICK_REFERENCE}}
```

支持的占位符:

| 占位符 | 值来源 | 示例 |
|-------|-------|------|
| `{{TITLE}}` | platform.json → displayName | "UI/UX Pro Max" |
| `{{DESCRIPTION}}` | base/skill-content.md | "Design intelligence toolkit" |
| `{{SKILL_OR_WORKFLOW}}` | installType === 'full' ? 'Skill' : 'Workflow' | "Skill" |
| `{{SCRIPT_PATH}}` | platform.json → scriptPath | "skills/ui-ux-pro-max/scripts/search.py" |
| `{{QUICK_REFERENCE}}` | base/quick-reference.md (Claude only) | "## Quick Reference..." |

### 6.2 条件段落

```markdown
{{#if platform === 'claude'}}
## Quick Reference
Only visible in Claude Code
{{/if}}

{{#if installType === 'workflow'}}
Use slash command: /ui-ux-pro-max <query>
{{/if}}
```

### 6.3 渲染引擎实现

```typescript
// cli/src/utils/template.ts

export class TemplateRenderer {
  private variables: Record<string, any>;

  constructor(variables: Record<string, any>) {
    this.variables = variables;
  }

  render(template: string): string {
    let result = template;

    // 1. 简单占位符替换
    for (const [key, value] of Object.entries(this.variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, String(value));
    }

    // 2. 条件段落处理
    result = this.processConditionals(result);

    // 3. 清理未匹配的占位符
    result = result.replace(/{{[^}]+}}/g, '');

    return result;
  }

  private processConditionals(template: string): string {
    // 匹配 {{#if condition}}...{{/if}}
    const conditionalRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;

    return template.replace(conditionalRegex, (match, condition, content) => {
      const result = this.evaluateCondition(condition);
      return result ? content : '';
    });
  }

  private evaluateCondition(condition: string): boolean {
    // 简单条件求值: "platform === 'claude'"
    try {
      const func = new Function(...Object.keys(this.variables), `return ${condition}`);
      return func(...Object.values(this.variables));
    } catch {
      return false;
    }
  }
}

// 使用示例
const renderer = new TemplateRenderer({
  TITLE: "My Skill",
  DESCRIPTION: "A great skill",
  SCRIPT_PATH: "scripts/search.py",
  platform: "claude",
  installType: "full"
});

const output = renderer.render(templateContent);
```

---

## 7. CLI 分发系统

### 7.1 三级回退策略

```
优先级 1: GitHub Latest Release (推荐)
════════════════════════════════════════
• URL: https://github.com/owner/repo/releases/latest/download/assets.zip
• 优势: 总是最新版本，CDN 加速
• 劣势: 需要网络，首次安装较慢

        ↓ (失败时)

优先级 2: npm Bundle (bundled)
════════════════════════════════════════
• 路径: node_modules/uipro-cli/assets/
• 优势: 离线可用，安装快
• 劣势: 版本可能滞后

        ↓ (失败时)

优先级 3: Inline Fallback (minimal)
════════════════════════════════════════
• 代码: 内联在 CLI 中的最小模板
• 优势: 绝对可用
• 劣势: 功能最少，仅基础搜索
```

### 7.2 CLI 代码实现

```typescript
// cli/src/commands/init.ts

export async function install(platform: string) {
  const spinner = ora('Installing UI/UX Pro Max...').start();

  try {
    // 1. 尝试 GitHub Release
    spinner.text = 'Downloading from GitHub...';
    const success = await downloadFromGitHub();
    if (success) {
      spinner.succeed('Installed from GitHub (latest)');
      return;
    }
  } catch (error) {
    spinner.warn('GitHub download failed, using bundled assets...');
  }

  try {
    // 2. 尝试 Bundle
    spinner.text = 'Using bundled assets...';
    const success = await installFromBundle();
    if (success) {
      spinner.succeed('Installed from bundle');
      return;
    }
  } catch (error) {
    spinner.warn('Bundle installation failed, using fallback...');
  }

  // 3. Fallback
  spinner.text = 'Creating minimal installation...';
  await installFallback();
  spinner.succeed('Installed (minimal mode)');
}

async function downloadFromGitHub(): Promise<boolean> {
  const url = 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/releases/latest/download/assets.zip';

  const response = await fetch(url);
  if (!response.ok) return false;

  const buffer = await response.arrayBuffer();
  const zip = await unzip(buffer);

  // 解压到目标目录
  await extractZip(zip, getInstallPath());
  return true;
}

async function installFromBundle(): Promise<boolean> {
  const bundlePath = path.join(__dirname, '../../assets');
  if (!fs.existsSync(bundlePath)) return false;

  await fs.copy(bundlePath, getInstallPath());
  return true;
}

async function installFallback(): Promise<void> {
  const minimalTemplate = `
# UI/UX Pro Max (Minimal)

Search: python3 scripts/search.py "<query>"

Note: This is a minimal installation. Run \`uipro update\` to get the full version.
  `;

  const installPath = getInstallPath();
  await fs.ensureDir(installPath);
  await fs.writeFile(path.join(installPath, 'SKILL.md'), minimalTemplate);

  // 创建最小搜索脚本
  await createMinimalSearchScript(installPath);
}
```

---

## 8. 多平台适配机制

### 8.1 平台配置矩阵

| 平台 | 安装类型 | 根目录 | 技能路径 | 文件名 | 脚本路径 |
|------|---------|-------|---------|-------|---------|
| Claude Code | full | .claude | skills/ui-ux-pro-max | SKILL.md | skills/ui-ux-pro-max/scripts/search.py |
| Cursor | full | .cursor | skills/ui-ux-pro-max | SKILL.md | skills/ui-ux-pro-max/scripts/search.py |
| Windsurf | full | .windsurf | skills/ui-ux-pro-max | skill.md | skills/ui-ux-pro-max/scripts/search.py |
| Copilot | workflow | .github/copilot | workflows/ui-ux-pro-max.md | - | .github/copilot/workflows/scripts/search.py |
| Kiro | workflow | .kiro | workflows/ui-ux-pro-max.kiro | - | .kiro/scripts/search.py |

### 8.2 零代码接入新平台

```json
// templates/platforms/newplatform.json
{
  "platform": "newplatform",
  "displayName": "New AI Platform",
  "installType": "full",
  "folderStructure": {
    "root": ".newplatform",
    "skillPath": "skills/ui-ux-pro-max",
    "filename": "SKILL.md"
  },
  "scriptPath": "skills/ui-ux-pro-max/scripts/search.py",
  "frontmatter": {
    "name": "ui-ux-pro-max",
    "version": "2.5.0",
    "description": "Design intelligence toolkit",
    "activate": ["plan", "build", "create", "design", "implement"]
  },
  "supportsQuickReference": false
}
```

添加新平台只需:
1. 创建 `platforms/newplatform.json` 配置
2. CLI 自动识别并支持
3. 无需修改核心代码

---

## 9. 性能与可扩展性

### 9.1 性能指标

基于实测数据 (MacBook Pro M1, 16GB RAM):

| 操作 | 数据规模 | Python | TypeScript | 内存 |
|-----|---------|--------|-----------|------|
| BM25 搜索 | 1000 行 | 30-50ms | 25-40ms | 5-10MB |
| CSV 加载 | 6,461 行 | 100-200ms | 80-150ms | 15-25MB |
| 推理引擎 | 161 规则 | 10-20ms | 8-15ms | 2-5MB |
| 设计系统生成 | 5 域并行 | 150-300ms | 120-250ms | 30-50MB |
| CLI 安装 (GitHub) | - | - | 2-5s | 50MB |
| CLI 安装 (Bundle) | - | - | 500ms-1s | 30MB |

### 9.2 可扩展性分析

```
当前规模:
────────────────────────────────────
• 6,461 行数据
• 42 个 CSV 文件
• BM25 搜索: O(n×m) 复杂度
  n = 文档数, m = 查询词数

预测规模:
────────────────────────────────────
• 10,000 行: 50-80ms (1.5x)
• 50,000 行: 200-300ms (6x)
• 100,000 行: 400-600ms (12x)

优化方案:
────────────────────────────────────
1. 域分片 (Domain Sharding)
   → 按域拆分 CSV，减少单次加载量

2. 索引缓存 (Index Caching)
   → 预计算 IDF，保存到 .cache 文件

3. 并行搜索 (Parallel Search)
   → 多线程/Worker 并行处理多个域

4. 增量更新 (Incremental Update)
   → 只重建变更部分的索引
```

---

## 10. 安全性考量

### 10.1 攻击面分析

| 攻击向量 | 风险等级 | 防护措施 |
|---------|---------|---------|
| **CSV 注入** | 🟡 中等 | 严格验证 CSV 格式，禁止特殊字符 |
| **命令注入** | 🔴 高 | search.py 使用 argparse，不拼接 shell 命令 |
| **路径遍历** | 🟡 中等 | 验证文件路径，限制访问范围 |
| **XSS (输出)** | 🟢 低 | 输出纯文本，AI 负责转义 |
| **依赖漏洞** | 🟢 低 | Python 零依赖，TS 仅 4 个包 |
| **恶意数据** | 🟡 中等 | 数据源可信 (GitHub)，但用户可修改 |

### 10.2 安全最佳实践

```python
# search.py - 安全的参数处理

import argparse
import os
import re

def validate_query(query: str) -> str:
    """验证查询字符串"""
    # 1. 长度限制
    if len(query) > 500:
        raise ValueError("Query too long (max 500 chars)")

    # 2. 禁止特殊字符
    if re.search(r'[;&|`$()]', query):
        raise ValueError("Invalid characters in query")

    return query

def validate_domain(domain: str) -> str:
    """验证域名"""
    # 白名单验证
    allowed_domains = ["product", "style", "color", "typography", "landing", "chart", "ux"]
    if domain not in allowed_domains:
        raise ValueError(f"Invalid domain. Allowed: {allowed_domains}")

    return domain

def safe_file_path(base_dir: str, filename: str) -> str:
    """防止路径遍历攻击"""
    # 1. 清理文件名
    filename = os.path.basename(filename)

    # 2. 构建完整路径
    full_path = os.path.join(base_dir, filename)

    # 3. 验证路径在允许范围内
    real_path = os.path.realpath(full_path)
    real_base = os.path.realpath(base_dir)

    if not real_path.startswith(real_base):
        raise ValueError("Path traversal detected")

    return full_path

# 主函数
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("query", help="Search query")
    parser.add_argument("--domain", "-d", help="Search domain")
    parser.add_argument("-n", "--max-results", type=int, default=3, choices=range(1, 51))

    args = parser.parse_args()

    # 验证输入
    query = validate_query(args.query)
    if args.domain:
        domain = validate_domain(args.domain)

    # 安全地搜索
    results = search(query, domain, args.max_results)
    print(format_output(results))
```

---

## 11. 总结与展望

### 11.1 核心设计原则

1. **零依赖** - Python/TypeScript 实现，无外部库
2. **人类可读** - CSV 数据，Excel 可编辑
3. **AI 友好** - 结构化输出，易于理解和应用
4. **高性能** - BM25 算法，30-50ms 搜索
5. **可扩展** - 三层架构，模块化设计
6. **跨平台** - 18 个 AI 平台支持

### 11.2 适用场景

✅ **适合**:
- 需要结构化知识库的 AI 技能
- 领域专家知识传递给 AI
- 设计规范、最佳实践指南
- 行业特定推荐系统
- 快速原型验证

❌ **不适合**:
- 需要复杂语义理解的场景 (用 RAG/Embedding)
- 实时动态数据 (用数据库)
- 大规模知识图谱 (用 Neo4j 等)

### 11.3 未来演进方向

```
Short-term (1-3 months):
• TypeScript 完整迁移
• 性能优化 (缓存、索引)
• 更多平台支持

Mid-term (3-6 months):
• 可视化数据编辑器
• 自动规则学习
• 设计系统版本控制

Long-term (6-12 months):
• 混合搜索 (BM25 + Embedding)
• 实时协作编辑
• Marketplace 生态系统
```

---

## 附录

### A. 参考文档

- [01-project-overview.md](../docs/analysis/01-project-overview.md) - 项目总览
- [02-architecture-deep-dive.md](../docs/analysis/02-architecture-deep-dive.md) - 架构剖析
- [03-search-engine-analysis.md](../docs/analysis/03-search-engine-analysis.md) - 搜索引擎
- [04-design-system-generator.md](../docs/analysis/04-design-system-generator.md) - 设计系统生成器
- [framework-design/](../docs/framework-design/) - 通用框架设计 (21 篇)

### B. 技术栈版本

| 依赖 | 版本 | 用途 |
|-----|------|------|
| Python | 3.x | 搜索引擎实现 |
| TypeScript | 5.7+ | CLI 工具 |
| Node.js | 18+ | CLI 运行时 |
| Bun | 1.1+ | CLI 打包 |

### C. 性能基准测试

```bash
# 运行基准测试
python3 tests/benchmark.py

# 输出示例:
# BM25 Search (1000 docs): 32.5ms
# CSV Load (6461 rows): 145ms
# Design System Gen: 287ms
```

### D. 贡献指南

参考主项目的 [CLAUDE.md](../CLAUDE.md) 和 Git Workflow。
