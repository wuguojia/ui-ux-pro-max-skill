# Vue 3 示例项目

这是一个用于演示 AI Codegen Booster 的 Vue 3 示例项目。

## 项目结构

```
vue-project/
├── src/
│   ├── components/      # Vue组件
│   │   ├── Button.vue  # 按钮组件
│   │   ├── Input.vue   # 输入框组件
│   │   └── Card.vue    # 卡片组件
│   └── styles/         # 样式文件
│       ├── variables.css   # CSS变量
│       └── utilities.css   # 工具类
└── package.json
```

## 组件说明

### Button.vue
- **Props**: type, size, disabled, loading
- **Events**: click
- **Slots**: default, icon
- **特点**: 支持多种类型、尺寸、加载状态

### Input.vue
- **Props**: modelValue, type, label, placeholder, disabled, required, error
- **Events**: update:modelValue, focus, blur
- **特点**: 支持v-model、标签、错误提示

### Card.vue
- **Props**: title, bordered, hoverable, padding
- **Slots**: header, default, footer
- **特点**: 灵活的卡片布局

## 样式系统

### CSS变量 (variables.css)
- 颜色: primary, secondary, error, success等
- 间距: xs, sm, md, lg, xl, 2xl
- 字体: sans, mono, text sizes
- 圆角: sm, md, lg, xl, full
- 阴影: sm, md, lg, xl

### 工具类 (utilities.css)
- Layout: flex, flex-col, items-center等
- Spacing: p-*, m-*等
- Typography: text-*, font-*等
- Borders: rounded, rounded-lg等
- Shadows: shadow, shadow-lg等

## 使用此项目训练知识库

```bash
# 1. 进入示例项目目录
cd examples/vue-project

# 2. 初始化知识库
kb init

# 3. 添加组件源
kb add-source -n "components" -p ./src/components -f Vue

# 4. 添加样式源
kb add-source -n "styles" -p ./src/styles

# 5. 构建知识库
kb build -v

# 6. 查看生成的知识库
ls -la kb/
# - components.csv (3个组件)
# - styles.csv (约50个样式)
```

## 生成的知识库数据

### components.csv 将包含:
- Button组件的所有Props、事件、插槽
- Input组件的双向绑定、验证功能
- Card组件的布局结构

### styles.csv 将包含:
- 所有CSS变量 (颜色、间距、字体等)
- 所有工具类 (flex, p-md, text-lg等)

## 使用知识库生成代码

训练完成后，AI可以生成符合项目规范的代码：

```vue
<template>
  <Card title="用户信息" hoverable>
    <div class="flex flex-col gap-md">
      <Input
        v-model="name"
        label="姓名"
        placeholder="请输入姓名"
        required
      />
      <Input
        v-model="email"
        type="email"
        label="邮箱"
        placeholder="请输入邮箱"
        required
      />
      <Button
        type="primary"
        size="lg"
        :loading="isSubmitting"
        @click="handleSubmit"
      >
        提交
      </Button>
    </div>
  </Card>
</template>
```

所有组件、Props、样式都来自知识库！
