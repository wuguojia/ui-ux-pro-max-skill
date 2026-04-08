---
name: ai-codegen-booster
description: "AI代码生成增强器 - 通过智能提取项目组件、样式和编码规范，让AI生成符合项目规范的代码。支持React、Vue等主流框架，包含智能提取器（HTML、文档、Hooks、Composables）、分析器（设计模式、架构、约定）和质量优化（去重、评分）。"
---

# AI Codegen Booster - AI代码生成增强器

> 让AI更懂你的项目，生成符合规范的代码

**版本**: v1.4.0
**适用于**: Claude Code, Cursor, Windsurf, Codeium 等AI编程助手

---

## 这个Skill能做什么？

当用户说"创建一个登录表单"或"添加一个用户卡片组件"时，这个Skill让AI能够：

✅ **自动提取项目信息** - 扫描项目，提取组件、样式、编码规范
✅ **理解项目结构** - 识别设计模式、架构模式、最佳实践
✅ **生成符合规范的代码** - 使用正确的组件、样式变量、命名约定
✅ **智能质量优化** - 去重、评分、修复不一致

---

## 何时使用这个Skill

### 必须使用的情况

- 用户要求分析、提取或理解项目的组件、样式或编码规范
- 用户要求生成符合项目规范的代码
- 用户要求检测项目中的设计模式、架构模式或编码约定
- 用户要求优化知识库质量或去除重复组件

### 推荐使用的情况

- 新接手一个项目，需要快速了解代码结构
- 团队协作时需要统一代码规范
- 生成的代码需要符合现有项目风格

---

## 核心功能

### 1. 智能提取器（Extractors）

当用户说"分析这个项目"时，自动提取：

- **HTML提取器** - 提取HTML结构模式、语义化标签、ARIA可访问性
- **文档提取器** - 提取JSDoc/TSDoc/Markdown文档、使用示例
- **React Hooks提取器** - 提取useState、useEffect、自定义Hook、Context API
- **Vue Composables提取器** - 提取ref、reactive、composables、指令

### 2. 智能分析器（Analyzers）

自动识别项目中的：

- **设计模式** - 单例、工厂、观察者、构建器等
- **架构模式** - MVC、MVVM、Clean Architecture、Feature-Based等
- **编码约定** - 命名规范、导入规范、注释风格
- **反模式检测** - 长函数、深层嵌套、魔法数字等

### 3. 质量优化

- **智能去重器** - 基于相似度算法合并重复组件
- **质量评分器** - 0-100分评分，评估完整性、一致性、可复用性

---

## 使用方法

### 方式1：直接对话（推荐）⭐

用户只需要说：

```
"帮我分析这个Vue/React项目，提取所有组件、样式和编码规范"
```

你（AI）会自动：
1. 扫描项目文件（src/components、src/styles等）
2. 使用智能提取器提取信息
3. 使用分析器识别模式
4. 生成知识库CSV文件（在项目的kb/目录）
5. 运行质量评分

然后用户说：
```
"用项目的组件创建一个登录表单"
```

你会：
1. 搜索知识库中的相关组件（Input、Button、Form等）
2. 搜索样式变量（spacing、colors等）
3. 生成使用正确组件和样式的代码

### 方式2：渐进式提取

用户可以分步骤进行：

```
"先提取所有React组件的Props和类型"
"再提取CSS变量和样式系统"
"分析项目的命名约定"
"检测项目中的设计模式"
```

### 方式3：优化知识库

```
"优化知识库质量，去除重复组件"
"运行质量评分，看看哪里需要改进"
```

---

## 支持的框架

- ✅ React (包括Next.js)
- ✅ Vue (2.x 和 3.x)
- ✅ Svelte
- ✅ Angular
- ✅ 纯HTML/CSS/JavaScript

---

## 生成的知识库结构

提取后会在项目中生成：

```
your-project/
├── kb/                          # 知识库目录
│   ├── components.csv           # 组件知识库
│   │   - 组件名称、框架、导入路径
│   │   - Props、事件、插槽
│   │   - React Hooks详情
│   │   - Vue Composables详情
│   │   - 使用示例
│   │
│   ├── styles.csv              # 样式知识库
│   │   - CSS变量、工具类
│   │   - 布局模式、语义化标签
│   │   - 可访问性模式
│   │
│   ├── conventions.csv         # 编码规范知识库
│   │   - 命名约定
│   │   - 设计模式、架构模式
│   │   - 最佳实践、反模式
│   │
│   └── quality-report.md       # 质量报告
│       - 整体质量评分
│       - 问题清单
│       - 改进建议
```

---

## 提取示例

### 示例1：提取React组件

**用户输入**：
```
"分析 src/components/Button.tsx"
```

**你的操作**：
1. 读取文件内容
2. 使用React Hooks提取器
3. 提取：
   - 组件名：Button
   - Props：label, onClick, disabled, type, size
   - TypeScript类型定义
   - 使用的Hooks：useState, useCallback
   - 使用示例

