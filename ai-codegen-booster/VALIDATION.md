# AI Codegen Booster v1.3 - 验证系统

## 新增功能

AI Codegen Booster v1.3 引入了强大的**AI 自动化验证系统**，用于验证生成的代码质量并追踪改进效果。

## 核心模块

### 1. 代码质量验证器 (Code Validator)

自动验证生成代码的质量，检查以下维度：

- **Import 路径正确性** - 检查是否使用项目的正确导入路径
- **Props 使用准确性** - 验证组件 props 是否符合定义
- **样式一致性** - 检测硬编码样式，鼓励使用项目变量
- **类型安全** - TypeScript 类型检查
- **编译正确性** - 代码是否可编译

**质量评分** (0-100):
- **正确性** - 导入、props、类型的准确度
- **一致性** - 样式使用的一致性
- **可维护性** - 代码的可维护性

### 2. A/B 测试工具 (A/B Tester)

对比使用知识库 (KB) 前后生成代码的质量差异：

- 并排对比两个版本
- 计算质量改进百分比
- 生成详细的对比报告
- 自动判断赢家 (A vs B vs Tie)

### 3. 质量追踪器 (Quality Tracker)

长期追踪代码生成质量：

- 记录每次代码生成的质量评分
- 统计平均质量改进率
- 生成 30 天趋势图
- 导出详细质量报告

## CLI 命令

### 验证代码质量

```bash
npm run kb validate -- -f <文件路径>
# 或
npm run kb validate -- -f src/components/Button.tsx --framework React
```

输出示例：
```
Quality Score:
  Overall: 85/100
    - Correctness: 90/100
    - Consistency: 80/100
    - Maintainability: 85/100

Checks:
  Imports: 100.0% (0 issues)
  Props: 90.0% (1 issues)
  Styles: 80/100 (2 hardcoded)

KB Usage:
  Components from KB: 3/4 (75.0%)

Suggestions:
  1. Replace 2 hardcoded style(s) with project variables
```

### 运行 A/B 测试

```bash
npm run kb test -- \
  -p "创建一个按钮组件" \
  -a ./code-without-kb.tsx \
  -b ./code-with-kb.tsx \
  --framework React
```

输出示例：
```
═══════════════════════════════════════════════════
           A/B TEST REPORT
═══════════════════════════════════════════════════

Prompt: 创建一个按钮组件
Time: 2024-01-15T10:30:00.000Z

───────────────────────────────────────────────────
RESULTS
───────────────────────────────────────────────────

✅ KB-enhanced version is BETTER

Quality improvement: +15.5 points
  - Correctness: +10.0
  - Consistency: +20.0
  - Maintainability: +16.5
  - Issues reduced: 5

───────────────────────────────────────────────────
DETAILED COMPARISON
───────────────────────────────────────────────────

Quality Scores:
  Version A (no KB):  70/100
  Version B (w/ KB):  85.5/100
  Improvement:        +15.5

Import Accuracy:
  Version A: 80.0% (2 issues)
  Version B: 100.0% (0 issues)
  Change: +20.0%

...
```

### 查看统计数据

```bash
npm run kb stats
```

输出示例：
```
📊 Quality Statistics

Overview:
  Total Generations: 50
    - With KB: 30 (60.0%)
    - Without KB: 20 (40.0%)

Average Quality Scores:
  Overall: 82.5/100
  With KB: 88.2/100
  Without KB: 73.4/100
  Improvement: +20.2%

Top Issues:
  1. Import path mismatch... (15x)
  2. Missing required props... (12x)
  ...

Trends (last 30 days):
  Recent activity:
    2024-01-10: 85.0/100 (5 gen)
    2024-01-11: 87.5/100 (8 gen)
    ...
```

### 生成质量报告

```bash
npm run kb report -- -o ./quality-report.txt
```

生成包含以下内容的完整报告：
- 总体统计
- 30 天趋势
- 最近的代码生成记录
- A/B 测试结果

## 在代码中使用

### 验证器

```typescript
import { CodeValidator } from 'ai-codegen-booster/kb';

const validator = new CodeValidator({ kb, framework: 'React' });
const result = await validator.validate(code);

console.log('Quality Score:', result.qualityScore.overall);
console.log('Suggestions:', result.suggestions);
```

### A/B 测试

```typescript
import { ABTester } from 'ai-codegen-booster/kb';

const tester = new ABTester({ kb });
const result = await tester.runTest(
  'Create a button component',
  codeWithoutKB,
  codeWithKB,
  'React'
);

console.log('Winner:', result.winner);
console.log('Improvement:', result.improvements.qualityScoreImprovement);
```

### 质量追踪

```typescript
import { QualityTracker } from 'ai-codegen-booster/kb';

const tracker = new QualityTracker();
await tracker.init();

// 记录生成
await tracker.recordGeneration(prompt, validation, usedKB);

// 查看统计
const stats = tracker.getStatistics();
console.log('Average score:', stats.averageQualityScore);

// 导出报告
await tracker.exportReport('./report.txt');
```

## 数据存储

验证数据存储在 `.kb/quality-tracking/` 目录：

```
.kb/
└── quality-tracking/
    ├── generations.json    # 所有生成记录
    └── ab-tests.json       # A/B 测试结果
```

## 验证维度

### 1. Import 检查

- ✅ 导入路径与 KB 匹配
- ❌ 使用错误的导入路径
- ❌ 导入不存在的组件

### 2. Props 检查

- ✅ 必需 props 都已提供
- ❌ 缺少必需 props
- ❌ 使用了无效的 props

### 3. 样式检查

- ✅ 使用项目样式变量/工具类
- ❌ 硬编码颜色 (#ff0000)
- ❌ 硬编码尺寸 (16px, 1rem)

### 4. 类型检查

- ✅ TypeScript 编译通过
- ❌ 类型错误

## 质量评分算法

```
正确性 = (Import准确率 + Props准确率 + 类型检查) / 3

一致性 = 样式评分 (100 - 硬编码数量 × 10)

可维护性 = 使用KB样式 ? 50 : 0 + (50 - 硬编码数量 × 5)

总分 = (正确性 + 一致性 + 可维护性) / 3
```

## 最佳实践

1. **定期运行验证** - 在每次生成代码后立即验证
2. **进行 A/B 测试** - 对比有无 KB 的效果
3. **追踪长期趋势** - 每周查看统计数据
4. **修复常见问题** - 根据"Top Issues"优化 KB
5. **导出报告** - 定期生成报告用于团队分享

## 未来计划

- [ ] 自动化扫描 (基于 git diff)
- [ ] 实时质量监控
- [ ] 更多验证维度 (性能、安全性)
- [ ] Web UI 可视化
- [ ] CI/CD 集成

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT
