# 12 — API 与接口参考

## 概述

本文档列出框架所有公开 API 的完整签名、参数说明、返回值和使用示例。

---

## Layer 2: Python 搜索引擎 API

### BM25 类

```python
class BM25:
    """零外部依赖的 BM25 搜索引擎"""

    def __init__(self, k1: float = 1.5, b: float = 0.75) -> None:
        """
        初始化 BM25 引擎。

        Args:
            k1: 词频饱和度参数 (1.2-2.0 推荐)
            b:  文档长度归一化参数 (0.0-1.0)
        """

    def tokenize(self, text: str) -> list[str]:
        """
        将文本分词。

        处理: 小写化 → 正则提取词 → 过滤 <3 字符

        Args:
            text: 输入文本
        Returns:
            分词后的列表 ["word1", "word2", ...]
        """

    def fit(self, documents: list[str]) -> None:
        """
        对文档集合建立索引。

        时间复杂度: O(N × L)
        空间复杂度: O(V) (V=词汇表大小)

        Args:
            documents: 文档列表，每个文档是一个字符串
        """

    def score(self, query: str) -> list[tuple[int, float]]:
        """
        对所有文档评分。

        时间复杂度: O(|Q| × N)

        Args:
            query: 查询字符串
        Returns:
            [(文档索引, BM25分数), ...] 按分数降序
            只返回分数 > 0 的文档
        """
```

---

### 核心搜索函数

```python
def search(
    query: str,
    domain: str | None = None,
    max_results: int = 3
) -> list[dict[str, str]]:
    """
    在指定域中搜索。

    Args:
        query:       搜索查询（自然语言）
        domain:      搜索域名 (None=自动检测)
                     可选值: 由 CSV_CONFIG 定义
        max_results: 最大返回结果数 (默认 3)

    Returns:
        匹配结果列表，每个结果是列名→值的字典
        [
            {"Name": "...", "Keywords": "...", "Score": 3.42},
            {"Name": "...", "Keywords": "...", "Score": 2.18},
        ]

    Example:
        >>> search("SaaS dark mode", "style", 3)
        [{"Style Category": "Glassmorphism", ...}, ...]
    """

def search_stack(
    query: str,
    stack: str,
    max_results: int = 3
) -> list[dict[str, str]]:
    """
    搜索特定技术栈。

    Args:
        query:       搜索查询
        stack:       技术栈名 (react|vue|flutter|...)
                     可选值: 由 STACK_CONFIG 定义
        max_results: 最大返回结果数

    Returns:
        与 search() 相同格式

    Example:
        >>> search_stack("state management", "react", 3)
        [{"Category": "State", "Guideline": "Use useState...", ...}, ...]
    """

def detect_domain(query: str) -> str:
    """
    根据查询关键词自动检测搜索域。

    匹配策略: 遍历 DOMAIN_KEYWORDS，统计查询中命中的关键词数，
              选命中最多的域，无命中返回默认域。

    Args:
        query: 用户查询

    Returns:
        域名字符串 (如 "style", "color", "product")

    Example:
        >>> detect_domain("glassmorphism with dark mode")
        "style"
        >>> detect_domain("blue color palette")
        "color"
    """
```

---

### CSV 加载函数

```python
def load_csv(filepath: str) -> list[dict[str, str]]:
    """
    加载 CSV 文件为字典列表。

    Args:
        filepath: CSV 文件的绝对或相对路径

    Returns:
        [{"列名1": "值1", "列名2": "值2", ...}, ...]

    Raises:
        FileNotFoundError: 文件不存在
        csv.Error: CSV 格式错误
    """
```

---

### 生成器 API

```python
class DesignSystemGenerator:
    """多域聚合生成器"""

    def __init__(self, data_dir: str) -> None:
        """
        初始化生成器，加载推理规则。

        Args:
            data_dir: data/ 目录的路径

        Side Effects:
            加载 reasoning.csv 到内存
        """

    def generate(
        self,
        query: str,
        project_name: str = "MyProject"
    ) -> dict:
        """
        生成完整的设计系统。

        流程: 产品搜索 → 推理匹配 → 多域搜索 → 最佳选择 → 组装

        Args:
            query:        产品/项目描述
            project_name: 项目名称 (用于输出标题)

        Returns:
            {
                "project_name": str,
                "category": str,
                "pattern": {"name": str, "sections": str, ...},
                "style": {"name": str, "type": str, "effects": str, ...},
                "colors": {"primary": str, "secondary": str, ...},
                "typography": {"heading": str, "body": str, ...},
                "key_effects": str,
                "anti_patterns": str,
                "decision_rules": dict,
                "severity": str
            }
        """

    def format_ascii(self, design_system: dict) -> str:
        """格式化为 ASCII Box (Unicode 边框，ANSI 色彩)"""

    def format_markdown(self, design_system: dict) -> str:
        """格式化为 Markdown 表格"""

    def persist(
        self,
        design_system: dict,
        output_dir: str,
        page: str | None = None
    ) -> str:
        """
        持久化设计系统到文件。

        Args:
            design_system: generate() 的返回值
            output_dir:    输出目录
            page:          页面名 (None=生成MASTER, 有值=生成pages/{page}.md)

        Returns:
            生成的文件路径
        """
```

