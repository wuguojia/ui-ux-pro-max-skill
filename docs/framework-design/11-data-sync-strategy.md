# 11 — 数据同步策略

## 问题

同一份数据需要存在于三个位置，如何保持一致？

```
位置 1: src/{your-skill}/          ← Source of Truth（开发时编辑）
位置 2: .claude/skills/{your-skill}/ ← 开发时 AI 使用（symlink）
位置 3: cli/assets/                 ← npm 发布时打包（物理副本）
```

---

## 三角同步模型

```
                  src/{your-skill}/
                  (Source of Truth)
                 ╱                ╲
          symlink                  cp (手动)
               ╱                    ╲
 .claude/skills/{your-skill}/    cli/assets/
 (开发时 AI 使用)               (npm 打包)
```

### 同步规则

| 从 → 到 | 同步方式 | 时机 | 自动化 |
|---------|---------|------|--------|
| src → .claude | Symlink | 一次性设置 | ✅ 自动（文件系统） |
| src → cli/assets | 手动复制 | npm publish 之前 | ⚠️ 半自动 |
| cli/assets → 用户目录 | CLI 安装 | `init` 命令时 | ✅ 自动 |

---

## Symlink 设置

### 创建 Symlink

```bash
# 在项目根目录执行
mkdir -p .claude/skills/{your-skill}

# 创建数据和脚本的 symlink
ln -s ../../../src/{your-skill}/data .claude/skills/{your-skill}/data
ln -s ../../../src/{your-skill}/scripts .claude/skills/{your-skill}/scripts

# Skill 文件可能需要渲染，不能 symlink
# 而是通过模板引擎生成
```

### 验证 Symlink

```bash
# 检查 symlink 是否正确
ls -la .claude/skills/{your-skill}/
# data -> ../../../src/{your-skill}/data
# scripts -> ../../../src/{your-skill}/scripts

# 验证数据可访问
python3 .claude/skills/{your-skill}/scripts/search.py "test" --domain product
```

### Windows 注意事项

Windows 默认不支持 symlink。替代方案：
1. 启用开发者模式（Settings → Developer → Developer Mode）
2. 使用管理员权限运行 `mklink /D`
3. 使用 CLI 安装代替 symlink（物理复制）

---

## CLI Assets 同步

### 同步脚本

```bash
#!/bin/bash
# sync-to-cli.sh - 在 npm publish 之前运行

SOURCE="src/{your-skill}"
TARGET="cli/assets"

echo "🔄 Syncing data..."
rm -rf "$TARGET/data"
cp -r "$SOURCE/data" "$TARGET/data"

echo "🔄 Syncing scripts..."
rm -rf "$TARGET/scripts"
cp -r "$SOURCE/scripts" "$TARGET/scripts"

echo "🔄 Syncing templates..."
rm -rf "$TARGET/templates"
cp -r "$SOURCE/templates" "$TARGET/templates"

echo "✅ Sync complete"

# 验证
echo "📊 File counts:"
echo "  Data: $(find $TARGET/data -name '*.csv' | wc -l) CSV files"
echo "  Scripts: $(find $TARGET/scripts -name '*.py' | wc -l) Python files"
echo "  Templates: $(find $TARGET/templates -name '*.json' | wc -l) platform configs"
```

### package.json 集成

```json
{
    "scripts": {
        "sync": "bash sync-to-cli.sh",
        "prepublishOnly": "npm run sync && bun run build"
    }
}
```

这样 `npm publish` 时会自动同步再构建。

---

## 一致性验证

### 验证脚本

```python
#!/usr/bin/env python3
"""validate_sync.py - 验证三个位置的数据一致性"""

import os
import hashlib

def file_hash(filepath):
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def compare_dirs(dir_a, dir_b, label):
    mismatches = []
    for root, dirs, files in os.walk(dir_a):
        for fname in files:
            path_a = os.path.join(root, fname)
            rel_path = os.path.relpath(path_a, dir_a)
            path_b = os.path.join(dir_b, rel_path)

            if not os.path.exists(path_b):
                mismatches.append(f"MISSING in {label}: {rel_path}")
            elif file_hash(path_a) != file_hash(path_b):
                mismatches.append(f"DIFFER: {rel_path}")

    return mismatches

# 比较 src vs cli/assets
src = "src/{your-skill}"
cli = "cli/assets"

for subdir in ["data", "scripts"]:
    issues = compare_dirs(
        os.path.join(src, subdir),
        os.path.join(cli, subdir),
        f"cli/assets/{subdir}"
    )
    if issues:
        print(f"❌ {subdir}: {len(issues)} issues")
        for issue in issues:
            print(f"   {issue}")
    else:
        print(f"✅ {subdir}: in sync")
```

---

## 数据流总览

```
开发者编辑
    │
    ▼
src/{your-skill}/data/{domain}.csv  ← Source of Truth
    │
    ├──(symlink)──→ .claude/skills/{your-skill}/data/{domain}.csv
    │                   │
    │                   └──→ AI 助手读取并搜索
    │
    └──(cp)──→ cli/assets/data/{domain}.csv
                    │
                    └──(npm publish)──→ npm registry
                                           │
                                           └──(npx init)──→ 用户的
                                                              .claude/skills/{your-skill}/data/
```

---

## 常见问题

### Q: 为什么不全部用 symlink？

**A**: cli/assets 需要物理副本，因为 npm publish 不跟随 symlink。

### Q: 忘了同步就发布了怎么办？

**A**: 
1. 修复 src/ 的内容
2. 运行 `npm run sync`
3. `npm version patch` 递增版本
4. 重新 `npm publish`

### Q: CI/CD 中如何处理？

**A**: 在 CI 的 publish job 中添加同步和验证步骤：
```yaml
- run: npm run sync
- run: python3 validate_sync.py
- run: npm publish
```
