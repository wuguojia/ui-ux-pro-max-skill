# AI 代码生成增强器 - 快速开始

## 5 分钟上手

### 1. 安装依赖

```bash
cd ai-codegen-booster
npm install
```

### 2. 提取你的第一个组件

假设你有一个 Button 组件在 `../src/components/ui/button.tsx`:

```bash
# 方式 1: 手动提取（使用 SKILL-CODEGEN-TRAINING.md 指南）
# 让 AI 帮你：
# "请按照 SKILL-CODEGEN-TRAINING.md 中的指南，从 ../src/components/ui/button.tsx 提取组件信息，生成 components-draft.csv"

# 方式 2: 自动提取（如果已实现 extract 命令）
npm run extract component ../src/components/ui/button.tsx --framework react
```

### 3. 验证提取结果

```bash
npm run validate components-draft.csv --schema components
```

如果看到 `✅ Validation passed!`，说明格式正确！

### 4. 导入到知识库

```bash
# 预览（不会实际修改文件）
npm run import components-draft.csv --domain components --dry-run

# 正式导入
npm run import components-draft.csv --domain components
```

### 5. 测试搜索

```bash
npm run search "button" --domain components
```

你应该能看到刚才导入的 Button 组件信息！

---

## 完整示例工作流

### 场景: 导入 shadcn/ui 项目的组件

假设你的项目结构：
```
your-project/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── input.tsx
│   └── styles/
│       └── globals.css
└── ai-codegen-booster/  ← 这是我们的工具
```

#### 步骤 1: 提取所有组件

**选项 A: 使用 AI 辅助**（推荐）
```
告诉 AI:
"请阅读 SKILL-CODEGEN-TRAINING.md，然后提取 ../src/components/ui/ 下所有组件的信息，生成 components-draft.csv"
```

AI 会：
1. 读取每个 .tsx 文件
2. 提取组件名、Props、类型定义
3. 生成符合 Schema 的 CSV

**选项 B: 手动填写**
- 打开 `src/data/components.csv` 作为模板
- 复制格式，填写你的组件信息

#### 步骤 2: 提取样式

```
告诉 AI:
"请阅读 SKILL-CODEGEN-TRAINING.md，从 ../src/styles/globals.css 提取所有 CSS 变量和工具类，生成 styles-draft.csv"
```

#### 步骤 3: 验证和导入

```bash
# 验证组件
npm run validate components-draft.csv --schema components

# 验证样式
npm run validate styles-draft.csv --schema styles

# 导入组件
npm run import components-draft.csv --domain components

# 导入样式
npm run import styles-draft.csv --domain styles
```

#### 步骤 4: 测试 AI 代码生成

现在告诉 AI:
```
"创建一个登录表单，使用我们项目的组件"
```

AI 会：
1. 搜索: `npm run search "form input button" --domain components`
2. 搜索: `npm run search "spacing" --domain styles`
3. 生成使用正确组件和样式的代码

---

## 常见问题

### Q: 我需要手动写 CSV 吗？

A: 不需要！这就是这个工具的价值所在：

- **手动方式**: 复制 SKILL-CODEGEN-TRAINING.md 给 AI，让它帮你生成 CSV
- **自动方式**: v1.5 会有自动提取命令

### Q: 验证失败怎么办？

```bash
npm run validate components-draft.csv --schema components

# 如果看到错误:
❌ Validation failed!
Errors:
  • Row 5: Missing required field 'Component_Name'
  • Row 12: Field 'No' must be a number, got 'abc'
```

修正 CSV 文件中的错误，然后重新验证。

### Q: 可以导入多次吗？

A: 可以！每次导入会自动：
- 创建备份
- 重新编号（从上次结束继续）
- 追加新数据

如果担心，先用 `--dry-run` 预览。

### Q: 如何更新已有的组件信息？

A: v1.0 会追加新数据。如果要更新：
1. 手动编辑 `src/data/components.csv`
2. 或删除旧条目，重新导入

v2.0 会支持智能合并。

---

## 下一步

- 阅读 [README.md](./README.md) 了解完整功能
- 阅读 [SKILL-CODEGEN-TRAINING.md](./SKILL-CODEGEN-TRAINING.md) 了解 AI 提取指南
- 查看 [tests/](./tests/) 了解代码示例
- 运行 `npm test` 查看所有测试

Happy coding! 🚀
