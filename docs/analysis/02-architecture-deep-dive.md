# 02 — 架构深度剖析

## 三层架构模型

UI/UX Pro Max 的核心架构可以抽象为三层：

```
┌────────────────────────────────────────────────────────────┐
│                     Layer 3: 分发层                         │
│  (Distribution Layer)                                      │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ templates/    │  │ cli/         │  │ skill.json       │ │
│  │ platforms/    │  │ (uipro-cli)  │  │ .claude-plugin/  │ │
│  │ *.json       │  │ TypeScript   │  │ marketplace      │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
├────────────────────────────────────────────────────────────┤
│                     Layer 2: 引擎层                         │
│  (Engine Layer)                                            │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ core.py      │  │ search.py    │  │ design_system.py │ │
│  │ BM25 算法     │  │ CLI 入口     │  │ 多域聚合+推理     │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
├────────────────────────────────────────────────────────────┤
│                     Layer 1: 知识层                         │
│  (Data/Knowledge Layer)                                    │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ *.csv (26个)  │  │ stacks/      │  │ ui-reasoning.csv │ │
│  │ 领域知识数据   │  │ (16个技术栈)  │  │ 推理规则(大脑)    │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 完整目录结构与职责

```
ui-ux-pro-max-skill/
│
├── src/ui-ux-pro-max/           ← 🏠 唯一的 Source of Truth
│   ├── data/                    ← Layer 1: 知识层
│   │   ├── products.csv         ←   161 种产品类型定义
│   │   ├── colors.csv           ←   161 套配色方案 (与 products 1:1)
│   │   ├── ui-reasoning.csv     ←   161 条推理规则 (与 products 1:1)
│   │   ├── styles.csv           ←   67 种 UI 风格
│   │   ├── typography.csv       ←   57 种字体配对
│   │   ├── charts.csv           ←   25 种图表类型
│   │   ├── landing.csv          ←   24 种着陆页模式
│   │   ├── ux-guidelines.csv    ←   99 条 UX 规则
│   │   ├── icons.csv            ←   图标推荐
│   │   ├── google-fonts.csv     ←   Google Fonts 完整库 (728KB)
│   │   ├── app-interface.csv    ←   App 界面指南
│   │   ├── react-performance.csv ←  React/Next.js 性能规则
│   │   ├── design.csv           ←   ~1775 条设计模式
│   │   ├── _sync_all.py         ←   数据同步脚本
│   │   └── stacks/              ←   16 个技术栈专用文件
│   │       ├── react.csv
│   │       ├── nextjs.csv
│   │       └── ... (共 16 个)
│   │
│   ├── scripts/                 ← Layer 2: 引擎层
│   │   ├── core.py              ←   BM25 搜索引擎核心
│   │   ├── search.py            ←   CLI 入口（用户直接调用）
│   │   └── design_system.py     ←   设计系统生成器
│   │
│   └── templates/               ← Layer 3: 分发层（模板部分）
│       ├── base/
│       │   ├── skill-content.md ←   SKILL.md 的主体模板
│       │   └── quick-reference.md ← 速查表 (仅 Claude)
│       └── platforms/           ←   18 个平台配置
│           ├── claude.json
│           ├── cursor.json
│           ├── copilot.json
│           └── ... (共 18 个)
│
├── cli/                         ← Layer 3: 分发层（CLI 部分）
│   ├── src/                     ←   TypeScript 源码
│   │   ├── index.ts             ←   CLI 主入口 (Commander.js)
│   │   ├── commands/
│   │   │   ├── init.ts          ←   安装命令
│   │   │   ├── update.ts        ←   更新命令
│   │   │   ├── uninstall.ts     ←   卸载命令
│   │   │   └── versions.ts      ←   版本列表
│   │   ├── types/index.ts       ←   类型定义 (AIType, PlatformConfig)
│   │   └── utils/
│   │       ├── template.ts      ←   模板渲染引擎 ★
│   │       ├── detect.ts        ←   AI 平台自动检测
│   │       ├── extract.ts       ←   ZIP 解压工具
│   │       ├── github.ts        ←   GitHub API 集成
│   │       └── logger.ts        ←   日志工具
│   ├── assets/                  ←   打包到 npm 的资源副本
│   │   ├── data/                ←   从 src/ 同步的 CSV
│   │   ├── scripts/             ←   从 src/ 同步的 Python 脚本
│   │   └── templates/           ←   从 src/ 同步的模板
│   └── package.json             ←   npm 包配置 (uipro-cli)
│
├── .claude/skills/ui-ux-pro-max/ ← symlink → src/
├── .claude-plugin/              ←   Claude Marketplace 元数据
├── .github/workflows/           ←   CI/CD (Claude 集成 + 代码审查)
├── docs/                        ←   文档
├── skill.json                   ←   技能市场元数据
├── CLAUDE.md                    ←   Claude 集成指南
└── README.md                    ←   项目主文档
```

---

## 数据流分析

### 搜索流程（单域搜索）

```
用户输入 "glassmorphism dark mode"
    │
    ▼
