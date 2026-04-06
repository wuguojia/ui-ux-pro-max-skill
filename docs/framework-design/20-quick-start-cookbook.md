# 20 — 快速上手食谱：5 分钟创建新 Skill

## 前提

```bash
# 需要:
python3 --version   # 3.6+
git --version       # 任意版本
```

---

## 🚀 5 分钟速成

### 第 1 分钟: 创建项目

```bash
mkdir my-awesome-skill && cd my-awesome-skill
git init
mkdir -p src/my-awesome-skill/{data,scripts,templates/{base,platforms}}
```

### 第 2 分钟: 创建数据

```bash
cat > src/my-awesome-skill/data/tips.csv << 'EOF'
No,Name,Category,Keywords,Description,Do,Don't,Severity
1,Use Semantic HTML,Accessibility,"html,semantic,a11y,accessibility,screen reader",Use semantic elements for better accessibility,Use <nav> <main> <article>,Use <div> for everything,High
2,Responsive Images,Performance,"image,responsive,srcset,picture,lazy,performance",Optimize images for different screen sizes,Use srcset and lazy loading,Use fixed-size images everywhere,Medium
3,CSS Custom Properties,Styling,"css,variables,custom properties,theming,dark mode",Use CSS variables for consistent theming,Define variables in :root,Hardcode color values,Medium
4,Error Boundaries,React,"error,boundary,react,catch,fallback,crash",Catch rendering errors gracefully,Wrap major sections,Ignore error handling,High
5,Keyboard Navigation,Accessibility,"keyboard,tab,focus,a11y,navigation,trap",Ensure all interactions work with keyboard,Test tab order,Only support mouse,High
EOF
```

### 第 3 分钟: 复制搜索引擎

复制框架的 `core.py` 到你的项目，然后修改配置:

```bash
# 复制 core.py（从框架模板或参考实现）
# 然后修改以下配置:
cat > src/my-awesome-skill/scripts/core_config.py << 'EOF'
# 在 core.py 顶部修改这些配置:

CSV_CONFIG = {
    "tips": {
        "file": "tips.csv",
        "search_cols": ["Name", "Category", "Keywords", "Description"],
        "output_cols": ["Name", "Category", "Description", "Do", "Don't", "Severity"],
    },
}

DOMAIN_KEYWORDS = {
    "tips": r"tip|best practice|guideline|how to|should|recommend",
}

DEFAULT_DOMAIN = "tips"
EOF
```

创建 search.py 入口:

```bash
cat > src/my-awesome-skill/scripts/search.py << 'PYEOF'
#!/usr/bin/env python3
"""搜索入口 - 最小版本"""
import sys
import os

# 确保能找到 core.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from core import search, detect_domain

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Search knowledge base")
    parser.add_argument("query", help="Search query")
    parser.add_argument("--domain", "-d", help="Search domain")
    parser.add_argument("-n", "--max-results", type=int, default=3)
    args = parser.parse_args()

    domain = args.domain or detect_domain(args.query)
    results = search(args.query, domain, args.max_results)

    if not results:
        print(f"No results for '{args.query}' in domain '{domain}'")
        return

    print(f"\n## Domain: {domain} | Query: \"{args.query}\" | Results: {len(results)}\n")
    for i, result in enumerate(results, 1):
        print(f"### #{i}")
        for key, value in result.items():
            if value and key != "No":
                print(f"  {key}: {value}")
        print()

if __name__ == "__main__":
    main()
PYEOF
```

### 第 4 分钟: 创建 Skill 模板

```bash
cat > src/my-awesome-skill/templates/base/skill-content.md << 'EOF'
# {{TITLE}}

{{DESCRIPTION}}

## How to Use This {{SKILL_OR_WORKFLOW}}

When a user asks for web development best practices, search the knowledge base:

```bash
python3 {{SCRIPT_PATH}} "<query>" --domain tips
```

### Search Domains

| Domain | Description | Example Query |
|--------|-------------|---------------|
| tips | Web dev best practices | "accessibility keyboard" |

### Search Examples

```bash
# Find accessibility tips
python3 {{SCRIPT_PATH}} "accessibility" --domain tips

# Find performance tips
python3 {{SCRIPT_PATH}} "image performance" --domain tips

# Auto-detect domain
python3 {{SCRIPT_PATH}} "how to handle errors in React"
```

{{QUICK_REFERENCE}}
EOF
```

创建平台配置:

```bash
cat > src/my-awesome-skill/templates/platforms/claude.json << 'EOF'
{
    "platform": "claude",
    "displayName": "Claude Code",
    "installType": "full",
    "folderStructure": {
        "root": ".claude",
        "skillPath": "skills/my-awesome-skill",
        "filename": "SKILL.md"
    },
    "scriptPath": "skills/my-awesome-skill/scripts/search.py",
    "frontmatter": {
        "name": "my-awesome-skill",
        "description": "Web development best practices knowledge base"
    },
    "sections": { "quickReference": false },
    "title": "My Awesome Skill - Web Dev Intelligence",
    "description": "A searchable knowledge base of web development best practices.",
    "skillOrWorkflow": "Skill"
}
EOF
```

### 第 5 分钟: 测试

```bash
# 测试搜索
python3 src/my-awesome-skill/scripts/search.py "accessibility"
python3 src/my-awesome-skill/scripts/search.py "React error" --domain tips
python3 src/my-awesome-skill/scripts/search.py "performance images" -n 2

# 创建开发用 symlink
mkdir -p .claude/skills/my-awesome-skill
ln -sf ../../../src/my-awesome-skill/data .claude/skills/my-awesome-skill/data
ln -sf ../../../src/my-awesome-skill/scripts .claude/skills/my-awesome-skill/scripts

echo "✅ Done! Your skill is ready."
```

---

## 🎉 完成！

你现在有了:

```
my-awesome-skill/
├── src/my-awesome-skill/
│   ├── data/tips.csv                    # 5 条最佳实践
│   ├── scripts/
│   │   ├── core.py                      # BM25 搜索引擎
│   │   └── search.py                    # CLI 入口
│   └── templates/
│       ├── base/skill-content.md        # Skill 模板
│       └── platforms/claude.json        # Claude 配置
└── .claude/skills/my-awesome-skill/     # Symlink (开发用)
```

---

## 下一步

| 目标 | 参考文档 |
|------|---------|
| 添加更多数据 | [03-data-layer-design.md](03-data-layer-design.md) |
| 添加推理引擎 | [05-reasoning-engine-design.md](05-reasoning-engine-design.md) |
| 添加更多平台 | [09-multi-platform-adaptation.md](09-multi-platform-adaptation.md) |
| 创建 CLI 发布 | [08-cli-distribution-design.md](08-cli-distribution-design.md) |
| 添加测试 | [18-testing-strategy.md](18-testing-strategy.md) |
| 完整迁移指南 | [19-migration-guide.md](19-migration-guide.md) |

---

## 速查命令

```bash
# 搜索
python3 scripts/search.py "query" --domain tips

# 搜索（自动检测域）
python3 scripts/search.py "query"

# 搜索（限制结果数）
python3 scripts/search.py "query" -n 5

# 验证 CSV
python3 -c "import csv; print(len(list(csv.DictReader(open('data/tips.csv')))))"
```
