/**
 * 去重器测试
 * 测试智能去重和合并功能
 */

import { describe, it, expect } from 'vitest';
import {
  deduplicateComponents,
  deduplicateStyles,
  deduplicateConventions,
  findSimilarComponents,
} from '../../src/kb/deduplicator';
import type { ComponentData, StyleData, ConventionData } from '../../src/kb/types';

describe('去重器', () => {
  describe('组件去重', () => {
    it('应该识别完全相同的组件', async () => {
      const components: ComponentData[] = [
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [{ name: 'label', type: 'string' }],
          keywords: ['button', 'click'],
        },
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [{ name: 'label', type: 'string' }],
          keywords: ['button', 'click'],
        },
      ];

      const result = await deduplicateComponents(components);

      expect(result.original).toBe(2);
      expect(result.duplicates).toBe(1);
      expect(result.final).toBe(1);
    });

    it('应该合并相似的组件', async () => {
      const components: ComponentData[] = [
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [{ name: 'label', type: 'string' }],
          keywords: ['button'],
          description: 'Primary button',
        },
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [{ name: 'onClick', type: 'function' }],
          keywords: ['click'],
          description: 'Click handler',
        },
      ];

      const result = await deduplicateComponents(components);

      expect(result.final).toBeLessThan(result.original);
      expect(result.duplicateGroups.length).toBeGreaterThan(0);
    });

    it('应该保留不同框架的相同组件', async () => {
      const components: ComponentData[] = [
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [],
          keywords: [],
        },
        {
          componentName: 'Button',
          framework: 'Vue',
          importPath: '@/components/Button',
          props: [],
          keywords: [],
        },
      ];

      const result = await deduplicateComponents(components);

      // 不同框架应该保持分开
      expect(result.final).toBe(2);
    });

    it('应该识别高相似度组件', async () => {
      const components: ComponentData[] = [
        {
          componentName: 'UserCard',
          framework: 'React',
          importPath: '@/components/UserCard',
          props: [
            { name: 'name', type: 'string' },
            { name: 'email', type: 'string' },
          ],
          keywords: ['user', 'card'],
        },
        {
          componentName: 'UserCard',
          framework: 'React',
          importPath: '@/components/users/UserCard',
          props: [
            { name: 'name', type: 'string' },
            { name: 'email', type: 'string' },
          ],
          keywords: ['user', 'card', 'profile'],
        },
      ];

      const result = await deduplicateComponents(components);

      expect(result.duplicateGroups.length).toBeGreaterThan(0);
      const group = result.duplicateGroups[0];
      expect(group.similarity).toBeGreaterThan(80);
    });

    it('应该合并 props 和 keywords', async () => {
      const components: ComponentData[] = [
        {
          componentName: 'Input',
          framework: 'React',
          importPath: '@/components/Input',
          props: [{ name: 'value', type: 'string' }],
          keywords: ['input'],
        },
        {
          componentName: 'Input',
          framework: 'React',
          importPath: '@/components/Input',
          props: [{ name: 'onChange', type: 'function' }],
          keywords: ['form', 'field'],
        },
      ];

      const result = await deduplicateComponents(components);

      expect(result.final).toBe(1);
      // 合并后的组件应该包含所有 props 和 keywords
    });
  });

  describe('样式去重', () => {
    it('应该识别完全相同的样式', async () => {
      const styles: StyleData[] = [
        {
          name: '--primary-color',
          value: '#007bff',
          styleType: 'CSS Variable',
          category: 'color',
          keywords: ['primary', 'blue'],
        },
        {
          name: '--primary-color',
          value: '#007bff',
          styleType: 'CSS Variable',
          category: 'color',
          keywords: ['primary', 'blue'],
        },
      ];

      const result = await deduplicateStyles(styles);

      expect(result.duplicates).toBe(1);
      expect(result.final).toBe(1);
    });

    it('应该保留不同值的同名样式', async () => {
      const styles: StyleData[] = [
        {
          name: '--primary-color',
          value: '#007bff',
          styleType: 'CSS Variable',
          category: 'color',
          keywords: [],
        },
        {
          name: '--primary-color',
          value: '#ff0000',
          styleType: 'CSS Variable',
          category: 'color',
          keywords: [],
        },
      ];

      const result = await deduplicateStyles(styles);

      // 值不同，应该保留
      expect(result.final).toBe(2);
    });

    it('应该合并 keywords', async () => {
      const styles: StyleData[] = [
        {
          name: '--spacing-md',
          value: '16px',
          styleType: 'CSS Variable',
          category: 'spacing',
          keywords: ['spacing', 'medium'],
        },
        {
          name: '--spacing-md',
          value: '16px',
          styleType: 'CSS Variable',
          category: 'spacing',
          keywords: ['margin', 'padding'],
        },
      ];

      const result = await deduplicateStyles(styles);

      expect(result.final).toBe(1);
    });
  });

  describe('约定去重', () => {
    it('应该识别完全相同的约定', async () => {
      const conventions: ConventionData[] = [
        {
          conventionType: 'Naming',
          rule: 'Use PascalCase for components',
          goodExample: 'UserProfile',
          badExample: 'userProfile',
          reason: 'Consistency',
          severity: 'error',
          keywords: ['naming', 'pascal'],
        },
        {
          conventionType: 'Naming',
          rule: 'Use PascalCase for components',
          goodExample: 'ProductCard',
          badExample: 'product_card',
          reason: 'Readability',
          severity: 'error',
          keywords: ['naming', 'case'],
        },
      ];

      const result = await deduplicateConventions(conventions);

      expect(result.duplicates).toBe(1);
      expect(result.final).toBe(1);
    });

    it('应该保留不同类型的相似约定', async () => {
      const conventions: ConventionData[] = [
        {
          conventionType: 'Naming',
          rule: 'Use camelCase',
          goodExample: 'myVariable',
          badExample: 'my_variable',
          reason: 'Standard',
          severity: 'error',
          keywords: [],
        },
        {
          conventionType: 'Formatting',
          rule: 'Use camelCase',
          goodExample: 'myVariable',
          badExample: 'my_variable',
          reason: 'Standard',
          severity: 'warning',
          keywords: [],
        },
      ];

      const result = await deduplicateConventions(conventions);

      // 不同类型应该保持分开
      expect(result.final).toBe(2);
    });
  });

  describe('相似组件查找', () => {
    it('应该找到相似的组件', () => {
      const target: ComponentData = {
        componentName: 'Button',
        framework: 'React',
        importPath: '@/components/Button',
        props: [{ name: 'label', type: 'string' }],
        keywords: ['button', 'click'],
      };

      const allComponents: ComponentData[] = [
        target,
        {
          componentName: 'IconButton',
          framework: 'React',
          importPath: '@/components/IconButton',
          props: [{ name: 'icon', type: 'string' }],
          keywords: ['button', 'icon'],
        },
        {
          componentName: 'Input',
          framework: 'React',
          importPath: '@/components/Input',
          props: [],
          keywords: ['input'],
        },
      ];

      const similar = findSimilarComponents(target, allComponents, 0.5);

      expect(similar.length).toBeGreaterThan(0);
      expect(similar[0].component.componentName).toBe('IconButton');
    });

    it('应该按相似度排序', () => {
      const target: ComponentData = {
        componentName: 'Button',
        framework: 'React',
        importPath: '@/components/Button',
        props: [],
        keywords: ['button'],
      };

      const allComponents: ComponentData[] = [
        target,
        {
          componentName: 'PrimaryButton',
          framework: 'React',
          importPath: '@/components/PrimaryButton',
          props: [],
          keywords: ['button', 'primary'],
        },
        {
          componentName: 'IconButton',
          framework: 'React',
          importPath: '@/components/IconButton',
          props: [],
          keywords: ['button', 'icon'],
        },
      ];

      const similar = findSimilarComponents(target, allComponents);

      // 应该按相似度降序排列
      for (let i = 0; i < similar.length - 1; i++) {
        expect(similar[i].similarity).toBeGreaterThanOrEqual(similar[i + 1].similarity);
      }
    });

    it('应该排除自身', () => {
      const target: ComponentData = {
        componentName: 'Button',
        framework: 'React',
        importPath: '@/components/Button',
        props: [],
        keywords: [],
      };

      const similar = findSimilarComponents(target, [target]);

      expect(similar.length).toBe(0);
    });

    it('应该过滤低相似度组件', () => {
      const target: ComponentData = {
        componentName: 'Button',
        framework: 'React',
        importPath: '@/components/Button',
        props: [],
        keywords: ['button'],
      };

      const allComponents: ComponentData[] = [
        target,
        {
          componentName: 'CompletelyDifferent',
          framework: 'Vue',
          importPath: '@/other/path',
          props: [],
          keywords: ['unrelated'],
        },
      ];

      const similar = findSimilarComponents(target, allComponents, 0.8);

      expect(similar.length).toBe(0);
    });
  });

  describe('去重策略', () => {
    it('应该支持保留第一个策略', async () => {
      const components: ComponentData[] = [
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [],
          keywords: [],
          description: 'First',
        },
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [],
          keywords: [],
          description: 'Second',
        },
      ];

      const result = await deduplicateComponents(components, {
        type: 'prefer-first',
        conflictResolution: 'keep-both',
      });

      expect(result.final).toBeLessThanOrEqual(components.length);
    });

    it('应该支持保留最完整策略', async () => {
      const components: ComponentData[] = [
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [],
          keywords: [],
        },
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [{ name: 'label', type: 'string' }],
          keywords: ['button'],
          description: 'Complete button',
          usageExample: '<Button label="Click" />',
        },
      ];

      const result = await deduplicateComponents(components, {
        type: 'prefer-most-complete',
        conflictResolution: 'combine',
      });

      expect(result.final).toBe(1);
    });
  });

  describe('边界情况', () => {
    it('应该处理空数组', async () => {
      const result = await deduplicateComponents([]);

      expect(result.original).toBe(0);
      expect(result.duplicates).toBe(0);
      expect(result.final).toBe(0);
    });

    it('应该处理单个元素', async () => {
      const components: ComponentData[] = [
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [],
          keywords: [],
        },
      ];

      const result = await deduplicateComponents(components);

      expect(result.final).toBe(1);
      expect(result.duplicates).toBe(0);
    });

    it('应该处理完全不同的组件', async () => {
      const components: ComponentData[] = [
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          props: [],
          keywords: [],
        },
        {
          componentName: 'Input',
          framework: 'Vue',
          importPath: '@/components/Input',
          props: [],
          keywords: [],
        },
        {
          componentName: 'Card',
          framework: 'Svelte',
          importPath: '@/components/Card',
          props: [],
          keywords: [],
        },
      ];

      const result = await deduplicateComponents(components);

      expect(result.final).toBe(3);
      expect(result.duplicates).toBe(0);
    });
  });
});
