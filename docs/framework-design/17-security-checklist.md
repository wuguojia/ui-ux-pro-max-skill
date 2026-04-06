# 17 — 安全检查清单

## 概述

框架的安全设计遵循**最小攻击面**原则：零网络依赖、零外部 Python 包、只读数据文件。

---

## 攻击面分析

| 入口点 | 风险等级 | 说明 | 缓解措施 |
|--------|---------|------|---------|
| CSV 数据文件 | 🟢 低 | 只读、纯文本 | 不 eval、不执行 |
| Python 搜索脚本 | 🟢 低 | 不接受网络输入 | 只处理本地文件 |
| 用户搜索查询 | 🟢 低 | 只用于字符串匹配 | 不拼接到 shell/SQL |
| CLI 安装器 | 🟡 中 | 下载 ZIP + 写文件 | HTTPS + 路径检查 |
| GitHub API 调用 | 🟢 低 | 只读、公开 API | 限流降级处理 |
| npm 包分发 | 🟡 中 | 供应链风险 | 最小依赖 + 锁版本 |

---

## 安全检查清单

### ☑️ 数据安全

```
☐ CSV 文件不包含任何可执行代码
☐ CSV 值不会被 eval() 或 exec() 处理
☐ CSV 值不会被注入到 shell 命令中
☐ CSV 值不会被注入到 SQL 查询中
☐ 数据文件只通过 csv.DictReader 读取
☐ 不存在路径穿越 (../) 风险
☐ 数据文件无敏感信息 (密钥、密码、个人数据)
```

### ☑️ 搜索安全

```
☐ 用户查询仅用于 BM25 字符串匹配
☐ 查询不会被传递给 os.system() 或 subprocess
☐ 查询长度有上限（截断超长输入）
☐ 特殊字符（引号、反斜杠）在 tokenize 时被过滤
☐ 搜索结果不包含可执行代码
```

### ☑️ CLI 安全

```
☐ ZIP 下载仅从 api.github.com 获取
☐ 使用 HTTPS 连接
☐ 文件解压时检查路径（防 zip slip）
☐ 不执行下载内容中的脚本
☐ 不要求用户提供认证 token
☐ 文件写入限制在目标目录内
☐ --force 标志需要用户明确指定
```

### ☑️ 依赖安全

```
☐ Python 脚本零外部依赖（只用标准库）
☐ CLI 依赖最小化（仅 4 个 npm 包）
☐ 依赖版本已锁定（package-lock.json）
☐ 定期运行 npm audit
☐ 不使用已知有漏洞的版本
```

### ☑️ 输出安全

```
☐ 生成的 Skill 文件是纯 Markdown（不含脚本）
☐ 颜色值经过 HEX 格式验证
☐ 输出不包含用户的私人信息
☐ ASCII 输出的 ANSI 转义码是安全的（只有颜色码）
```

---

## 依赖审计

### Python 依赖：0 个

```
搜索引擎使用的标准库:
  csv      — CSV 解析
  json     — JSON 解析
  math     — 数学函数 (log)
  re       — 正则表达式
  os       — 文件路径
  sys      — 标准输出
  argparse — 参数解析
  textwrap — 文本换行

安全结论: 无第三方供应链风险
```

### CLI 依赖：4 个

| 包名 | 版本 | 周下载量 | 用途 | 已知漏洞 |
|------|------|---------|------|---------|
| commander | ^12.1.0 | 100M+ | CLI 参数解析 | 无 |
| chalk | ^5.3.0 | 100M+ | 彩色输出 | 无 |
| ora | ^8.1.1 | 10M+ | 加载动画 | 无 |
| prompts | ^2.4.2 | 20M+ | 交互式提示 | 无 |

```bash
# 定期审计
npm audit
npm audit fix
```

---

## 安全配置建议

### .gitignore

```gitignore
# 防止敏感文件意外提交
.env
*.key
*.pem
*.p12
credentials.*
secrets.*

# 防止构建产物提交
node_modules/
dist/
*.zip
```

### npm 发布安全

```json
// package.json - 限制发布文件
{
    "files": [
        "dist",
        "assets"
    ]
}
// 只有 dist/ 和 assets/ 会被发布到 npm
// 源代码、测试、配置文件不会被发布
```

### GitHub Release 安全

```yaml
# .github/workflows/release.yml
- name: Create release
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    # 使用 GitHub 自动 token，不使用个人 token
```

---

## 常见安全误区

| 误区 | 正确做法 |
|------|---------|
| "CSV 不需要验证" | 验证格式、编码、列完整性 |
| "本地工具不需要安全" | CLI 安装涉及文件写入，需要权限检查 |
| "小项目不需要 npm audit" | 4 个依赖也可能有漏洞 |
| "HTTPS 就够了" | 还需要验证下载内容的完整性 |

---

## 安全事件响应

如果发现安全问题:

1. **评估影响范围**: 哪些版本受影响？多少用户？
2. **修复**: 修补漏洞或移除问题依赖
3. **发布补丁**: `npm version patch && npm publish`
4. **通知**: 在 GitHub Releases 中标注安全修复
5. **回顾**: 更新安全检查清单，防止类似问题
