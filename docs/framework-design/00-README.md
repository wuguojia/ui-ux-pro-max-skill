# 🏗️ 通用 AI Skill 框架设计文档集

> **定位**：这是一套**完全独立、可直接复制**到任何新项目的通用框架设计文档。
> 它提炼了 UI/UX Pro Max 项目的架构精华，抽象成与具体领域无关的设计蓝图。
>
> **使用方式**：将整个 `framework-design/` 文件夹复制到你的新项目，按编号顺序阅读或按需查阅。

---

## 📖 文档索引（共 21 篇）

### 🎯 第一部分：架构设计（核心）

| # | 文档 | 描述 | 页数 |
|---|------|------|------|
| 01 | [执行摘要](01-executive-summary.md) | 框架是什么、解决什么问题、核心价值主张 | ~3 |
| 02 | [三层架构设计](02-three-layer-architecture.md) | 数据层 / 逻辑层 / 表现层的完整设计 | ~8 |
| 03 | [数据层设计](03-data-layer-design.md) | CSV 知识库设计规范、Schema 设计原则、数据质量 | ~6 |
| 04 | [搜索引擎设计](04-search-engine-design.md) | BM25 算法详解、配置系统、域自动检测 | ~8 |
| 05 | [推理引擎设计](05-reasoning-engine-design.md) | 规则匹配、决策链、条件逻辑、优先级系统 | ~6 |
| 06 | [生成器设计](06-design-system-generator.md) | 多域聚合、最佳匹配选择、输出格式化 | ~7 |

### 🔧 第二部分：工程实现

| # | 文档 | 描述 | 页数 |
|---|------|------|------|
| 07 | [模板渲染引擎](07-template-rendering-engine.md) | 占位符系统、Frontmatter、条件段落 | ~5 |
| 08 | [CLI 分发系统](08-cli-distribution-design.md) | 安装 / 更新 / 卸载、三级回退策略 | ~6 |
| 09 | [多平台适配](09-multi-platform-adaptation.md) | 平台配置矩阵、零代码接入新平台 | ~5 |
| 10 | [持久化模式](10-persistence-pattern.md) | Master + Overrides、页面级覆写 | ~4 |
| 11 | [数据同步策略](11-data-sync-strategy.md) | Source of Truth、Symlink、Bundle 三角 | ~4 |

### 📐 第三部分：接口与规范

| # | 文档 | 描述 | 页数 |
|---|------|------|------|
| 12 | [API 接口参考](12-api-interface-reference.md) | 所有函数签名、类型定义、调用示例 | ~8 |
| 13 | [CSV Schema 规范](13-csv-schema-specification.md) | 每个域的完整列定义与约束 | ~6 |
| 14 | [配置参考](14-configuration-reference.md) | 所有 JSON / Python / TypeScript 配置项 | ~5 |

### 🛡️ 第四部分：质量保障

| # | 文档 | 描述 | 页数 |
|---|------|------|------|
| 15 | [错误处理模式](15-error-handling-patterns.md) | 降级策略、边界条件、容错设计 | ~4 |
| 16 | [性能指南](16-performance-guide.md) | 复杂度分析、瓶颈定位、优化建议 | ~5 |
| 17 | [安全检查清单](17-security-checklist.md) | 攻击面分析、防护措施、依赖审计 | ~4 |
| 18 | [测试策略](18-testing-strategy.md) | 单元 / 集成 / E2E 测试方案 | ~5 |

### 🚀 第五部分：实操指南

| # | 文档 | 描述 | 页数 |
|---|------|------|------|
| 19 | [迁移指南](19-migration-guide.md) | 如何将框架应用到全新领域（step-by-step） | ~6 |
| 20 | [快速上手食谱](20-quick-start-cookbook.md) | 5 分钟创建一个新 Skill 的完整流程 | ~4 |

---

## 🗺️ 阅读路径推荐

### 路径 A：「我想理解这个框架」（架构师 / 技术负责人）
```
01 执行摘要 → 02 三层架构 → 04 搜索引擎 → 05 推理引擎 → 06 生成器
```

### 路径 B：「我想用它做一个新 Skill」（开发者）
```
20 快速上手 → 19 迁移指南 → 03 数据层 → 13 CSV Schema → 14 配置参考
```

### 路径 C：「我想评估是否适合我的项目」（决策者）
```
01 执行摘要 → 16 性能指南 → 17 安全清单 → 09 多平台适配
```

### 路径 D：「我要维护和扩展」（维护者）
```
11 数据同步 → 12 API 参考 → 15 错误处理 → 18 测试策略
```

---

## 📋 文档约定

- **代码块**：所有代码示例均为伪代码或简化版，标注了语言类型
- **接口定义**：使用 TypeScript 语法定义类型，Python 用类型注解
- **表格**：配置矩阵和对比表格统一使用 Markdown 表格
- **图表**：使用 ASCII art 绘制架构图和流程图
- **参数说明**：`[可选]` 表示可选参数，`必需` 表示必须提供
- **领域无关**：文档中用 `{your-skill}` 表示你的 Skill 名称，用 `{domain}` 表示你的知识领域

---

## 🔗 与现有文档的关系

```
docs/
├── analysis/              ← 对 UI/UX Pro Max 的具体分析（绑定本项目）
├── template-guide/        ← 模板化操作指南（绑定本项目）
├── advanced/              ← 高级话题（绑定本项目）
├── typescript-rewrite/    ← TS 迁移（绑定本项目）
└── framework-design/ ★    ← 通用框架设计文档（可直接复制到任何项目）
```

> **核心区别**：`analysis/` 和 `template-guide/` 是"解读这个项目"，
> 而 `framework-design/` 是"照着这个蓝图建任何项目"。
