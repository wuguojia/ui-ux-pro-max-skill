# 03 — 与竞品/替代方案对比

## 定位对比

| 方案 | 类型 | 目标 | 依赖 |
|------|------|------|------|
| **UI/UX Pro Max** | AI Skill + 本地数据 | 给 AI 编码助手设计知识 | Python 3 (零依赖) |
| Tailwind CSS | CSS 框架 | 实用优先的样式系统 | Node.js |
| shadcn/ui | 组件库 | 复制粘贴式组件 | React + Tailwind |
| Design Tokens | 规范 | 跨平台设计变量 | 工具链依赖 |
| Figma Plugins | 设计工具 | 视觉设计 | Figma |
| v0.dev | AI 生成 | 从描述生成 UI | 在线服务 |

---

## 详细对比

### vs Tailwind CSS

| 维度 | UI/UX Pro Max | Tailwind CSS |
|------|--------------|-------------|
| 解决什么 | "用什么颜色？什么风格？" | "怎么写样式？" |
| 工作层级 | 设计决策层 | 样式实现层 |
| 关系 | 互补 | 互补 |
| 输出 | 配色方案 + 风格推荐 | CSS 类名 |

**结论**: 不是竞品，是上下游关系。UI/UX Pro Max 决定"用什么"，Tailwind 负责"怎么实现"。

### vs shadcn/ui

| 维度 | UI/UX Pro Max | shadcn/ui |
|------|--------------|-----------|
| 解决什么 | 设计系统决策 | UI 组件实现 |
| 框架依赖 | 框架无关 | React 专属 |
| 输出 | Markdown 推荐 | 可复制代码 |
| 平台 | 18 个 AI 平台 | 通用 |

**结论**: 互补。搭配 shadcn/ui 的 MCP server 可以先决策再组件化。

### vs v0.dev

| 维度 | UI/UX Pro Max | v0.dev |
|------|--------------|--------|
| 方式 | 本地搜索引擎 | 云端 AI 生成 |
| 可控性 | 数据透明、可编辑 | 黑盒 |
| 一致性 | 同输入同输出 | 每次可能不同 |
| 离线使用 | ✅ | ❌ |
| 成本 | 免费 | 付费 |

---

## 独特优势

### 1. 唯一的 "AI for AI" 设计方案

目前市场上**没有**其他产品做到:
- 以 Skill/Workflow 形式给 AI 编码助手注入设计知识
- 覆盖 18 个 AI 平台
- 161 种产品类型的专业设计建议

### 2. 数据透明

所有知识存储在 CSV 中，可以:
- 用 Excel/Numbers 编辑
- Git diff 追踪变化
- 团队协作修改

### 3. 零依赖

```
Python 3 (预装在 macOS/Linux)
+ 标准库 csv/json/os/re/math/argparse
= 完整运行
```

不需要 `pip install`，不需要 `npm install`，不需要网络。

### 4. 可模板化

架构设计使得同一套系统可以用于任何领域，不仅限于 UI/UX。
