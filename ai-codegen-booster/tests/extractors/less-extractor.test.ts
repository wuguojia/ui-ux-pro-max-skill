/**
 * Tests for Less Extractor
 */

import { describe, it, expect } from 'vitest';
import { extractLess, categorizeLessVariable } from '../../src/extractors/less-extractor';

describe('Less Extractor', () => {
  describe('extractLess()', () => {
    it('should extract Less variables', async () => {
      const lessContent = `
        @primary-color: #3b82f6;
        @spacing-4: 1rem;
        @font-family: 'Inter', sans-serif;
      `;

      const result = await extractLess(lessContent);

      expect(result.variables).toHaveLength(3);
      expect(result.variables[0]).toMatchObject({
        name: '@primary-color',
        value: '#3b82f6',
      });
      expect(result.variables[1].name).toBe('@spacing-4');
      expect(result.variables[2].name).toBe('@font-family');
    });

    it('should extract Less mixins', async () => {
      const lessContent = `
        .center-flex {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `;

      const result = await extractLess(lessContent);

      expect(result.utilities).toHaveLength(1);
      expect(result.utilities[0].selector).toBe('.center-flex');
    });

    it('should handle nested Less rules', async () => {
      const lessContent = `
        .card {
          padding: 1rem;
          .title {
            font-size: 1.5rem;
          }
        }
      `;

      const result = await extractLess(lessContent);

      expect(result.utilities.length).toBeGreaterThan(0);
    });

    it('should handle empty Less content', async () => {
      const result = await extractLess('');

      expect(result.variables).toHaveLength(0);
      expect(result.utilities).toHaveLength(0);
    });

    it('should handle Less with comments', async () => {
      const lessContent = `
        // Primary color
        @primary-color: #3b82f6;
        /* Secondary color */
        @secondary-color: #6b7280;
      `;

      const result = await extractLess(lessContent);

      expect(result.variables).toHaveLength(2);
    });
  });

  describe('categorizeLessVariable()', () => {
    it('should categorize color variables', () => {
      expect(categorizeLessVariable('@primary-color', '#3b82f6')).toBe('Color');
      expect(categorizeLessVariable('@bg-blue', 'rgb(59, 130, 246)')).toBe('Color');
    });

    it('should categorize spacing variables', () => {
      expect(categorizeLessVariable('@spacing-4', '1rem')).toBe('Spacing');
      expect(categorizeLessVariable('@padding-lg', '2rem')).toBe('Spacing');
    });

    it('should categorize typography variables', () => {
      expect(categorizeLessVariable('@font-family', 'Inter')).toBe('Typography');
      expect(categorizeLessVariable('@text-size', '1.125rem')).toBe('Typography');
    });

    it('should default to Other for unknown variables', () => {
      expect(categorizeLessVariable('@custom-var', 'value')).toBe('Other');
    });
  });
});
