# 07 — 模板渲染引擎分析

## 概述

模板渲染引擎（`cli/src/utils/template.ts`，244 行）是分发层的核心。它将一份基础模板 + 平台配置 JSON 组合，生成适用于 18 个不同平台的 Skill 文件。

---

## 渲染流程

```
基础模板 (skill-content.md)          平台配置 (claude.json)
         |                                    |
         +--------------------+---------------+
                              |
                    renderSkillFile(config)
                              |
         +--------------------+-------------------+
         | 替换占位符                                |
         | {{TITLE}} -> "UI/UX Pro Max"            |
         | {{DESCRIPTION}} -> "..."                |
         | {{SCRIPT_PATH}} -> "skills/..."         |
         | {{QUICK_REFERENCE}} -> "..."            |
         | {{SKILL_OR_WORKFLOW}} -> "Skill"         |
         +--------------------+-------------------+
                              |
                    渲染 Frontmatter (可选)
                              |
                    组合成最终 SKILL.md
```

---

## 平台配置接口

```typescript
interface PlatformConfig {
  platform: string;         // "claude", "cursor", "copilot"
  displayName: string;      // "Claude Code", "Cursor"
  installType: 'full' | 'reference';
  folderStructure: {
    root: string;           // ".claude", ".github"
    skillPath: string;      // "skills/ui-ux-pro-max"
    filename: string;       // "SKILL.md" 或 "PROMPT.md"
  };
  scriptPath: string;       // "skills/ui-ux-pro-max/scripts/search.py"
  frontmatter: Record<string, string> | null;
  sections: {
    quickReference: boolean; // 是否包含速查表
  };
  title: string;
  description: string;
  skillOrWorkflow: string;  // "Skill" 或 "Workflow"
}
```

---

## 占位符系统

| 占位符 | 来源 | 示例值 |
|--------|------|--------|
| `{{TITLE}}` | `config.title` | `UI/UX Pro Max - Design Intelligence` |
| `{{DESCRIPTION}}` | `config.description` | `Comprehensive design guide...` |
| `{{SCRIPT_PATH}}` | `config.scriptPath` | `python3 skills/ui-ux-pro-max/scripts/search.py` |
| `{{QUICK_REFERENCE}}` | 条件加载 | 完整 quick-reference.md 或空字符串 |
| `{{SKILL_OR_WORKFLOW}}` | `config.skillOrWorkflow` | `Skill` 或 `Workflow` |

### Quick Reference 条件加载

- **Claude**: `sections.quickReference = true` → 包含 297 行速查表
- **其他 17 个平台**: `sections.quickReference = false` → 占位符被替换为空

### 全局安装路径重写

当使用 `--global` 时，脚本路径变为绝对路径：
```
"python3 skills/..." → "python3 ~/.claude/skills/..."
```

---

## Frontmatter 渲染

部分平台需要 YAML 头部：

```yaml
---
name: "ui-ux-pro-max"
description: "UI/UX design intelligence. 67 styles, 161 palettes..."
---
```

`renderFrontmatter()` 遍历 `config.frontmatter` 对象生成 YAML 行。

---

## 文件生成流程

```
generatePlatformFiles(targetDir, aiType, isGlobal)
    |
    ├── 1. loadPlatformConfig(aiType)
    |      从 assets/templates/platforms/{platform}.json 加载
    |
    ├── 2. 创建目录结构
    |      mkdirSync({root}/{skillPath}, {recursive: true})
    |
    ├── 3. renderSkillFile(config, isGlobal)
    |      加载 skill-content.md → 替换占位符 → 添加 frontmatter
    |
    ├── 4. 写入 SKILL.md / PROMPT.md
    |
    └── 5. copyDataAndScripts(targetSkillDir)
           复制 data/ 和 scripts/ 到 Skill 文件夹
```

---

## 模板文件结构

### skill-content.md（529 行）

主要章节：
1. **Prerequisites** — Python 安装指南
2. **How to Use This Skill** — 7 种使用场景表格
3. **Step 1**: 分析用户需求
4. **Step 2**: 生成设计系统（核心命令）
5. **Step 2b**: 持久化设计系统
6. **Step 3**: 补充搜索（域搜索）
7. **Step 4**: 技术栈指南
8. **搜索参考表**: 所有域和技术栈列表
9. **示例工作流**: 完整的端到端示例
10. **输出格式**: ASCII Box vs Markdown
11. **专业 UI 规则**: 图标、交互、对比度、布局
12. **交付前清单**: 58 项检查

### quick-reference.md（297 行，仅 Claude）

10 大规则类别，200+ 子规则：
1. 可访问性 (CRITICAL)
2. 触摸与交互 (CRITICAL)
3. 性能 (HIGH)
4. 风格选择 (HIGH)
5. 布局与响应式 (HIGH)
6. 排版与配色 (MEDIUM)
7. 动画 (MEDIUM)
8. 表单与反馈 (MEDIUM)
9. 导航模式 (HIGH)
10. 图表与数据 (LOW)

---

## 设计模式

### 策略模式（Strategy Pattern）

每个 `platforms/*.json` 是一个**策略**。模板引擎根据策略对象调整输出，而不需要为每个平台写独立代码。

### 模板方法模式（Template Method）

`skill-content.md` 定义了**算法骨架**（结构不变），`{{PLACEHOLDER}}` 是可变的**钩子点**。

### 关注点分离

- **内容** (skill-content.md) 与**配置** (*.json) 严格分离
- 添加新平台只需新增一个 JSON 文件，无需改代码
- 修改 Skill 内容只需编辑 skill-content.md，18 个平台同步更新
