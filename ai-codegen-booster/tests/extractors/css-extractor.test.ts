/**
 * Tests for CSS Extractor
 */

import { describe, it, expect } from 'vitest';
import { extractCSS, categorizeVariable, categorizeUtility } from '../src/extractors/css-extractor';

describe('CSS Extractor', () => {
  describe('extractCSS()', () => {
    it('should extract CSS variables from :root', async () => {
      const cssContent = `
        :root {
          --primary-color: #3b82f6;
          --spacing-4: 1rem;
          --font-sans: 'Inter', sans-serif;
        }
      `;

      const result = await extractCSS(cssContent);

      expect(result.variables).toHaveLength(3);
      expect(result.variables[0]).toMatchObject({
        name: '--primary-color',
        value: '#3b82f6',
      });
    });

    it('should extract utility classes', async () => {
      const cssContent = `
        .bg-primary {
          background-color: var(--primary-color);
        }

        .text-lg {
          font-size: 1.125rem;
        }
      `;

      const result = await extractCSS(cssContent);

      expect(result.utilities).toHaveLength(2);
      expect(result.utilities[0].selector).toBe('.bg-primary');
      expect(result.utilities[0].properties['background-color']).toBe('var(--primary-color)');
    });

    it('should handle empty CSS', async () => {
      const result = await extractCSS('');

      expect(result.variables).toHaveLength(0);
      expect(result.utilities).toHaveLength(0);
    });

    it('should skip non-utility classes', async () => {
      const cssContent = `
        .component-wrapper .nested-element {
          color: red;
        }
      `;

      const result = await extractCSS(cssContent);

      expect(result.utilities).toHaveLength(0);
    });
  });

  describe('categorizeVariable()', () => {
    it('should categorize color variables', () => {
      expect(categorizeVariable('--primary-color', '#3b82f6')).toBe('Color');
      expect(categorizeVariable('--bg-blue', 'rgb(59, 130, 246)')).toBe('Color');
      expect(categorizeVariable('--text', 'hsl(220, 13%, 13%)')).toBe('Color');
    });

    it('should categorize spacing variables', () => {
      expect(categorizeVariable('--spacing-4', '1rem')).toBe('Spacing');
      expect(categorizeVariable('--gap-lg', '2rem')).toBe('Spacing');
      expect(categorizeVariable('--padding-x', '16px')).toBe('Spacing');
      expect(categorizeVariable('--margin-y', '8px')).toBe('Spacing');
    });

    it('should categorize typography variables', () => {
      expect(categorizeVariable('--font-sans', 'Inter')).toBe('Typography');
      expect(categorizeVariable('--text-sm', '0.875rem')).toBe('Typography');
      expect(categorizeVariable('--font-weight', '600')).toBe('Typography');
    });

    it('should categorize shadow variables', () => {
      expect(categorizeVariable('--shadow-md', '0 4px 6px rgba(0,0,0,0.1)')).toBe('Shadow');
      expect(categorizeVariable('--box-shadow', '0 2px 4px')).toBe('Shadow');
    });

    it('should default to Other for unknown variables', () => {
      expect(categorizeVariable('--custom-var', 'value')).toBe('Other');
    });
  });

  describe('categorizeUtility()', () => {
    it('should categorize color utilities', () => {
      expect(categorizeUtility('.bg-primary')).toBe('Color');
      expect(categorizeUtility('.text-blue')).toBe('Color');
    });

    it('should categorize spacing utilities', () => {
      expect(categorizeUtility('.p-4')).toBe('Spacing');
      expect(categorizeUtility('.m-8')).toBe('Spacing');
      expect(categorizeUtility('.gap-6')).toBe('Spacing');
    });

    it('should categorize typography utilities', () => {
      expect(categorizeUtility('.text-lg')).toBe('Typography');
      expect(categorizeUtility('.font-bold')).toBe('Typography');
    });

    it('should default to Layout for unknown utilities', () => {
      expect(categorizeUtility('.flex')).toBe('Layout');
      expect(categorizeUtility('.grid')).toBe('Layout');
    });
  });
});
