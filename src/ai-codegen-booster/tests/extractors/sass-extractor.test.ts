/**
 * Tests for Sass/SCSS Extractor
 */

import { describe, it, expect } from 'vitest';
import { extractSass, categorizeSassVariable } from '../../src/extractors/sass-extractor';

describe('Sass Extractor', () => {
  describe('extractSass()', () => {
    it('should extract Sass variables', async () => {
      const sassContent = `
        $primary-color: #3b82f6;
        $spacing-4: 1rem;
        $font-family: 'Inter', sans-serif;
      `;

      const result = await extractSass(sassContent);

      expect(result.variables).toHaveLength(3);
      expect(result.variables[0]).toMatchObject({
        name: '$primary-color',
        value: '#3b82f6',
      });
      expect(result.variables[1].name).toBe('$spacing-4');
      expect(result.variables[2].name).toBe('$font-family');
    });

    it('should extract Sass mixins and classes', async () => {
      const sassContent = `
        .center-flex {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `;

      const result = await extractSass(sassContent);

      expect(result.utilities).toHaveLength(1);
      expect(result.utilities[0].selector).toBe('.center-flex');
    });

    it('should handle nested Sass rules', async () => {
      const sassContent = `
        .card {
          padding: 1rem;
          .title {
            font-size: 1.5rem;
          }
        }
      `;

      const result = await extractSass(sassContent);

      expect(result.utilities.length).toBeGreaterThan(0);
    });

    it('should handle empty Sass content', async () => {
      const result = await extractSass('');

      expect(result.variables).toHaveLength(0);
      expect(result.utilities).toHaveLength(0);
    });

    it('should handle SCSS with comments', async () => {
      const sassContent = `
        // Primary color
        $primary-color: #3b82f6;
        /* Secondary color */
        $secondary-color: #6b7280;
      `;

      const result = await extractSass(sassContent);

      expect(result.variables).toHaveLength(2);
    });
  });

  describe('categorizeSassVariable()', () => {
    it('should categorize color variables', () => {
      expect(categorizeSassVariable('$primary-color', '#3b82f6')).toBe('Color');
      expect(categorizeSassVariable('$bg-blue', 'rgb(59, 130, 246)')).toBe('Color');
    });

    it('should categorize spacing variables', () => {
      expect(categorizeSassVariable('$spacing-4', '1rem')).toBe('Spacing');
      expect(categorizeSassVariable('$padding-lg', '2rem')).toBe('Spacing');
    });

    it('should categorize typography variables', () => {
      expect(categorizeSassVariable('$font-family', 'Inter')).toBe('Typography');
      expect(categorizeSassVariable('$text-size', '1.125rem')).toBe('Typography');
    });

    it('should default to Other for unknown variables', () => {
      expect(categorizeSassVariable('$custom-var', 'value')).toBe('Other');
    });
  });
});
