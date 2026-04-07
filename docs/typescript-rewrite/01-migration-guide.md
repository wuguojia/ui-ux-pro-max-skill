# 01 — TypeScript 重写迁移指南

## 当前状态

| 文件 | Python | TypeScript | 状态 |
|------|--------|-----------|------|
| core.py → core.ts | 263 行 | 680 行 | ✅ 已完成 |
| search.py → search.ts | 115 行 | - | ❌ 待写 |
| design_system.py → design_system.ts | 1149 行 | - | ❌ 待写 |

---

## core.ts 架构

### 导出接口

```typescript
// BM25 搜索引擎
export class BM25 {
  fit(documents: string[]): void;
  score(query: string): Array<[number, number]>;
}

// 主搜索函数
export function search(
  query: string,
  domain?: string,
  maxResults?: number
): SearchResult[];

// 技术栈搜索
export function searchStack(
  query: string,
  stack: string,
  maxResults?: number
): SearchResult[];

// 辅助函数
export function detectDomain(query: string): string;
export function loadCsv(filePath: string): Record<string, string>[];
```

### 与 Python 版的差异

| 方面 | Python | TypeScript |
|------|--------|-----------|
| CSV 解析 | `csv` 标准库 | 自定义 RFC-4180 解析器 |
| 类型安全 | 无 | 完整接口定义 |
| 导入方式 | `from core import search` | `import { search } from './core'` |
| 模块系统 | CommonJS | ES Modules |
| 外部依赖 | 0 | 0 |

---

## 迁移步骤

### search.ts

```typescript
// 需要迁移的功能:
// 1. argparse → process.argv 解析 或 commander
// 2. format_output() → 格式化函数
// 3. main() → CLI 入口

import { search, searchStack, detectDomain } from './core.js';

function formatOutput(results: SearchResult[], query: string, domain: string): string {
  // 移植 search.py 的 format_output()
}

// CLI 入口
const args = parseArgs(process.argv.slice(2));
if (args.stack) {
  const results = searchStack(args.query, args.stack, args.maxResults);
  console.log(formatOutput(results, args.query, args.stack));
} else {
  const results = search(args.query, args.domain, args.maxResults);
  console.log(formatOutput(results, args.query, args.domain));
}
```

### design_system.ts

```typescript
// 需要迁移的功能 (按优先级):
// 1. DesignSystemGenerator 类
// 2. _multi_domain_search() — 多域搜索
// 3. _apply_reasoning() — 推理匹配
// 4. _select_best_match() — 最佳匹配选择
// 5. generate() — 主入口
// 6. format_ascii_box() — ASCII 输出 (470 行)
// 7. format_markdown() — Markdown 输出
// 8. format_master_md() — MASTER.md 生成
// 9. persist_design_system() — 持久化

import { search, loadCsv } from './core.js';

interface DesignSystem {
  project_name: string;
  category: string;
  pattern: PatternInfo;
  style: StyleInfo;
  colors: ColorPalette;
  typography: TypographyInfo;
  key_effects: string;
  anti_patterns: string;
  decision_rules: Record<string, string>;
  severity: string;
}
```

---

## 运行方式

```bash
# Python 版 (当前)
python3 search.py "SaaS dashboard" --domain style

# TypeScript 版 (目标)
npx tsx scripts/search.ts "SaaS dashboard" --domain style
# 或
node scripts/search.js "SaaS dashboard" --domain style
# 或
bun scripts/search.ts "SaaS dashboard" --domain style
```

---

## 注意事项

1. **保持 Python 版本** — TS 版是补充而非替代，两版共存
2. **行为一致性** — 同样的输入必须产生同样的输出
3. **零依赖原则** — TS 版也不应有外部依赖
4. **CSV 路径兼容** — 使用相对路径，兼容不同安装位置
