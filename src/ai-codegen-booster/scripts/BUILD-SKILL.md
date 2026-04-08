# 打包 Skill 指南

## 🎯 什么是 build-skill？

`build-skill` 是一个打包命令，可以将 `ai-codegen-booster/` 项目打包成一个可以直接分发和使用的 Skill 包。

## 🚀 使用方法

### 1. 打包 Skill

在项目根目录运行：

```bash
cd ai-codegen-booster
npm run build-skill
```

### 2. 输出位置

打包后的 Skill 会输出到：

```
.claude/skills/ai-codegen-booster/
```

### 3. 分发给其他人

打包完成后，你可以：

**方式1：直接复制目录**
```bash
# 压缩成 zip 文件
cd .claude/skills
zip -r ai-codegen-booster.zip ai-codegen-booster/

# 发送给其他人
```

**方式2：提交到 Git**
```bash
# .claude/skills/ai-codegen-booster/ 已经在仓库中
# 其他人克隆后可以直接使用
git clone <repo-url>
```

## 📦 打包内容

打包的 Skill 包含：

```
.claude/skills/ai-codegen-booster/
├── src/                          # TypeScript 源代码
│   ├── extractors/              # 智能提取器
│   │   ├── html-extractor.ts
│   │   ├── doc-extractor.ts
│   │   ├── react-hooks-extractor.ts
│   │   └── vue-composables-extractor.ts
│   ├── analyzers/               # 智能分析器
│   │   ├── pattern-analyzer.ts
│   │   ├── architecture-analyzer.ts
│   │   └── convention-analyzer.ts
│   ├── kb/                      # 知识库管理
│   │   ├── deduplicator.ts
│   │   ├── quality-scorer.ts
│   │   └── ...
│   └── cli/                     # 命令行工具
├── package.json                  # 依赖配置
├── tsconfig.json                 # TypeScript 配置
├── SKILL.md                      # Skill 主文档
├── 如何开始.md                    # 快速开始指南
├── README.md                     # 项目说明
├── INSTALL.md                    # 安装说明（自动生成）
├── start.sh                      # 启动脚本（自动生成）
└── .gitignore                    # Git 忽略配置
```

## 👥 其他人如何使用

### 步骤 1：获取 Skill 包

```bash
# 从 Git 克隆
git clone <repo-url>

# 或者解压 zip 文件
unzip ai-codegen-booster.zip
```

### 步骤 2：复制到项目

```bash
# 复制到你的项目
cp -r ai-codegen-booster /your-project/.claude/skills/

# 或者创建符号链接
ln -s $(pwd)/ai-codegen-booster /your-project/.claude/skills/ai-codegen-booster
```

### 步骤 3：安装依赖

```bash
cd /your-project/.claude/skills/ai-codegen-booster
npm install
```

### 步骤 4：开始使用

在 Claude Code 中对 AI 说：

```
"你有 ai-codegen-booster 这个技能吗？"
```

如果回答"是"，就可以开始使用了：

```
"帮我分析这个 React 项目，提取所有组件和样式"
```

## 🔄 更新 Skill

当你更新了源代码后，重新打包：

```bash
cd ai-codegen-booster
npm run build-skill
```

新的版本会覆盖旧版本。

## 📝 自定义打包内容

如果你想修改打包的内容，编辑 `scripts/build-skill.js`：

```javascript
// 添加更多文档文件
const docFiles = [
  'SKILL.md',
  '如何开始.md',
  'README.md',
  'YOUR_NEW_DOC.md',  // 添加这里
];

// 添加更多配置文件
const configFiles = [
  'package.json',
  'tsconfig.json',
  'your-config.json',  // 添加这里
];
```

## ⚙️ 技术细节

### 打包脚本做了什么？

1. **清理输出目录** - 删除旧的打包文件
2. **复制源代码** - 复制 `src/` 目录
3. **复制配置文件** - 复制 `package.json`、`tsconfig.json`
4. **复制文档** - 复制所有 `.md` 文档
5. **生成安装说明** - 自动创建 `INSTALL.md`
6. **创建启动脚本** - 创建 `start.sh` 快速启动
7. **创建 .gitignore** - 忽略 `node_modules/` 等

### 为什么不打包 node_modules？

- `node_modules/` 太大（50-100MB）
- 不同平台可能需要不同的二进制文件
- 让用户自己 `npm install` 更可靠

### 为什么不打包编译后的 dist？

- 源代码更灵活，用户可以修改
- TypeScript 源码更易读
- 用户可以根据需要编译

## 🎯 最佳实践

### 对于开发者（你）

1. **开发时**在 `ai-codegen-booster/` 目录工作
2. **测试完成后**运行 `npm run build-skill`
3. **提交到 Git**包含打包后的 `.claude/skills/ai-codegen-booster/`

### 对于用户（其他人）

1. **获取仓库**通过 Git 或 zip
2. **复制 Skill**到项目的 `.claude/skills/`
3. **安装依赖** `npm install`
4. **开始使用**直接对话

## ❓ 常见问题

### Q: 为什么打包后还需要安装依赖？

**A**: 因为 Skill 包含 TypeScript 源代码和智能提取器，需要运行时依赖。这样用户可以：
- 修改源代码适配自己的需求
- 看到完整的实现细节
- 获得最新的依赖版本

### Q: 能不能打包成不需要依赖的版本？

**A**: 可以，但需要：
1. 编译成 JavaScript（`npm run build`）
2. 打包所有依赖（使用 webpack/rollup）
3. 文件会变大，且不易修改

目前的方案更灵活。

### Q: 打包后的 Skill 能在没有 Node.js 的环境运行吗？

**A**: 不能。这个 Skill 需要 Node.js 18+ 环境。

### Q: 如何只分发纯文档版本？

**A**: 只复制 `SKILL.md` 文件即可：
```bash
mkdir -p /your-project/.claude/skills/ai-codegen-booster
cp ai-codegen-booster/SKILL.md /your-project/.claude/skills/ai-codegen-booster/
```

这样就是纯文档 Skill，无需安装依赖，但功能受限。

## 📊 文件大小对比

| 内容 | 大小 |
|------|------|
| 源代码 (src/) | ~500KB |
| 文档 (.md) | ~100KB |
| 配置文件 | ~10KB |
| **打包总计** | **~1MB** |
| node_modules (安装后) | ~50-100MB |

## 🔗 相关资源

- [SKILL.md](../SKILL.md) - Skill 主文档
- [如何开始.md](../如何开始.md) - 快速开始指南
- [IMPLEMENTATION-SUMMARY.md](../IMPLEMENTATION-SUMMARY.md) - 实现细节

---

**更新时间**: 2026-04-08
