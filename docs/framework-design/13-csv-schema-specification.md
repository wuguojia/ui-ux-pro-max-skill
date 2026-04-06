# 13 — CSV Schema 完整规范

## 概述

本文档定义了框架中每种 CSV 数据文件的完整 Schema，包括列名、类型、约束和用途。

> **约定**：所有 CSV 文件使用 UTF-8 编码（无 BOM），逗号分隔，第一行为列头。

---

## 通用约束

| 约束 | 说明 |
|------|------|
| 编码 | UTF-8 (无 BOM) |
| 分隔符 | 逗号 (,) |
| 换行 | LF (\n) 或 CRLF (\r\n) |
| 引号 | 值含逗号/换行时必须用双引号包裹 |
| 转义 | 双引号内的双引号用 `""` 转义 |
| 空值 | 空字符串 `""` |
| 序号 | 第一列 `No`，从 1 开始连续递增 |

---

## Schema 1: 产品/类型分类表

**文件名**: `products.csv` (或你的主分类 CSV)

| 列名 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| No | 整数 | ✅ | 序号 | 1 |
| Product_Type | 字符串 | ✅ | 产品/知识类型名 (唯一) | "SaaS (General)" |
| Keywords | 字符串 | ✅ | 搜索关键词 (逗号分隔) | "app, cloud, b2b, subscription" |
| Primary_Strategy | 字符串 | ✅ | 主推荐策略 | "Glassmorphism + Flat Design" |
| Secondary_Strategies | 字符串 | ⬜ | 备选策略 | "Soft UI, Minimalism" |
| Layout_Pattern | 字符串 | ⬜ | 布局模式 | "Hero + Features + CTA" |
| Key_Considerations | 字符串 | ⬜ | 关键注意事项 | "Balance modern feel with clarity" |

**约束**:
- `Product_Type` 全局唯一
- `Product_Type` 与 reasoning.csv 的 `Category` 列 1:1 对应
- `Keywords` 应包含尽可能多的同义词和相关词

---

## Schema 2: 推理规则表

**文件名**: `reasoning.csv` (或 `ui-reasoning.csv`)

| 列名 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| No | 整数 | ✅ | 序号 | 1 |
| Category | 字符串 | ✅ | 分类名 (与产品表 1:1) | "SaaS (General)" |
| Recommended_Pattern | 字符串 | ✅ | 推荐布局/策略模式 | "Hero + Features + CTA" |
| Style_Priority | 字符串 | ✅ | 风格优先级 (逗号分隔) | "Glassmorphism, Flat Design" |
| Color_Mood | 字符串 | ⬜ | 配色倾向 | "Trust blue + Accent contrast" |
| Typography_Mood | 字符串 | ⬜ | 字体倾向 | "Professional + Hierarchy" |
| Key_Effects | 字符串 | ⬜ | 动效建议 | "Subtle hover (200-250ms)" |
| Decision_Rules | JSON字符串 | ⬜ | 条件-动作规则集 | `{"if_ux_focused": "prioritize-minimalism"}` |
| Anti_Patterns | 字符串 | ⬜ | 反模式警告 | "Excessive animation" |
| Severity | 枚举 | ✅ | 规则优先级 | HIGH \| MEDIUM \| LOW |

**约束**:
- `Category` 全局唯一且与产品表对齐
- `Decision_Rules` 必须是合法 JSON (或空字符串)
- `Severity` 只能是 HIGH / MEDIUM / LOW

---

## Schema 3: 通用域表 (样式/图表/布局等)

**文件名**: `{domain}.csv`

| 列名 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| No | 整数 | ✅ | 序号 | 1 |
| Name | 字符串 | ✅ | 条目名称 | "Glassmorphism" |
| Type | 字符串 | ⬜ | 子类型/分类 | "General" |
| Keywords | 字符串 | ✅ | 搜索关键词 | "glass, frost, blur, transparency" |
| Description | 字符串 | ⬜ | 描述 | "Frosted glass aesthetic..." |
| Best_For | 字符串 | ⬜ | 最适合的场景 | "SaaS dashboards, modern apps" |
| Performance | 字符串 | ⬜ | 性能评级 | "⚡ Good (backdrop-filter)" |
| Accessibility | 字符串 | ⬜ | 可访问性评级 | "✓ WCAG AA with contrast" |
| Notes | 字符串 | ⬜ | 补充说明 | "Requires GPU acceleration" |

