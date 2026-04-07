# 06 — 分发系统分析

## 概述

分发系统是 UI/UX Pro Max 的最外层——它负责将搜索引擎和数据库**安装到用户项目中**，并适配 18 个不同的 AI 编码助手平台。

---

## CLI 工具架构 (uipro-cli)

### 技术栈

| 组件 | 技术 | 为什么 |
|------|------|--------|
| 语言 | TypeScript | 类型安全、IDE 支持好 |
| 构建器 | Bun | 极快的 TS 打包，单文件输出 |
| CLI 框架 | Commander.js v12 | 成熟稳定的 CLI 框架 |
| 终端美化 | chalk v5 | 彩色输出 |
| 加载动画 | ora v8 | Spinner 动画 |
| 用户交互 | prompts v2 | 交互式选择菜单 |
| 包管理 | npm | 全球开发者最熟悉 |

### 命令体系

```
uipro init [--ai <type>] [--force] [--offline] [--global]
       │
       ├── 自动检测 AI 平台 (detect.ts)
       ├── 尝试 GitHub 下载 (github.ts)
       ├── 失败则模板生成 (template.ts)
       └── 复制数据和脚本到目标文件夹

uipro update [--ai <type>]
       │
       └── 获取最新版本 → 执行 init --force

uipro uninstall [--ai <type>]
       │
       ├── 检测已安装平台
       ├── 用户选择要卸载的平台
       └── 删除对应文件夹

uipro versions
       │
       └── 列出所有 GitHub Releases
```

### 安装流程详解

```
npx uipro-cli init
        │
        ▼
  ┌─ 指定了 --ai？─┐
  │  是            否 │
  │                  │
  │          detectAIType()
  │          扫描当前目录的 . 文件夹
  │          (.claude, .cursor, .windsurf, ...)
  │                  │
  │          ┌── 检测到？──┐
  │          │ 是         否 │
  │          │             │
  │          │      用户手动选择
  │          │             │
  │          └─────┬───────┘
  │                │
  └────────────────┘
        │
        ▼
  ┌─ --offline？──┐
  │  否           是 │
  │               │
  │     tryGitHubInstall()
  │     下载最新 Release ZIP
  │        │
  │     ┌─ 成功？──┐
  │     │ 是      否 │ (限流/网络错误)
  │     │          │
  │     │   templateInstall()  ◄─────┘
  │     │   从 cli/assets/ 生成
  │     │        │
  │     └───┬────┘
  │         │
  └─────────┘
        │
        ▼
  生成文件到目标文件夹:
  ├── {root}/{skillPath}/SKILL.md  (或 PROMPT.md)
  ├── {root}/{skillPath}/scripts/  (Python 脚本)
  ├── {root}/{skillPath}/data/     (CSV 数据)
  └── 显示安装成功信息
```

---

## 18 平台适配

### 平台配置矩阵

| 平台 | 根文件夹 | Skill 路径 | 文件名 | Frontmatter | Quick Ref | 类型 |
|------|---------|-----------|--------|-------------|-----------|------|
| Claude Code | `.claude` | `skills/ui-ux-pro-max` | `SKILL.md` | ✅ YAML | ✅ | Skill |
| Cursor | `.cursor` | `skills/ui-ux-pro-max` | `SKILL.md` | ✅ YAML | ❌ | Skill |
| Windsurf | `.windsurf` | `skills/ui-ux-pro-max` | `SKILL.md` | ✅ YAML | ❌ | Skill |
| GitHub Copilot | `.github` | `prompts/ui-ux-pro-max` | `PROMPT.md` | ✅ YAML | ❌ | Workflow |
| Kiro | `.kiro` | `steering/ui-ux-pro-max` | `SKILL.md` | ✅ YAML | ❌ | Skill |
| Droid (Factory) | `.factory` | `skills/ui-ux-pro-max` | `SKILL.md` | ✅ YAML | ❌ | Skill |
| 其他 12 个平台 | `.{platform}` | `skills/ui-ux-pro-max` | `SKILL.md` | ✅ | ❌ | Skill |

### 平台差异点

1. **文件夹结构**: Copilot 用 `.github/prompts/`，Kiro 用 `.kiro/steering/`，其余用 `.{platform}/skills/`
2. **文件名**: Copilot 用 `PROMPT.md`，其余用 `SKILL.md`
3. **Quick Reference**: 仅 Claude 包含 quick-reference.md（297 行速查表）
4. **术语**: Copilot 用 "Workflow"，其余用 "Skill"

---

## npm 发布流程

```bash
# 1. 同步资源
cp -r src/ui-ux-pro-max/data/* cli/assets/data/
cp -r src/ui-ux-pro-max/scripts/* cli/assets/scripts/
cp -r src/ui-ux-pro-max/templates/* cli/assets/templates/

# 2. 构建
cd cli
bun run build  # → dist/index.js

# 3. 发布
npm publish  # → uipro-cli@2.5.0

# 用户安装
npx uipro-cli init --ai claude
# 或
npm install -g uipro-cli && uipro init
```

### 包结构

```
uipro-cli (npm 包)
├── dist/
│   └── index.js         ← 打包后的单文件 CLI
├── assets/
│   ├── data/            ← 所有 CSV 数据
│   ├── scripts/         ← Python 搜索脚本
│   └── templates/       ← 平台配置 + 基础模板
└── package.json
```

---

## GitHub Release 集成

### API 调用

```typescript
// 获取最新版本
GET https://api.github.com/repos/nextlevelbuilder/ui-ux-pro-max-skill/releases/latest

// 获取所有版本
GET https://api.github.com/repos/nextlevelbuilder/ui-ux-pro-max-skill/releases

// 下载资源
GET release.assets[0].browser_download_url  // 优先使用上传的 ZIP
// 或
GET https://api.github.com/repos/.../zipball/{tag}  // 回退到自动生成的
```

### Rate Limit 处理

```typescript
// 检查 headers
const remaining = response.headers.get('x-ratelimit-remaining');
const reset = response.headers.get('x-ratelimit-reset');

if (remaining === '0' || response.status === 429) {
    throw new GitHubRateLimitError(resetTime);
    // → 自动回退到 templateInstall()
}
```

---

## 错误处理策略

| 错误场景 | 处理方式 | 用户感知 |
|---------|---------|---------|
| GitHub 限流 (429) | 回退到模板安装 | Spinner 提示 "Switching to offline mode..." |
| 网络不可达 | 回退到模板安装 | 同上 |
| ZIP 解压失败 | 回退到模板安装 | 同上 |
| 目标目录已存在 | 需要 `--force` 标志 | 错误提示 "Already installed. Use --force" |
| 未检测到 AI 平台 | 交互式选择 | prompts 菜单列出所有 18 个选项 |
| Python 未安装 | 安装成功，搜索时报错 | SKILL.md 包含 Python 安装指南 |

**核心设计原则**: 永远不让用户看到安装失败。通过三级回退策略（GitHub → 本地资源 → 模板生成），确保 `npx uipro-cli init` 总能成功。