---

## Layer 3: TypeScript CLI API

### 类型定义

```typescript
/** 支持的 AI 平台类型 */
export type AIType = 'claude' | 'cursor' | 'windsurf' | 'copilot'
    | 'kiro' | 'roocode' | 'continue' | 'codex'
    | 'qoder' | 'gemini' | 'trae' | 'opencode'
    | 'codebuddy' | 'droid' | 'kilocode' | 'warp'
    | 'augment' | 'agent';

/** 平台配置接口 */
export interface PlatformConfig {
    platform: string;
    displayName: string;
    installType: 'full' | 'reference';
    folderStructure: {
        root: string;
        skillPath: string;
        filename: string;
    };
    scriptPath: string;
    frontmatter: Record<string, string> | null;
    sections: { quickReference: boolean };
    title: string;
    description: string;
    skillOrWorkflow: string;
}

/** GitHub Release 信息 */
export interface ReleaseInfo {
    tag: string;
    version: string;
    zipUrl: string;
    publishedAt: string;
}
```

### 模板引擎函数

```typescript
/**
 * 加载平台配置 JSON。
 * @param aiType - AI 平台类型
 * @returns 解析后的平台配置对象
 */
export function loadPlatformConfig(aiType: AIType): PlatformConfig;

/**
 * 渲染 Skill 文件。
 * @param config - 平台配置
 * @param isGlobal - 是否全局安装
 * @returns 渲染后的 Markdown 字符串
 */
export function renderSkillFile(config: PlatformConfig, isGlobal: boolean): string;

/**
 * 为指定平台生成所有文件。
 * @param targetDir - 目标目录（项目根目录）
 * @param aiType - AI 平台类型
 * @param isGlobal - 是否全局安装
 * @returns 创建的文件夹路径列表
 */
export function generatePlatformFiles(
    targetDir: string,
    aiType: AIType,
    isGlobal: boolean
): string[];

/**
 * 为所有平台生成文件。
 */
export function generateAllPlatformFiles(
    targetDir: string,
    isGlobal: boolean
): string[];

/**
 * 复制数据和脚本到目标 Skill 目录。
 * @param targetSkillDir - 目标 Skill 目录路径
 */
export function copyDataAndScripts(targetSkillDir: string): void;
```

### 检测函数

```typescript
/**
 * 检测项目中已安装的 AI 平台。
 * @param targetDir - 项目根目录
 * @returns 检测到的 AI 平台类型列表
 */
export function detectInstalledAI(targetDir: string): AIType[];
```

### GitHub 函数

```typescript
/**
 * 获取最新 release 信息。
 * @returns Release 信息，null 表示请求失败
 */
export async function getLatestRelease(): Promise<ReleaseInfo | null>;

/**
 * 下载并解压 release ZIP。
 * @param zipUrl - ZIP 下载 URL
 * @param targetDir - 解压目标目录
 */
export async function downloadAndExtract(
    zipUrl: string,
    targetDir: string
): Promise<void>;
```

---

## CLI 命令接口

```
用法: {cli-name} <command> [options]

命令:
  init        安装 Skill 到当前项目
  update      更新已安装的 Skill
  uninstall   卸载 Skill
  versions    显示版本信息

init 选项:
  --ai <type>   AI 平台 (claude|cursor|...|all)
  --force       覆盖已有文件
  --offline     离线模式（仅使用本地 assets）
  --global      全局安装 (~/.<platform>/)

update 选项:
  --ai <type>   指定更新哪个平台

uninstall 选项:
  --ai <type>   指定卸载哪个平台
  --global      卸载全局安装
```

---

## 搜索命令接口

```
用法: python3 search.py <query> [options]

参数:
  query         搜索查询（用引号包裹）

选项:
  --domain <d>  指定搜索域
  --stack <s>   搜索特定技术栈
  -n <N>        最大结果数 (默认: 3)
  --design-system  生成完整设计系统
  -p <name>     项目名称 (与 --design-system 配合)
  --persist     持久化到文件
  --page <name> 页面名 (与 --persist 配合)
  --format <f>  输出格式 (ascii|markdown|json)
  --json        等价于 --format json
```
