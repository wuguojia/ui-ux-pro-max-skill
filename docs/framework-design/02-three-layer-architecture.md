# 02 — 三层架构设计

## 架构哲学

> **每一层可以独立演进：改数据不动代码，改代码不动表现，改表现不动逻辑。**

---

## 架构总图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Layer 3: 表现层 (Presentation)                    │
│                                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │ CLI 安装器 │  │ 模板渲染引擎  │  │ 平台配置 JSON  │  │ Marketplace  │  │
│  │ (TypeScript)│  │ ({{}} 占位符) │  │ (18 个平台)    │  │ (元数据)     │  │
│  └──────────┘  └──────────────┘  └───────────────┘  └──────────────┘  │
│                                                                         │
│  职责: 安装/分发/适配/展示 | 输入: 用户命令 | 输出: 平台特定文件         │
├─────────────────────────────────────────────────────────────────────────┤
│                        Layer 2: 逻辑层 (Logic)                           │
│                                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │ BM25 搜索 │  │ 推理引擎      │  │ 多域聚合器     │  │ 输出格式化   │  │
│  │ (core.py) │  │ (reasoning)  │  │ (generator)   │  │ (ASCII/MD)  │  │
│  └──────────┘  └──────────────┘  └───────────────┘  └──────────────┘  │
│                                                                         │
│  职责: 搜索/推理/聚合/格式化 | 输入: 查询+域 | 输出: 结构化结果         │
├─────────────────────────────────────────────────────────────────────────┤
│                        Layer 1: 数据层 (Data)                            │
│                                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │ 主域 CSV  │  │ 技术栈 CSV    │  │ 推理规则 CSV   │  │ 辅助 CSV     │  │
│  │ (N 文件)  │  │ (M 文件)     │  │ (1 文件)       │  │ (可选)       │  │
│  └──────────┘  └──────────────┘  └───────────────┘  └──────────────┘  │
│                                                                         │
│  职责: 存储知识 | 格式: CSV (UTF-8) | 维护: Excel/Git 均可              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: 数据层

### 职责
存储所有领域知识，以 CSV 格式呈现，支持 Excel 编辑和 Git 版本控制。

### 文件组织

```
{your-skill}/data/
├── {domain-a}.csv              # 主域数据 A
├── {domain-b}.csv              # 主域数据 B
├── {domain-c}.csv              # 主域数据 C
├── {reasoning}.csv             # 推理规则（可选，但推荐）
├── {auxiliary}.csv             # 辅助数据（可选）
└── stacks/                     # 技术栈专属数据（可选）
    ├── react.csv
    ├── vue.csv
    └── ...
```

### 设计原则

| 原则 | 说明 | 理由 |
|------|------|------|
| 每行独立 | 不依赖上下行关系 | BM25 按行独立评分 |
| Keywords 列必须 | 每个 CSV 至少有一列关键词 | 搜索入口 |
| UTF-8 无 BOM | 统一编码 | 跨平台兼容 |
| 第一列是序号 | `No` 列，从 1 开始 | 方便排序和引用 |
| 值不过长 | 单个值 <500 字符 | BM25 长文档惩罚 |

### 数据关系模型

```
                    ┌─────────────────┐
                    │  推理规则 CSV    │
                    │  (1:1 映射)      │
                    └────────┬────────┘
                             │ Category 列 = Product Type 列
                    ┌────────▼────────┐
                    │  产品/类型 CSV   │
                    │  (主分类表)      │
                    └────────┬────────┘
                             │ 产品类型引导搜索
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ 域 A CSV  │  │ 域 B CSV  │  │ 域 C CSV  │
        │ (独立搜索) │  │ (独立搜索) │  │ (独立搜索) │
        └──────────┘  └──────────┘  └──────────┘
```

### 接口定义

```python
# 数据层对外接口（由逻辑层调用）
def load_csv(filepath: str) -> list[dict[str, str]]:
    """加载 CSV 为字典列表，每行一个 dict"""

def get_csv_headers(filepath: str) -> list[str]:
    """返回 CSV 的列名列表"""
```

---

## Layer 2: 逻辑层

### 职责
对数据层进行搜索、推理、聚合、格式化，返回结构化结果。

### 组件划分

```
逻辑层
├── core.py (或 core.ts)
│   ├── BM25 搜索引擎类
│   ├── CSV 域配置 (CSV_CONFIG)
│   ├── 域自动检测 (detect_domain)
│   ├── 单域搜索 (search)
│   └── 技术栈搜索 (search_stack)
│
├── reasoning.py (或内嵌在 generator 中)
│   ├── 推理规则加载
│   ├── 三级匹配算法
│   └── Decision_Rules 解析
│
├── generator.py
│   ├── 多域搜索聚合
│   ├── 推理引导搜索
│   ├── 最佳匹配选择
│   └── 输出格式化
│
└── search.py (CLI 入口)
    ├── argparse 参数解析
    ├── 输出格式化
    └── main() 入口
```

### 设计原则

| 原则 | 说明 |
|------|------|
| 零外部依赖 | 只用 Python 标准库 |
| 纯函数优先 | 搜索函数无副作用 |
| 配置驱动 | CSV_CONFIG 字典定义域，而非硬编码 if-else |
| 幂等性 | 同输入始终同输出 |

### 接口定义

```python
# 核心搜索接口
def search(query: str, domain: str | None = None, max_results: int = 3) -> list[dict]:
    """
    搜索指定域，返回排序后的结果列表。
    domain=None 时自动检测域。
    """

def search_stack(query: str, stack: str, max_results: int = 3) -> list[dict]:
    """搜索特定技术栈的 CSV"""

def detect_domain(query: str) -> str:
    """根据查询关键词自动检测搜索域"""
```

