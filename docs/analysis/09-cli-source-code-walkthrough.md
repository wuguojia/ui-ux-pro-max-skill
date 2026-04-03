# 09 — CLI 源码逐文件解读

## 文件清单

```
cli/src/
├── index.ts              # 主入口 (Commander.js)
├── types/index.ts        # 类型定义与常量
├── commands/
│   ├── init.ts           # 安装命令 (217 行)
│   ├── update.ts         # 更新命令 (37 行)
│   ├── uninstall.ts      # 卸载命令 (136 行)
│   └── versions.ts       # 版本列表 (43 行)
└── utils/
    ├── template.ts       # 模板渲染引擎 (244 行)
    ├── detect.ts         # AI 平台检测 (121 行)
    ├── github.ts         # GitHub API (105 行)
    ├── extract.ts        # ZIP 解压工具
    └── logger.ts         # 日志工具
```

---

## index.ts — 主入口

**职责**: 定义 CLI 命令和全局选项

```typescript
// 核心流程
const program = new Command();
program
  .name('uipro')
  .version(getVersion())
  .description('Install UI/UX Pro Max skill');

program.command('init')
  .option('--ai <type>', 'AI platform')
  .option('--force', 'Overwrite existing')
  .option('--offline', 'Skip GitHub download')
  .option('--global', 'Install to home directory')
  .action(initCommand);
```

**关键设计点**:
- 使用 `import.meta.url` 获取 `__dirname`（ESM 兼容）
- 从 `package.json` 动态读取版本号
- 在执行命令前验证 AI 类型参数

---

## types/index.ts — 类型定义

**18 种 AI 平台类型**:
```typescript
type AIType = 'claude' | 'cursor' | 'windsurf' | 'antigravity' |
  'copilot' | 'kiro' | 'roocode' | 'codex' | 'qoder' | 'gemini' |
  'trae' | 'opencode' | 'continue' | 'codebuddy' | 'droid' |
  'kilocode' | 'warp' | 'augment' | 'all';
```

**AI_FOLDERS 映射表**: 将 AI 类型映射到文件夹结构
```typescript
const AI_FOLDERS = {
  claude:  ['.claude'],
  cursor:  ['.cursor', '.shared'],  // Cursor 有两个文件夹
  copilot: ['.github'],
  droid:   ['.factory'],
  // ...
};
```

---

## commands/init.ts — 安装命令

**三级回退安装策略**:

```
tryGitHubInstall()
    │ 成功 → 完成
    │ 失败 ↓
templateInstall() (从 assets/ 生成)
    │ 成功 → 完成
    │ 失败 ↓
错误提示
```

**关键函数**:

### `initCommand(options)`
1. 检查 `--ai` 参数或自动检测
2. 如果未检测到，弹出交互式选择菜单
3. 根据 `--global` 确定安装目标目录
4. 执行安装
5. 显示成功信息和下一步操作

### `tryGitHubInstall()`
1. 调用 `getLatestRelease()` 获取最新版本
2. 下载 ZIP 到临时目录
3. 解压并复制到目标位置
4. 捕获 `GitHubRateLimitError` → 返回 false（触发回退）

### `templateInstall()`
1. 调用 `generatePlatformFiles()`
2. 从 `cli/assets/` 复制数据和脚本
3. 这是离线模式的默认行为

---

## commands/update.ts — 更新命令

**极简设计**（37 行）:
1. 获取最新 Release 版本号
2. 调用 `initCommand({ ...options, force: true })`

---

## commands/uninstall.ts — 卸载命令

**流程**:
1. `detectAIType()` 扫描当前目录
2. 列出所有已安装的平台
3. 用户选择要卸载的（支持 "all"）
4. 确认对话框
5. 删除对应的 `.{platform}/skills/ui-ux-pro-max/` 文件夹

---

## utils/detect.ts — 平台检测

**检测逻辑**:
```typescript
const detectionMap: Record<string, AIType> = {
  '.claude': 'claude',
  '.cursor': 'cursor',
  '.windsurf': 'windsurf',
  '.agents': 'antigravity',
  '.github': 'copilot',
  // ... 18 个平台
};

function detectAIType(cwd: string) {
  const detected: AIType[] = [];
  for (const [dir, type] of Object.entries(detectionMap)) {
    if (existsSync(join(cwd, dir))) {
      detected.push(type);
    }
  }
  return { detected, suggested: detected[0] || null };
}
```

---

## utils/github.ts — GitHub API

**API 端点**:
- 列出 Releases: `GET /repos/nextlevelbuilder/ui-ux-pro-max-skill/releases`
- 最新 Release: `GET .../releases/latest`
- 下载资源: 从 `asset.browser_download_url`

**Rate Limit 处理**:
- 检查 `x-ratelimit-remaining` header
- 429 或 remaining=0 → 抛出 `GitHubRateLimitError`
- 错误消息包含重置时间

---

## utils/template.ts — 模板引擎

参见 [07-template-rendering-engine.md](07-template-rendering-engine.md) 的详细分析。

---

## utils/logger.ts — 日志工具

```typescript
const logger = {
  info:    (msg) => console.log(chalk.blue('info'), msg),
  success: (msg) => console.log(chalk.green('success'), msg),
  warn:    (msg) => console.log(chalk.yellow('warn'), msg),
  error:   (msg) => console.log(chalk.red('error'), msg),
  title:   (msg) => console.log(chalk.bold.cyan('\n' + msg + '\n')),
  dim:     (msg) => console.log(chalk.dim(msg)),
};
```

---

## 依赖分析

| 依赖 | 版本 | 用途 | 大小影响 |
|------|------|------|---------|
| commander | ^12.1.0 | CLI 框架 | 小 |
| chalk | ^5.3.0 | 彩色终端输出 | 小 |
| ora | ^8.1.1 | Spinner 动画 | 小 |
| prompts | ^2.4.2 | 交互式输入 | 小 |

**总依赖**: 仅 4 个运行时依赖，全部为轻量级。