search.py (CLI 入口)
    │ 解析参数: query="glassmorphism dark mode", domain=None
    ▼
core.py → detectDomain(query)
    │ 匹配关键词: "glassmorphism" → style, "dark mode" → style
    │ 得分最高: style
    ▼
core.py → search(query, "style", maxResults=3)
    │ 读取 CSV_CONFIG["style"]
    │ filepath = data/styles.csv
    ▼
core.py → _search_csv(filepath, search_cols, output_cols, query, 3)
    │ 1. loadCsv: 解析 67 行 CSV
    │ 2. 拼接搜索列: "Style Category Keywords Best For Type AI Prompt Keywords"
    │ 3. BM25.fit(67 个文档)
    │ 4. BM25.score("glassmorphism dark mode")
    │ 5. 取 top 3 且 score > 0
    ▼
返回结果: [{Style Category: "Glassmorphism", ...}, ...]
```

### 设计系统生成流程

```
用户输入 "beauty spa wellness" --design-system -p "Serenity Spa"
    │
    ▼
search.py → generate_design_system(query, project_name, format)
    │
    ▼
design_system.py → DesignSystemGenerator.generate(query)
    │
    ├─ Step 1: search(query, "product", 1)
    │  → 找到: "Beauty / Spa / Salon"
    │
    ├─ Step 2: _apply_reasoning("Beauty / Spa / Salon")
    │  → 从 ui-reasoning.csv 匹配规则
    │  → 得到: style_priority=["Soft UI", "Minimalism"]
    │         color_mood="Calming pink + Sage green"
    │         anti_patterns="Bright neon + Harsh animations"
    │
    ├─ Step 3: _multi_domain_search(query, style_priority)
    │  → 并行搜索 5 个域:
    │     product(1) + style(3) + color(2) + landing(2) + typography(2)
    │
    ├─ Step 4: _select_best_match(style_results, style_priority)
    │  → 用优先级关键词对结果排序
    │  → 选择与 "Soft UI" 最匹配的风格
    │
    └─ Step 5: 组装最终设计系统
       → { pattern, style, colors, typography, effects, anti_patterns }
    │
    ▼
format_ascii_box(design_system) 或 format_markdown(design_system)
    │
    ▼
输出到终端 / 保存到 MASTER.md
```

---

## 耦合点分析

这是理解架构可复用性的关键。三层之间的耦合点极少：

### 耦合点 1: 知识层 → 引擎层

**位置**: `core.py` 的 `CSV_CONFIG` 字典

```python
CSV_CONFIG = {
    "style": {
        "file": "styles.csv",                    # 哪个文件
        "search_cols": ["Style Category", ...],   # 搜索哪些列
        "output_cols": ["Style Category", ...],   # 输出哪些列
    },
    ...
}
```

**影响**: 如果换一套 CSV 数据（比如烹饪知识），只需要修改这个字典。

### 耦合点 2: 引擎层 → 分发层

**位置**: `skill-content.md` 模板中的搜索命令

```markdown
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>
```

**影响**: 如果改了脚本路径或参数，需要同步修改模板。

### 耦合点 3: 分发层内部

**位置**: `template.ts` 的 `renderSkillFile()` 中的占位符

```typescript
content = content
    .replace(/\{\{TITLE\}\}/g, config.title)
    .replace(/\{\{DESCRIPTION\}\}/g, config.description)
    .replace(/\{\{SCRIPT_PATH\}\}/g, config.scriptPath)
    .replace(/\{\{SKILL_OR_WORKFLOW\}\}/g, config.skillOrWorkflow)
    .replace(/\{\{QUICK_REFERENCE\}\}/g, quickRefWithNewline);
```

**影响**: 添加新的占位符需要同时修改模板和渲染代码。

---

## 设计模式识别

| 模式 | 在项目中的应用 | 位置 |
|------|--------------|------|
| **策略模式** | 每个域 (style/color/...) 是一个搜索策略 | `CSV_CONFIG` |
| **模板方法** | `skill-content.md` + `{{PLACEHOLDER}}` | `template.ts` |
| **聚合器模式** | 多域搜索 → 推理 → 合并输出 | `design_system.py` |
| **工厂模式** | 根据 AI 类型生成不同的平台文件 | `generatePlatformFiles()` |
| **适配器模式** | 同一份数据适配 18 个平台的不同格式 | `platforms/*.json` |
| **单一数据源** | `src/` 是唯一真实来源，其他都是副本或链接 | 目录结构 |

---

## 性能特征

| 操作 | 耗时 | 瓶颈 |
|------|------|------|
| 单域搜索 | ~50ms | CSV 文件 I/O (冷启动) |
| 设计系统生成 | ~200ms | 5 次独立搜索 + 推理 |
| CLI 安装 | ~1-3s | 文件系统写入 |
| GitHub 下载 | 2-10s | 网络延迟 |

**注**: BM25 是内存中计算，对 6000+ 行数据，性能完全足够。不需要向量数据库。
