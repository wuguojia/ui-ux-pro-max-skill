# AI 代码生成增强器 - 训练素材提取指南

## 📋 目标

你的任务是从用户提供的源文件（CSS、组件源码、HTML、文档）中提取结构化训练素材，生成 CSV 格式的知识库，供后续 AI 代码生成时参考。

---

## 🎯 支持的提取类型

### 1. CSS/样式提取

**输入格式**:
- CSS 文件 (`.css`)
- SCSS 文件 (`.scss`)
- Tailwind 配置 (`tailwind.config.ts`)

**输出**: `styles.csv`

**Schema**:
```csv
No,Style_Type,Name,Value,Category,Usage,Example,Keywords
```

**字段说明**:
- `No`: 序号 (number, required)
- `Style_Type`: CSS Variable | Utility Class | Theme Token (string, required)
- `Name`: 变量名或类名 (string, required)
- `Value`: 值 (string, required)
- `Category`: Color | Spacing | Typography | Shadow | Layout (string, required)
- `Usage`: 使用场景说明 (string, required)
- `Example`: 使用示例代码 (string, required)
- `Keywords`: 关键词，逗号分隔，无空格 (string, required)

**提取步骤**:

1. **识别 CSS 变量** (`:root` 选择器中的 `--variable-name`)
   ```css
   :root {
     --primary-color: #3b82f6;
     --spacing-4: 1rem;
   }
   ```

   提取为:
   ```csv
   1,CSS Variable,--primary-color,#3b82f6,Color,Primary brand color for buttons and links,var(--primary-color),primary,color,brand,blue
   2,CSS Variable,--spacing-4,1rem,Spacing,Standard spacing unit,padding: var(--spacing-4),spacing,padding,margin,gap
   ```

2. **识别工具类** (单个类选择器，如 `.bg-primary`)
   ```css
   .bg-primary {
     background-color: var(--primary-color);
   }
   ```

   提取为:
   ```csv
   3,Utility Class,bg-primary,background-color: var(--primary-color),Color,Primary background color,className="bg-primary",background,primary,color,utility
   ```

3. **分类规则**:
   - **Color**: 包含 `color`, `bg`, `text` 或值是颜色 (`#`, `rgb`, `hsl`)
   - **Spacing**: 包含 `spacing`, `gap`, `padding`, `margin`
   - **Typography**: 包含 `font`, `text-size`
   - **Shadow**: 包含 `shadow`
   - **Layout**: 其他

**示例输出** (`styles-draft.csv`):
```csv
No,Style_Type,Name,Value,Category,Usage,Example,Keywords
1,CSS Variable,--primary,"hsl(221.2 83.2% 53.3%)",Color,Primary brand color,var(--primary),primary,color,brand
2,CSS Variable,--spacing-4,"1rem (16px)",Spacing,Standard gap between elements,className="gap-4",spacing,gap,padding
3,Utility Class,bg-primary,background-color: hsl(var(--primary)),Color,Background for primary elements,className="bg-primary",background,primary,button
```

---

### 2. 组件提取

**输入格式**:
- React TypeScript 文件 (`.tsx`)
- React JavaScript 文件 (`.jsx`)

**输出**: `components.csv`

**Schema**:
```csv
No,Component_Name,Framework,Import_Path,Props,Props_Types,Default_Props,Description,Usage_Example,Category,Keywords
```

**字段说明**:
- `No`: 序号 (number, required)
- `Component_Name`: 组件名 (string, required)
- `Framework`: React | Vue | Svelte (string, required)
- `Import_Path`: 导入路径 (string, required)
- `Props`: Props 列表，逗号分隔 (string, optional)
- `Props_Types`: TypeScript 类型定义 (string, optional)
- `Default_Props`: 默认值 (string, optional)
- `Description`: 组件描述 (string, required)
- `Usage_Example`: 使用示例 (string, required)
- `Category`: UI | Layout | Form | Data | Navigation (string, required)
- `Keywords`: 关键词，逗号分隔，无空格 (string, required)

