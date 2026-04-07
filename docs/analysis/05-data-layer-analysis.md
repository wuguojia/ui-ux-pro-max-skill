# 05 — 数据层完整分析

## 概述

数据层是整个项目的基础。所有的搜索结果和设计推荐都来源于 42 个 CSV 文件。这些文件构成了一个**结构化的设计知识图谱**。

---

## 数据文件清单

### 主数据文件（26 个）

| 文件 | 行数 | 大小 | 域名 | 作用 |
|------|------|------|------|------|
| `products.csv` | 161 | ~50KB | product | 产品类型定义与推荐 |
| `colors.csv` | 161 | ~30KB | color | 配色方案（与 products 1:1） |
| `ui-reasoning.csv` | 161 | ~80KB | — | 推理规则（与 products 1:1） |
| `styles.csv` | 67 | ~40KB | style | UI 风格定义 |
| `typography.csv` | 57 | ~20KB | typography | 字体配对 |
| `charts.csv` | 25 | ~15KB | chart | 图表类型推荐 |
| `landing.csv` | 24 | ~10KB | landing | 着陆页模式 |
| `ux-guidelines.csv` | 99 | ~30KB | ux | UX 最佳实践 |
| `icons.csv` | ~50 | ~21KB | icons | 图标推荐 |
| `google-fonts.csv` | ~1500 | 728KB | google-fonts | Google Fonts 完整库 |
| `app-interface.csv` | ~30 | ~10KB | web | App 界面指南 |
| `react-performance.csv` | ~50 | ~15KB | react | React 性能规则 |
| `design.csv` | ~1775 | ~200KB | — | 设计模式库 |
| `draft.csv` | — | — | — | 草稿/开发中数据 |

### 技术栈文件（16 个）

| 文件 | 技术栈 | 内容 |
|------|--------|------|
| `stacks/react.csv` | React | 组件、Hooks、状态管理规则 |
| `stacks/nextjs.csv` | Next.js | SSR、路由、缓存规则 |
| `stacks/vue.csv` | Vue.js | 组合式 API、响应式规则 |
| `stacks/svelte.csv` | Svelte | 编译器优化、存储规则 |
| `stacks/astro.csv` | Astro | Islands 架构、内容集合规则 |
| `stacks/swiftui.csv` | SwiftUI | 声明式 UI、导航规则 |
| `stacks/react-native.csv` | React Native | 移动端性能、导航规则 |
| `stacks/flutter.csv` | Flutter | Widget 树、状态管理规则 |
| `stacks/nuxtjs.csv` | Nuxt.js | SSR、Nitro、模块规则 |
| `stacks/nuxt-ui.csv` | Nuxt UI | 组件库最佳实践 |
| `stacks/html-tailwind.csv` | HTML+Tailwind | 工具类优先、响应式规则 |
| `stacks/shadcn.csv` | shadcn/ui | 组件定制、主题规则 |
| `stacks/jetpack-compose.csv` | Jetpack Compose | Android 声明式 UI 规则 |
| `stacks/threejs.csv` | Three.js | 3D 渲染、性能优化规则 |
| `stacks/angular.csv` | Angular | 模块化、RxJS、变更检测规则 |
| `stacks/laravel.csv` | Laravel | Blade、Livewire、Inertia 规则 |

---

## 数据关系图

```
products.csv (161 行)
    │
    ├── 1:1 ──→ colors.csv (161 行)
    │           每个产品类型有一套专属配色
    │
    ├── 1:1 ──→ ui-reasoning.csv (161 行)
    │           每个产品类型有一套推理规则
    │
    ├── N:M ──→ styles.csv (67 行)
    │           一个产品可以推荐多种风格
    │           一种风格适用于多种产品
    │
    ├── N:M ──→ typography.csv (57 行)
    │           通过 mood 关键词关联
    │
    └── N:M ──→ landing.csv (24 行)
                通过 pattern 名称关联

ux-guidelines.csv ←──独立──→ 所有域都可能查询
charts.csv        ←──独立──→ 仅 chart 域查询
google-fonts.csv  ←──独立──→ 仅 google-fonts 域查询
stacks/*.csv      ←──独立──→ 仅 --stack 查询
```

---

## 关键 CSV 列结构详解

### products.csv

```csv
Product Type, Keywords, Primary Style Recommendation,
Secondary Styles, Landing Page Pattern,
Dashboard Style (if applicable), Color Palette Focus
```

