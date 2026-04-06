# 08 — CLI 分发系统设计

## 概述

CLI 是框架的"最后一公里"——将知识库从 npm registry 交付到用户的 AI 编码助手工作目录中。

---

## 命令体系

```bash
# 安装（核心命令）
{cli-name} init [--ai TYPE] [--force] [--offline] [--global]

# 更新
{cli-name} update [--ai TYPE]

# 卸载
{cli-name} uninstall [--ai TYPE] [--global]

# 版本信息
{cli-name} versions
```

### init 命令详解

```
{cli-name} init
  --ai <type>       指定 AI 平台 (claude|cursor|...|all)
                    未指定时自动检测已安装的 AI 工具
  --force           覆盖已存在的文件
  --offline         强制使用本地 assets（不尝试网络下载）
  --global          安装到全局目录 (~/.{platform}/)
```

---

## 安装流程

### 三级回退策略

```
┌─────────────────────────────────────────────────────┐
│                   init 命令                           │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌──────────────────────┐     成功
│ Level 1: 模板生成    │────────────→ ✅ 完成
│ (从 bundled assets)   │
└──────────┬───────────┘
           │ 失败（assets 不存在或损坏）
           ▼
┌──────────────────────┐     成功
│ Level 2: GitHub 下载 │────────────→ ✅ 完成
│ (API → ZIP → 解压)   │
└──────────┬───────────┘
           │ 失败（网络不可用、限流、404）
           ▼
┌──────────────────────┐     成功
│ Level 3: 最小安装    │────────────→ ⚠️ 部分完成
│ (仅生成 Skill 文件)   │
└──────────┬───────────┘
           │ 失败
           ▼
         ❌ 报错退出
```

### Level 1: 模板生成（推荐，最快）

```typescript
async function templateInstall(aiType: AIType, targetDir: string) {
    // 1. 从 bundled assets 加载平台配置
    const config = loadPlatformConfig(aiType);

    // 2. 渲染 Skill 文件
    const content = renderSkillFile(config, isGlobal);

    // 3. 写入目标路径
    const outputPath = buildOutputPath(targetDir, config);
    writeFile(outputPath, content);

    // 4. 复制 data/ 和 scripts/
    copyDataAndScripts(outputPath);

    // 耗时: ~100ms，无网络请求
}
```

### Level 2: GitHub 下载

```typescript
async function githubInstall(aiType: AIType, targetDir: string) {
    // 1. 获取最新 release
    const release = await fetch(
        `https://api.github.com/repos/{owner}/{repo}/releases/latest`
    );
    const asset = release.assets.find(a => a.name.endsWith('.zip'));

    // 2. 下载 ZIP
    const zip = await fetch(asset.browser_download_url);

    // 3. 解压到目标目录
    await extractZip(zip, targetDir);

    // 耗时: 2-10s，需要网络
}
```

### Level 3: 最小安装

```typescript
async function minimalInstall(aiType: AIType, targetDir: string) {
    // 只生成 Skill 文件，不复制数据和脚本
    const config = loadPlatformConfig(aiType);
    const content = renderSkillFile(config, isGlobal);
    writeFile(buildOutputPath(targetDir, config), content);

    // 提示用户手动下载数据
    console.warn("⚠️ Data and scripts not installed. Please run 'update' when online.");
}
```

---

## AI 平台自动检测

```typescript
const DETECTION_MAP: Record<string, AIType> = {
    '.claude':     'claude',
    '.cursor':     'cursor',
    '.windsurf':   'windsurf',
    '.github':     'copilot',      // 检测 .github/copilot 目录
    '.continue':   'continue',
    '.kiro':       'kiro',
    '.roo':        'roocode',
    '.codex':      'codex',
    // ... 更多平台
};

function detectInstalledAI(targetDir: string): AIType[] {
    const detected: AIType[] = [];

    for (const [folder, aiType] of Object.entries(DETECTION_MAP)) {
        if (fs.existsSync(path.join(targetDir, folder))) {
            detected.push(aiType);
        }
    }

    return detected;
}
```

### 检测策略

```
场景 1: 用户指定 --ai claude
  → 直接使用 claude

场景 2: 用户未指定 --ai
  → detectInstalledAI()
  → 发现 .claude/ 和 .cursor/
  → 提示用户选择或安装全部

场景 3: 用户指定 --ai all
  → 为所有平台生成文件
```

---

## npm 包结构

```
{cli-name}/
├── dist/
│   └── index.js                    # 编译后的 CLI 入口
├── assets/                         # 打包资源
│   ├── data/                       # CSV 知识库副本
│   │   ├── {domain-a}.csv
│   │   ├── {domain-b}.csv
│   │   └── stacks/
│   ├── scripts/                    # Python 脚本副本
│   │   ├── core.py
│   │   ├── search.py
│   │   └── generator.py
│   └── templates/                  # 模板文件
│       ├── base/
│       │   ├── skill-content.md
│       │   └── quick-reference.md
│       └── platforms/
│           ├── claude.json
│           └── ...
└── package.json
```

### package.json 配置

```json
{
    "name": "{cli-name}",
    "version": "1.0.0",
    "type": "module",
    "bin": {
        "{cli-command}": "./dist/index.js"
    },
    "files": [
        "dist",
        "assets"
    ],
    "scripts": {
        "build": "bun build src/index.ts --outdir dist --target node",
        "dev": "bun run src/index.ts",
        "prepublishOnly": "bun run build"
    },
    "dependencies": {
        "commander": "^12.1.0",
        "chalk": "^5.3.0",
        "ora": "^8.1.1",
        "prompts": "^2.4.2"
    }
}
```

---

## 更新与卸载

### 更新流程

```typescript
async function update(aiType: AIType) {
    // 1. 检测当前安装位置
    const installDir = findInstallDir(aiType);
    if (!installDir) {
        console.error("Not installed. Run 'init' first.");
        return;
    }

    // 2. 备份当前版本
    backupDir(installDir);

    // 3. 重新安装（覆盖模式）
    await init(aiType, { force: true });

    // 4. 验证
    if (verifyInstall(installDir)) {
        removeBackup(installDir);
        console.log("✅ Updated successfully");
    } else {
        restoreBackup(installDir);
        console.error("❌ Update failed, restored backup");
    }
}
```

### 卸载流程

```typescript
async function uninstall(aiType: AIType, isGlobal: boolean) {
    const installDir = isGlobal
        ? path.join(os.homedir(), `.${platform}`, skillPath)
        : findInstallDir(aiType);

    if (!installDir || !fs.existsSync(installDir)) {
        console.log("Not installed.");
        return;
    }

    // 确认后删除
    fs.rmSync(installDir, { recursive: true });
    console.log(`✅ Uninstalled from ${installDir}`);
}
```

---

## CLI 交互设计

### 进度指示

```typescript
import ora from 'ora';

const spinner = ora('Installing...').start();
// ... 执行安装 ...
spinner.succeed('Installed successfully!');
// 或
spinner.fail('Installation failed');
```

### 交互式选择

```typescript
import prompts from 'prompts';

const response = await prompts({
    type: 'select',
    name: 'aiType',
    message: 'Which AI platform?',
    choices: AI_TYPES.map(t => ({ title: t, value: t })),
});
```

### 彩色输出

```typescript
import chalk from 'chalk';

console.log(chalk.green('✅ Success'));
console.log(chalk.yellow('⚠️ Warning'));
console.log(chalk.red('❌ Error'));
console.log(chalk.dim('ℹ️ Info'));
```
