# AI Codegen Booster Skill

> 可直接使用的 Skill 包 - 无需安装任何依赖

## 📦 这是什么？

这是一个 **纯文档型 Skill**，可以直接复制到 `.claude/skills/` 目录使用，无需安装 Node.js、npm 或任何其他依赖。

## 🚀 快速安装

### 方法1：直接复制整个目录

```bash
# 复制到你的项目
cp -r .claude/skills/ai-codegen-booster /your-project/.claude/skills/

# 或者创建符号链接
ln -s $(pwd)/.claude/skills/ai-codegen-booster /your-project/.claude/skills/ai-codegen-booster
```

### 方法2：只复制 SKILL.md

如果你只想要核心功能：

```bash
mkdir -p /your-project/.claude/skills/ai-codegen-booster
cp .claude/skills/ai-codegen-booster/SKILL.md /your-project/.claude/skills/ai-codegen-booster/
```

## ✅ 验证安装

1. 打开 Claude Code
2. 打开你的项目
3. 对 AI 说："你有 ai-codegen-booster 这个技能吗？"

如果回答"是"，说明安装成功！

## 💡 如何使用

直接跟 AI 对话即可：

```
"帮我分析这个Vue项目，提取所有组件、样式和编码规范"

"用项目的组件创建一个登录表单"

"优化知识库质量"
```

详细使用方法请查看 [SKILL.md](./SKILL.md)

## 📁 文件说明

```
.claude/skills/ai-codegen-booster/
├── SKILL.md              # 核心技能文档（必需）
├── README.md             # 本文件
└── 快速参考.md           # 快速参考卡片（可选）
```

**只需要 SKILL.md 一个文件就能工作！**

## 🎯 适用场景

- ✅ 使用 Claude Code, Cursor, Windsurf 等 AI 编程助手
- ✅ 需要 AI 生成符合项目规范的代码
- ✅ 想要自动提取项目的组件和样式信息
- ✅ 需要检测项目的设计模式和编码约定

## ❓ 常见问题

### Q: 需要安装 npm 包吗？
**A**: 不需要！这是纯文档 Skill，直接复制就能用。

### Q: 会修改我的项目代码吗？
**A**: 不会。只读取分析，生成的知识库文件在 `kb/` 目录。

### Q: 支持哪些框架？
**A**: React, Vue, Svelte, Angular, 纯 HTML/CSS/JS。

### Q: 生成的知识库文件在哪？
**A**: 在项目的 `kb/` 目录，自动创建。

## 🔗 更多资源

如果你想了解源代码实现（可选，不影响使用）：

- [源代码项目](../../ai-codegen-booster/) - TypeScript 实现
- [如何开始](../../ai-codegen-booster/如何开始.md) - 详细指南
- [测试用例](../../ai-codegen-booster/tests/) - 代码示例

**但记住：你不需要这些就能使用 Skill！**

---

**版本**: v1.4.0
**类型**: 纯文档 Skill
**依赖**: 无
