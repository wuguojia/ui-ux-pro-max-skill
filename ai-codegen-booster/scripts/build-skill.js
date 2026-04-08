#!/usr/bin/env node

/**
 * Build Skill Package Script
 *
 * 将 ai-codegen-booster 打包成可以直接使用的 Skill
 * 输出到 .claude/skills/ai-codegen-booster/
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const skillOutputDir = join(projectRoot, '..', '.claude', 'skills', 'ai-codegen-booster');

console.log('🎯 开始打包 AI Codegen Booster Skill...\n');

// 1. 清理并创建输出目录
console.log('📁 准备输出目录...');
if (existsSync(skillOutputDir)) {
  rmSync(skillOutputDir, { recursive: true, force: true });
}
mkdirSync(skillOutputDir, { recursive: true });

// 2. 复制源代码
console.log('📦 复制源代码...');
const srcDir = join(projectRoot, 'src');
const destSrcDir = join(skillOutputDir, 'src');
cpSync(srcDir, destSrcDir, { recursive: true });
console.log('   ✓ src/ 已复制');

// 3. 复制数据文件（如果有的话，这个项目主要是代码）
// const dataDir = join(projectRoot, 'src', 'data');
// if (existsSync(dataDir)) {
//   const destDataDir = join(skillOutputDir, 'data');
//   cpSync(dataDir, destDataDir, { recursive: true });
//   console.log('   ✓ data/ 已复制');
// }

// 4. 复制必要的配置文件
console.log('⚙️  复制配置文件...');
const configFiles = [
  'package.json',
  'tsconfig.json',
];

configFiles.forEach(file => {
  const src = join(projectRoot, file);
  const dest = join(skillOutputDir, file);
  if (existsSync(src)) {
    cpSync(src, dest);
    console.log(`   ✓ ${file} 已复制`);
  }
});

// 5. 复制文档文件
console.log('📚 复制文档文件...');
const docFiles = [
  'SKILL.md',
  '如何开始.md',
  'README.md',
  'IMPLEMENTATION-SUMMARY.md',
  'QUICKSTART.md',
];

docFiles.forEach(file => {
  const src = join(projectRoot, file);
  const dest = join(skillOutputDir, file);
  if (existsSync(src)) {
    cpSync(src, dest);
    console.log(`   ✓ ${file} 已复制`);
  }
});

// 6. 创建 .gitignore
console.log('📝 创建 .gitignore...');
const gitignoreContent = `node_modules/
dist/
*.log
.DS_Store
`;
writeFileSync(join(skillOutputDir, '.gitignore'), gitignoreContent);

// 7. 创建安装说明
console.log('📖 创建安装说明...');
const installGuide = `# AI Codegen Booster Skill - 安装指南

## 📦 这个包包含什么？

这是一个**完整的 Skill 包**，包含：
- ✅ TypeScript 源代码（src/）
- ✅ 智能提取器（HTML、React Hooks、Vue Composables等）
- ✅ 智能分析器（设计模式、架构、编码约定）
- ✅ 质量优化工具（去重、评分）
- ✅ 完整文档

## 🚀 快速安装

### 方式1：复制到你的项目（推荐）

\`\`\`bash
# 复制整个 Skill 目录到你的项目
cp -r .claude/skills/ai-codegen-booster /your-project/.claude/skills/

# 安装依赖（在 Skill 目录内）
cd /your-project/.claude/skills/ai-codegen-booster
npm install
\`\`\`

### 方式2：创建符号链接

\`\`\`bash
# 创建符号链接
ln -s $(pwd)/.claude/skills/ai-codegen-booster /your-project/.claude/skills/ai-codegen-booster

# 安装依赖
cd .claude/skills/ai-codegen-booster
npm install
\`\`\`

## ✅ 验证安装

安装完成后，在你的项目中对 AI 说：

\`\`\`
"你有 ai-codegen-booster 这个技能吗？"
\`\`\`

如果 AI 回答"是"并能描述功能，说明安装成功！

## 💡 开始使用

\`\`\`
"帮我分析这个React项目，提取所有组件、样式和编码规范"
\`\`\`

AI 会自动使用这个 Skill 的功能来分析你的项目。

## 📁 目录结构

\`\`\`
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
\`\`\`

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

运行 \`npm install\` 会自动安装所有依赖。

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
**A**: 不行。但安装很简单，只需要 \`npm install\` 一次。

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
**打包时间**: ${new Date().toISOString()}
`;

writeFileSync(join(skillOutputDir, 'INSTALL.md'), installGuide);

// 8. 创建快速启动脚本
console.log('🚀 创建启动脚本...');
const quickStartScript = `#!/bin/bash

echo "🎯 AI Codegen Booster Skill - 快速启动"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 检测到未安装依赖，正在安装..."
  npm install
  echo ""
fi

echo "✅ Skill 已准备就绪！"
echo ""
echo "💡 使用方法："
echo "   在你的项目中对 AI 说："
echo "   '帮我分析这个项目，提取所有组件和样式'"
echo ""
echo "📚 查看文档："
echo "   - SKILL.md - 完整功能说明"
echo "   - 如何开始.md - 快速开始指南"
echo "   - INSTALL.md - 安装说明"
echo ""
`;

writeFileSync(join(skillOutputDir, 'start.sh'), quickStartScript);

// 9. 输出打包摘要
console.log('\n✨ 打包完成！\n');
console.log('📦 输出位置:', skillOutputDir);
console.log('\n📋 包含内容:');
console.log('   ✓ src/ - TypeScript 源代码');
console.log('   ✓ package.json - 依赖配置');
console.log('   ✓ tsconfig.json - TypeScript 配置');
console.log('   ✓ SKILL.md - Skill 主文档');
console.log('   ✓ 如何开始.md - 快速指南');
console.log('   ✓ INSTALL.md - 安装说明');
console.log('   ✓ start.sh - 启动脚本');

console.log('\n🚀 下一步:');
console.log('   1. 复制到你的项目: cp -r .claude/skills/ai-codegen-booster /your-project/.claude/skills/');
console.log('   2. 安装依赖: cd /your-project/.claude/skills/ai-codegen-booster && npm install');
console.log('   3. 开始使用: 对 AI 说 "分析项目"');

console.log('\n💡 提示:');
console.log('   - 这是完整版 Skill，包含可执行的源代码');
console.log('   - 需要安装依赖才能使用');
console.log('   - 大小约 1MB（源码） + 50-100MB（依赖）');
console.log('');
