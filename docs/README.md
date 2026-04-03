# 📚 UI/UX Pro Max — 文档集总览

> 本文档集旨在帮助你**深入理解**项目的每一个角落，并掌握**如何将其变成可复用模板**。

---

## 一、项目剖析文档（Analysis）

对现有 ui-ux-pro-max-skill 的完整逆向分析，从宏观到微观。

| # | 文档 | 内容 | 适合谁 |
|---|------|------|--------|
| 01 | [项目总览与定位](analysis/01-project-overview.md) | 项目是什么、解决什么问题、核心价值、数据统计 | 所有人 |
| 02 | [架构深度剖析](analysis/02-architecture-deep-dive.md) | 三层架构、目录结构、数据流、耦合分析 | 架构师、开发者 |
| 03 | [BM25 搜索引擎分析](analysis/03-search-engine-analysis.md) | 搜索算法原理、代码逐行解读、性能特征 | 开发者 |
| 04 | [设计系统生成器分析](analysis/04-design-system-generator.md) | 多域聚合、推理引擎、输出格式化 | 开发者 |
| 05 | [数据层完整分析](analysis/05-data-layer-analysis.md) | 42个CSV文件、列结构、数据关系、同步脚本 | 数据维护者 |
| 06 | [分发系统分析](analysis/06-distribution-system.md) | CLI工具、18平台适配、npm发布 | 发布者 |
| 07 | [模板渲染引擎分析](analysis/07-template-rendering-engine.md) | 模板系统、占位符、平台配置差异 | 开发者 |
| 08 | [数据同步策略分析](analysis/08-sync-strategy.md) | 三份数据的关系、symlink、同步流程 | 维护者 |

## 二、模板化设计文档（Template Guide）

如何将此项目变成高可用、高复用的可套用模板。

| # | 文档 | 内容 | 适合谁 |
|---|------|------|--------|
| 01 | [设计思路与哲学](template-guide/01-design-philosophy.md) | 核心设计原则、为什么这样设计、哲学基础 | 所有人 |
| 02 | [方案设计](template-guide/02-solution-design.md) | 具体技术方案、配置驱动、抽象策略 | 架构师 |
| 03 | [架构蓝图](template-guide/03-architecture-blueprint.md) | 模板架构、层次划分、接口定义 | 架构师、开发者 |
| 04 | [逐步实施指南](template-guide/04-step-by-step-implementation.md) | 从0到1创建新Skill的完整步骤 | 开发者 |
| 05 | [定制化指南](template-guide/05-customization-guide.md) | 换领域、改数据、调模板的操作手册 | 开发者 |
| 06 | [分享与分发](template-guide/06-sharing-and-distribution.md) | npm发布、GitHub Template、Marketplace | 发布者 |
| 07 | [实战案例](template-guide/07-real-world-examples.md) | 3个完整案例（烹饪、API设计、代码规范） | 学习者 |
| 08 | [向他人介绍的演示大纲](template-guide/08-presentation-deck.md) | 5分钟/15分钟/30分钟演示脚本 | 演讲者 |

---

## 阅读建议

### 如果你想「理解这个项目」

```
01-project-overview → 02-architecture-deep-dive → 05-data-layer-analysis → 03-search-engine
```

### 如果你想「做一个新的 Skill」

```
template-guide/01-design-philosophy → 04-step-by-step → 05-customization-guide → 07-examples
```

### 如果你想「向别人介绍」

```
01-project-overview → template-guide/08-presentation-deck
```

### 如果你想「维护和贡献」

```
08-sync-strategy → 05-data-layer-analysis → 06-distribution-system
```