**提取步骤**:

1. **识别组件名称** (首字母大写的函数或类)
   ```tsx
   export function Button() { ... }
   export const Card = () => { ... }
   ```

2. **提取 Props 定义**
   ```tsx
   interface ButtonProps {
     variant: 'primary' | 'secondary';
     size?: 'sm' | 'lg';
     disabled?: boolean;
   }

   export function Button({ variant = 'primary', size = 'lg' }: ButtonProps) {
     return <button>...</button>;
   }
   ```

   提取为:
   ```csv
   variant,size,disabled
   ```

   ```csv
   ButtonProps { variant: 'primary'|'secondary', size?: 'sm'|'lg', disabled?: boolean }
   ```

   ```csv
   variant='primary' size='lg'
   ```

3. **推断导入路径**
   - 文件路径: `src/components/ui/button.tsx`
   - 导入路径: `@/components/ui/button`

4. **生成使用示例**
   ```tsx
   <Button variant="primary" size="lg">Click Me</Button>
   ```

**示例输出** (`components-draft.csv`):
```csv
No,Component_Name,Framework,Import_Path,Props,Props_Types,Default_Props,Description,Usage_Example,Category,Keywords
1,Button,React,@/components/ui/button,"variant,size,disabled","ButtonProps { variant: 'primary'|'secondary', size?: 'sm'|'lg', disabled?: boolean }","variant='primary' size='lg'",Primary action button with multiple variants,"<Button variant='outline' size='lg'>Click</Button>",UI,"button,action,cta,primary,click"
2,Card,React,@/components/ui/card,"title,children,className","CardProps { title?: string, children: ReactNode, className?: string }","","Container component for grouping related content","<Card title='User Info'><p>Name: John</p></Card>",Layout,"card,container,box,group,layout"
```

---

### 3. 约定提取

**输入格式**:
- Markdown 文档 (`.md`)
- 代码注释
- 现有代码库（分析命名模式）

**输出**: `conventions.csv`

**Schema**:
```csv
No,Convention_Type,Rule,Good_Example,Bad_Example,Reason,Severity,Keywords
```

**字段说明**:
- `No`: 序号 (number, required)
- `Convention_Type`: Naming | File Structure | Import Order | Code Style (string, required)
- `Rule`: 规则描述 (string, required)
- `Good_Example`: 正确示例 (string, required)
- `Bad_Example`: 错误示例 (string, required)
- `Reason`: 原因说明 (string, required)
- `Severity`: Must | Should | Nice-to-have (string, required)
- `Keywords`: 关键词 (string, required)

**提取步骤**:

1. **从文档提取** (查找 "✅ DO" 和 "❌ DON'T" 模式)
   ```markdown
   ## Naming Conventions

   ✅ DO: Use PascalCase for component files: `Button.tsx`
   ❌ DON'T: Use kebab-case: `button.tsx`

   **Reason**: Matches React component naming convention
   ```

   提取为:
   ```csv
   1,Naming,Component files use PascalCase,Button.tsx,button.tsx,Matches React component naming convention,Must,naming,component,file,pascal
   ```

2. **从代码分析提取** (统计命名模式)
   - 分析所有组件文件名
   - 统计 PascalCase vs kebab-case vs camelCase
   - 如果 95% 使用 PascalCase，记录为约定

**示例输出** (`conventions-draft.csv`):
```csv
No,Convention_Type,Rule,Good_Example,Bad_Example,Reason,Severity,Keywords
1,Naming,Component files use PascalCase,Button.tsx,button.tsx,Matches React naming convention,Must,naming,component,file
2,Import Order,Group imports: React → External → Internal,"import React from 'react';\nimport { cn } from '@/lib/utils';","import { cn } from '@/lib/utils';\nimport React from 'react';",Improves readability,Should,import,order,organization
3,Code Style,Props destructuring in function params,"function Button({ variant }) { }","function Button(props) { const { variant } = props; }",More concise and idiomatic,Should,props,destructuring,style
```

---

## ✅ 质量检查清单

