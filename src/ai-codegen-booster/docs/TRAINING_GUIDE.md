# AI Codegen Booster - 训练指南

> 从零开始构建知识库的完整教程

**版本**: v1.3.0
**目标**: 训练一个能够生成高质量代码的知识库
**示例**: Vue 3 + TypeScript项目

---

## 📋 概述

本指南将带你完成从零开始构建知识库的全过程，包括：
1. 环境准备
2. 项目扫描
3. 数据提取
4. 知识库构建
5. 质量验证
6. 实战测试

**预计时间**: 30-60分钟

---

## 步骤 1: 环境准备

### 1.1 安装依赖

```bash
# 进入你的Vue项目目录
cd ~/projects/my-vue-app

# 确保已安装Node.js 18+
node --version

# 安装AI Codegen Booster (如果还没有)
npm install -D ai-codegen-booster
```

### 1.2 检查项目结构

```bash
# 查看项目结构
tree -L 3 src/

# 确认你有以下目录:
# - src/components/ (Vue组件)
# - src/styles/     (样式文件)
```

**✅ 检查清单**:
- [ ] Node.js 18+ 已安装
- [ ] 项目包含Vue组件
- [ ] 项目包含样式文件
- [ ] 可以运行 `npm run dev`

---

## 步骤 2: 初始化知识库

### 2.1 创建知识库配置

```bash
# 在项目根目录初始化
npx kb init

# 输出:
# ✓ 创建配置文件: ./kb-config.json
# ✓ 创建输出目录: ./kb
# ✓ 知识库已初始化
```

### 2.2 检查生成的配置

```bash
cat kb-config.json
```

**预期输出**:
```json
{
  "mode": "project",
  "basePath": "/path/to/your-project",
  "outputDir": "./kb",
  "sources": [],
  "priority": "local-first",
  "autoSync": false
}
```

**✅ 检查清单**:
- [ ] kb-config.json 已创建
- [ ] ./kb 目录已创建
- [ ] 配置中 basePath 正确

---

## 步骤 3: 添加扫描源

### 3.1 添加组件目录

```bash
# 添加UI组件
npx kb add-source \
  -n "ui-components" \
  -p ./src/components/ui \
  -f Vue

# 如果有功能组件
npx kb add-source \
  -n "features" \
  -p ./src/components/features \
  -f Vue

# 如果组件不在子目录
npx kb add-source \
  -n "components" \
  -p ./src/components \
  -f Vue
```

### 3.2 添加样式目录

```bash
# 添加样式文件
npx kb add-source \
  -n "styles" \
  -p ./src/styles
```

### 3.3 验证添加的源

```bash
npx kb list
```

**预期输出**:
```
📚 Project Knowledge Base Sources:

1. ✓ ui-components
   Path: ./src/components/ui
   Framework: Vue

2. ✓ styles
   Path: ./src/styles
   Framework: Unknown
```

**✅ 检查清单**:
- [ ] 所有组件目录已添加
- [ ] 样式目录已添加
- [ ] `kb list` 显示所有源

---

## 步骤 4: 扫描和构建知识库

### 4.1 运行首次扫描

```bash
# 使用 -v 标志获取详细输出
npx kb build -v
```

**预期输出**:
```
🔍 正在扫描源代码...

📦 扫描: ui-components (./src/components/ui)
  ✓ Button.vue - 发现5个props, 2个事件, 2个插槽
  ✓ Input.vue - 发现7个props, 3个事件
  ✓ Card.vue - 发现4个props, 3个插槽
  ✓ Modal.vue - 发现6个props, 2个事件
  总计: 12个组件

📦 扫描: styles (./src/styles)
  ✓ variables.css - 发现98个CSS变量
  ✓ utilities.css - 发现58个工具类
  总计: 156个样式

📊 生成CSV文件...
  ✓ ./kb/components.csv (12行)
  ✓ ./kb/styles.csv (156行)
  ✓ ./kb/conventions.csv (0行)

✨ 知识库构建完成!
   组件: 12 | 样式: 156 | 约定: 0
```

### 4.2 检查生成的CSV文件

```bash
# 查看组件数据
head -3 ./kb/components.csv

# 查看样式数据
head -3 ./kb/styles.csv

# 检查文件大小
ls -lh ./kb/*.csv
```

**✅ 检查清单**:
- [ ] components.csv 已生成
- [ ] styles.csv 已生成
- [ ] conventions.csv 已生成 (可能为空)
- [ ] CSV文件包含数据 (不只是标题行)

---

## 步骤 5: 补充编码规范

### 5.1 创建规范文件

由于自动扫描无法提取编码规范，需要手动创建：

