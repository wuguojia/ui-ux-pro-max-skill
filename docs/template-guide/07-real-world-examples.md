# 07 — 实战案例

## 案例一：烹饪助手 Skill

### 定位
帮助 AI 编码助手在开发食谱应用时给出专业的烹饪建议。

### 数据设计

```
data/
├── recipes.csv         # 200+ 食谱
├── techniques.csv      # 50+ 烹饪技巧
├── ingredients.csv     # 300+ 食材营养信息
├── cuisine-reasoning.csv  # 30 个菜系的推理规则
└── stacks/
    └── react.csv       # React 食谱 App 组件建议
```

### recipes.csv 示例
```csv
No,Recipe Name,Cuisine,Category,Ingredients,Keywords,Difficulty,Time
1,Spaghetti Carbonara,Italian,Pasta,"eggs,pecorino,guanciale","pasta,italian,quick,classic",Medium,30min
2,Pad Thai,Thai,Noodles,"rice noodles,shrimp,peanuts","thai,noodles,street-food",Medium,25min
3,Ratatouille,French,Vegetable,"eggplant,zucchini,tomato","french,vegan,healthy",Easy,45min
```

### 搜索配置
```python
CSV_CONFIGS = {
    "recipe": {"file": "recipes.csv", "search_columns": ["Recipe Name", "Cuisine", "Keywords"]},
    "technique": {"file": "techniques.csv", "search_columns": ["Technique", "Keywords"]},
    "ingredient": {"file": "ingredients.csv", "search_columns": ["Name", "Category"]},
}
```

### 使用效果
```bash
$ python3 search.py "quick italian dinner"
Domain: recipe | File: recipes.csv | Results: 3

#1 Spaghetti Carbonara
   Cuisine: Italian | Difficulty: Medium | Time: 30min
   Ingredients: eggs, pecorino, guanciale
```

---

## 案例二：API 设计规范 Skill

### 定位
帮助 AI 在生成 API 代码时遵循 RESTful 最佳实践。

### 数据设计

```
data/
├── endpoints.csv       # 100+ API 端点模式
├── status-codes.csv    # HTTP 状态码使用指南
├── auth-patterns.csv   # 认证方案对比
├── api-reasoning.csv   # 按行业推理最佳 API 架构
└── stacks/
    ├── express.csv     # Express.js 最佳实践
    ├── fastapi.csv     # FastAPI 最佳实践
    └── spring.csv      # Spring Boot 最佳实践
```

### endpoints.csv 示例
```csv
No,Pattern,Method,Path,Description,Keywords,Request Body,Response,Anti-Patterns
1,List Resources,GET,/api/v1/{resource},返回分页列表,"list,get,query,pagination",N/A,"{items:[], total, page}",不要返回所有数据
2,Create Resource,POST,/api/v1/{resource},创建新资源,"create,add,new,post","{field1,field2}","{id,created_at}",不要用 GET 创建
```

### 使用效果
```bash
$ python3 search.py "user authentication JWT"
Domain: auth | File: auth-patterns.csv | Results: 2

#1 JWT Bearer Token
   Type: Stateless | Best For: SPA, Mobile
   Flow: Login → Token → Header: Bearer {token}
   Anti-Patterns: Don't store in localStorage
```

---

## 案例三：代码规范 Skill

### 定位
确保 AI 生成的代码符合团队编码规范。

### 数据设计

```
data/
├── naming.csv          # 命名规范
├── patterns.csv        # 设计模式使用建议
├── anti-patterns.csv   # 反模式警告
├── testing.csv         # 测试最佳实践
└── stacks/
    ├── typescript.csv  # TypeScript 特定规范
    ├── python.csv      # Python 特定规范
    └── go.csv          # Go 特定规范
```

### naming.csv 示例
```csv
No,Context,Convention,Keywords,Good Example,Bad Example,Reason
1,Variable,camelCase,"variable,var,let,const",userName,user_name,JavaScript/TypeScript 标准
2,Component,PascalCase,"component,react,vue",UserProfile,userProfile,React 组件约定
3,Constant,UPPER_SNAKE,"constant,const,enum",MAX_RETRIES,maxRetries,区分常量与变量
```

---

## 通用模式总结

三个案例展示了相同的架构模式：

| 组件 | 烹饪 | API | 代码规范 |
|------|------|-----|---------|
| 主域 | 食谱 | 端点模式 | 命名规范 |
| 辅助域 | 技巧、食材 | 状态码、认证 | 模式、反模式 |
| 推理 | 菜系规则 | 行业API规则 | 语言规则 |
| 技术栈 | React组件 | Express/FastAPI | TS/Python/Go |

**关键洞察**：架构完全相同，只有数据不同。这证明了模板化方案的可行性。
