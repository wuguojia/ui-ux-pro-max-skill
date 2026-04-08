# AI 代码生成增强器 (AI Codegen Booster)

> 导入训练素材，提升 AI 写代码的效果

**版本**: v1.4.0
**开发方式**: TDD (Test-Driven Development)

---

## 🚀 快速开始

**新用户？** → [📖 如何开始使用](./如何开始.md) - 3分钟快速集成指南

**想了解功能？** → [📚 完整 Skill 指南](./SKILL.md) - 详细功能说明

---

## 📖 项目简介

AI 代码生成增强器是一个基于 TypeScript 的工具，帮助你从现有代码库中提取组件、样式、约定等信息，构建结构化知识库，让 AI（Claude Code, Cursor, Windsurf 等）在生成代码时：

✅ 遵循你的代码风格和规范
✅ 使用你项目中已有的组件和工具类
✅ 生成符合你设计系统的 UI 代码
✅ 理解你的项目架构和最佳实践
✅ **[v1.3新增]** 自动验证代码质量，量化评估 KB 效果

---

## 🎯 核心价值

### 现有问题
```
❌ AI 生成的代码不符合项目规范
❌ 生成的组件与设计系统不一致
❌ 使用错误的 CSS 类名或组件 API
❌ 忽略项目的最佳实践
❌ 需要大量手动修改才能使用
❌ 无法量化 KB 的实际效果
```

### 本方案解决
```
✅ AI 知道你所有的组件和它们的用法
✅ AI 知道你的 CSS 变量、工具类、主题系统
✅ AI 知道你的代码规范和命名约定
✅ AI 生成的代码开箱可用，零修改
✅ AI 理解你的反模式，避免踩坑
✅ 自动验证代码质量，A/B测试量化KB效果 (v1.3)
```

---

## 🚀 快速开始

### 安装

```bash
cd your-project
mkdir ai-codegen-booster
cd ai-codegen-booster
npm init -y
npm install
```

### v1.3 知识库系统 (推荐)

#### 1. 初始化知识库
```bash
# 创建项目知识库
kb init

# 添加源代码目录
kb add-source -n "components" -p ./src/components -f React
kb add-source -n "styles" -p ./src/styles

# 构建知识库
kb build
```

#### 2. 验证代码质量
```bash
# 验证单个文件
kb validate -f src/components/Button.tsx

# 输出: 质量分数 (正确性/一致性/可维护性)
```

#### 3. A/B测试评估KB效果
```bash
# 对比有无KB的代码质量
kb test \
  -p "创建登录表单组件" \
  -a Button-without-KB.tsx \
  -b Button-with-KB.tsx

# 输出: 详细对比报告和改进度
```

#### 4. 查看质量统计
```bash
# 查看统计数据
kb stats

# 生成质量报告
kb report -o quality-report.txt
```

### v1.0 基础用法 (仍然支持)

#### 1. 提取 CSS 样式
```bash
# 从 CSS 文件提取
npm run extract css ../src/styles/globals.css

# 输出: styles-draft.csv
```

#### 2. 提取 React 组件
```bash
# 从组件文件提取
npm run extract component ../src/components/ui/button.tsx --framework react

# 批量提取
npm run extract component ../src/components/**/*.tsx --framework react

# 输出: components-draft.csv
```

#### 3. 验证提取结果
```bash
npm run validate components-draft.csv --schema components
```

#### 4. 导入到知识库
```bash
# 预览
npm run import components-draft.csv --domain components --dry-run

# 正式导入
npm run import components-draft.csv --domain components
```

#### 5. AI 使用知识库
```bash
# AI 搜索组件
npm run search "button component" --domain components

# AI 搜索样式
npm run search "primary color" --domain styles
```

---

## 📁 项目结构

```
ai-codegen-booster/
├── src/
│   ├── config/
│   │   └── schemas.ts              # 数据 Schema 定义
│   ├── extractors/
│   │   ├── css-extractor.ts        # CSS 提取器
│   │   └── component-extractor.ts  # 组件提取器
│   ├── cli/
│   │   └── commands/
│   │       ├── extract.ts          # 提取命令
│   │       ├── validate.ts         # 验证命令
│   │       └── import.ts           # 导入命令
│   ├── core/
│   │   └── csv-parser.ts           # CSV 解析器
│   ├── data/                       # 知识库 CSV
│   │   ├── components.csv
│   │   ├── styles.csv
│   │   └── conventions.csv
│   └── scripts/
│       └── search.ts               # 搜索脚本
├── tests/                          # 测试文件 (TDD)
│   ├── schemas.test.ts
│   ├── extractors/
│   │   ├── css-extractor.test.ts
│   │   └── component-extractor.test.ts
│   └── cli/
├── SKILL-CODEGEN-TRAINING.md       # AI 训练素材提取指南
├── README.md                       # 项目文档
├── package.json
├── tsconfig.json
└── vitest.config.ts                # 测试配置
```

