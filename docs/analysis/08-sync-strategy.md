# 08 — 数据同步策略分析

## 核心问题

项目中存在**三份数据副本**，它们必须保持一致：

```
                     ┌─────────────────────────┐
                     │  src/ui-ux-pro-max/     │  ◄── Source of Truth
                     │  (规范数据源)             │
                     └────────┬────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
  │ .claude/skills│  │ cli/assets/  │  │ .factory/    │
  │ (symlink)     │  │ (文件副本)    │  │ (symlink)    │
  │ 开发时使用     │  │ npm 发布用    │  │ Droid 使用    │
  └───────────────┘  └──────────────┘  └──────────────┘
```

---

## 三份数据的角色

### 1. `src/ui-ux-pro-max/`（规范源）

| 子目录 | 作用 | 编辑方式 |
|--------|------|---------|
| `data/*.csv` | 42 个 CSV 数据库 | 直接编辑 |
| `scripts/*.py` | Python 搜索引擎 | 直接编辑 |
| `templates/` | 平台模板和配置 | 直接编辑 |

**规则**: 所有修改都必须在这里进行。

### 2. `.claude/skills/ui-ux-pro-max/`（Symlink）

通过符号链接指向 `src/`：
```
.claude/skills/ui-ux-pro-max/data    → ../../../src/ui-ux-pro-max/data
.claude/skills/ui-ux-pro-max/scripts → ../../../src/ui-ux-pro-max/scripts
```

**优点**:
- 零维护成本——改 `src/` 自动同步
- 开发时 Claude Code 可以直接使用
- 不会出现版本不一致

### 3. `cli/assets/`（文件副本）

npm 包不支持 symlink，所以 CLI 打包时需要**物理复制**：

```bash
cp -r src/ui-ux-pro-max/data/*      cli/assets/data/
cp -r src/ui-ux-pro-max/scripts/*   cli/assets/scripts/
cp -r src/ui-ux-pro-max/templates/* cli/assets/templates/
```

**发布前必须执行**，否则 npm 包内的数据会过期。

---

## 同步流程

### 日常开发

```
编辑 src/ui-ux-pro-max/data/styles.csv
    │
    ├── .claude/ 自动同步 (symlink)    ✅ 无需操作
    ├── .factory/ 自动同步 (symlink)   ✅ 无需操作
    └── cli/assets/ 不同步             ⚠️ 需要手动 cp
```

### 发布新版本

```
1. 确保 src/ 中所有修改已完成
2. 运行同步命令:
   cp -r src/ui-ux-pro-max/data/*      cli/assets/data/
   cp -r src/ui-ux-pro-max/scripts/*   cli/assets/scripts/
   cp -r src/ui-ux-pro-max/templates/* cli/assets/templates/
3. 构建 CLI:
   cd cli && bun run build
4. 发布:
   npm publish
```

---

## 数据内部同步 (_sync_all.py)

除了三份数据副本之间的同步，`data/` 内部也有同步需求：

### products ↔ colors ↔ ui-reasoning 三表对齐

```
products.csv (161 行) ← 权威来源
    │
    ├──→ colors.csv (161 行)       必须 1:1 对齐
    └──→ ui-reasoning.csv (161 行) 必须 1:1 对齐
```

### _sync_all.py 工作流

```python
# 1. 读取 products.csv 的 161 个产品类型
products = load_csv("products.csv")

# 2. 重建 colors.csv
rebuild_colors():
    for product in products:
        if product in existing_colors:
            keep(existing_row)          # 保留已有颜色
        elif product in NEW_COLORS:
            derive(NEW_COLORS[product]) # 使用预定义的 4 基色
        else:
            generate_default()          # 从基色自动派生 16 色

# 3. 重建 ui-reasoning.csv
rebuild_ui_reasoning():
    for product in products:
        if product in existing_reasoning:
            keep(existing_row)
        else:
            derive_from_style()         # 从产品的推荐风格派生推理规则
```

### 颜色派生算法

从 4 个基础色（Primary, Secondary, Accent, Background）自动生成完整 16 色 Token：

```
输入: Primary=#2563EB, Secondary=#3B82F6, Accent=#EA580C, Background=#F8FAFC

派生:
  On Primary    = 亮度检测 → #FFFFFF (白)
  On Secondary  = 亮度检测 → #FFFFFF
  On Accent     = 亮度检测 → #FFFFFF
  Foreground    = 背景亮暗 → #1E293B (深色文字)
  Card          = shift(Background, +2%) → #FFFFFF
  Card FG       = Foreground
  Muted         = shift(Background, -5%) → 稍暗
  Muted FG      = blend(Foreground, Background, 40%)
  Border        = shift(Background, -10%) → 更暗
  Destructive   = #DC2626 (固定红)
  On Destructive= #FFFFFF
  Ring          = Primary
```

---

## 风险与缓解

| 风险 | 后果 | 缓解措施 |
|------|------|---------|
| 忘记同步 cli/assets/ | npm 包数据过期 | 可在 CI 中添加 diff 检查 |
| 直接编辑 .claude/ 下的文件 | 下次 sync 会覆盖 | 文档明确标注 "只编辑 src/" |
| products/colors/reasoning 不对齐 | 搜索结果异常 | _sync_all.py 自动修复 |
| Symlink 在 Windows 上失败 | 开发者无法在本地使用 | CLI 安装使用物理复制，不依赖 symlink |
