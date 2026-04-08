/**
 * Tests for Code Validator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CodeValidator } from '../../src/kb/validator';
import type { KnowledgeBase, ComponentData, StyleData } from '../../src/kb/types';

describe('CodeValidator', () => {
  let kb: KnowledgeBase;
  let validator: CodeValidator;

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
          { name: 'onClick', type: '() => void', required: false },
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
        keywords: ['primary', 'color'],
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

    validator = new CodeValidator({ kb, framework: 'React' });
  });

  describe('validate', () => {
    it('should validate React code successfully', async () => {
      const code = `
        import { Button } from '@/components/Button';

        function App() {
          return <Button variant="primary">Click me</Button>;
        }
      `;

      const result = await validator.validate(code, 'React');

      expect(result.framework).toBe('React');
      expect(result.qualityScore.overall).toBeGreaterThan(0);
      expect(result.checks).toBeDefined();
    });

    it('should detect framework from code', async () => {
      const reactCode = `import React from 'react';`;
      const result = await validator.validate(reactCode);
      expect(result.framework).toBe('React');
    });
  });

  describe('checkImports', () => {
    it('should validate correct import paths', async () => {
      const code = `
        import { Button } from '@/components/Button';
      `;

      const result = await validator.validate(code, 'React');

      expect(result.checks.imports.accuracy).toBe(100);
      expect(result.checks.imports.issues.length).toBe(0);
    });

    it('should detect incorrect import paths', async () => {
      const code = `
        import { Button } from '@/wrong/path/Button';
      `;

      const result = await validator.validate(code, 'React');

      expect(result.checks.imports.accuracy).toBeLessThan(100);
      expect(result.checks.imports.issues.length).toBeGreaterThan(0);
    });
  });

  describe('checkPropsUsage', () => {
    it('should validate correct props usage', async () => {
      const code = `
        import { Button } from '@/components/Button';

        function App() {
          return <Button variant="primary">Click</Button>;
        }
      `;

      const result = await validator.validate(code, 'React');

      expect(result.checks.props.accuracy).toBe(100);
    });

    it('should detect missing required props', async () => {
      const code = `
        import { Button } from '@/components/Button';

        function App() {
          return <Button>Click</Button>;
        }
      `;

      const result = await validator.validate(code, 'React');

      expect(result.checks.props.accuracy).toBeLessThan(100);
      expect(result.checks.props.issues).toContain(
        expect.stringContaining('missing required props')
      );
    });
  });

  describe('checkStyleUsage', () => {
    it('should detect hardcoded colors', async () => {
      const code = `
        function App() {
          return <div style={{ color: '#ff0000' }}>Text</div>;
        }
      `;

      const result = await validator.validate(code, 'React');

      expect(result.checks.styles.hardcodedCount).toBeGreaterThan(0);
      expect(result.checks.styles.score).toBeLessThan(100);
    });

    it('should reward using KB styles', async () => {
      const code = `
        function App() {
          return <div style={{ color: 'var(--primary-color)' }}>Text</div>;
        }
      `;

      const result = await validator.validate(code, 'React');

      expect(result.checks.styles.usesProjectStyles).toBe(true);
    });
  });

  describe('calculateQualityScore', () => {
    it('should calculate overall quality score', async () => {
      const code = `
        import { Button } from '@/components/Button';

        function App() {
          return <Button variant="primary">Click</Button>;
        }
      `;

      const result = await validator.validate(code, 'React');

      expect(result.qualityScore.overall).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore.overall).toBeLessThanOrEqual(100);
      expect(result.qualityScore.correctness).toBeDefined();
      expect(result.qualityScore.consistency).toBeDefined();
      expect(result.qualityScore.maintainability).toBeDefined();
    });
  });

  describe('generateSuggestions', () => {
    it('should generate helpful suggestions', async () => {
      const code = `
        import { Button } from '@/wrong/path';

        function App() {
          return <Button>Missing required props</Button>;
        }
      `;

      const result = await validator.validate(code, 'React');

      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should indicate good code quality', async () => {
      const code = `
        import { Button } from '@/components/Button';

        function App() {
          return <Button variant="primary">Good code</Button>;
        }
      `;

      const result = await validator.validate(code, 'React');

      expect(result.suggestions).toContain(
        expect.stringContaining('looks good')
      );
    });
  });

  describe('calculateKBUsage', () => {
    it('should calculate KB usage rate', async () => {
      const code = `
        import { Button } from '@/components/Button';

        function App() {
          return (
            <div>
              <Button variant="primary">From KB</Button>
              <CustomComponent>Not from KB</CustomComponent>
            </div>
          );
        }
      `;

      const result = await validator.validate(code, 'React');

      expect(result.kbUsage.totalComponents).toBe(3); // Button, CustomComponent, div
      expect(result.kbUsage.componentsFromKB).toBe(1); // Only Button
      expect(result.kbUsage.usageRate).toBeGreaterThan(0);
    });
  });
});
