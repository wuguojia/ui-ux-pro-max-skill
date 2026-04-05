# 📚 UI/UX Pro Max — 文档集总览

> 本文档集旨在帮助你**深入理解**项目的每一个角落，并掌握**如何将其变成可复用模板**。
>
> **共 27 篇文档**，覆盖架构分析、模板化指南、高级主题、TypeScript 迁移四大板块。

---

## 一、项目剖析文档（Analysis） — 11 篇

对现有 ui-ux-pro-max-skill 的完整逆向分析，从宏观到微观。

| # | 文档 | 内容 | 适合谁 |
|---|------|------|--------|
| 01 | [项目总览与定位](analysis/01-project-overview.md) | 项目是什么、解决什么问题、核心价值、数据统计 | 所有人 |
| 02 | [架构深度剖析](analysis/02-architecture-deep-dive.md) | 三层架构、目录结构、数据流、耦合分析 | 架构师、开发者 |
| 03 | [BM25 搜索引擎分析](analysis/03-search-engine-analysis.md) | 搜索算法原理、代码逐行解读、性能特征 | 开发者 |
| 04 | [设计系统生成器分析](analysis/04-design-system-generator.md) | 多域聚合、推理引擎、输出格式化 | 开发者 |
| 05 | [数据层完整分析](analysis/05-data-layer-analysis.md) | 42个CSV文件、列结构、数据关系、同步脚本 | 数据维护者 |
| 06 | [分发系统分析](analysis/06-distribution-system.md) | CLI工具、18平台适配、npm发布、三级回退策略 | 发布者 |
| 07 | [模板渲染引擎分析](analysis/07-template-rendering-engine.md) | 模板系统、占位符、平台配置差异、设计模式 | 开发者 |
| 08 | [数据同步策略分析](analysis/08-sync-strategy.md) | 三份数据的关系、symlink、同步流程、颜色派生算法 | 维护者 |
| 09 | [CLI 源码逐文件解读](analysis/09-cli-source-code-walkthrough.md) | 9个TS文件逐一解读、依赖分析 | 开发者 |
| 10 | [18平台适配机制剖析](analysis/10-platform-adaptation-analysis.md) | 配置矩阵、差异对比、新平台接入步骤 | 开发者 |
| 11 | [推理引擎深度剖析](analysis/11-reasoning-engine-analysis.md) | 三级匹配策略、Decision_Rules、推理影响搜索的机制 | 开发者 |

## 二、模板化设计文档（Template Guide） — 8 篇

如何将此项目变成高可用、高复用的可套用模板。

| # | 文档 | 内容 | 适合谁 |
|---|------|------|--------|
| 01 | [设计思路与哲学](template-guide/01-design-philosophy.md) | 五大设计原则、架构哲学、技术选型理由 | 所有人 |
| 02 | [方案设计](template-guide/02-solution-design.md) | 三种抽象方案（配置驱动/继承/脚手架）、数据设计规范 | 架构师 |
| 03 | [架构蓝图](template-guide/03-architecture-blueprint.md) | 通用Skill架构、三层划分、接口定义、数据流 | 架构师、开发者 |
| 04 | [逐步实施指南](template-guide/04-step-by-step-implementation.md) | 从0到1创建新Skill的完整6步（以烹饪助手为例） | 开发者 |
| 05 | [定制化指南](template-guide/05-customization-guide.md) | 5种定制场景：换领域、加域、加平台、改内容、调参数 | 开发者 |
| 06 | [分享与分发](template-guide/06-sharing-and-distribution.md) | 4种分发渠道：npm/GitHub Template/Marketplace/Release | 发布者 |
| 07 | [实战案例](template-guide/07-real-world-examples.md) | 3个完整案例（烹饪助手、API设计规范、代码规范） | 学习者 |
| 08 | [演示大纲](template-guide/08-presentation-deck.md) | 5分钟/15分钟/30分钟演示脚本 + 准备清单 | 演讲者 |

## 三、高级主题（Advanced） — 6 篇

深入分析性能、安全、竞品、路线图等高级话题。

| # | 文档 | 内容 | 适合谁 |
|---|------|------|--------|
| 01 | [性能与可扩展性](advanced/01-performance-and-scalability.md) | BM25性能分析、数据规模预测、TS版性能优势 | 架构师 |
| 02 | [安全性与质量保证](advanced/02-security-and-quality.md) | 攻击面分析、依赖安全、WCAG色彩检查、改进建议 | 安全工程师 |
| 03 | [竞品对比](advanced/03-comparison-with-alternatives.md) | vs Tailwind/shadcn/v0.dev + 独特优势 | 决策者 |
| 04 | [未来路线图](advanced/04-future-roadmap.md) | 短期/中期/长期规划、技术债务清单 | 项目负责人 |
| 05 | [FAQ与疑难排解](advanced/05-faq-and-troubleshooting.md) | 6个常见问题 + 5个疑难排解方案 | 所有人 |
| 06 | [术语表](advanced/06-glossary.md) | 30+ 专业术语解释（A-U） | 新人 |

## 四、TypeScript 迁移（TypeScript Rewrite） — 1 篇

| # | 文档 | 内容 | 适合谁 |
|---|------|------|--------|
| 01 | [TS重写迁移指南](typescript-rewrite/01-migration-guide.md) | 当前状态、core.ts接口、search.ts/design_system.ts迁移计划 | 开发者 |

## 附录

| 文档 | 内容 |
|------|------|
| [三个 data-scripts-templates 的区别](三个%20data-scripts-templates%20的区别.md) | src/ vs .claude/ vs cli/assets/ 的关系 |

---

## 阅读建议

### 🟢 如果你想「理解这个项目」

```
01-project-overview → 02-architecture → 05-data-layer → 03-search-engine → 11-reasoning-engine
```

### 🔵 如果你想「做一个新的 Skill」

```
template-guide/01-philosophy → 04-step-by-step → 05-customization → 07-examples
```

### 🟡 如果你想「向别人介绍」

```
01-project-overview → template-guide/08-presentation-deck → advanced/03-comparison
```

### 🔴 如果你想「维护和贡献」

```
08-sync-strategy → 05-data-layer → 06-distribution → 09-cli-walkthrough
```

### 🟣 如果你想「评估和决策」

```
01-project-overview → advanced/03-comparison → advanced/01-performance → advanced/04-roadmap
```

### ⚪ 如果你遇到问题

```
advanced/05-faq-and-troubleshooting → advanced/06-glossary
```
