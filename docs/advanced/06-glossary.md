# 06 — 术语表

## A

**AI Skill** — 为 AI 编码助手提供的结构化知识和指令集，通常以 Markdown 文件形式存在。AI 读取 Skill 后获得特定领域的专业能力。

**AI_FOLDERS** — CLI 中的映射表，将 AI 平台类型映射到对应的文件夹路径。

**Anti_Patterns** — 推理规则中的"反模式"字段，告诉 AI **不应该**做什么。

---

## B

**BM25 (Best Matching 25)** — 信息检索算法，基于词频(TF)和逆文档频率(IDF)计算文档与查询的相关性分数。是搜索引擎的核心排序算法。

---

## C

**Commander.js** — Node.js CLI 框架，用于定义命令、选项和参数。本项目 CLI 基于此构建。

**core.py / core.ts** — 搜索引擎核心文件，包含 BM25 算法和 CSV 域配置。

**CSV_CONFIGS** — core.py 中的字典，定义每个搜索域对应的 CSV 文件、搜索列和输出列。

---

## D

**Decision_Rules** — ui-reasoning.csv 中的 JSON 字段，包含条件-动作规则对，供 AI 在特定上下文中酌情应用。

**Design System** — 一套完整的设计规范，包括配色方案、字体搭配、间距系统、动效规则等。本项目可自动生成。

**detect_domain()** — 核心函数，通过正则表达式匹配用户查询中的关键词，自动判断应搜索哪个域。

**Domain** — 搜索域，对应一个 CSV 数据文件。如 `style`、`color`、`typography`。

---

## F

**Frontmatter** — Markdown 文件顶部的 YAML 元数据块，被 `---` 包围。部分 AI 平台用它识别 Skill 属性。

---

## G

**generatePlatformFiles()** — 模板引擎的核心函数，为指定 AI 平台生成完整的 Skill 文件和资源。

---

## I

**IDF (Inverse Document Frequency)** — 逆文档频率，衡量一个词的稀有程度。越稀有的词 IDF 越高，搜索时权重越大。

---

## K

**k1** — BM25 的词频饱和度参数 (默认 1.5)。值越大，高频词的影响越大。

---

## M

**MASTER.md** — 设计系统的主文件，包含全局设计规则。页面级覆盖存储在 `pages/*.md` 中。

**Multi-domain Search** — 设计系统生成时同时搜索多个域 (product, style, color, typography, landing) 的策略。

---

## P

**PlatformConfig** — TypeScript 接口，定义平台配置 JSON 的结构 (platform, folderStructure, frontmatter 等)。

---

## Q

**Quick Reference** — 仅 Claude 平台包含的 297 行速查表，包含 200+ 条内联 UI/UX 规则。

---

## R

**Reasoning Engine** — 推理引擎，基于 ui-reasoning.csv 的 161 条规则，将产品类型映射到设计决策。

**renderSkillFile()** — 模板渲染函数，加载基础模板并替换占位符生成最终 Skill 文件。

---

## S

**search()** — 核心搜索函数，接受查询、域和结果数，返回 BM25 排序的匹配记录。

**Severity** — 推理规则的优先级 (HIGH/MEDIUM/LOW)，影响规则在设计系统中的权重。

**Source of Truth** — `src/ui-ux-pro-max/`，项目的规范数据源。所有修改必须在此目录进行。

**Style_Priority** — 推理规则中的风格优先级字段，指导搜索引擎优先匹配哪些 UI 风格。

**Symlink** — 符号链接，`.claude/skills/` 通过 symlink 指向 `src/`，实现零成本数据同步。

---

## T

**templateInstall()** — CLI 安装的回退方法，当 GitHub 下载失败时从本地 assets 模板生成文件。

**TF (Term Frequency)** — 词频，一个词在文档中出现的次数。BM25 用它计算匹配度。

---

## U

**ui-reasoning.csv** — 推理规则数据库，161 行，每行对应一个产品类型的设计决策规则。

**uipro-cli** — npm 包名，CLI 安装工具。用户通过 `npx uipro-cli init` 安装 Skill。
