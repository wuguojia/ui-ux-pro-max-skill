# TypeScript AI Skill Template (通用 AI 技能模板)

> 基于 UI/UX Pro Max 项目架构设计的 TypeScript 通用 AI Skill 模板
>
> 快速创建你自己的 AI 技能包，支持从 HTML、组件源码、图片、Markdown 文档、文字等多种输入源生成内容

## 📖 项目技术分析总览

### 核心技术栈

| 技术层 | 技术选型 | 设计原理 |
|--------|---------|---------|
| **数据层** | CSV 文件 | 人类可读、Git 友好、Excel 可编辑、零依赖 |
| **搜索引擎** | BM25 算法 (Python/TypeScript) | TF-IDF 改进版，不需要向量数据库或 embedding |
| **推理引擎** | 规则匹配 + 决策树 | 161 条行业特定规则，三级匹配策略 |
| **模板系统** | 占位符替换 | `{{PLACEHOLDER}}` 模式，零外部依赖 |
| **CLI 工具** | TypeScript + Bun | 类型安全、快速打包、npm 分发 |
| **多平台适配** | 配置驱动 | 18 个平台通过 JSON 配置零代码接入 |

### 解决的核心问题

```
问题：AI 编码助手缺乏专业领域知识
      ↓
解决方案：可搜索的知识库 (CSV) + 智能推理引擎
      ↓
工作流程：
  1. 用户请求 → AI 识别意图
  2. 调用搜索脚本 → BM25 检索相关数据
  3. 推理引擎匹配规则 → 生成完整设计系统
  4. AI 根据推荐生成高质量代码
```

### 核心架构：三层设计

```
┌─────────────────────────────────────────────────────────┐
│  表现层 (Presentation Layer)                             │
│  • SKILL.md / workflow.md - AI 助手读取的指令文件         │
│  • 模板系统 - 根据平台动态生成文件                         │
│  • CLI 工具 - 用户安装交互                                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  逻辑层 (Logic Layer)                                    │
│  • 搜索引擎 (core.py/ts) - BM25 算法实现                  │
│  • 推理引擎 (design_system.py) - 规则匹配与决策           │
│  • 领域检测 - 自动识别查询意图                            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  数据层 (Data Layer)                                     │
│  • CSV 知识库 - 42 个文件，6,461 行数据                   │
│  • 推理规则库 - products.csv 的 Decision_Rules 列         │
│  • 技术栈数据 - 16 个框架特定的指南                       │
└─────────────────────────────────────────────────────────┘
```

### 数据流程

```mermaid
用户输入 "Build a SaaS dashboard"
    ↓
AI 读取 SKILL.md 指令
    ↓
调用: python3 search.py "SaaS dashboard" --design-system
    ↓
搜索引擎工作流程:
    1. 领域检测 → 自动识别为 "product" 域
    2. BM25 搜索 → 在 products.csv 找到 "SaaS" (匹配度 95%)
    3. 多域聚合 → 并行搜索 5 个域:
       - product → SaaS
       - style → Glassmorphism + Minimalism
       - color → Trust Blue 配色方案
       - typography → Space Grotesk / DM Sans
       - landing → Hero-Centric 布局
    4. 推理引擎 → 读取 Decision_Rules JSON:
       {
         "Recommended_Pattern": "Hero-Centric + Feature Showcase",
         "Style_Priority": "Glassmorphism > Flat Design",
         "Color_Mood": "Trust, Professional",
         "Anti_Patterns": "AI purple/pink gradients, Over-animation"
       }
    5. 生成输出 → ASCII/Markdown 格式的完整设计系统
    ↓
返回给 AI
    ↓
AI 根据设计系统生成代码
```

### BM25 搜索引擎原理

```python
# BM25 算法核心公式
score(D, Q) = Σ IDF(qi) * (f(qi, D) * (k1 + 1)) / (f(qi, D) + k1 * (1 - b + b * |D| / avgdl))

参数说明:
- D: 文档 (CSV 的每一行)
- Q: 查询 (用户输入)
- qi: 查询中的第 i 个词
- f(qi, D): qi 在文档 D 中的词频
- k1: 词频饱和参数 (默认 1.5) - 控制词频的重要性
- b: 长度归一化参数 (默认 0.75) - 控制文档长度的影响
- |D|: 文档长度
- avgdl: 平均文档长度
- IDF(qi): 逆文档频率 = log((N - n(qi) + 0.5) / (n(qi) + 0.5))
  - N: 总文档数
  - n(qi): 包含 qi 的文档数
```

**为什么选择 BM25？**
- ✅ 不需要训练或 embedding
- ✅ 零外部依赖 (纯 Python/TypeScript)
- ✅ 对短文本和长文本都有效
- ✅ 可解释性强 (能看到匹配原因)
- ✅ 性能优异 (1000 行数据 < 50ms)