---

## 🧪 测试 (TDD)

本项目采用 **测试驱动开发 (TDD)** 方式构建，所有核心功能都有完整的单元测试。

### 运行测试

```bash
# 运行所有测试
npm test

# 测试 UI 模式
npm run test:ui

# 生成覆盖率报告
npm run test:coverage
```

### 测试覆盖

- ✅ Schema 定义测试
- ✅ CSS 提取器测试
- ✅ 组件提取器测试
- ✅ 验证命令测试
- ✅ 导入命令测试

---

## 📊 支持的 Schema

### 1. Components Schema (组件库)

提取 React/Vue/Svelte 组件的信息。

**字段**:
- Component_Name, Framework, Import_Path
- Props, Props_Types, Default_Props
- Description, Usage_Example
- Category, Keywords

**示例**:
```csv
1,Button,React,@/components/ui/button,"variant,size","ButtonProps { variant: 'primary'|'secondary' }","variant='primary'",Primary action button,"<Button variant='primary'>Click</Button>",UI,"button,action,cta"
```

### 2. Styles Schema (样式系统)

提取 CSS 变量、工具类、主题 tokens。

**字段**:
- Style_Type, Name, Value
- Category, Usage, Example
- Keywords

**示例**:
```csv
1,CSS Variable,--primary,#3b82f6,Color,Primary brand color,var(--primary),"primary,color,brand"
```

### 3. Conventions Schema (项目约定)

提取或记录项目的编码规范和命名约定。

**字段**:
- Convention_Type, Rule
- Good_Example, Bad_Example
- Reason, Severity, Keywords

**示例**:
```csv
1,Naming,Component files use PascalCase,Button.tsx,button.tsx,Matches React convention,Must,"naming,component"
```

---

## 🔧 核心功能

### CSS Extractor

**功能**: 从 CSS 文件中提取变量和工具类

**支持格式**:
- CSS (`.css`)
- SCSS (`.scss`)
- Tailwind Config (`tailwind.config.ts`)

**智能分类**:
- 自动识别 Color, Spacing, Typography, Shadow
- 基于变量名和值进行分类

**测试覆盖**:
```typescript
✅ 提取 :root 中的 CSS 变量
✅ 提取工具类 (.bg-primary, .text-lg)
✅ 智能分类 (Color, Spacing, Typography)
✅ 处理空文件
✅ 跳过复杂选择器
```

### Component Extractor

**功能**: 从 React 组件源码中提取 API 信息

**支持框架**:
- React (`.tsx`, `.jsx`)

**提取内容**:
- 组件名称
- Props 定义（TypeScript interface）
- 导入依赖
- 完整源码

**测试覆盖**:
```typescript
✅ 提取函数组件名称
✅ 提取 Props interface
✅ 提取导入依赖
✅ 处理可选 Props
✅ 支持箭头函数组件
```

---

## 📚 使用指南 (作为 Skill)

### 给 AI 的指令

当用户要求生成 UI 代码时，AI 应该：

1. **搜索组件知识库**
   ```bash
   npm run search "button component" --domain components
   ```

2. **搜索样式知识库**
   ```bash
   npm run search "primary color" --domain styles
   ```

3. **检查约定规范**
   ```bash
   npm run search "naming convention" --domain conventions
   ```

4. **生成代码** - 基于知识库信息生成符合项目规范的代码

### 示例工作流

**用户**: "创建一个登录表单"

**AI 执行**:
```bash
# 1. 搜索表单相关组件
npm run search "form input button" --domain components

# 2. 搜索样式
npm run search "form styling" --domain styles

# 3. 检查约定
npm run search "form validation" --domain conventions

# 4. 生成代码
```