```bash
# 创建规范草稿
cat > conventions-draft.csv << 'EOF'
conventionType,rule,goodExample,badExample,reason,severity,keywords
Naming,组件文件使用PascalCase,Button.vue,button.vue,符合Vue官方风格指南,error,"naming,component,vue"
API,优先使用Composition API,"<script setup>","export default { data() {} }",Vue 3推荐方式,warning,"vue,composition,api"
Props,使用defineProps定义Props,"const props = defineProps<Props>()","props: { ... }",TypeScript类型安全,error,"props,typescript,vue"
Template,避免复杂表达式,"{{ formattedDate }}","{{ new Date().toLocaleDateString() }}",提高可读性,warning,"template,expression"
Style,使用CSS变量,"color: var(--primary)","color: #3b82f6",保持主题一致性,warning,"style,variable,theme"
Import,使用@别名导入,"import { Button } from '@/components/ui/Button'","import Button from '../components/Button'",路径清晰,error,"import,alias,path"
EOF
```

### 5.2 导入规范到知识库

```bash
# 复制到kb目录
cp conventions-draft.csv ./kb/conventions.csv

# 验证
wc -l ./kb/conventions.csv
# 应该输出: 7 ./kb/conventions.csv (包括标题行)
```

**✅ 检查清单**:
- [ ] conventions-draft.csv 已创建
- [ ] 复制到 ./kb/conventions.csv
- [ ] 至少包含5-10条规范

---

## 步骤 6: 验证知识库数据

### 6.1 检查数据质量

```bash
# 检查组件数据
echo "=== 组件统计 ==="
wc -l ./kb/components.csv
grep -c "^[^,]" ./kb/components.csv || echo "0 components"

# 检查样式数据
echo "=== 样式统计 ==="
wc -l ./kb/styles.csv
grep -c "CSS Variable" ./kb/styles.csv || echo "0 variables"
grep -c "Utility Class" ./kb/styles.csv || echo "0 utilities"

# 检查约定数据
echo "=== 约定统计 ==="
wc -l ./kb/conventions.csv
```

### 6.2 预览数据内容

```bash
# 预览组件
echo "=== 组件示例 ==="
head -2 ./kb/components.csv | tail -1

# 预览样式
echo "=== 样式示例 ==="
head -2 ./kb/styles.csv | tail -1

# 预览约定
echo "=== 约定示例 ==="
head -2 ./kb/conventions.csv | tail -1
```

**✅ 检查清单**:
- [ ] 组件数量 > 0
- [ ] 样式数量 > 10
- [ ] 约定数量 ≥ 5
- [ ] CSV格式正确 (无语法错误)

---

## 步骤 7: 测试AI代码生成

### 7.1 第一个测试: 简单组件

**请求AI**: "创建一个显示用户头像的组件"

**AI应该执行**:
```bash
# 1. 搜索相关组件
npm run search "avatar image user" --domain components

# 2. 搜索相关样式
npm run search "image border rounded" --domain styles

# 3. 生成代码
```

**预期结果**: AI生成的代码应该:
- ✅ 使用知识库中的组件 (如果有)
- ✅ 使用正确的导入路径 (`@/components/...`)
- ✅ 使用CSS变量 (`var(--primary-color)`)
- ✅ 遵循Composition API (`<script setup>`)

### 7.2 验证生成的代码

```bash
# 假设AI生成了 UserAvatar.vue
npx kb validate -f src/components/UserAvatar.vue --framework Vue
```

**预期输出**:
```
Quality Score:
  Overall: 85/100
    - Correctness: 90/100
    - Consistency: 80/100
    - Maintainability: 85/100

Checks:
  Imports: 100.0% ✓
  Props: 100.0% ✓
  Styles: 80/100 (可能有少量硬编码)

KB Usage:
  Components from KB: 1/1 (100.0%)

Suggestions:
  1. Good job! 代码质量很高
```

**✅ 检查清单**:
- [ ] 整体分数 > 75
- [ ] 导入准确度 100%
- [ ] 使用KB组件 > 80%

---

## 步骤 8: A/B测试对比

### 8.1 创建对比版本

```bash
# 创建测试目录
mkdir -p ./kb-test

# 让AI生成两个版本:
# 1. 不使用KB (只凭记忆)
# 2. 使用KB (搜索知识库)
```

**版本A (不使用KB)**:
```vue
<!-- LoginForm-baseline.vue -->
<template>
  <div class="login">
    <input v-model="email" type="email" />
    <input v-model="password" type="password" />
    <button @click="login">Login</button>
  </div>
</template>

<script>
export default {
  data() {
    return { email: '', password: '' }
  }
}
</script>

<style>
.login { padding: 20px; }
</style>
```

**版本B (使用KB)**:
```vue
<!-- LoginForm-with-kb.vue -->
<template>
  <Card title="登录">
    <div class="flex flex-col gap-md">
      <Input v-model="email" type="email" label="邮箱" />
      <Input v-model="password" type="password" label="密码" />
      <Button type="primary" @click="handleLogin">登录</Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const email = ref('')
const password = ref('')
const handleLogin = () => { /* ... */ }
</script>
```

