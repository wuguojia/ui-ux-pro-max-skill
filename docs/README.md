# 📚 UI/UX Pro Max — 文档集总览

> 本文档集旨在帮助你**深入理解**项目的每一个角落，并掌握**如何将其变成可复用模板**。
>
> **共 48 篇文档**，覆盖架构分析、模板化指南、高级主题、TypeScript 迁移、**通用框架设计**五大板块。

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

## 五、通用框架设计文档（Framework Design）— 21 篇 ★ NEW

**可直接复制到新项目使用**的通用 AI Skill 框架设计蓝图。详见 [framework-design/00-README.md](framework-design/00-README.md)。

| # | 文档 | 内容 | 适合谁 |
|---|------|------|--------|
| 00 | [文档索引](framework-design/00-README.md) | 21篇文档总览、阅读路径推荐 | 所有人 |
| 01 | [执行摘要](framework-design/01-executive-summary.md) | 框架定位、核心价值、适用场景、技术选型 | 决策者 |
| 02 | [三层架构设计](framework-design/02-three-layer-architecture.md) | 数据/逻辑/表现层完整设计、接口、扩展点 | 架构师 |
| 03 | [数据层设计](framework-design/03-data-layer-design.md) | CSV规范、Schema设计、数据关系、质量保障 | 数据工程师 |
| 04 | [搜索引擎设计](framework-design/04-search-engine-design.md) | BM25算法详解、完整实现、域配置、自动检测 | 开发者 |
| 05 | [推理引擎设计](framework-design/05-reasoning-engine-design.md) | 三级匹配、Decision_Rules、搜索注入机制 | 开发者 |
| 06 | [生成器设计](framework-design/06-design-system-generator.md) | 多域聚合、最佳匹配、输出格式化、持久化 | 开发者 |
| 07 | [模板渲染引擎](framework-design/07-template-rendering-engine.md) | 占位符系统、平台JSON、零代码加平台 | 开发者 |
| 08 | [CLI分发系统](framework-design/08-cli-distribution-design.md) | 三级回退、自动检测、npm配置 | DevOps |
| 09 | [多平台适配](framework-design/09-multi-platform-adaptation.md) | 平台矩阵、差异维度、接入步骤 | 开发者 |
| 10 | [持久化模式](framework-design/10-persistence-pattern.md) | Master+Overrides、页面覆写、AI使用流程 | 架构师 |
| 11 | [数据同步策略](framework-design/11-data-sync-strategy.md) | 三角同步、Symlink、CLI Assets、验证脚本 | 维护者 |
| 12 | [API接口参考](framework-design/12-api-interface-reference.md) | 所有Python/TS函数签名、类型、CLI命令 | 开发者 |
| 13 | [CSV Schema规范](framework-design/13-csv-schema-specification.md) | 6种Schema模板、列定义、约束规则 | 数据工程师 |
| 14 | [配置参考](framework-design/14-configuration-reference.md) | BM25参数、CSV_CONFIG、平台JSON、package.json | 开发者 |
| 15 | [错误处理模式](framework-design/15-error-handling-patterns.md) | 降级矩阵、边界条件、错误码 | 开发者 |
| 16 | [性能指南](framework-design/16-performance-guide.md) | 复杂度分析、基准测试、优化级别 | 架构师 |
| 17 | [安全检查清单](framework-design/17-security-checklist.md) | 攻击面、数据/搜索/CLI安全、依赖审计 | 安全工程师 |
| 18 | [测试策略](framework-design/18-testing-strategy.md) | 数据质量/单元/集成/E2E测试、CI/CD | QA |
| 19 | [迁移指南](framework-design/19-migration-guide.md) | 6步迁移法、3个案例、完整检查清单 | 开发者 |
| 20 | [快速上手食谱](framework-design/20-quick-start-cookbook.md) | 5分钟创建新Skill的完整流程 | 所有人 |

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

### 🟠 如果你想「复制框架到新项目」★

```
framework-design/20-quick-start → 19-migration-guide → 02-architecture → 03-data-layer → 04-search-engine
```
