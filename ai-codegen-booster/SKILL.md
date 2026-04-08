# AI Codegen Booster - 完整Skill指南

> 从训练数据到AI代码生成的端到端工作流

**版本**: v1.3.0
**适用于**: Claude Code, Cursor, Windsurf, Codeium 等AI编程助手
**示例框架**: Vue 3 + TypeScript

---

## 📋 目录

1. [Part 1: 训练素材收集 (如何填充数据)](#part-1-训练素材收集)
2. [Part 2: 知识库构建 (如何组织KB)](#part-2-知识库构建)
3. [Part 3: AI代码生成 (如何使用KB)](#part-3-ai代码生成)
4. [Part 4: 质量验证与优化](#part-4-质量验证与优化)
5. [Part 5: 完整工作流示例](#part-5-完整工作流示例)

---

## Part 1: 训练素材收集

### 🎯 目标

从现有Vue项目中提取：
- **组件信息** - 组件名称、Props、事件、插槽、用法
- **样式系统** - CSS变量、工具类、主题配置
- **编码规范** - 命名约定、最佳实践、反模式

### 步骤 1.1: 检查项目结构

```bash
# 进入你的Vue项目
cd ~/projects/my-vue-app

# 查看项目结构
tree -L 3 src/
```

**典型Vue 3项目结构**:
```
src/
├── components/
│   ├── ui/              # 基础UI组件
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   └── Card.vue
│   └── features/        # 功能组件
│       └── UserProfile.vue
├── styles/
│   ├── variables.css    # CSS变量
│   ├── utilities.css    # 工具类
│   └── themes/
│       └── default.css
├── views/               # 页面组件
│   ├── Home.vue
│   └── Login.vue
└── utils/
```

### 步骤 1.2: 初始化知识库

```bash
# 在项目根目录初始化
kb init

# 输出:
# ✓ 创建配置文件: ./kb-config.json
# ✓ 创建输出目录: ./kb
# ✓ 知识库已初始化
```

### 步骤 1.3: 添加源代码目录

```bash
# 添加UI组件目录
kb add-source -n "ui-components" -p ./src/components/ui -f Vue

# 添加功能组件
kb add-source -n "features" -p ./src/components/features -f Vue

# 添加样式目录
kb add-source -n "styles" -p ./src/styles

# 查看已配置的源
kb list
```

**输出**:
```
📚 Project Knowledge Base Sources:

1. ✓ ui-components
   Path: ./src/components/ui
   Framework: Vue

2. ✓ features
   Path: ./src/components/features
   Framework: Vue

3. ✓ styles
   Path: ./src/styles
   Framework: Unknown
```

### 步骤 1.4: 扫描并构建知识库

```bash
# 扫描所有源并生成CSV
kb build -v
```

**输出示例**:
```
🔍 正在扫描源代码...

📦 扫描: ui-components (./src/components/ui)
  ✓ Button.vue - 发现5个props, 2个事件
  ✓ Input.vue - 发现7个props, 3个事件
  ✓ Card.vue - 发现4个props, 2个插槽
  总计: 12个组件

📦 扫描: features (./src/components/features)
  ✓ UserProfile.vue
  ✓ ProductCard.vue
  总计: 8个组件

📦 扫描: styles (./src/styles)
  ✓ variables.css - 发现98个CSS变量
  ✓ utilities.css - 发现58个工具类
  总计: 156个样式

📊 生成CSV文件...
  ✓ ./kb/components.csv (20行)
  ✓ ./kb/styles.csv (156行)
  ✓ ./kb/conventions.csv (0行)

✨ 知识库构建完成!
```

### 步骤 1.5: 验证生成的数据

```bash
# 查看组件数据
head -3 ./kb/components.csv

# 查看样式数据
head -3 ./kb/styles.csv
```

**components.csv 示例**:
```csv
componentName,framework,importPath,filePath,props,events,slots,apiStyle,description,usageExample,category,keywords
Button,Vue,@/components/ui/Button,src/components/ui/Button.vue,"[{""name"":""type"",""type"":""'primary'|'secondary'|'ghost'"",""required"":false,""default"":""primary""},{""name"":""size"",""type"":""'sm'|'md'|'lg'"",""required"":false,""default"":""md""},{""name"":""disabled"",""type"":""boolean"",""required"":false,""default"":""false""}]","click","default,icon",Composition,可复用的按钮组件,"<Button type=""primary"" size=""md"" @click=""handleClick"">点击我</Button>",UI,"button,click,action,primary"
Input,Vue,@/components/ui/Input,src/components/ui/Input.vue,"[{""name"":""modelValue"",""type"":""string"",""required"":true},{""name"":""type"",""type"":""string"",""required"":false,""default"":""text""},{""name"":""placeholder"",""type"":""string"",""required"":false}]","update:modelValue,focus,blur","default",Composition,输入框组件,"<Input v-model=""value"" type=""text"" placeholder=""请输入"" />",Form,"input,form,text,v-model"
```

---

## Part 2: 知识库构建

### 2.1 理解CSV数据结构

知识库包含3个CSV文件：

#### components.csv - 组件库

**关键字段**:
- `componentName`: Button, Input, Card
- `framework`: Vue, React
- `importPath`: `@/components/ui/Button`
- `props`: JSON格式，包含name、type、required、default
- `events`: `click,hover,focus`
- `slots`: `default,icon,header`
- `usageExample`: 实际使用代码

#### styles.csv - 样式系统

**关键字段**:
- `styleType`: CSS Variable, Utility Class
- `name`: `--primary-color`, `flex`
- `value`: `#3b82f6`, `display: flex`
- `category`: Color, Spacing, Typography
- `usage`: 使用说明
- `example`: 代码示例

#### conventions.csv - 编码规范

**关键字段**:
- `conventionType`: Naming, Structure, Pattern
- `rule`: 规则描述
- `goodExample`: 正确示例
- `badExample`: 错误示例
- `severity`: error, warning, info

### 2.2 手动补充编码规范

自动扫描无法提取编码规范，需手动创建：

**创建 conventions-draft.csv**:
```csv
conventionType,rule,goodExample,badExample,reason,severity,keywords
Naming,组件文件使用PascalCase,Button.vue,button.vue,符合Vue官方风格指南,error,"naming,component,vue"
API,优先使用Composition API,<script setup>,export default { data() {} },Vue 3推荐方式,warning,"vue,composition,api"
Props,使用defineProps定义Props,"const props = defineProps<Props>()","props: { ... }",TypeScript类型安全,error,"props,typescript,vue"
Template,避免复杂表达式,"{{ formattedDate }}","{{ new Date().toLocaleDateString() }}",提高可读性,warning,"template,expression"
Style,使用CSS变量,"color: var(--primary)","color: #3b82f6",保持主题一致性,warning,"style,variable,theme"
Import,使用@别名导入,"import { Button } from '@/components/ui/Button'","import Button from '../components/Button'",路径清晰,error,"import,alias,path"
```

**导入约定**:
```bash
# 复制到kb目录
cp conventions-draft.csv ./kb/conventions.csv

# 或使用import命令 (如果已实现)
kb import conventions-draft.csv --domain conventions
```

### 2.3 增量更新

项目变化时更新KB：

```bash
# 方式1: 完全重建
kb build

# 方式2: 合并新内容
kb build --merge

# 方式3: 扫描单个目录
kb scan -p ./src/components/new -o ./kb-temp
```

---

## Part 3: AI代码生成

### 3.1 AI使用KB的标准流程

当用户请求"创建一个登录表单"时：

**第1步: 搜索相关组件**
```bash
npm run search "form input button" --domain components
```

**搜索结果**:
```
找到 3 个相关组件:

1. Input (相关度: 95%)
   导入: import { Input } from '@/components/ui/Input'
   Props: modelValue (必需), type, placeholder
   事件: update:modelValue, focus, blur
   示例: <Input v-model="value" type="text" />

2. Button (相关度: 90%)
   导入: import { Button } from '@/components/ui/Button'
   Props: type, size, disabled, loading
   事件: click
   示例: <Button type="primary" @click="handleClick">提交</Button>

3. Form (相关度: 85%)
   导入: import { Form } from '@/components/ui/Form'
   ...
```

**第2步: 搜索样式系统**
```bash
npm run search "spacing color" --domain styles
```

**搜索结果**:
```
找到 5 个相关样式:

1. --spacing-md (16px) - 中等间距
   用法: padding: var(--spacing-md)

2. --primary-color (#3b82f6) - 主色
   用法: color: var(--primary-color)

3. --text-primary (#1f2937) - 主文本色
   用法: color: var(--text-primary)
```

**第3步: 检查编码规范**
```bash
npm run search "vue composition" --domain conventions
```

**第4步: 生成代码**

基于KB信息，AI生成：

```vue
<template>
  <div class="login-form">
    <h2 class="form-title">用户登录</h2>

    <form @submit.prevent="handleSubmit">
      <!-- 使用KB中的Input组件 -->
      <div class="form-field">
        <Input
          v-model="email"
          type="email"
          placeholder="请输入邮箱"
        />
      </div>

      <div class="form-field">
        <Input
          v-model="password"
          type="password"
          placeholder="请输入密码"
        />
      </div>

      <!-- 使用KB中的Button组件 -->
      <div class="form-actions">
        <Button
          type="primary"
          size="lg"
          :loading="isLoading"
          @click="handleSubmit"
        >
          登录
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// ✓ 使用KB中的正确导入路径
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  isLoading.value = true
  try {
    // 登录逻辑
    console.log('登录', { email: email.value, password: password.value })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-xl);  /* ✓ 使用KB中的样式变量 */
}

.form-title {
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.form-field {
  margin-bottom: var(--spacing-md);
}

.form-actions {
  margin-top: var(--spacing-lg);
}
</style>
```

### 3.2 对比: 有无KB的差异

**❌ 没有KB (AI凭记忆生成)**:
```vue
<template>
  <div class="login">
    <!-- 使用原生input -->
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <!-- 使用原生button -->
    <button @click="login">Login</button>
  </div>
</template>

<script>
// ❌ 使用Options API (不符合项目规范)
export default {
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    login() {
      // ...
    }
  }
}
</script>

<style scoped>
.login {
  padding: 20px;  /* ❌ 硬编码 */
}
input {
  margin: 10px 0;  /* ❌ 硬编码 */
}
</style>
```

**✅ 有KB (AI使用KB生成)**:
- ✓ 使用项目的Input和Button组件
- ✓ 正确的导入路径 (`@/components/ui/...`)
- ✓ 使用Composition API (`<script setup>`)
- ✓ 使用CSS变量 (`var(--spacing-md)`)
- ✓ 完整的Props (`type`, `size`, `loading`)
- ✓ 正确的事件处理 (`@click`, `v-model`)

**质量提升**: +28.5分 (56→84.5)

---

## Part 4: 质量验证与优化

### 4.1 验证生成的代码

```bash
# 验证单个Vue文件
kb validate -f src/views/Login.vue --framework Vue
```

**输出**:
```
🔍 Validating: src/views/Login.vue

Quality Score:
  Overall: 85/100
    - Correctness: 90/100    ✓ 导入路径正确, Props完整
    - Consistency: 80/100    ⚠ 2个硬编码样式
    - Maintainability: 85/100 ✓ 使用KB组件

Checks:
  Imports: 100.0% (0 issues)
  Props: 100.0% (0 issues)
  Styles: 80/100 (2 hardcoded values)

KB Usage:
  Components from KB: 2/2 (100.0%)

Suggestions:
  1. Replace 2 hardcoded style(s) with project variables
```

### 4.2 运行A/B测试

```bash
# 对比两个版本
kb test \
  -p "创建用户登录表单" \
  -a src/views/LoginForm-without-KB.vue \
  -b src/views/LoginForm-with-KB.vue \
  --framework Vue
```

**输出**:
```
═══════════════════════════════════════════════════
           A/B TEST REPORT
═══════════════════════════════════════════════════

✅ KB-enhanced version is BETTER

Quality improvement: +28.5 points
  - Correctness: +20.0 (导入路径, Props)
  - Consistency: +35.0 (样式变量)
  - Maintainability: +30.0 (KB组件使用)
  - Issues reduced: 6

Import Accuracy:
  Version A: 0.0% (使用错误路径)
  Version B: 100.0% ✓
  Change: +100.0%

Style Consistency:
  Version A: 40/100 (6个硬编码)
  Version B: 90/100 (1个硬编码)
  Change: +50

KB Usage:
  Components from KB: 2/2 (100%)
═══════════════════════════════════════════════════
```

### 4.3 查看质量统计

```bash
# 查看30天质量趋势
kb stats -d 30
```

**输出**:
```
📊 Quality Statistics

Overview:
  Total Generations: 45
    - With KB: 30 (66.7%)
    - Without KB: 15 (33.3%)

Average Quality Scores:
  Overall: 78.5/100
  With KB: 84.2/100 ✓
  Without KB: 67.1/100
  Improvement: +25.5%

Top Issues:
  1. 硬编码颜色 (8次)
  2. 导入路径错误 (5次)
  3. 缺少必需Props (3次)

Trends (last 7 days):
  2026-04-01: 82.3/100 (5 gen)
  2026-04-02: 79.8/100 (3 gen)
  2026-04-08: 87.5/100 (4 gen) ↑
```

---

## Part 5: 完整工作流示例

### 场景: 从零开始 (Vue 3项目)

#### 第1天: 初始化知识库

```bash
# 1. 进入项目
cd ~/projects/my-vue-app

# 2. 初始化KB
kb init

# 3. 添加源
kb add-source -n "components" -p ./src/components -f Vue
kb add-source -n "styles" -p ./src/styles

# 4. 构建KB
kb build -v

# ✓ 知识库已创建: ./kb
#   - components.csv (20 组件)
#   - styles.csv (156 样式)
```

#### 第2天: 测试AI生成

```bash
# 1. 请求AI: "创建一个产品卡片组件 ProductCard.vue"

# 2. AI自动搜索KB
npm run search "card product" --domain components
npm run search "spacing color" --domain styles

# 3. AI生成代码 (使用KB中的Card组件和样式)

# 4. 验证
kb validate -f src/components/ProductCard.vue
# Output: Overall: 88/100 ✓
```

#### 第3天: A/B测试

```bash
# 1. 准备两个版本进行对比

# 2. 运行测试
kb test \
  -p "创建产品卡片组件" \
  -a ProductCard-baseline.vue \
  -b ProductCard-with-kb.vue \
  --framework Vue

# Output: Quality improvement: +32.1 points ✓
```

#### 第7天: 周报

```bash
kb stats -d 7
kb report -o weekly-report.txt
```

#### 第30天: 优化KB

```bash
# 1. 重新构建 (包含新组件)
kb build

# 2. 补充规范
vim conventions-draft.csv
cp conventions-draft.csv ./kb/conventions.csv

# 3. 再次测试
kb test -p "..." -a file-a.vue -b file-b.vue
```

---

## 🎯 命令速查表

```bash
# === 初始化 ===
kb init                    # 初始化项目KB
kb init -g                 # 初始化全局KB

# === 管理源 ===
kb add-source -n <name> -p <path> -f Vue    # 添加源
kb remove-source -n <name>                  # 删除源
kb list                                     # 列出所有源

# === 构建KB ===
kb build                   # 构建知识库
kb build -v                # 详细输出
kb build --merge           # 合并模式
kb scan -p <path> -o <dir> # 快速扫描

# === 验证 ===
kb validate -f <file> --framework Vue  # 验证Vue文件

# === A/B测试 ===
kb test -p <prompt> -a <file-a> -b <file-b> --framework Vue

# === 统计 ===
kb stats -d 30             # 30天趋势
kb report -o report.txt    # 生成报告

# === 搜索 (AI使用) ===
npm run search "<query>" --domain components
npm run search "<query>" --domain styles
npm run search "<query>" --domain conventions
```

---

## ⚠️ AI使用规则

### 必须遵守

1. ✅ **总是搜索KB** - 生成代码前先搜索组件和样式
2. ✅ **使用正确导入路径** - 从KB获取importPath
3. ✅ **使用正确Props** - 从KB获取props定义
4. ✅ **使用样式变量** - 不要硬编码颜色和间距
5. ✅ **遵循规范** - 检查conventions了解项目约定

### 常见错误

❌ 硬编码样式:
```vue
<div style="padding: 20px; color: #3b82f6">
```

✅ 使用样式变量:
```vue
<div class="container">
<style>
.container {
  padding: var(--spacing-lg);
  color: var(--primary-color);
}
</style>
```

❌ 错误的导入:
```vue
import Button from './Button'
```

✅ 使用KB路径:
```vue
import { Button } from '@/components/ui/Button'
```

❌ 错误的Props:
```vue
<Button color="primary">  <!-- ❌ 应该是type -->
```

✅ 正确的Props:
```vue
<Button type="primary">  <!-- ✓ -->
```

---

## 📚 更多资源

- [详细验证系统文档](./docs/VALIDATION_SYSTEM.md)
- [训练指南](./docs/TRAINING_GUIDE.md)
- [Vue示例项目](./examples/vue-project/)
- [A/B测试示例](./examples/validation/)

---

**版本**: v1.3.0
**最后更新**: 2026-04-08
