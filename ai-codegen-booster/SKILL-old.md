# AI 代码生成增强器 Skill

> 本 Skill 让 AI 能够访问项目特定的组件、样式和编码规范，生成高质量的代码。

---

## 🎯 何时使用

当用户要求生成以下内容时，**必须先搜索知识库**：

- ✅ UI 组件代码
- ✅ 页面布局
- ✅ 表单实现
- ✅ 样式应用
- ✅ 任何涉及项目组件的代码

---

## 🔍 搜索命令

### 查询组件
```bash
npm run search "Button component" --domain components
npm run search "form input" --domain components
```

### 查询样式
```bash
npm run search "primary color" --domain styles
npm run search "spacing" --domain styles
```

### 查询约定
```bash
npm run search "naming convention" --domain conventions
npm run search "file structure" --domain conventions
```

---

## 📋 工作流程

### 标准代码生成流程

1. **理解需求** - 分析用户想要什么
2. **搜索组件** - 查找相关组件和它们的 API
3. **搜索样式** - 查找颜色、间距等样式 tokens
4. **检查约定** - 了解命名和结构规范
5. **生成代码** - 基于知识库信息生成代码
6. **验证** - 确保符合项目规范

---

## 💡 示例

### 示例 1: 创建登录表单

**用户请求**: "创建一个登录表单"

**第 1 步**: 搜索相关组件
```bash
npm run search "form input button" --domain components
```

**第 2 步**: 搜索布局和样式
```bash
npm run search "spacing layout" --domain styles
```

**第 3 步**: 检查约定
```bash
npm run search "form naming" --domain conventions
```

**第 4 步**: 生成代码（基于搜索结果）
```tsx
import { Button } from '@/components/ui/button';  // ← 从知识库获取导入路径
import { Input } from '@/components/ui/input';    // ← 从知识库获取

export function LoginForm() {
  return (
    <form className="space-y-4">              {/* ← 使用项目的 spacing-4 */}
      <Input
        type="email"
        placeholder="Email"                   {/* ← 使用正确的 props */}
        className="w-full"
      />
      <Input
        type="password"
        placeholder="Password"
      />
      <Button variant="primary" size="lg">   {/* ← 使用正确的 variant 和 size */}
        Login
      </Button>
    </form>
  );
}
```

---

### 示例 2: 创建卡片布局

**用户请求**: "创建一个用户信息卡片"

**第 1 步**: 搜索卡片组件
```bash
npm run search "card component" --domain components
```

**第 2 步**: 生成代码
```tsx
import { Card } from '@/components/ui/card';      // ← 从知识库获取

export function UserCard({ user }: { user: User }) {
  return (
    <Card title={user.name}>                      {/* ← 使用 title prop */}
      <p className="text-lg">{user.email}</p>     {/* ← 使用样式 token */}
      <p>{user.role}</p>
    </Card>
  );
}
```

---

## ⚠️ 重要规则

### 必须遵守

1. **总是使用知识库中的组件** - 不要自己创建已有的组件
2. **使用正确的导入路径** - 从搜索结果获取 Import_Path
3. **使用正确的 Props** - 从搜索结果获取 Props 和类型
4. **遵循约定** - 检查 conventions 域了解命名和结构规范
5. **使用项目的样式系统** - 不要硬编码颜色和间距

### 常见错误

❌ **错误**: 硬编码样式
```tsx
<button style={{ backgroundColor: '#3b82f6' }}>Click</button>
```

✅ **正确**: 使用组件和样式 token
```tsx
import { Button } from '@/components/ui/button';
<Button variant="primary">Click</Button>
```

❌ **错误**: 错误的导入路径
```tsx
import { Button } from './components/Button';
```

✅ **正确**: 使用知识库中的路径
```tsx
import { Button } from '@/components/ui/button';
```

❌ **错误**: 错误的 Props
```tsx
<Button type="primary">Click</Button>
```

✅ **正确**: 使用正确的 Props 名称
```tsx
<Button variant="primary">Click</Button>
```

---

## 🔄 更新知识库

如果用户添加了新组件或修改了样式，他们会：

1. 提取新数据
2. 验证
3. 导入到知识库
4. 之后你就能访问新的信息

---

## 📊 知识库域名

| 域名 | 内容 | 用途 |
|------|------|------|
| `components` | UI 组件 | 查找组件 API、Props、使用示例 |
| `styles` | 样式系统 | 查找颜色、间距、字体等 token |
| `conventions` | 编码规范 | 查找命名、结构、风格约定 |

---

## 💡 提示

- **优先搜索** - 生成代码前总是先搜索
- **精确关键词** - 使用具体的关键词（如 "primary button" 而不是 "button"）
- **组合搜索** - 可以进行多次搜索获取不同信息
- **遵循示例** - 搜索结果中的 Usage_Example 是最佳实践
- **保持一致** - 使用相同的模式和风格

---

## 🚀 开始使用

现在你可以开始使用知识库生成高质量的项目代码了！

记住：**搜索 → 理解 → 生成 → 验证**