**输出到 kb/components.csv**：
```csv
componentName,framework,importPath,props,hooks,usageExample
Button,React,@/components/Button,"[{name:'label',type:'string'},{name:'onClick',type:'() => void'}]","['useState','useCallback']","<Button type='primary' onClick={handleClick}>Click</Button>"
```

### 示例2：提取Vue组件

**用户输入**：
```
"分析 src/components/UserCard.vue"
```

**你的操作**：
1. 读取SFC文件
2. 使用Vue Composables提取器
3. 提取：
   - 组件名：UserCard
   - Props：user, showActions
   - Composables：useUser, useAuth
   - 响应式变量：ref, computed
   - 生命周期钩子：onMounted

**输出到 kb/components.csv**。

### 示例3：提取样式系统

**用户输入**：
```
"分析 src/styles/variables.css"
```

**你的操作**：
1. 读取CSS文件
2. 提取CSS变量
3. 识别分类（颜色、间距、字体等）

**输出到 kb/styles.csv**：
```csv
name,value,styleType,category,usage
--primary-color,#3b82f6,CSS Variable,color,主题色
--spacing-md,16px,CSS Variable,spacing,中等间距
```

### 示例4：检测设计模式

**用户输入**：
```
"检测项目中的设计模式"
```

**你的操作**：
1. 扫描代码文件
2. 使用模式分析器
3. 识别：
   - 单例模式（getInstance方法）
   - 工厂模式（create*函数）
   - 观察者模式（subscribe/notify）
   - 状态管理（Redux、Zustand、Pinia）

**输出到 kb/conventions.csv**。

### 示例5：生成代码

**用户输入**：
```
"创建一个登录表单"
```

**你的操作**：
1. 搜索 kb/components.csv：找到 Input、Button、Form
2. 搜索 kb/styles.csv：找到 --spacing-md、--primary-color
3. 搜索 kb/conventions.csv：了解命名约定、导入路径规范
4. 生成代码：

```tsx
import { Form } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <Form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <Input
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email"
        />
      </div>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <Input
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
        />
      </div>
      <Button type="primary" onClick={handleSubmit}>
        Login
      </Button>
    </Form>
  )
}
```

**注意代码使用了**：
- ✅ 正确的导入路径（从知识库）
- ✅ 正确的组件Props（从知识库）
- ✅ 项目的CSS变量（从知识库）

---

## 质量评分系统

当用户说"评估知识库质量"时：

**输出示例**：
```
知识库质量评分：

整体质量: 82/100

详细评分：
- 完整性: 85/100
  ✓ 组件Props文档完整
  ⚠ 3个组件缺少使用示例

- 一致性: 78/100
  ⚠ 2个组件导入路径不一致
  ⚠ 样式变量命名不统一

- 可复用性: 88/100
  ✓ 文档充分，易于复用
  ✓ 示例代码清晰

- 文档性: 80/100
  ⚠ 5个组件缺少描述

建议修复：
1. 统一导入路径格式为 @/components/*
2. 补充缺失的组件描述
3. 添加更多使用示例
```

---

## 智能去重

当用户说"去除重复组件"时：

**操作**：
1. 计算组件相似度（基于名称、Props、框架）
2. 识别重复和相似组件
3. 智能合并

**输出示例**：
```
去重结果：

原始组件数: 45
发现重复: 5个
发现相似: 12个
合并后: 40个

合并详情：
- Button 和 PrimaryButton 合并（相似度 92%）
- Card 和 CardComponent 合并（相似度 95%）
- Input 和 TextInput 合并（相似度 88%）
```

---

## 最佳实践

### 1. 初次使用

```
"分析整个项目，生成完整的知识库"
```

这会一次性提取所有信息。

### 2. 增量更新

当有新组件时：
```
"扫描新增的组件，更新知识库"
```

### 3. 验证生成的代码

```
"验证这段代码是否符合项目规范"
```

会检查：
- 导入路径是否正确
- Props使用是否正确
- 样式变量是否存在
- 命名是否符合约定

### 4. 多人协作

建议将 `kb/` 目录提交到Git，团队共享知识库。

---

## 注意事项

1. **不会修改源代码** - 只读取和分析，不会修改任何项目文件
2. **知识库文件** - 生成的CSV文件在 `kb/` 目录，可以手动编辑
3. **增量扫描** - 支持只扫描变化的文件，不用每次全量扫描
4. **框架自适应** - 自动识别项目框架（React/Vue/Svelte等）

---

## 快速参考

| 用户说... | AI做什么 |
|----------|---------|
| "分析项目" | 提取组件、样式、约定 |
| "提取React组件" | 只提取React组件信息 |
| "提取样式系统" | 只提取CSS变量、工具类 |
| "检测设计模式" | 识别单例、工厂等模式 |
| "优化知识库" | 去重、评分、修复 |
| "创建XX组件" | 使用知识库生成代码 |
| "验证代码" | 检查是否符合规范 |

---

**版本**: v1.4.0
**最后更新**: 2026-04-08