生成 CSV 前，请自检：

- [ ] **所有必填字段已填写** - 检查 `required: true` 的字段
- [ ] **Keywords 无空格** - 正确: `button,action,cta` | 错误: `button, action, cta`
- [ ] **No 字段从 1 开始递增** - 1, 2, 3, ...
- [ ] **类别使用标准值** - Color, Spacing, Typography (不是 color, spacing)
- [ ] **示例代码格式正确** - 可复制粘贴直接使用
- [ ] **无重复条目** - 同一个组件/样式只提取一次
- [ ] **CSV 格式正确** - 使用双引号包裹含逗号的字段

---

## 🚫 常见错误

### ❌ 错误 1: Keywords 有空格
```csv
Keywords: "button, action, click"  ❌
Keywords: "button,action,click"    ✅
```

### ❌ 错误 2: 缺少必填字段
```csv
1,Button,React,,,,Click button,,UI  ❌ (缺少 Import_Path, Description, Usage_Example)
1,Button,React,@/components/ui/button,,,Primary button,<Button />,UI  ✅
```

### ❌ 错误 3: No 字段不是数字
```csv
No,Component_Name,...
one,Button,...  ❌
1,Button,...     ✅
```

### ❌ 错误 4: 类别值不规范
```csv
Category: "color"       ❌ (小写)
Category: "Color"       ✅ (首字母大写)
Category: "colors"      ❌ (单数形式)
Category: "Color"       ✅
```

---

## 📝 完整工作流程示例

### 场景: 提取 shadcn/ui Button 组件

**输入文件**: `button.tsx`
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps {
  variant?: "default" | "destructive" | "outline"
  size?: "default" | "sm" | "lg"
  disabled?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }))}
        ref={ref}
        {...props}
      />
    )
  }
)

export { Button }
```

**提取步骤**:

1. **识别组件**: `Button`
2. **提取 Props**: `variant`, `size`, `disabled`
3. **提取类型**: `ButtonProps { variant?: "default"|"destructive"|"outline", size?: "default"|"sm"|"lg", disabled?: boolean }`
4. **默认值**: `variant="default" size="default"`
5. **推断导入**: `@/components/ui/button`
6. **生成示例**: `<Button variant="outline" size="lg">Click Me</Button>`
7. **分类**: `UI`
8. **Keywords**: `button,action,cta,click,primary`

**输出 CSV** (`components-draft.csv`):
```csv
No,Component_Name,Framework,Import_Path,Props,Props_Types,Default_Props,Description,Usage_Example,Category,Keywords
1,Button,React,@/components/ui/button,"variant,size,disabled","ButtonProps { variant?: 'default'|'destructive'|'outline', size?: 'default'|'sm'|'lg', disabled?: boolean }","variant='default' size='default'",Button component with multiple variants for different actions,"<Button variant='outline' size='lg'>Click Me</Button>",UI,"button,action,cta,click,primary,outline,destructive"
```

---

## 🎯 成功标准

生成的 CSV 应该满足：

1. **可验证性**: `npm run validate <file> --schema <domain>` 通过
2. **可导入性**: `npm run import <file> --domain <domain>` 成功
3. **可搜索性**: AI 能通过关键词找到相关条目
4. **可使用性**: 示例代码可以直接复制使用

---

## 💡 提示

- **优先提取高频使用的组件/样式** - 这些最有价值
- **保持一致性** - 使用相同的命名和格式规则
- **提供上下文** - Description 应该清楚说明何时使用
- **示例要实用** - 使用真实场景的示例代码
- **关键词要全面** - 包含所有可能的搜索词

---

## 📚 后续步骤

生成 CSV 后，用户将执行：

```bash
# 1. 验证
npm run validate components-draft.csv --schema components

# 2. 预览导入
npm run import components-draft.csv --domain components --dry-run

# 3. 正式导入
npm run import components-draft.csv --domain components

# 4. 测试搜索
npm run search "button component" --domain components
```

AI 在生成代码时会自动搜索知识库，使用你提取的信息！