**示例行**:
```
SaaS (General), saas software cloud platform subscription,
Glassmorphism, Flat Design + Minimalism,
Hero + Features + CTA, Glassmorphism, Trust blue + accent
```

### colors.csv（16 色 Token 系统）

```csv
No, Product Type, Primary, On Primary, Secondary, On Secondary,
Accent, On Accent, Background, Foreground, Card, Card Foreground,
Muted, Muted Foreground, Border, Destructive, On Destructive, Ring, Notes
```

**设计Token 说明**:

| Token | 用途 | 示例 |
|-------|------|------|
| Primary | 品牌主色、主按钮 | `#2563EB` (信任蓝) |
| On Primary | Primary 上的文字色 | `#FFFFFF` (白) |
| Secondary | 辅助色、次要按钮 | `#3B82F6` |
| Accent | CTA、强调元素 | `#F97316` (橙) |
| Background | 页面背景 | `#F8FAFC` |
| Foreground | 主体文字 | `#1E293B` |
| Card | 卡片背景 | `#FFFFFF` |
| Muted | 弱化背景 | `#F1F5F9` |
| Muted Foreground | 弱化文字 | `#64748B` |
| Border | 边框色 | `#E2E8F0` |
| Destructive | 错误/删除 | `#DC2626` (红) |
| Ring | 焦点环 | `#2563EB` |

### ui-reasoning.csv（推理规则）

```csv
No, UI_Category, Recommended_Pattern, Style_Priority,
Color_Mood, Typography_Mood, Key_Effects,
Decision_Rules, Anti_Patterns, Severity
```

**Decision_Rules 是 JSON 格式**:
```json
{
  "if_ux_focused": "prioritize-minimalism",
  "if_data_heavy": "add-glassmorphism",
  "if_luxury": "switch-to-liquid-glass"
}
```

---

## 数据同步脚本 (_sync_all.py)

### 作用

确保 `products.csv`、`colors.csv`、`ui-reasoning.csv` 三个文件的 161 行保持同步。

### 工作原理

```
products.csv (权威来源)
    │
    ├──→ rebuild_colors(): 
    │    对 products.csv 中每个产品类型：
    │    1. 如果 colors.csv 中已有 → 保留
    │    2. 如果在 NEW_COLORS 字典中 → 使用预定义颜色
    │    3. 否则 → 从 4 个基础色自动派生 16 色
    │
    └──→ rebuild_ui_reasoning():
         对 products.csv 中每个产品类型：
         1. 如果 ui-reasoning.csv 中已有 → 保留
         2. 否则 → 从产品的 Style/Keywords 自动派生推理规则
```

### 颜色派生算法

```python
def derive_row(product_type, primary, secondary, accent, bg):
    """从 4 个基础色生成完整 16 色 Token"""
    on_primary = on_color(primary)     # 白或黑
    on_secondary = on_color(secondary)
    on_accent = on_color(accent)
    foreground = "#1E293B" if not is_dark(bg) else "#F8FAFC"
    card = shift(bg, 0.02)             # 比背景稍亮
    card_fg = foreground
    muted = shift(bg, -0.05)           # 比背景稍暗
    muted_fg = blend(foreground, bg, 0.4)  # 弱化文字
    border = shift(bg, -0.1)
    destructive = "#DC2626"
    on_destructive = "#FFFFFF"
    ring = primary
    return [product_type, primary, on_primary, secondary, on_secondary,
            accent, on_accent, bg, foreground, card, card_fg,
            muted, muted_fg, border, destructive, on_destructive, ring]
```

---

## 数据质量保证

### 1:1 对齐检查

`products.csv`、`colors.csv`、`ui-reasoning.csv` 必须：
- 行数相同（161）
- Product Type / UI_Category 对应
- 顺序一致

### CSV 格式规范

- 编码: UTF-8
- 分隔符: 逗号
- 引号: RFC-4180（含逗号或换行的字段用双引号包裹）
- 无 BOM
- 行尾: LF（Unix 风格）

---

## 数据规模与存储

| 度量 | 值 |
|------|-----|
| 总 CSV 文件 | 42 |
| 总数据行 | ~6,461 |
| 总大小 | ~2.3 MB |
| 最大文件 | google-fonts.csv (728 KB) |
| 最小文件 | landing.csv (~10 KB) |
| npm 包大小 | ~2 MB (含所有 assets) |
