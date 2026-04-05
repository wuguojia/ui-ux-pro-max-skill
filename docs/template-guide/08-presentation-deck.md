# 08 — 演示大纲

## 5 分钟闪电演讲

### 目标受众：开发者、同事

```
[0:00-0:30] 问题
  "AI 写代码很强，但设计决策很随机。每次生成的颜色、字体都不一样。"

[0:30-1:30] 解决方案
  "UI/UX Pro Max = 专业设计师的知识，编码成数据库。"
  展示: 67种风格 + 161种配色 + 57种字体搭配

[1:30-3:00] 现场演示
  $ python3 search.py "SaaS dashboard" --design-system
  展示 ASCII Box 输出（配色可视化、字体推荐、布局建议）

[3:00-4:00] 架构亮点
  "一份数据，18个AI平台。CSV驱动，零依赖。"
  展示: npx uipro-cli init --ai claude

[4:00-5:00] 行动号召
  "npx uipro-cli init，或 GitHub Star"
  展示: 安装只需 10 秒
```

---

## 15 分钟技术分享

### 目标受众：技术团队

```
第一幕：问题 (3分钟)
├── AI 编码助手的设计盲区 (真实案例)
├── 为什么提示词工程解决不了设计问题
└── 数据驱动 vs 规则硬编码

第二幕：方案 (5分钟)
├── 三层架构: 数据层 + 逻辑层 + 表现层
├── BM25 搜索引擎原理 (30秒简述)
├── 推理引擎: 从产品类型到设计系统
├── 现场演示: 生成完整设计系统
└── 现场演示: Master + Override 持久化

第三幕：模板化 (4分钟)
├── 为什么能模板化? (架构与数据完全分离)
├── 创建新 Skill 的 6 个步骤
├── 烹饪助手案例 (快速过)
└── 添加新 AI 平台只需 1 个 JSON

第四幕：分发 (2分钟)
├── npm 发布 (npx 安装)
├── 18 个 AI 平台支持
└── Claude Marketplace

第五幕：总结 (1分钟)
└── 开源地址 + 行动号召
```

---

## 30 分钟深度工作坊

### 目标受众：想做自己 Skill 的开发者

```
Part 1: 理论 (10分钟)
├── AI Skill 的概念和价值
├── UI/UX Pro Max 完整架构讲解
├── BM25 算法简介 + 为什么不用 Embedding
└── CSV 数据设计最佳实践

Part 2: 实操 (15分钟)
├── 创建项目结构 (mkdir)
├── 编写第一个 CSV 数据文件
├── 配置搜索引擎 (修改 core.py)
├── 测试搜索功能
├── 创建 Skill 模板
└── 创建本地 symlink 测试

Part 3: 进阶 (5分钟)
├── 添加推理引擎
├── npm 发布
├── 添加新平台
└── Q&A
```

---

## 演示准备清单

### 环境

- [ ] Python 3 已安装
- [ ] 终端字体支持 Unicode (ASCII Box 需要)
- [ ] 终端支持 ANSI 颜色
- [ ] 网络可用 (npm 安装演示)

### 命令速查

```bash
# 基础搜索
python3 src/ui-ux-pro-max/scripts/search.py "SaaS" --domain product

# 设计系统
python3 src/ui-ux-pro-max/scripts/search.py "fintech app" --design-system -p "FinPay"

# 技术栈
python3 src/ui-ux-pro-max/scripts/search.py "button component" --stack react

# CLI 安装
npx uipro-cli init --ai claude --force
```

---

## 关键卖点

演示时反复强调这三点：

1. **零依赖** — Python 3 即可运行，不需要 npm install / pip install
2. **161 种产品类型** — 不是通用建议，是针对你的行业的专业建议
3. **18 个平台** — 一次投入，所有 AI 助手都能用
