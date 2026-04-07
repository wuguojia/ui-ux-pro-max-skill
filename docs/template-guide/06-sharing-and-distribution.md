# 06 — 分享与分发

## 分发渠道

```
               ┌──────────────────┐
               │  Source of Truth  │
               │  src/my-skill/    │
               └───────┬──────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
  ┌─────────┐   ┌──────────┐   ┌──────────────┐
  │ npm 包   │   │ GitHub   │   │ Claude       │
  │ CLI 安装 │   │ Template │   │ Marketplace  │
  └─────────┘   └──────────┘   └──────────────┘
```

---

## 渠道一：npm 发布

### 准备

```bash
# 1. 同步资源
cp -r src/my-skill/data/* cli/assets/data/
cp -r src/my-skill/scripts/* cli/assets/scripts/
cp -r src/my-skill/templates/* cli/assets/templates/

# 2. 确保 cli/package.json 正确
{
  "name": "my-skill-cli",
  "version": "1.0.0",
  "bin": { "myskill": "./dist/index.js" },
  "files": ["dist", "assets"]
}

# 3. 构建
cd cli && bun run build

# 4. 发布
npm publish
```

### 用户使用

```bash
npx my-skill-cli init --ai claude
# 或
npm install -g my-skill-cli
myskill init
```

---

## 渠道二：GitHub Template

### 创建模板仓库

1. 在 GitHub 仓库设置中勾选 "Template repository"
2. 用户点击 "Use this template" 创建新仓库
3. 用户修改 CSV 数据即可使用

### 优点
- 用户得到完整源码
- 可以自由定制
- 天然支持版本控制

### 缺点
- 用户需要了解整个项目结构
- 不支持自动更新

---

## 渠道三：Claude Marketplace

### 配置文件

`.claude-plugin/plugin.json`:
```json
{
  "name": "my-skill",
  "id": "my-skill",
  "owner": { "name": "your-username" },
  "metadata": {
    "description": "My awesome skill...",
    "version": "1.0.0"
  },
  "plugins": [{
    "name": "my-skill",
    "source": "./",
    "category": "your-category",
    "version": "1.0.0"
  }]
}
```

### 发布流程
1. 创建 `.claude-plugin/` 目录
2. 配置 `plugin.json` 和 `marketplace.json`
3. 提交到 Claude Marketplace

---

## 渠道四：GitHub Release

### 自动发布

创建 `.github/workflows/release.yml`:
```yaml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: zip -r skill.zip src/ cli/assets/ skill.json
      - uses: softprops/action-gh-release@v1
        with:
          files: skill.zip
```

### CLI 集成

CLI 的 `uipro init` 会自动从 GitHub Release 下载最新 ZIP。

---

## 版本管理策略

### 语义化版本

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └── 修复数据错误、typo
  │     └── 添加新域、新数据行、新平台
  └── 破坏性变更（API 变化、结构重组）
```

### 需要同步更新版本号的位置

| 文件 | 字段 |
|------|------|
| `cli/package.json` | `version` |
| `skill.json` | `version` |
| `.claude-plugin/plugin.json` | `metadata.version` + `plugins[].version` |
| GitHub Release | Tag name |
