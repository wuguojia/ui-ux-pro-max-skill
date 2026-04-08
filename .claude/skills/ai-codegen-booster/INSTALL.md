# AI Codegen Booster Skill - 安装指南

## 📦 这个包包含什么？

这是一个**完整的 Skill 包**，包含：
- ✅ TypeScript 源代码（src/）
- ✅ 智能提取器（HTML、React Hooks、Vue Composables等）
- ✅ 智能分析器（设计模式、架构、编码约定）
- ✅ 质量优化工具（去重、评分）
- ✅ 完整文档

## 🚀 快速安装

### 方式1：复制到你的项目（推荐）

```bash
# 复制整个 Skill 目录到你的项目
cp -r .claude/skills/ai-codegen-booster /your-project/.claude/skills/

# 安装依赖（在 Skill 目录内）
cd /your-project/.claude/skills/ai-codegen-booster
npm install
```

### 方式2：创建符号链接

```bash
# 创建符号链接
ln -s $(pwd)/.claude/skills/ai-codegen-booster /your-project/.claude/skills/ai-codegen-booster

# 安装依赖
cd .claude/skills/ai-codegen-booster
npm install
```

## ✅ 验证安装

安装完成后，在你的项目中对 AI 说：

```
"你有 ai-codegen-booster 这个技能吗？"
```

如果 AI 回答"是"并能描述功能，说明安装成功！

## 💡 开始使用

```
"帮我分析这个React项目，提取所有组件、样式和编码规范"
```

AI 会自动使用这个 Skill 的功能来分析你的项目。

## 📁 目录结构

```
.claude/skills/ai-codegen-booster/
├── src/                       # TypeScript 源代码
│   ├── extractors/           # 智能提取器
│   ├── analyzers/            # 智能分析器
│   ├── kb/                   # 知识库管理
│   └── cli/                  # 命令行工具
├── package.json              # 依赖配置
├── tsconfig.json             # TypeScript 配置
├── SKILL.md                  # Skill 主文档
├── 如何开始.md                # 快速开始指南
└── README.md                 # 本文件
```

## 🔧 依赖说明

这个 Skill 需要以下依赖：

- **运行时依赖**：
  - @vue/compiler-sfc - Vue SFC 解析
  - @babel/parser - JavaScript/TypeScript 解析
  - chalk - 终端输出美化
  - commander - 命令行工具

- **开发依赖**：
  - typescript - TypeScript 编译
  - tsx - TypeScript 运行时
  - vitest - 测试框架

运行 `npm install` 会自动安装所有依赖。

## 🎯 功能特性

- ✅ **智能提取器** - 自动提取组件、样式、文档
- ✅ **模式识别** - 识别设计模式和架构模式
- ✅ **质量评分** - 0-100分评估知识库质量
- ✅ **智能去重** - 基于相似度算法合并重复
- ✅ **多框架支持** - React、Vue、Svelte、Angular

## 📚 文档资源

- [SKILL.md](./SKILL.md) - 完整 Skill 指南
- [如何开始.md](./如何开始.md) - 快速开始指南
- [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) - 实现细节

## ❓ 常见问题

### Q: 必须安装依赖吗？
**A**: 是的。这个 Skill 包含 TypeScript 源代码，需要运行时依赖才能工作。

### Q: 能不能不安装依赖直接用？
**A**: 不行。但安装很简单，只需要 `npm install` 一次。

### Q: 占用多少空间？
**A**:
- Skill 源代码: ~1MB
- node_modules: ~50-100MB（安装依赖后）

### Q: 更新怎么办？
**A**: 重新复制新版本的 Skill 目录即可。

## 🆚 与纯文档 Skill 的区别

如果你不想安装依赖，可以使用**纯文档版本**（功能受限）：
- 只包含 SKILL.md 文档
- 无需安装依赖
- 只能通过 AI 对话使用，无法运行代码提取器

这个**完整版本**包含：
- ✅ 完整的 TypeScript 源代码
- ✅ 可执行的提取器和分析器
- ✅ 命令行工具
- ✅ 单元测试

## 📄 许可证

MIT License

---

**版本**: v1.4.0
**打包时间**: 2026-04-08T08:13:11.599Z
