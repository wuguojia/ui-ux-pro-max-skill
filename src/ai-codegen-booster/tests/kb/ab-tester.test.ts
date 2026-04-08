/**
 * Tests for A/B Tester
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ABTester } from '../../src/kb/ab-tester';
import type { KnowledgeBase, ComponentData, StyleData } from '../../src/kb/types';

describe('ABTester', () => {
  let kb: KnowledgeBase;
  let tester: ABTester;

  beforeEach(() => {
    // Create mock KB
    const components: ComponentData[] = [
      {
        componentName: 'Button',
        framework: 'React',
        importPath: '@/components/Button',
        filePath: '/src/components/Button.tsx',
        props: [
          { name: 'variant', type: 'string', required: true },
        ],
        keywords: ['button'],
      },
    ];

    const styles: StyleData[] = [
      {
        styleType: 'CSS Variable',
        name: '--primary-color',
        value: '#3b82f6',
        category: 'Color',
        usage: 'var(--primary-color)',
        example: 'var(--primary-color)',
        keywords: ['primary'],
        filePath: '/styles.css',
      },
    ];

    kb = {
      config: {
        mode: 'project',
        basePath: '/test',
        outputDir: '/test/kb',
        sources: [],
      },
      components,
      styles,
      conventions: [],
      lastUpdated: new Date(),
      version: '1.3.0',
    };

    tester = new ABTester({ kb });
  });

  describe('runTest', () => {
    it('should compare code with and without KB', async () => {
      const codeWithoutKB = `
        import { Button } from './components/Button';

        function App() {
          return <Button style={{ color: '#3b82f6' }}>Click</Button>;
        }
      `;

      const codeWithKB = `
        import { Button } from '@/components/Button';

        function App() {
          return <Button variant="primary" style={{ color: 'var(--primary-color)' }}>Click</Button>;
        }
      `;

      const result = await tester.runTest(
        'Create a button component',
        codeWithoutKB,
        codeWithKB,
        'React'
      );

      expect(result.versionA.withKB).toBe(false);
      expect(result.versionB.withKB).toBe(true);
      expect(result.improvements).toBeDefined();
      expect(result.comparison).toBeDefined();
      expect(result.winner).toBeDefined();
    });

    it('should show KB version is better when quality improves', async () => {
      const codeWithoutKB = `
        function App() {
          return <button style={{ color: '#ff0000' }}>Click</button>;
        }
      `;

      const codeWithKB = `
        import { Button } from '@/components/Button';

        function App() {
          return <Button variant="primary">Click</Button>;
        }
      `;

      const result = await tester.runTest(
        'Create a button',
        codeWithoutKB,
        codeWithKB,
        'React'
      );

      expect(result.improvements.qualityScoreImprovement).toBeGreaterThan(0);
      expect(result.winner).toBe('B');
    });

    it('should detect tie when versions are similar', async () => {
      const code = `
        function App() {
          return <div>Hello</div>;
        }
      `;

      const result = await tester.runTest(
        'Simple div',
        code,
        code,
        'React'
      );

      expect(result.improvements.qualityScoreImprovement).toBe(0);
      expect(result.winner).toBe('tie');
    });
  });

  describe('calculateImprovements', () => {
    it('should calculate improvements correctly', async () => {
      const codeA = `function App() { return <div style={{ color: '#ff0000' }}>A</div>; }`;
      const codeB = `
        import { Button } from '@/components/Button';
        function App() { return <Button variant="primary">B</Button>; }
      `;

      const result = await tester.runTest('Test', codeA, codeB, 'React');

      expect(result.improvements.correctnessImprovement).toBeDefined();
      expect(result.improvements.consistencyImprovement).toBeDefined();
      expect(result.improvements.maintainabilityImprovement).toBeDefined();
      expect(result.improvements.qualityScoreImprovement).toBeDefined();
    });
  });

  describe('formatReport', () => {
    it('should generate formatted report', async () => {
      const codeA = `function App() { return <div>A</div>; }`;
      const codeB = `function App() { return <div>B</div>; }`;

      const result = await tester.runTest('Test', codeA, codeB, 'React');
      const report = tester.formatReport(result);

      expect(report).toContain('A/B TEST REPORT');
      expect(report).toContain('RESULTS');
      expect(report).toContain('DETAILED COMPARISON');
      expect(report).toContain('Quality Scores');
    });
  });
});