```python
# 生成器接口
class Generator:
    def generate(self, query: str, project_name: str = "MyProject") -> dict:
        """
        完整生成流程:
        1. 搜索产品域 → 识别类型
        2. 加载推理规则 → 获取优先级
        3. 多域搜索 → 各域 Top N
        4. 推理引导选择 → 最佳匹配
        5. 返回结构化设计系统
        """
```

---

## Layer 3: 表现层

### 职责
将逻辑层的结果适配到不同 AI 平台，提供安装、更新、卸载等分发功能。

### 组件划分

```
表现层
├── templates/
│   ├── base/
│   │   ├── skill-content.md          # Skill 模板（含 {{}} 占位符）
│   │   └── quick-reference.md        # 可选速查表
│   └── platforms/
│       ├── claude.json               # 平台配置 x N
│       ├── cursor.json
│       └── ...
│
├── cli/
│   ├── src/
│   │   ├── index.ts                  # Commander.js 程序入口
│   │   ├── commands/init.ts          # 安装命令
│   │   ├── commands/update.ts        # 更新命令
│   │   ├── commands/uninstall.ts     # 卸载命令
│   │   ├── utils/template.ts         # 模板渲染引擎
│   │   ├── utils/detect.ts           # AI 平台检测
│   │   └── types/index.ts            # TypeScript 类型
│   ├── assets/                       # 打包的数据和脚本副本
│   └── package.json                  # npm 包配置
│
└── marketplace/                      # 可选的市场发布元数据
    └── plugin.json
```

### 设计原则

| 原则 | 说明 |
|------|------|
| 内容与配置分离 | 一份 skill-content.md + N 份 platform.json |
| 添加平台零代码 | 新建一个 JSON 即可支持新平台 |
| 离线优先 | 本地 assets 兜底，网络只用于可选更新 |
| 幂等安装 | 重复安装不会产生重复文件 |

### 接口定义

```typescript
// 模板渲染接口
function renderSkillFile(config: PlatformConfig, isGlobal: boolean): string;

// 平台文件生成接口
function generatePlatformFiles(targetDir: string, aiType: AIType, isGlobal: boolean): string[];

// 全平台生成接口
function generateAllPlatformFiles(targetDir: string, isGlobal: boolean): string[];
```

---

## 层间通信

```
                    用户
                     │
                     ▼
              ┌──────────────┐
              │ CLI / AI 助手 │   Layer 3: 接收用户输入
              └──────┬───────┘
                     │  "python3 search.py 'SaaS dashboard' --design-system"
                     ▼
              ┌──────────────┐
              │  search.py   │   Layer 2: 解析参数
              └──────┬───────┘
                     │  调用 generator.generate("SaaS dashboard")
                     ▼
              ┌──────────────┐
              │  generator   │   Layer 2: 多域搜索 + 推理
              └──────┬───────┘
                     │  调用 core.search("SaaS", "product")
                     ▼
              ┌──────────────┐
              │  core.py     │   Layer 2: BM25 搜索
              └──────┬───────┘
                     │  调用 load_csv("products.csv")
                     ▼
              ┌──────────────┐
              │  CSV 文件     │   Layer 1: 返回原始数据
              └──────────────┘
```

### 依赖方向

```
Layer 3 → Layer 2 → Layer 1

Layer 1 不知道 Layer 2 的存在
Layer 2 不知道 Layer 3 的存在
```

这是**单向依赖**，确保层间解耦。

---

## 目录结构完整参考

```
{your-skill}/
├── src/{your-skill}/                    # Source of Truth
│   ├── data/                            # Layer 1: 数据层
│   │   ├── {domain-a}.csv
│   │   ├── {domain-b}.csv
│   │   ├── {reasoning}.csv
│   │   └── stacks/
│   │       ├── react.csv
│   │       └── ...
│   ├── scripts/                         # Layer 2: 逻辑层
│   │   ├── core.py                      # 搜索引擎
│   │   ├── search.py                    # CLI 入口
│   │   └── generator.py                 # 生成器（可选）
│   └── templates/                       # Layer 3: 表现层（模板部分）
│       ├── base/
│       │   ├── skill-content.md
│       │   └── quick-reference.md
│       └── platforms/
│           ├── claude.json
│           ├── cursor.json
│           └── ...
├── cli/                                 # Layer 3: 表现层（CLI 部分）
│   ├── src/
│   │   ├── index.ts
│   │   ├── commands/
│   │   ├── utils/
│   │   └── types/
│   ├── assets/                          # Layer 1 + 2 的打包副本
│   └── package.json
├── .claude/skills/{your-skill}/         # 开发用 symlink
├── skill.json                           # Skill 元数据
└── CLAUDE.md                            # 项目说明
```

---

## 扩展点

| 扩展需求 | 修改位置 | 影响范围 |
|---------|---------|---------|
| 添加新知识域 | Layer 1 + Layer 2 (CSV_CONFIG) | 不影响 Layer 3 |
| 添加新 AI 平台 | Layer 3 (新 JSON) | 不影响 Layer 1, 2 |
| 更改搜索算法 | Layer 2 (core.py) | 不影响 Layer 1, 3 |
| 修改输出格式 | Layer 2 (generator) | 不影响 Layer 1, 3 |
| 更新知识数据 | Layer 1 (CSV 文件) | 不影响 Layer 2, 3 |
| 更改分发方式 | Layer 3 (CLI) | 不影响 Layer 1, 2 |
