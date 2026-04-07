# 07 — 模板渲染引擎

## 概述

模板渲染引擎负责从一份 Skill 内容模板 + 平台配置 JSON，生成针对特定 AI 平台的 Skill 文件。

---

## 架构

```
输入:
  skill-content.md (含 {{PLACEHOLDER}})
  + platform.json (平台配置)
  + quick-reference.md (可选段落)

↓ 渲染引擎 ↓

输出:
  SKILL.md (平台特定的完整 Skill 文件)
```

---

## 占位符系统

### 支持的占位符

| 占位符 | 来源 | 说明 | 示例值 |
|--------|------|------|--------|
| `{{TITLE}}` | platform.json → title | Skill 标题 | "UI/UX Pro Max - Design Intelligence" |
| `{{DESCRIPTION}}` | platform.json → description | 详细描述 | "Comprehensive design guide..." |
| `{{SCRIPT_PATH}}` | platform.json → scriptPath | 搜索脚本路径 | "skills/ui-ux-pro-max/scripts/search.py" |
| `{{SKILL_OR_WORKFLOW}}` | platform.json → skillOrWorkflow | 平台术语 | "Skill" 或 "Workflow" |
| `{{QUICK_REFERENCE}}` | quick-reference.md 文件内容 | 速查表（可选） | 297 行规则内容，或空 |

### 模板示例

```markdown
---
{{FRONTMATTER}}
---

# {{TITLE}}

{{DESCRIPTION}}

## How to Use This {{SKILL_OR_WORKFLOW}}

### Step 1: Search
\`\`\`bash
python3 {{SCRIPT_PATH}} "<query>" --domain <domain>
\`\`\`

### Quick Reference
{{QUICK_REFERENCE}}
```

### 渲染逻辑

```python
def render_skill_file(template: str, config: dict, quick_ref: str = "") -> str:
    """
    渲染 Skill 文件模板。

    Args:
        template: skill-content.md 的原始内容
        config: platform.json 解析后的字典
        quick_ref: quick-reference.md 的内容（可选）

    Returns:
        渲染后的完整 Markdown 字符串
    """
    result = template

    # 1. 替换简单占位符
    result = result.replace("{{TITLE}}", config["title"])
    result = result.replace("{{DESCRIPTION}}", config["description"])
    result = result.replace("{{SCRIPT_PATH}}", config["scriptPath"])
    result = result.replace("{{SKILL_OR_WORKFLOW}}", config["skillOrWorkflow"])

    # 2. 条件替换: Quick Reference
    if config.get("sections", {}).get("quickReference", False) and quick_ref:
        result = result.replace("{{QUICK_REFERENCE}}", quick_ref)
    else:
        result = result.replace("{{QUICK_REFERENCE}}", "")

    # 3. 渲染 Frontmatter
    if config.get("frontmatter"):
        fm_lines = ["---"]
        for key, value in config["frontmatter"].items():
            fm_lines.append(f'{key}: "{value}"')
        fm_lines.append("---")
        frontmatter = "\n".join(fm_lines)
        result = result.replace("{{FRONTMATTER}}", frontmatter)
    else:
        # 移除 frontmatter 占位符和分隔线
        result = re.sub(r'---\s*\n{{FRONTMATTER}}\s*\n---\s*\n', '', result)

    # 4. 全局路径重写 (Global 安装)
    if is_global:
        result = result.replace(
            f"python3 {config['scriptPath']}",
            f"python3 ~/.{config['folderStructure']['root']}/{config['scriptPath']}"
        )

    return result
```

---

## 平台配置 JSON Schema

```typescript
interface PlatformConfig {
    /** 平台标识符 */
    platform: string;

    /** 人类可读的平台名称 */
    displayName: string;

    /** 安装类型: full=完整(数据+脚本), reference=仅参考文件 */
    installType: 'full' | 'reference';

    /** 文件夹结构配置 */
    folderStructure: {
        /** 根文件夹名 (例: ".claude", ".cursor") */
        root: string;
        /** Skill 子路径 (例: "skills/my-skill") */
        skillPath: string;
        /** 文件名 (例: "SKILL.md", "skill.md") */
        filename: string;
    };

    /** 搜索脚本的相对路径 */
    scriptPath: string;

    /** YAML Frontmatter (null 表示不添加) */
    frontmatter: Record<string, string> | null;

    /** 可选段落控制 */
    sections: {
        /** 是否包含 Quick Reference 段落 */
        quickReference: boolean;
    };

    /** Skill 标题 */
    title: string;

    /** Skill 描述 */
    description: string;

    /** 平台术语: "Skill" 或 "Workflow" */
    skillOrWorkflow: string;
}
```

### 配置示例

```json
{
    "platform": "claude",
    "displayName": "Claude Code",
    "installType": "full",
    "folderStructure": {
        "root": ".claude",
        "skillPath": "skills/{your-skill}",
        "filename": "SKILL.md"
    },
    "scriptPath": "skills/{your-skill}/scripts/search.py",
    "frontmatter": {
        "name": "{your-skill}",
        "description": "Your skill description"
    },
    "sections": {
        "quickReference": true
    },
    "title": "Your Skill Title",
    "description": "Detailed description of what this skill does...",
    "skillOrWorkflow": "Skill"
}
```

---

## 文件生成流程

### 单平台生成

```typescript
function generatePlatformFiles(
    targetDir: string,
    aiType: AIType,
    isGlobal: boolean
): string[] {
    // 1. 加载平台配置
    const config = loadPlatformConfig(aiType);

    // 2. 渲染 Skill 文件
    const skillContent = renderSkillFile(config, isGlobal);

    // 3. 确定输出路径
    const outputDir = path.join(
        targetDir,
        config.folderStructure.root,
        config.folderStructure.skillPath
    );
    const outputFile = path.join(outputDir, config.folderStructure.filename);

    // 4. 创建目录
    fs.mkdirSync(outputDir, { recursive: true });

    // 5. 写入 Skill 文件
    fs.writeFileSync(outputFile, skillContent, 'utf-8');

    // 6. 复制数据和脚本（full 模式）
    if (config.installType === 'full') {
        copyDataAndScripts(outputDir);
    }

    return [outputDir];
}
```

### 全平台生成

```typescript
function generateAllPlatformFiles(
    targetDir: string,
    isGlobal: boolean
): string[] {
    const allDirs: string[] = [];
    for (const aiType of ALL_AI_TYPES) {
        const dirs = generatePlatformFiles(targetDir, aiType, isGlobal);
        allDirs.push(...dirs);
    }
    return allDirs;
}
```

---

## 添加新平台

**零核心代码修改**，只需 3 步：

### Step 1: 创建平台配置

```bash
cp templates/platforms/cursor.json templates/platforms/newplatform.json
```

编辑 `newplatform.json`：
```json
{
    "platform": "newplatform",
    "displayName": "New Platform",
    "folderStructure": {
        "root": ".newplatform",
        "skillPath": "skills/{your-skill}",
        "filename": "SKILL.md"
    },
    ...
}
```

### Step 2: 注册类型

```typescript
// types/index.ts
type AIType = '...' | 'newplatform';
const AI_TYPES = [..., 'newplatform'];
```

### Step 3: 添加检测

```typescript
// utils/detect.ts
const DETECTION_MAP: Record<string, AIType> = {
    ...
    '.newplatform': 'newplatform',
};
```

完成！新平台自动获得完整安装能力。