### 推理引擎工作原理

```
三级匹配策略:

Level 1: 产品类型匹配
  输入: "SaaS dashboard"
  匹配: products.csv → Product_Name = "SaaS"
  提取: Decision_Rules JSON

Level 2: 规则注入搜索
  使用 Decision_Rules 中的优先级和过滤器:
  - Style_Priority: "Glassmorphism > Flat > Minimalism"
  - Color_Mood: "Trust, Professional, Clean"
  - Typography_Mood: "Modern, Sans-serif"
  - Anti_Patterns: ["AI purple gradients", "Over-animation"]

Level 3: 最佳匹配选择
  对每个域的搜索结果:
  1. 应用优先级权重
  2. 过滤反模式
  3. 选择 Top 1 或 Top N
  4. 验证一致性
```

## 🚀 快速开始

### 1. 创建你的技能包

```bash
# 复制模板到你的项目
cp -r typescript-skill-template my-awesome-skill
cd my-awesome-skill

# 安装依赖 (如果使用 TypeScript 版本)
npm install
```

### 2. 准备数据

创建 `data/knowledge.csv`:

```csv
No,Name,Category,Keywords,Description,Best_Practice,Anti_Pattern,Example
1,React Hooks,React,"react,hooks,useState,useEffect",Modern React state management,Use functional components,Class components for new code,"useState for simple state"
2,TypeScript,Type Safety,"typescript,types,interfaces,generics",Static typing for JavaScript,Define clear interfaces,Using any everywhere,"interface User { name: string }"
```

### 3. 配置搜索引擎

编辑 `src/config.ts`:

```typescript
export const CSV_CONFIGS = {
  knowledge: {
    file: "knowledge.csv",
    searchColumns: ["Name", "Category", "Keywords", "Description"],
    outputColumns: ["Name", "Description", "Best_Practice", "Example"]
  }
};

export const DOMAIN_KEYWORDS = {
  knowledge: /react|typescript|javascript|frontend|backend|database/i
};
```

### 4. 创建 SKILL.md 模板

编辑 `templates/skill-content.md`:

```markdown
# My Awesome Skill

When the user asks about programming best practices, search the knowledge base:

\```bash
python3 scripts/search.py "<query>" --domain knowledge
\```

## Examples

\```bash
# Search for React best practices
python3 scripts/search.py "React hooks" --domain knowledge

# Search for TypeScript tips
python3 scripts/search.py "TypeScript interfaces" --domain knowledge
\```
```

### 5. 测试搜索

```bash
# Python 版本
python3 src/scripts/search.py "React hooks" --domain knowledge

# TypeScript 版本
npx tsx src/scripts/search.ts "React hooks" --domain knowledge
```

### 6. 安装到 AI 助手

```bash
# 手动安装到 Claude Code
mkdir -p ~/.claude/skills/my-awesome-skill
cp -r src/* ~/.claude/skills/my-awesome-skill/

# 或使用 CLI (如果你构建了 CLI 工具)
npx my-skill-cli init --ai claude
```

## 📁 模板结构

```
typescript-skill-template/
├── README.md                          # 本文件
├── ANALYSIS.md                        # 详细技术分析
├── package.json                       # TypeScript 项目配置
├── tsconfig.json                      # TypeScript 编译配置
├── src/
│   ├── core/
│   │   ├── bm25.ts                   # BM25 搜索引擎实现
│   │   ├── csv-parser.ts             # CSV 解析器 (RFC-4180)
│   │   ├── domain-detector.ts        # 领域自动检测
│   │   └── types.ts                  # TypeScript 类型定义
│   ├── scripts/
│   │   ├── search.ts                 # 搜索入口 (TypeScript 版本)
│   │   ├── search.py                 # 搜索入口 (Python 版本)
│   │   └── reasoning-engine.ts       # 推理引擎 (可选)
│   ├── data/
│   │   ├── example-knowledge.csv     # 示例数据文件
│   │   └── README.md                 # 数据格式说明
│   ├── templates/
│   │   ├── base/
│   │   │   ├── skill-content.md      # 通用技能内容
│   │   │   └── quick-reference.md    # 快速参考
│   │   └── platforms/
│   │       ├── claude.json           # Claude Code 配置
│   │       ├── cursor.json           # Cursor 配置
│   │       └── README.md             # 平台配置说明
│   └── config.ts                     # 主配置文件
├── cli/                               # CLI 工具 (可选)
│   ├── src/
│   │   ├── commands/
│   │   │   └── init.ts               # 初始化命令
│   │   ├── utils/
│   │   │   └── template.ts           # 模板渲染
│   │   └── index.ts                  # CLI 入口
│   └── package.json
└── examples/                          # 示例实现
    ├── web-dev-tips/                 # Web 开发技巧
    ├── api-design-guide/             # API 设计指南
    └── code-review-rules/            # 代码审查规则
```

