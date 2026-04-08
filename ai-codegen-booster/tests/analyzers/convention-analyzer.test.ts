/**
 * 约定分析器测试
 * 测试编码约定和反模式检测功能
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeConventions,
  conventionsToCSVFormat,
} from '../../src/analyzers/convention-analyzer';

describe('约定分析器', () => {
  describe('命名约定提取', () => {
    it('应该识别 PascalCase 组件命名', async () => {
      const code = `
        function UserProfile() { return <div />; }
        function ProductCard() { return <div />; }
        function NavigationBar() { return <div />; }
      `;

      const result = await analyzeConventions(code);

      const convention = result.conventions.find(c => c.rule.includes('PascalCase'));
      expect(convention).toBeDefined();
      expect(convention?.confidence).toBeGreaterThan(80);
    });

    it('应该识别 camelCase 函数命名', async () => {
      const code = `
        function fetchData() {}
        function calculateTotal() {}
        function validateInput() {}
      `;

      const result = await analyzeConventions(code);

      const convention = result.conventions.find(c => c.rule.includes('camelCase'));
      expect(convention).toBeDefined();
    });

    it('应该识别 UPPER_CASE 常量命名', async () => {
      const code = `
        const API_URL = 'https://api.example.com';
        const MAX_RETRIES = 3;
        const DEFAULT_TIMEOUT = 5000;
      `;

      const result = await analyzeConventions(code);

      const convention = result.conventions.find(c => c.rule.includes('UPPER_CASE'));
      expect(convention).toBeDefined();
    });
  });

  describe('导入约定提取', () => {
    it('应该识别路径别名约定', async () => {
      const code = `
        import { Button } from '@/components/Button';
        import { useAuth } from '@/hooks/useAuth';
        import { API_URL } from '@/config/constants';
      `;

      const result = await analyzeConventions(code);

      const convention = result.conventions.find(c => c.rule.includes('path aliases'));
      expect(convention).toBeDefined();
      expect(convention?.examples.some(e => e.includes('@/'))).toBe(true);
    });

    it('应该识别分组导入约定', async () => {
      const code = `
        import React from 'react';
        import { useState } from 'react';

        import { Button } from '@/components/Button';
        import { formatDate } from './utils';
      `;

      const result = await analyzeConventions(code);

      const convention = result.conventions.find(c => c.rule.includes('external and internal'));
      expect(convention).toBeDefined();
    });
  });

  describe('注释约定提取', () => {
    it('应该识别 JSDoc 注释约定', async () => {
      const code = `
        /**
         * Calculate sum of two numbers
         * @param {number} a - First number
         * @param {number} b - Second number
         * @returns {number} Sum
         */
        function add(a, b) {
          return a + b;
        }

        /**
         * User class
         */
        class User {}
      `;

      const result = await analyzeConventions(code);

      const convention = result.conventions.find(c => c.rule.includes('JSDoc'));
      expect(convention).toBeDefined();
    });
  });

  describe('反模式检测', () => {
    it('应该检测长函数', async () => {
      const code = `
        function longFunction() {
          ${Array.from({ length: 60 }, (_, i) => `const line${i} = ${i};`).join('\n')}
        }
      `;

      const result = await analyzeConventions(code);

      const antiPattern = result.antiPatterns.find(ap => ap.type === 'Long Function');
      expect(antiPattern).toBeDefined();
      expect(antiPattern?.severity).toBe('warning');
    });

    it('应该检测深层嵌套', async () => {
      const code = `
        function deepNesting() {
          if (condition1) {
            if (condition2) {
              if (condition3) {
                if (condition4) {
                  if (condition5) {
                    console.log('too deep');
                  }
                }
              }
            }
          }
        }
      `;

      const result = await analyzeConventions(code);

      const antiPattern = result.antiPatterns.find(ap => ap.type === 'Deep Nesting');
      expect(antiPattern).toBeDefined();
    });

    it('应该检测魔法数字', async () => {
      const code = `
        function calculate() {
          return value * 42 + 3.14;
        }
      `;

      const result = await analyzeConventions(code);

      const antiPatterns = result.antiPatterns.filter(ap => ap.type === 'Magic Number');
      expect(antiPatterns.length).toBeGreaterThan(0);
    });

    it('应该忽略常量中的数字', async () => {
      const code = `
        const MAX_VALUE = 100;
        const PI = 3.14159;
      `;

      const result = await analyzeConventions(code);

      // 常量中的数字不应被标记为魔法数字
      const magicNumbers = result.antiPatterns.filter(ap => ap.type === 'Magic Number');
      expect(magicNumbers.length).toBe(0);
    });

    it('应该检测 console.log', async () => {
      const code = `
        function debug() {
          console.log('debug message');
          console.error('error message');
        }
      `;

      const result = await analyzeConventions(code);

      const consoleStatements = result.antiPatterns.filter(ap => ap.type === 'Console Statement');
      expect(consoleStatements.length).toBeGreaterThan(0);
    });

    it('应该检测 var 使用', async () => {
      const code = `
        var oldStyle = 'should use let or const';
        var anotherOne = 123;
      `;

      const result = await analyzeConventions(code);

      const varUsage = result.antiPatterns.filter(ap => ap.type === 'Var Usage');
      expect(varUsage.length).toBe(2);
    });

    it('应该检测 TODO 注释', async () => {
      const code = `
        // TODO: implement this function
        function incomplete() {}

        // FIXME: this is broken
        function buggy() {}
      `;

      const result = await analyzeConventions(code);

      const todoComments = result.antiPatterns.filter(ap => ap.type === 'TODO Comment');
      expect(todoComments.length).toBe(2);
    });
  });

  describe('最佳实践识别', () => {
    it('应该识别 const 使用', async () => {
      const code = `
        const API_URL = 'https://api.example.com';
        const user = { name: 'John' };
      `;

      const result = await analyzeConventions(code);

      const practice = result.bestPractices.find(bp => bp.practice.includes('const'));
      expect(practice).toBeDefined();
    });

    it('应该识别 TypeScript 类型注解', async () => {
      const code = `
        function greet(name: string): string {
          return \`Hello, \${name}\`;
        }
      `;

      const result = await analyzeConventions(code);

      const practice = result.bestPractices.find(bp => bp.category === 'Type Safety');
      expect(practice).toBeDefined();
    });

    it('应该识别错误处理', async () => {
      const code = `
        try {
          riskyOperation();
        } catch (error) {
          handleError(error);
        }
      `;

      const result = await analyzeConventions(code);

      const practice = result.bestPractices.find(bp => bp.category === 'Error Handling');
      expect(practice).toBeDefined();
    });
  });

  describe('统计信息计算', () => {
    it('应该计算正确的统计信息', async () => {
      const code = `
        /**
         * User class
         */
        class User {
          constructor(name) {
            this.name = name;
          }
        }

        /**
         * Greet function
         */
        function greet(name) {
          return \`Hello, \${name}\`;
        }

        const count = 0;
        const message = 'test';
      `;

      const result = await analyzeConventions(code);

      expect(result.statistics.totalFunctions).toBeGreaterThan(0);
      expect(result.statistics.totalClasses).toBe(1);
      expect(result.statistics.totalVariables).toBeGreaterThan(0);
      expect(result.statistics.commentDensity).toBeGreaterThan(0);
    });

    it('应该计算平均函数长度', async () => {
      const code = `
        function short() {
          return 1;
        }

        function longer() {
          const a = 1;
          const b = 2;
          const c = 3;
          return a + b + c;
        }
      `;

      const result = await analyzeConventions(code);

      expect(result.statistics.avgFunctionLength).toBeGreaterThan(0);
    });
  });

  describe('CSV 格式转换', () => {
    it('应该转换为 CSV 格式', async () => {
      const code = `
        function UserProfile() {}
        function ProductCard() {}
      `;

      const result = await analyzeConventions(code);
      const csvData = conventionsToCSVFormat(result.conventions);

      expect(csvData.length).toBeGreaterThan(0);
      csvData.forEach(item => {
        expect(item).toHaveProperty('conventionType');
        expect(item).toHaveProperty('rule');
        expect(item).toHaveProperty('goodExample');
        expect(item).toHaveProperty('badExample');
        expect(item).toHaveProperty('reason');
        expect(item).toHaveProperty('severity');
      });
    });

    it('应该包含合理的严重级别', async () => {
      const code = `
        const API_URL = 'https://api.example.com';
        const MAX_RETRIES = 3;
      `;

      const result = await analyzeConventions(code);
      const csvData = conventionsToCSVFormat(result.conventions);

      csvData.forEach(item => {
        expect(['error', 'warning']).toContain(item.severity);
      });
    });
  });

  describe('复杂代码场景', () => {
    it('应该处理完整的 React 组件', async () => {
      const code = `
        import React, { useState, useEffect } from 'react';
        import { Button } from '@/components/Button';

        /**
         * User profile component
         */
        function UserProfile({ userId }) {
          const [user, setUser] = useState(null);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
            fetchUser(userId)
              .then(setUser)
              .catch(console.error)
              .finally(() => setLoading(false));
          }, [userId]);

          if (loading) return <div>Loading...</div>;
          return <div>{user?.name}</div>;
        }
      `;

      const result = await analyzeConventions(code);

      expect(result.conventions.length).toBeGreaterThan(0);
      expect(result.bestPractices.length).toBeGreaterThan(0);
      expect(result.statistics.totalFunctions).toBeGreaterThan(0);
    });

    it('应该处理 TypeScript 类', async () => {
      const code = `
        /**
         * Service class
         */
        class UserService {
          private readonly API_URL = 'https://api.example.com';

          async getUser(id: string): Promise<User> {
            try {
              const response = await fetch(\`\${this.API_URL}/users/\${id}\`);
              return await response.json();
            } catch (error) {
              throw new Error(\`Failed to fetch user: \${error}\`);
            }
          }
        }
      `;

      const result = await analyzeConventions(code);

      expect(result.conventions.length).toBeGreaterThan(0);
      expect(result.bestPractices.some(bp => bp.category === 'Type Safety')).toBe(true);
      expect(result.bestPractices.some(bp => bp.category === 'Error Handling')).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('应该处理空代码', async () => {
      const code = '';
      const result = await analyzeConventions(code);

      expect(result.conventions).toEqual([]);
      expect(result.antiPatterns).toEqual([]);
      expect(result.bestPractices).toEqual([]);
    });

    it('应该处理只有注释的代码', async () => {
      const code = `
        // This is a comment
        /* Block comment */
        /**
         * JSDoc comment
         */
      `;

      const result = await analyzeConventions(code);

      expect(result.statistics.commentDensity).toBeGreaterThan(0);
    });

    it('应该处理混合命名风格', async () => {
      const code = `
        function camelCase() {}
        function PascalCase() {}
        const snake_case = 1;
        const UPPER_CASE = 2;
      `;

      const result = await analyzeConventions(code);

      // 应该能识别多种命名约定，但置信度可能较低
      expect(result.conventions.length).toBeGreaterThan(0);
    });

    it('应该处理条件性代码', async () => {
      const code = `
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode');
        }
      `;

      const result = await analyzeConventions(code);

      // 即使在条件中，也应该检测到 console.log
      const consoleLog = result.antiPatterns.find(ap => ap.type === 'Console Statement');
      expect(consoleLog).toBeDefined();
    });
  });
});
