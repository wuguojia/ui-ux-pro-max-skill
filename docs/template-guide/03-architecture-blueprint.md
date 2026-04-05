# 03 — 架构蓝图

## 通用 Skill 架构

```
my-skill/
├── src/my-skill/                 # 源代码 (Source of Truth)
│   ├── data/                     # 知识库
│   │   ├── domain-a.csv          # 域 A 数据
│   │   ├── domain-b.csv          # 域 B 数据
│   │   ├── reasoning.csv         # 推理规则 (可选)
│   │   └── stacks/               # 技术栈专属数据 (可选)
│   │       ├── react.csv
│   │       └── vue.csv
│   ├── scripts/
│   │   ├── core.py               # BM25 搜索引擎
│   │   ├── search.py             # CLI 入口
│   │   └── generator.py          # 综合生成器 (可选)
│   └── templates/
│       ├── base/
│       │   └── skill-content.md  # Skill 模板
│       └── platforms/
│           ├── claude.json       # 平台配置 x N
│           └── ...
├── cli/                          # CLI 安装工具
│   ├── src/
│   └── assets/                   # 打包资源
├── .claude/skills/my-skill/      # 开发用 (symlink)
└── skill.json                    # Skill 元数据
```

---

## 层次划分

### Layer 1: 数据层 (Knowledge)

```
┌──────────────────────────────────────┐
│            数据层 (CSV)               │
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ 主域数据   │  │ 技术栈数据        │  │
│  │ domain.csv│  │ stacks/*.csv    │  │
│  └──────────┘  └──────────────────┘  │
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ 推理规则   │  │ 辅助数据          │  │
│  │ reason.csv│  │ (icons, fonts...)│  │
│  └──────────┘  └──────────────────┘  │
└──────────────────────────────────────┘
```

**接口**: 标准 CSV 文件，UTF-8 编码

### Layer 2: 逻辑层 (Engine)

```
┌──────────────────────────────────────┐
│            逻辑层 (Python)            │
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ BM25     │  │ 域自动检测        │  │
│  │ 搜索引擎  │  │ detect_domain()  │  │
│  └──────────┘  └──────────────────┘  │
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ 推理引擎  │  │ 输出格式化        │  │
│  │ (可选)    │  │ ASCII/Markdown   │  │
│  └──────────┘  └──────────────────┘  │
└──────────────────────────────────────┘
```

**接口**:
```bash
python3 search.py "<query>" --domain <domain> [--max-results N]
python3 search.py "<query>" --stack <stack>
python3 search.py "<query>" --generate [-p "Name"] [--persist]
```

### Layer 3: 表现层 (Skill File)

```
┌──────────────────────────────────────┐
│          表现层 (Markdown)            │
│                                      │
│  Frontmatter (YAML)                  │
│  + Skill 说明                        │
│  + 使用步骤                           │
│  + 搜索命令参考                       │
│  + 最佳实践规则                       │
│  + Quick Reference (可选)            │
└──────────────────────────────────────┘
```

**接口**: AI 助手读取 Markdown，按指令执行搜索

---

## 数据流

```
用户请求 "做一个 X"
    |
    v
AI 读取 SKILL.md，理解工作流
    |
    v
AI 执行: python3 search.py "X" --domain product
    |
    v
core.py: BM25 搜索 products.csv → 返回最匹配的产品类型
    |
    v
AI 执行: python3 search.py "X" --generate -p "Project"
    |
    v
generator.py:
  1. 搜索产品域 → 识别类型
  2. 加载推理规则 → 获取风格优先级
  3. 多域搜索 → 风格/配色/字体/布局
  4. 优先级选择 → 最佳匹配
  5. 格式化输出 → ASCII Box / Markdown
    |
    v
AI 接收设计系统 → 按规则编写代码
```

---

## 接口定义

### search() 函数接口

```python
def search(
    query: str,          # 搜索词
    domain: str = None,  # 域名，None=自动检测
    max_results: int = 3 # 最大结果数
) -> list[dict]:
    """
    返回: [
        {"column1": "value1", "column2": "value2", ...},
        ...
    ]
    """
```

### 平台配置接口

```typescript
interface PlatformConfig {
  platform: string;
  displayName: string;
  installType: 'full' | 'reference';
  folderStructure: {
    root: string;      // ".claude"
    skillPath: string;  // "skills/my-skill"
    filename: string;   // "SKILL.md"
  };
  scriptPath: string;
  frontmatter: Record<string, string> | null;
  sections: { quickReference: boolean };
  title: string;
  description: string;
  skillOrWorkflow: string;
}
```