### 8.2 运行A/B测试

```bash
npx kb test \
  -p "创建用户登录表单" \
  -a ./kb-test/LoginForm-baseline.vue \
  -b ./kb-test/LoginForm-with-kb.vue \
  --framework Vue
```

**预期输出**:
```
═══════════════════════════════════════════════════
           A/B TEST REPORT
═══════════════════════════════════════════════════

✅ KB-enhanced version is BETTER

Quality improvement: +25-35 points
  - Correctness: +20-30
  - Consistency: +30-40
  - Maintainability: +25-35

Import Accuracy:
  Version A: 0% (没有使用项目组件)
  Version B: 100% ✓

Style Consistency:
  Version A: 40/100 (硬编码)
  Version B: 90/100 ✓

═══════════════════════════════════════════════════
```

**✅ 检查清单**:
- [ ] 质量改进 > 20分
- [ ] Version B导入准确度 100%
- [ ] Version B样式一致性 > 80

---

## 步骤 9: 长期使用和维护

### 9.1 设置自动更新

```bash
# 方式1: 添加npm script
# 在package.json中添加:
{
  "scripts": {
    "kb:update": "kb build"
  }
}

# 使用:
npm run kb:update
```

### 9.2 定期检查质量

```bash
# 每周查看统计
npx kb stats -d 7

# 每月生成报告
npx kb report -o reports/monthly-$(date +%Y-%m).txt
```

### 9.3 增量更新

```bash
# 当添加新组件时
npx kb build --merge

# 或只扫描特定目录
npx kb scan -p ./src/components/new-feature -o ./kb-temp
```

**✅ 检查清单**:
- [ ] 设置了更新脚本
- [ ] 计划每周/每月维护
- [ ] 了解增量更新方法

---

## 步骤 10: 故障排查

### 常见问题

#### Q1: 扫描时没有发现组件

**症状**:
```
📦 扫描: components
  总计: 0个组件
```

**解决方案**:
```bash
# 1. 检查路径是否正确
ls -la ./src/components/

# 2. 检查文件扩展名
find ./src/components/ -name "*.vue"

# 3. 确认框架参数
kb remove-source -n "components"
kb add-source -n "components" -p ./src/components -f Vue
kb build
```

#### Q2: CSV文件为空或只有标题

**症状**:
```bash
$ wc -l ./kb/components.csv
1 ./kb/components.csv
```

**解决方案**:
```bash
# 1. 使用详细模式查看错误
kb build -v

# 2. 检查组件文件语法
# 确保Vue组件格式正确

# 3. 手动测试提取
kb scan -p ./src/components/Button.vue -o ./test-kb
```

#### Q3: 验证分数很低

**症状**:
```
Quality Score: 45/100
```

**原因分析**:
- KB数据不完整
- 生成的代码没有使用KB
- KB数据过时

**解决方案**:
```bash
# 1. 重新构建KB
kb build

# 2. 确认AI搜索了KB
# 检查AI是否执行了: npm run search ...

# 3. 补充缺失的数据
# 手动编辑conventions.csv
```

---

## 完成检查清单

训练完成后，你应该有:

### 基础要求
- [ ] kb-config.json 配置文件
- [ ] ./kb/ 目录包含3个CSV文件
- [ ] components.csv 包含 ≥ 5个组件
- [ ] styles.csv 包含 ≥ 20个样式
- [ ] conventions.csv 包含 ≥ 5条规范

### 功能验证
- [ ] `kb list` 显示所有源
- [ ] `kb build` 成功执行
- [ ] AI可以搜索知识库
- [ ] `kb validate` 可以验证代码
- [ ] `kb test` 可以运行A/B测试

### 质量标准
- [ ] A/B测试显示质量改进 > 20分
- [ ] 验证分数 > 75分
- [ ] 导入准确度 100%
- [ ] KB组件使用率 > 80%

---

## 下一步

训练完成后,你可以:

1. **日常使用**:
   - 让AI生成代码时自动搜索KB
   - 使用 `kb validate` 验证质量

2. **持续优化**:
   - 每周运行 `kb build` 更新KB
   - 补充新的编码规范
   - 查看 `kb stats` 了解改进趋势

3. **团队协作**:
   - 分享 ./kb/ 目录
   - 创建全局KB: `kb init -g`
   - 编写团队规范文档

---

## 更多资源

- [完整Skill指南](../SKILL.md)
- [验证系统文档](./VALIDATION_SYSTEM.md)
- [Vue示例项目](../examples/vue-project/)
- [常见问题FAQ](./FAQ.md)

---

**恭喜！🎉** 你已经成功训练了知识库，现在AI可以生成符合项目规范的高质量代码了！

**版本**: v1.3.0
**最后更新**: 2026-04-08
