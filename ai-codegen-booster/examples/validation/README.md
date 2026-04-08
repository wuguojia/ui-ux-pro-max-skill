# AI自动化验证系统 - 使用示例

本目录包含了 AI 自动化验证系统的实际使用示例。

## 示例文件

### 1. Button 组件对比

- `Button-without-KB.tsx` - 不使用知识库生成的代码
- `Button-with-KB.tsx` - 使用知识库生成的代码

### 关键差异

| 方面 | Without KB | With KB |
|------|-----------|---------|
| **导入路径** | `./Button` ❌ | `@/components/ui/Button` ✅ |
| **Props定义** | 缺少 variant, size, disabled ❌ | 完整的 props 定义 ✅ |
| **样式实现** | 硬编码颜色和尺寸 ❌ | 使用 CSS 变量 ✅ |
| **可访问性** | 无 disabled 状态 ❌ | 完整的 disabled 支持 ✅ |

## 运行 A/B 测试

```bash
# 1. 确保已安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 运行 A/B 测试
kb test \
  -p "创建可复用的 Button 组件" \
  -a examples/validation/Button-without-KB.tsx \
  -b examples/validation/Button-with-KB.tsx \
  --framework React
```

## 预期结果

```
═══════════════════════════════════════════════════
           A/B TEST REPORT
═══════════════════════════════════════════════════

Prompt: 创建可复用的 Button 组件
Time: 2026-04-08T...

───────────────────────────────────────────────────
RESULTS
───────────────────────────────────────────────────

✅ KB-enhanced version is BETTER

Quality improvement: +30+ points
  - Correctness: +20.0
  - Consistency: +50.0  (显著减少硬编码)
  - Maintainability: +25.0
  - Issues reduced: 6

───────────────────────────────────────────────────
DETAILED COMPARISON
───────────────────────────────────────────────────

Style Consistency:
  Version A: 50/100 (5 hardcoded)  ❌
  Version B: 100/100 (0 hardcoded) ✅
  Change: +50

KB Usage:
  Components from KB: 1/1
  Usage rate: 100.0%

═══════════════════════════════════════════════════
```

## 单独验证文件

你也可以单独验证每个文件：

```bash
# 验证 without-KB 版本
kb validate -f examples/validation/Button-without-KB.tsx

# 验证 with-KB 版本
kb validate -f examples/validation/Button-with-KB.tsx
```

## 学习要点

通过这个示例，你可以学习到：

1. **导入路径的重要性**: KB 确保使用正确的项目导入路径
2. **Props 完整性**: KB 提供完整的组件 API 定义
3. **样式一致性**: KB 推荐使用项目样式变量而非硬编码
4. **可访问性**: KB 包含完整的状态处理（如 disabled）
5. **代码质量量化**: 通过具体分数了解代码质量差异

## 下一步

1. 创建你自己的测试案例
2. 构建项目知识库: `kb build`
3. 定期运行 A/B 测试验证 KB 效果
4. 使用 `kb stats` 查看长期质量趋势
