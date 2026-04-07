# 15 — 错误处理模式

## 概述

框架采用**优雅降级**策略：遇到错误时不崩溃，而是退回到更安全的替代方案。

---

## 降级策略矩阵

| 组件 | 正常流程 | 降级 Level 1 | 降级 Level 2 | 最终回退 |
|------|---------|-------------|-------------|---------|
| 域检测 | 自动检测域 | 用户指定 --domain | 使用默认域 | 搜索全部域 |
| CSV 加载 | 加载指定 CSV | 尝试相对路径 | 尝试绝对路径 | 报错 + 提示 |
| BM25 搜索 | 返回 Top N | 返回所有结果 | 返回空列表 | — |
| 推理匹配 | Level 1 精确 | Level 2 包含 | Level 3 关键词 | 使用默认规则 |
| Decision_Rules | JSON 解析 | 空 dict | — | — |
| CLI 安装 | 模板生成 | GitHub 下载 | 最小安装 | 报错 + 提示 |
| 网络请求 | GitHub API | 缓存版本 | 离线 assets | 报错 |
| 输出格式化 | ASCII Box | 纯 Markdown | 纯文本 | JSON |

---

## 搜索引擎错误处理

### CSV 文件不存在

```python
def load_csv(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return list(csv.DictReader(f))
    except FileNotFoundError:
        # 尝试从 data/ 子目录查找
        alt_path = os.path.join(DATA_DIR, os.path.basename(filepath))
        if os.path.exists(alt_path):
            return load_csv(alt_path)
        # 仍然失败: 返回空列表而非崩溃
        print(f"⚠️ Data file not found: {filepath}", file=sys.stderr)
        return []
    except csv.Error as e:
        print(f"⚠️ CSV parse error in {filepath}: {e}", file=sys.stderr)
        return []
```

### 域配置缺失

```python
def search(query, domain=None, max_results=3):
    if domain and domain not in CSV_CONFIG:
        # 未知域: 尝试自动检测
        print(f"⚠️ Unknown domain '{domain}', auto-detecting...", file=sys.stderr)
        domain = detect_domain(query)

    if domain not in CSV_CONFIG:
        # 自动检测也失败: 使用默认域
        domain = DEFAULT_DOMAIN
    # ...
```

### 搜索无结果

```python
def search(query, domain, max_results):
    results = _search_csv(query, domain)

    if not results:
        # 无结果时提供建议
        return [{
            "_message": f"No results for '{query}' in domain '{domain}'",
            "_suggestion": "Try broader keywords or a different domain",
        }]

    return results[:max_results]
```

---

## 推理引擎错误处理

### Decision_Rules JSON 解析失败

```python
def parse_decision_rules(raw_json: str) -> dict:
    """安全解析 Decision_Rules，失败返回空 dict"""
    if not raw_json or raw_json.strip() == "":
        return {}
    try:
        return json.loads(raw_json)
    except json.JSONDecodeError:
        # JSON 格式错误: 静默降级
        return {}
```

### 推理规则未匹配

```python
def find_reasoning_rule(category, reasoning_data):
    # ... 三级匹配 ...
    
    if not matched:
        # 返回安全默认值
        return {
            "Recommended_Strategy": "Standard Layout",
            "Priority_Hints": "Minimalism, Clean Design",
            "Decision_Rules": "{}",
            "Anti_Patterns": "",
            "Severity": "MEDIUM",
        }
```

---

## CLI 错误处理

### 网络请求失败

```typescript
async function getLatestRelease(): Promise<ReleaseInfo | null> {
    try {
        const response = await fetch(GITHUB_API_URL, {
            headers: { 'User-Agent': '{cli-name}' },
            signal: AbortSignal.timeout(10000),  // 10s 超时
        });

        if (response.status === 403) {
            // GitHub API 限流
            console.warn('⚠️ GitHub API rate limited. Using offline mode.');
            return null;
        }

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('⚠️ Request timed out. Using offline mode.');
        }
        return null;  // 降级到离线模式
    }
}
```

### 文件写入失败

```typescript
function writeFile(filepath: string, content: string): boolean {
    try {
        const dir = path.dirname(filepath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filepath, content, 'utf-8');
        return true;
    } catch (error) {
        if (error.code === 'EACCES') {
            console.error(`❌ Permission denied: ${filepath}`);
            console.error('   Try running with sudo or check directory permissions.');
        } else if (error.code === 'ENOSPC') {
            console.error(`❌ No space left on device`);
        } else {
            console.error(`❌ Failed to write ${filepath}: ${error.message}`);
        }
        return false;
    }
}
```

### 已存在的安装

```typescript
function checkExisting(targetDir: string, force: boolean): boolean {
    if (fs.existsSync(targetDir)) {
        if (force) {
            console.log('⚠️ Overwriting existing installation...');
            return true;
        } else {
            console.error(`❌ Already installed at ${targetDir}`);
            console.error('   Use --force to overwrite.');
            return false;
        }
    }
    return true;
}
```

---

## 边界条件清单

| 边界条件 | 处理方式 |
|---------|---------|
| 查询为空字符串 | 返回空结果 + 提示 |
| 查询超长 (>1000 字符) | 截断到前 200 字符 |
| CSV 为空 (只有表头) | 返回空结果 |
| CSV 列名不匹配 | 跳过该列，不崩溃 |
| 非 UTF-8 编码 CSV | 尝试 latin-1 回退 |
| Windows 路径分隔符 | 统一转为 `/` |
| 权限不足 | 提示用户检查权限 |
| 磁盘空间不足 | 提示用户清理空间 |
| Python 2.x 运行 | 打印版本要求提示 |

---

## 错误码规范

| 退出码 | 含义 | 场景 |
|--------|------|------|
| 0 | 成功 | 正常完成 |
| 1 | 通用错误 | 未分类错误 |
| 2 | 参数错误 | 无效的域名、栈名 |
| 3 | 文件错误 | CSV 不存在或格式错误 |
| 4 | 网络错误 | GitHub API 不可达 |
| 5 | 权限错误 | 无法写入目标目录 |
