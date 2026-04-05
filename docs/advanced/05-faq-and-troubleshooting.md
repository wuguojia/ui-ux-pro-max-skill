# 05 — FAQ 与疑难排解

## 常见问题

### Q1: 为什么用 CSV 而不是 JSON 或 SQLite？

**A**: 三个原因:
1. **Excel 兼容** — 非开发者可以用 Excel/Numbers 直接编辑
2. **Git diff 友好** — CSV 的 diff 比 JSON 可读性好得多
3. **零依赖** — Python 标准库就能解析，不需要 `pip install`

### Q2: 为什么用 BM25 而不是向量搜索/Embedding？

**A**: 
- BM25 零依赖，不需要模型文件或 API 调用
- 对于结构化数据 (CSV 行)，BM25 效果已经很好
- 完全可预测：同样的输入总是返回同样的结果
- 离线运行，无网络延迟

### Q3: Python 脚本没有外部依赖，真的吗？

**A**: 真的。只用了标准库:
```python
import csv, json, os, sys, re, math, argparse, textwrap
```
不需要 `pip install` 任何东西。

### Q4: 为什么只有 Claude 有 Quick Reference？

**A**: Quick Reference 有 297 行、200+ 条规则，会消耗大量 token。Claude Code 的 Skill 系统支持更大的 context，其他平台限制更严，所以省略以节省 token。

### Q5: 搜索结果不准确怎么办？

**A**: 三种优化方法:
1. 在 CSV 的 Keywords 列添加更多同义词
2. 调整 BM25 参数 (k1, b)
3. 使用 `--domain` 指定搜索域而非自动检测

### Q6: 支持哪些 AI 平台？

**A**: 18 个平台:
Claude, Cursor, Windsurf, GitHub Copilot, Kiro, Antigravity, RooCode, Continue, Codex, Qoder, Gemini, Trae, OpenCode, CodeBuddy, Droid (Factory), Kilocode, Warp, Augment

---

## 疑难排解

### 搜索返回空结果

```bash
# 检查 Python 版本
python3 --version  # 需要 3.x

# 检查文件是否存在
ls src/ui-ux-pro-max/data/styles.csv

# 尝试指定域
python3 search.py "your query" --domain style

# 检查 CSV 编码
file src/ui-ux-pro-max/data/styles.csv  # 应该是 UTF-8
```

### CLI 安装失败

```bash
# 检查 Node.js 版本
node --version  # 需要 18+

# GitHub 限流？使用离线模式
npx uipro-cli init --offline

# 权限问题？
npx uipro-cli init --ai claude  # 指定平台

# 已安装？使用 force
npx uipro-cli init --force
```

### 设计系统生成报错

```bash
# 完整调试
python3 -c "
import sys
sys.path.insert(0, 'src/ui-ux-pro-max/scripts')
from core import search
result = search('SaaS', 'product')
print(result)
"
```

### Symlink 在 Windows 上失败

Windows 默认不支持 symlink。解决方案:
1. 使用 CLI 安装 (物理复制，不依赖 symlink)
2. 或以管理员身份运行 Git Bash
3. 或启用 Windows Developer Mode

### CSV 编辑后搜索异常

1. 检查 CSV 列数是否一致 (每行逗号数相同)
2. 检查引号是否正确闭合
3. 确保 UTF-8 编码 (无 BOM)
4. 运行 `_sync_all.py` 重新对齐 products/colors/reasoning