**AI 生成**:
```tsx
import { Button } from '@/components/ui/button';  // ← 从知识库获取
import { Input } from '@/components/ui/input';    // ← 从知识库获取

export function LoginForm() {
  return (
    <form className="space-y-4">              {/* ← 使用项目的 spacing */}
      <Input type="email" placeholder="Email" />
      <Button variant="primary" size="lg">   {/* ← 使用正确的 props */}
        Login
      </Button>
    </form>
  );
}
```

---

## 🎨 实际效果对比

### 提取前（AI 不了解项目）
```tsx
// ❌ AI 生成的代码 - 不符合规范
export function LoginButton() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded">
      Login
    </button>
  );
}
```

### 提取后（AI 了解项目）
```tsx
// ✅ AI 生成的代码 - 完美符合规范
import { Button } from '@/components/ui/button';

export function LoginButton() {
  return (
    <Button variant="default" size="default">
      Login
    </Button>
  );
}
```

**差异**:
- ✅ 使用正确的导入路径
- ✅ 使用项目的 Button 组件
- ✅ 使用正确的 props
- ✅ 符合命名约定

---

## 🔍 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **语言** | TypeScript | 类型安全 |
| **测试** | Vitest | 快速的单元测试框架 |
| **解析** | @babel/parser | AST 解析 (JS/TS/JSX) |
| **CSS 解析** | PostCSS | CSS AST 解析 |
| **CLI** | Commander.js | 命令行工具 |
| **运行时** | tsx | 快速开发和测试 |

---

## 📝 开发指南

### TDD 开发流程

1. **编写测试** (先写测试，测试失败)
   ```typescript
   it('should extract component name', () => {
     const result = extractComponent(code);
     expect(result.name).toBe('Button');
   });
   ```

2. **实现功能** (让测试通过)
   ```typescript
   export function extractComponent(code: string) {
     // 实现逻辑
     return { name: 'Button', ... };
   }
   ```

3. **运行测试** (确保通过)
   ```bash
   npm test
   ```

4. **重构** (优化代码，保持测试通过)

---

## 🗺️ Roadmap

### v1.3 (当前版本) ✅
- [x] **知识库系统 (KB System)**
  - [x] 项目级/全局级 KB 管理
  - [x] 自动扫描 React/Vue/TypeScript/JavaScript
  - [x] CSV 格式导出 (components, styles, conventions)
- [x] **AI自动化验证系统**
  - [x] CodeValidator - 代码质量验证器 (三维度评分)
  - [x] ABTester - A/B测试工具 (量化KB效果)
  - [x] QualityTracker - 质量跟踪器 (长期趋势分析)
  - [x] CSV解析器 (完整实现)
  - [x] 完整中文文档
- [x] TDD 测试覆盖
- [x] SKILL 文档

### v1.0 (已完成) ✅
- [x] CSS Extractor
- [x] Component Extractor (React)
- [x] Schema 定义
- [x] Validate & Import 命令
- [x] TDD 测试覆盖
- [x] SKILL 文档

### v1.5 (计划中)
- [ ] HTML Extractor
- [ ] Doc Extractor
- [ ] Pattern Analyzer
- [ ] Convention Analyzer
- [ ] Vue/Svelte 完整支持

### v2.0 (未来)
- [ ] 智能去重
- [ ] 增量导入
- [ ] 质量评分优化
- [ ] Web UI 可视化管理

---

## 📄 License

MIT

---

## 🙏 致谢

本项目参考了 [typescript-skill-template](../typescript-skill-template) 的架构设计。

---

## 📞 支持

如有问题，请查看:
- [VALIDATION_SYSTEM.md](./docs/VALIDATION_SYSTEM.md) - **v1.3 AI自动化验证系统完整文档**
- [SKILL-CODEGEN-TRAINING.md](./SKILL-CODEGEN-TRAINING.md) - AI 训练素材提取指南
- [示例代码](./examples/validation/) - A/B测试示例
- [测试文件](./tests/) - 查看使用示例

## 📚 文档索引

- **v1.3 新功能**
  - [AI自动化验证系统详细文档](./docs/VALIDATION_SYSTEM.md) - 完整的中文文档，包含使用示例、API参考、最佳实践
  - [A/B测试示例](./examples/validation/README.md) - 实际对比案例

- **核心功能**
  - [SKILL-CODEGEN-TRAINING.md](./SKILL-CODEGEN-TRAINING.md) - 如何构建AI训练素材
  - 本 README - 快速入门和功能概览
