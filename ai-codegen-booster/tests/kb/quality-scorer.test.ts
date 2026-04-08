/**
 * 质量评分器测试
 * 测试知识库质量评分功能
 */

import { describe, it, expect } from 'vitest';
import {
  calculateKBQuality,
  generateQualityReport,
} from '../../src/kb/quality-scorer';
import type { KnowledgeBase } from '../../src/kb/types';

describe('质量评分器', () => {
  describe('整体质量评分', () => {
    it('应该计算完整知识库的质量分数', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [
              { name: 'label', type: 'string', description: 'Button label' },
            ],
            keywords: ['button', 'click'],
            description: 'Primary button component',
            usageExample: '<Button label="Click me" />',
          },
        ],
        styles: [
          {
            name: '--primary-color',
            value: '#007bff',
            styleType: 'CSS Variable',
            category: 'color',
            usage: 'Primary theme color',
            example: 'color: var(--primary-color);',
            keywords: ['primary', 'blue'],
          },
        ],
        conventions: [
          {
            conventionType: 'Naming',
            rule: 'Use PascalCase for components',
            goodExample: 'UserProfile',
            badExample: 'userprofile',
            reason: 'Improves readability',
            severity: 'error',
            keywords: ['naming', 'pascal'],
          },
        ],
      };

      const score = await calculateKBQuality(kb);

      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.completeness).toBeGreaterThan(0);
      expect(score.consistency).toBeGreaterThan(0);
      expect(score.reusability).toBeGreaterThan(0);
      expect(score.documentation).toBeGreaterThan(0);
    });

    it('应该为完整的知识库给出高分', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [
              { name: 'label', type: 'string', description: 'Label text' },
              { name: 'onClick', type: 'function', description: 'Click handler' },
            ],
            keywords: ['button', 'click', 'interaction'],
            description: 'Reusable button component',
            usageExample: '<Button label="Submit" onClick={handleSubmit} />',
          },
        ],
        styles: [
          {
            name: '--primary-color',
            value: '#007bff',
            styleType: 'CSS Variable',
            category: 'color',
            usage: 'Primary brand color',
            example: 'background: var(--primary-color);',
            keywords: ['primary', 'blue', 'brand'],
          },
        ],
        conventions: [
          {
            conventionType: 'Naming',
            rule: 'Use PascalCase',
            goodExample: 'UserProfile',
            badExample: 'user_profile',
            reason: 'Standard React convention',
            severity: 'error',
            keywords: ['naming'],
          },
        ],
      };

      const score = await calculateKBQuality(kb);

      expect(score.overall).toBeGreaterThan(70);
    });

    it('应该为不完整的知识库给出较低分', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '',
            props: [],
            keywords: [],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      expect(score.overall).toBeLessThan(50);
    });
  });

  describe('组件质量评分', () => {
    it('应该识别缺少 props 的组件', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [],
            keywords: [],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      const issue = score.breakdown.components.issues.find(
        i => i.description.includes('no props')
      );
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('warning');
    });

    it('应该识别缺少描述的组件', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [],
            keywords: [],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      const issue = score.breakdown.components.issues.find(
        i => i.description.includes('missing description')
      );
      expect(issue).toBeDefined();
    });

    it('应该识别无效的 import 路径', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: 'Button',
            props: [],
            keywords: [],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      const issue = score.breakdown.components.issues.find(
        i => i.category === 'Consistency'
      );
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('error');
    });

    it('应该正确计算 props 文档覆盖率', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [
              { name: 'label', type: 'string', description: 'Label' },
              { name: 'onClick', type: 'function' },
            ],
            keywords: [],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      expect(score.breakdown.components.metrics.propsDocumented).toBeGreaterThan(0);
      expect(score.breakdown.components.metrics.propsDocumented).toBeLessThan(100);
    });
  });

  describe('样式质量评分', () => {
    it('应该识别缺少 usage 的样式', async () => {
      const kb: KnowledgeBase = {
        components: [],
        styles: [
          {
            name: '--primary-color',
            value: '#007bff',
            styleType: 'CSS Variable',
            category: 'color',
            keywords: [],
          },
        ],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      const issue = score.breakdown.styles.issues.find(
        i => i.description.includes('missing usage')
      );
      expect(issue).toBeDefined();
    });

    it('应该验证样式命名一致性', async () => {
      const kb: KnowledgeBase = {
        components: [],
        styles: [
          {
            name: 'primaryColor',
            value: '#007bff',
            styleType: 'CSS Variable',
            category: 'color',
            usage: 'Primary color',
            keywords: [],
          },
        ],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      const issue = score.breakdown.styles.issues.find(
        i => i.category === 'Consistency'
      );
      expect(issue).toBeDefined();
    });

    it('应该为完整的样式给出高分', async () => {
      const kb: KnowledgeBase = {
        components: [],
        styles: [
          {
            name: '--primary-color',
            value: '#007bff',
            styleType: 'CSS Variable',
            category: 'color',
            usage: 'Primary brand color',
            example: 'background: var(--primary-color);',
            keywords: ['primary', 'blue'],
          },
        ],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      expect(score.breakdown.styles.score).toBeGreaterThan(80);
    });
  });

  describe('约定质量评分', () => {
    it('应该识别缺少 bad example 的约定', async () => {
      const kb: KnowledgeBase = {
        components: [],
        styles: [],
        conventions: [
          {
            conventionType: 'Naming',
            rule: 'Use PascalCase',
            goodExample: 'UserProfile',
            badExample: '',
            reason: 'Standard',
            severity: 'error',
            keywords: [],
          },
        ],
      };

      const score = await calculateKBQuality(kb);

      const issue = score.breakdown.conventions.issues.find(
        i => i.description.includes('missing bad example')
      );
      expect(issue).toBeDefined();
    });

    it('应该识别缺少 reason 的约定', async () => {
      const kb: KnowledgeBase = {
        components: [],
        styles: [],
        conventions: [
          {
            conventionType: 'Naming',
            rule: 'Use PascalCase',
            goodExample: 'UserProfile',
            badExample: 'user_profile',
            reason: '',
            severity: 'error',
            keywords: [],
          },
        ],
      };

      const score = await calculateKBQuality(kb);

      const issue = score.breakdown.conventions.issues.find(
        i => i.description.includes('missing reason')
      );
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('warning');
    });

    it('应该计算 actionable 指标', async () => {
      const kb: KnowledgeBase = {
        components: [],
        styles: [],
        conventions: [
          {
            conventionType: 'Naming',
            rule: 'Use PascalCase',
            goodExample: 'UserProfile',
            badExample: 'user_profile',
            reason: 'Improves readability',
            severity: 'error',
            keywords: [],
          },
        ],
      };

      const score = await calculateKBQuality(kb);

      expect(score.breakdown.conventions.metrics.actionable).toBe(100);
    });
  });

  describe('可复用性评分', () => {
    it('应该为文档完整的组件给高复用分', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [{ name: 'label', type: 'string' }],
            description: 'Reusable button',
            usageExample: '<Button label="Click" />',
            keywords: ['button', 'click', 'ui'],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      expect(score.reusability).toBeGreaterThan(80);
    });

    it('应该为缺少文档的组件给低复用分', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [],
            keywords: [],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      expect(score.reusability).toBeLessThan(70);
    });
  });

  describe('质量报告生成', () => {
    it('应该生成可读的质量报告', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [],
            keywords: [],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);
      const report = generateQualityReport(score);

      expect(report).toContain('Knowledge Base Quality Report');
      expect(report).toContain('Overall Score');
      expect(report).toContain('Component Quality');
      expect(report).toContain('Style Quality');
      expect(report).toContain('Convention Quality');
    });

    it('应该包含关键问题', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: 'invalid-path',
            props: [],
            keywords: [],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);
      const report = generateQualityReport(score);

      expect(report).toContain('Critical Issues');
    });

    it('应该显示警告', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [],
            keywords: [],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);
      const report = generateQualityReport(score);

      expect(report).toContain('Warnings');
    });
  });

  describe('边界情况', () => {
    it('应该处理空知识库', async () => {
      const kb: KnowledgeBase = {
        components: [],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      expect(score.overall).toBe(0);
      expect(score.breakdown.components.score).toBe(0);
      expect(score.breakdown.styles.score).toBe(0);
      expect(score.breakdown.conventions.score).toBe(0);
    });

    it('应该处理只有组件的知识库', async () => {
      const kb: KnowledgeBase = {
        components: [
          {
            componentName: 'Button',
            framework: 'React',
            importPath: '@/components/Button',
            props: [{ name: 'label', type: 'string', description: 'Label' }],
            description: 'Button',
            usageExample: '<Button />',
            keywords: ['button'],
          },
        ],
        styles: [],
        conventions: [],
      };

      const score = await calculateKBQuality(kb);

      expect(score.overall).toBeGreaterThan(0);
      expect(score.breakdown.components.score).toBeGreaterThan(0);
    });

    it('应该处理大量数据', async () => {
      const kb: KnowledgeBase = {
        components: Array.from({ length: 100 }, (_, i) => ({
          componentName: `Component${i}`,
          framework: 'React',
          importPath: `@/components/Component${i}`,
          props: [{ name: 'prop', type: 'string' }],
          keywords: ['component'],
          description: 'Test component',
        })),
        styles: Array.from({ length: 100 }, (_, i) => ({
          name: `--var-${i}`,
          value: `${i}px`,
          styleType: 'CSS Variable',
          category: 'spacing',
          usage: 'Spacing',
          keywords: ['spacing'],
        })),
        conventions: Array.from({ length: 100 }, (_, i) => ({
          conventionType: 'Naming',
          rule: `Rule ${i}`,
          goodExample: 'good',
          badExample: 'bad',
          reason: 'reason',
          severity: 'error' as const,
          keywords: ['rule'],
        })),
      };

      const score = await calculateKBQuality(kb);

      expect(score).toBeDefined();
      expect(score.overall).toBeGreaterThan(0);
    });
  });
});