## 🎯 支持的输入源类型

### 1. HTML 文档

```typescript
// data/html-patterns.csv
No,Pattern_Name,HTML_Structure,Use_Case,Best_Practice
1,Card Component,"<div class='card'>...</div>",Content containers,Use semantic HTML
```

### 2. 组件源码

```typescript
// data/component-library.csv
No,Component_Name,Code_Snippet,Props,Usage_Example
1,Button,"<button class='btn'>Click</button>","variant,size,disabled","<Button variant='primary' />"
```

### 3. 图片 (通过元数据)

```typescript
// data/design-assets.csv
No,Asset_Name,Image_Path,Category,Description,Keywords
1,Hero Banner,/assets/hero-1.png,Landing Page,Modern SaaS hero,"hero,banner,saas"
```

### 4. Markdown 文档

```typescript
// data/documentation.csv
No,Doc_Name,File_Path,Category,Summary,Keywords
1,React Guide,/docs/react.md,Framework,React best practices,"react,hooks,components"
```

### 5. 文字内容

```typescript
// data/copywriting.csv
No,Content_Type,Title,Body,Tone,Use_Case
1,CTA Button,"Get Started","Join 10,000+ users",Friendly,Landing page primary CTA
```

## 🔧 高级功能

### 推理引擎集成

```typescript
// src/reasoning-engine.ts
interface ReasoningRule {
  condition: string;
  priority: string[];
  antiPatterns: string[];
  recommendations: Record<string, any>;
}

export function applyReasoning(
  query: string,
  searchResults: SearchResult[]
): EnhancedResults {
  // 1. 匹配规则
  const rule = matchRule(query);

  // 2. 应用优先级
  const prioritized = applyPriority(searchResults, rule.priority);

  // 3. 过滤反模式
  const filtered = filterAntiPatterns(prioritized, rule.antiPatterns);

  return {
    results: filtered,
    reasoning: rule.recommendations
  };
}
```

### 多域聚合

```typescript
// 并行搜索多个数据源
const results = await Promise.all([
  search("React", "framework"),
  search("React", "patterns"),
  search("React", "best-practices")
]);

const aggregated = aggregateResults(results);
```

### 持久化设计系统

```bash
# 生成并持久化到文件
python3 search.py "SaaS" --design-system --persist

# 生成结构:
design-system/
├── MASTER.md              # 全局设计系统
└── pages/
    ├── dashboard.md       # 页面级覆写
    └── settings.md
```

## 📊 性能指标

基于 UI/UX Pro Max 实测数据:

| 操作 | 数据规模 | 执行时间 | 内存占用 |
|-----|---------|---------|---------|
| BM25 搜索 | 1000 行 | 30-50ms | 5-10MB |
| CSV 加载 | 6,461 行 | 100-200ms | 15-25MB |
| 推理引擎 | 161 规则 | 10-20ms | 2-5MB |
| 完整设计系统生成 | 5 域并行 | 150-300ms | 30-50MB |

## 🛠️ 技术原理详解

### CSV 作为知识库的优势

1. **人类可读** - 任何人都能用 Excel/Numbers 编辑
2. **Git 友好** - 文本格式，diff 清晰，merge 简单
3. **零依赖** - 不需要数据库或 ORM
4. **跨平台** - Python/TypeScript/任何语言都能解析
5. **AI 友好** - AI 可以直接读取和理解 CSV 格式

### 模板渲染引擎原理

```typescript
// 占位符替换系统
const template = `
# {{TITLE}}
{{DESCRIPTION}}
Command: python3 {{SCRIPT_PATH}} "query"
`;

const rendered = template
  .replace(/{{TITLE}}/g, "My Skill")
  .replace(/{{DESCRIPTION}}/g, "A great skill")
  .replace(/{{SCRIPT_PATH}}/g, "scripts/search.py");
```

### 平台适配机制

```json
// platforms/claude.json
{
  "platform": "claude",
  "folderStructure": {
    "root": ".claude",
    "skillPath": "skills/my-skill",
    "filename": "SKILL.md"
  },
  "scriptPath": "skills/my-skill/scripts/search.py",
  "frontmatter": {
    "activate": ["plan", "build", "create"]
  }
}
```

## 📚 参考文档

- [完整技术分析](ANALYSIS.md) - 深入分析 UI/UX Pro Max 的设计决策
- [快速上手指南](docs/quick-start.md) - 5 分钟创建你的第一个技能
- [API 参考](docs/api-reference.md) - 所有函数和接口文档
- [示例集合](examples/) - 真实项目示例

## 🤝 贡献指南

欢迎提交 PR 和 Issue！参考 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 许可证

MIT License - 参考 [LICENSE](../LICENSE)

## 🙏 致谢

本模板基于 [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 项目架构提炼而成。
