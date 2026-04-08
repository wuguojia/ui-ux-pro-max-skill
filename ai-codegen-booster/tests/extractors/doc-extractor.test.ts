/**
 * 文档提取器测试
 * 测试 JSDoc, TSDoc 和 Markdown 文档提取功能
 */

import { describe, it, expect } from 'vitest';
import {
  extractJSDoc,
  extractMarkdown,
  extractUsageExamples,
} from '../../src/extractors/doc-extractor';

describe('文档提取器', () => {
  describe('JSDoc 提取', () => {
    it('应该提取函数的 JSDoc 注释', async () => {
      const code = `
        /**
         * 计算两个数的和
         * @param {number} a - 第一个数
         * @param {number} b - 第二个数
         * @returns {number} 两数之和
         */
        function add(a, b) {
          return a + b;
        }
      `;

      const docs = await extractJSDoc(code);

      expect(docs.has('add')).toBe(true);
      const addDoc = docs.get('add');
      expect(addDoc?.description).toContain('计算两个数的和');
      expect(addDoc?.params).toHaveLength(2);
      expect(addDoc?.params[0].name).toBe('a');
      expect(addDoc?.params[1].name).toBe('b');
      expect(addDoc?.returns).toContain('两数之和');
    });

    it('应该提取类的 JSDoc 注释', async () => {
      const code = `
        /**
         * 用户类
         * @class
         */
        class User {
          constructor(name) {
            this.name = name;
          }
        }
      `;

      const docs = await extractJSDoc(code);

      expect(docs.has('User')).toBe(true);
      const userDoc = docs.get('User');
      expect(userDoc?.description).toContain('用户类');
    });

    it('应该提取示例代码', async () => {
      const code = `
        /**
         * 格式化日期
         * @example
         * formatDate(new Date())
         * // => '2026-04-08'
         */
        function formatDate(date) {
          return date.toISOString().split('T')[0];
        }
      `;

      const docs = await extractJSDoc(code);

      const doc = docs.get('formatDate');
      expect(doc?.examples).toHaveLength(1);
      expect(doc?.examples[0]).toContain('formatDate(new Date())');
    });

    it('应该提取可选参数', async () => {
      const code = `
        /**
         * 问候函数
         * @param {string} name - 姓名
         * @param {string} [greeting] - 问候语
         */
        function greet(name, greeting = 'Hello') {
          return \`\${greeting}, \${name}!\`;
        }
      `;

      const docs = await extractJSDoc(code);

      const doc = docs.get('greet');
      expect(doc?.params).toHaveLength(2);
      expect(doc?.params[1].optional).toBe(true);
    });
  });

  describe('Markdown 提取', () => {
    it('应该提取标题和章节', async () => {
      const markdown = `
# 主标题

这是简介段落。

## 第一章

第一章内容。

### 小节 1.1

小节内容。

## 第二章

第二章内容。
      `;

      const doc = await extractMarkdown(markdown);

      expect(doc.title).toBe('主标题');
      expect(doc.sections).toHaveLength(3);
      expect(doc.sections[0].heading).toBe('第一章');
      expect(doc.sections[0].level).toBe(2);
      expect(doc.sections[1].heading).toBe('小节 1.1');
      expect(doc.sections[1].level).toBe(3);
    });

    it('应该提取代码块', async () => {
      const markdown = `
# 示例

\`\`\`javascript
function hello() {
  console.log('Hello World');
}
\`\`\`

\`\`\`typescript
const greet = (name: string): void => {
  console.log(\`Hello, \${name}\`);
};
\`\`\`
      `;

      const doc = await extractMarkdown(markdown);

      expect(doc.codeBlocks).toHaveLength(2);
      expect(doc.codeBlocks[0].language).toBe('javascript');
      expect(doc.codeBlocks[0].code).toContain('Hello World');
      expect(doc.codeBlocks[1].language).toBe('typescript');
    });

    it('应该提取链接', async () => {
      const markdown = `
[官方文档](https://docs.example.com)
[内部链接](./internal.md)
[相对路径](../README.md)
      `;

      const doc = await extractMarkdown(markdown);

      expect(doc.links).toHaveLength(3);
      expect(doc.links[0].text).toBe('官方文档');
      expect(doc.links[0].type).toBe('external');
      expect(doc.links[1].type).toBe('internal');
      expect(doc.links[2].type).toBe('internal');
    });
  });

  describe('使用示例提取', () => {
    it('应该提取 TypeScript 代码示例', () => {
      const markdown = `
\`\`\`tsx
import { Button } from '@/components/Button';

function App() {
  return <Button type="primary">点击</Button>;
}
\`\`\`
      `;

      const examples = extractUsageExamples(markdown);

      expect(examples).toHaveLength(1);
      expect(examples[0]).toContain('Button');
      expect(examples[0]).toContain('type="primary"');
    });

    it('应该提取 Vue 代码示例', () => {
      const markdown = `
\`\`\`vue
<template>
  <Button type="primary">点击</Button>
</template>
\`\`\`
      `;

      const examples = extractUsageExamples(markdown);

      expect(examples).toHaveLength(1);
      expect(examples[0]).toContain('<Button');
    });

    it('应该提取多个代码示例', () => {
      const markdown = `
\`\`\`jsx
<div>示例1</div>
\`\`\`

\`\`\`tsx
<div>示例2</div>
\`\`\`

\`\`\`js
const x = 1;
\`\`\`
      `;

      const examples = extractUsageExamples(markdown);

      expect(examples).toHaveLength(3);
    });
  });

  describe('边界情况', () => {
    it('应该处理空文档', async () => {
      const docs = await extractJSDoc('');
      expect(docs.size).toBe(0);

      const mdDoc = await extractMarkdown('');
      expect(mdDoc.title).toBe('');
      expect(mdDoc.sections).toHaveLength(0);
    });

    it('应该处理没有 JSDoc 的代码', async () => {
      const code = `
        function noDoc() {
          return true;
        }
      `;

      const docs = await extractJSDoc(code);
      expect(docs.size).toBe(0);
    });

    it('应该处理复杂的 JSDoc 标签', async () => {
      const code = `
        /**
         * 复杂函数
         * @param {Object} options - 选项对象
         * @param {string} options.name - 名称
         * @param {number} options.age - 年龄
         * @returns {Promise<User>} 用户对象
         * @throws {Error} 当参数无效时抛出
         * @deprecated 使用 newFunction 替代
         * @since 1.0.0
         */
        async function complexFunc(options) {
          // 实现
        }
      `;

      const docs = await extractJSDoc(code);
      const doc = docs.get('complexFunc');

      expect(doc).toBeDefined();
      expect(doc?.tags).toHaveProperty('deprecated');
      expect(doc?.tags).toHaveProperty('since');
    });
  });
});