**约束**:
- 至少有 `No`, `Name`, `Keywords` 三列
- `Keywords` 用于 BM25 搜索

---

## Schema 4: 配色表

**文件名**: `colors.csv`

| 列名 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| No | 整数 | ✅ | 序号 | 1 |
| Product_Type | 字符串 | ✅ | 产品类型 (与产品表 1:1) | "SaaS (General)" |
| Primary | HEX | ✅ | 主色 | #2563EB |
| On_Primary | HEX | ✅ | 主色上文字色 | #FFFFFF |
| Secondary | HEX | ✅ | 次色 | #3B82F6 |
| Accent | HEX | ✅ | 强调色 | #EA580C |
| Background | HEX | ✅ | 背景色 | #F8FAFC |
| Foreground | HEX | ✅ | 前景文字色 | #1E293B |
| Muted | HEX | ⬜ | 柔和色 | #94A3B8 |
| Border | HEX | ⬜ | 边框色 | #E2E8F0 |
| Destructive | HEX | ⬜ | 危险/错误色 | #DC2626 |
| Ring | HEX | ⬜ | 焦点环色 | #2563EB |
| Notes | 字符串 | ⬜ | 配色说明 | "Trust blue for financial..." |

**约束**:
- HEX 格式: `#[0-9A-Fa-f]{6}` (6 位十六进制)
- `Primary` vs `On_Primary` 对比度 ≥ 4.5:1 (WCAG AA)
- `Foreground` vs `Background` 对比度 ≥ 7.0:1 (WCAG AAA)
- `Product_Type` 与产品表 1:1 对应

---

## Schema 5: 字体搭配表

**文件名**: `typography.csv`

| 列名 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| No | 整数 | ✅ | 序号 | 1 |
| Heading_Font | 字符串 | ✅ | 标题字体名 | "Inter" |
| Body_Font | 字符串 | ✅ | 正文字体名 | "Source Sans Pro" |
| Mood | 字符串 | ✅ | 搭配风格/情绪 | "Professional, Clean" |
| Best_For | 字符串 | ⬜ | 最适合场景 | "SaaS, Enterprise" |
| Google_Fonts_URL | URL | ⬜ | Google Fonts 导入链接 | "https://fonts.google..." |
| CSS_Import | 字符串 | ⬜ | CSS @import 语句 | "@import url('...')" |
| Keywords | 字符串 | ✅ | 搜索关键词 | "professional, clean, modern" |

---

## Schema 6: 技术栈指南表

**文件名**: `stacks/{stack}.csv`

| 列名 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| No | 整数 | ✅ | 序号 | 1 |
| Category | 字符串 | ✅ | 分类 | "State Management" |
| Guideline | 字符串 | ✅ | 指南名称 | "Use useState for local state" |
| Description | 字符串 | ✅ | 详细描述 | "Simple component state..." |
| Do | 字符串 | ✅ | 推荐做法 | "useState for forms, toggles" |
| Don't | 字符串 | ✅ | 不推荐做法 | "Class components this.state" |
| Code_Good | 字符串 | ⬜ | 正确代码示例 | "const [x, setX] = useState(0)" |
| Code_Bad | 字符串 | ⬜ | 错误代码示例 | "this.state = { x: 0 }" |
| Severity | 枚举 | ✅ | 重要程度 | High \| Medium \| Low |
| Docs_URL | URL | ⬜ | 官方文档链接 | "https://react.dev/..." |

**约束**:
- 所有技术栈 CSV 使用相同 Schema
- `Severity` 只能是 High / Medium / Low
- `Category` 用于分组显示

---

## 新增域的 Schema 设计指南

### 最小 Schema (必须)

```csv
No,Name,Keywords
1,Item One,"keyword1, keyword2"
2,Item Two,"keyword3, keyword4"
```

### 推荐 Schema (搜索+展示)

```csv
No,Name,Category,Keywords,Description,Best_For,Notes
```

### 完整 Schema (搜索+展示+代码+元数据)

```csv
No,Name,Category,Keywords,Description,Best_For,Code_Example,Performance,Accessibility,Severity,Docs_URL,Notes
```

### 设计原则

1. **搜索列尽量多** — Keywords, Name, Category, Description 都应放入 search_cols
2. **展示列精选** — output_cols 只放用户需要看到的列
3. **关键词要丰富** — 同义词、缩写、行话都放进 Keywords
4. **值长度适中** — 单个值 <500 字符最佳
5. **枚举值统一** — Severity 全用 High/Medium/Low，不要混用大小写
