/**
 * Tests for CSV Generator
 */

import { describe, it, expect } from 'vitest';
import {
  generateComponentsCSV,
  generateStylesCSV,
  generateConventionsCSV,
  mergeComponentsCSV,
  mergeStylesCSV,
} from '../../src/kb/csv-generator';
import type { ComponentData, StyleData, ConventionData } from '../../src/kb/types';

describe('CSV Generator', () => {
  describe('generateComponentsCSV', () => {
    it('should generate CSV from component data', () => {
      const components: ComponentData[] = [
        {
          componentName: 'Button',
          framework: 'React',
          importPath: '@/components/Button',
          filePath: '/src/components/Button.tsx',
          props: [
            { name: 'variant', type: 'string', required: true },
            { name: 'size', type: 'string', required: false, default: 'md' },
          ],
          description: 'Button component',
          category: 'UI',
          keywords: ['button', 'click'],
        },
      ];

      const csv = generateComponentsCSV(components);

      expect(csv).toContain('Component_Name');
      expect(csv).toContain('Button');
      expect(csv).toContain('React');
      expect(csv).toContain('@/components/Button');
      expect(csv).toContain('variant, size');
    });

    it('should handle Vue components with events and slots', () => {
      const components: ComponentData[] = [
        {
          componentName: 'Modal',
          framework: 'Vue',
          importPath: '@/components/Modal',
          filePath: '/src/components/Modal.vue',
          props: [],
          events: ['close', 'submit'],
          slots: ['header', 'footer', 'default'],
          apiStyle: 'Composition',
          description: 'Modal component',
          category: 'UI',
          keywords: ['modal', 'dialog'],
        },
      ];

      const csv = generateComponentsCSV(components);

      expect(csv).toContain('Modal');
      expect(csv).toContain('close, submit');
      expect(csv).toContain('header, footer, default');
      expect(csv).toContain('Composition');
    });

    it('should escape CSV special characters', () => {
      const components: ComponentData[] = [
        {
          componentName: 'Test',
          framework: 'React',
          importPath: '@/test',
          filePath: '/test.tsx',
          props: [],
          description: 'A description with, comma',
          category: 'UI',
          keywords: ['test'],
        },
      ];

      const csv = generateComponentsCSV(components);

      // Comma in description should be escaped with quotes
      expect(csv).toContain('"A description with, comma"');
    });
  });

  describe('generateStylesCSV', () => {
    it('should generate CSV from style data', () => {
      const styles: StyleData[] = [
        {
          styleType: 'CSS Variable',
          name: '--primary-color',
          value: '#3b82f6',
          category: 'Color',
          usage: 'var(--primary-color)',
          example: 'var(--primary-color)',
          preprocessor: 'CSS',
          keywords: ['primary', 'color'],
          filePath: '/styles.css',
        },
        {
          styleType: 'Less Variable',
          name: '@spacing-4',
          value: '1rem',
          category: 'Spacing',
          usage: '@spacing-4',
          example: '@spacing-4',
          preprocessor: 'Less',
          keywords: ['spacing'],
          filePath: '/styles.less',
        },
      ];

      const csv = generateStylesCSV(styles);

      expect(csv).toContain('Style_Type');
      expect(csv).toContain('CSS Variable');
      expect(csv).toContain('--primary-color');
      expect(csv).toContain('Less Variable');
      expect(csv).toContain('@spacing-4');
      expect(csv).toContain('Preprocessor');
    });

    it('should handle utility classes', () => {
      const styles: StyleData[] = [
        {
          styleType: 'Utility Class',
          name: '.btn-primary',
          value: '{"background":"blue","padding":"1rem"}',
          category: 'Layout',
          usage: 'Apply class',
          example: '.btn-primary',
          keywords: ['button', 'primary'],
          filePath: '/styles.css',
        },
      ];

      const csv = generateStylesCSV(styles);

      expect(csv).toContain('Utility Class');
      expect(csv).toContain('.btn-primary');
    });
  });

  describe('generateConventionsCSV', () => {
    it('should generate CSV from convention data', () => {
      const conventions: ConventionData[] = [
        {
          conventionType: 'Naming',
          rule: 'Use PascalCase for components',
          goodExample: 'MyComponent',
          badExample: 'myComponent',
          reason: 'Consistency',
          severity: 'error',
          keywords: ['naming', 'component'],
        },
      ];

      const csv = generateConventionsCSV(conventions);

      expect(csv).toContain('Convention_Type');
      expect(csv).toContain('Naming');
      expect(csv).toContain('PascalCase');
      expect(csv).toContain('MyComponent');
      expect(csv).toContain('error');
    });
  });

  describe('mergeComponentsCSV', () => {
    it('should merge two component CSV files', () => {
      const csv1 = `No,Component_Name,Framework,Import_Path,Props,Props_Types,Default_Props,Events,Slots,API_Style,Description,Usage_Example,Category,Keywords
1,Button,React,@/Button,,,,,,,Button component,<Button />,UI,button`;

      const csv2 = `No,Component_Name,Framework,Import_Path,Props,Props_Types,Default_Props,Events,Slots,API_Style,Description,Usage_Example,Category,Keywords
1,Card,React,@/Card,,,,,,,Card component,<Card />,UI,card`;

      const merged = mergeComponentsCSV(csv1, csv2);

      expect(merged).toContain('Button');
      expect(merged).toContain('Card');

      // Should have 2 data rows (plus header)
      const lines = merged.split('\n').filter(l => l.trim());
      expect(lines.length).toBe(3); // 1 header + 2 components
    });

    it('should deduplicate components by name', () => {
      const csv1 = `No,Component_Name,Framework,Import_Path,Props,Props_Types,Default_Props,Events,Slots,API_Style,Description,Usage_Example,Category,Keywords
1,Button,React,@/Button,,,,,,,Button v1,<Button />,UI,button`;

      const csv2 = `No,Component_Name,Framework,Import_Path,Props,Props_Types,Default_Props,Events,Slots,API_Style,Description,Usage_Example,Category,Keywords
1,Button,React,@/Button,,,,,,,Button v2,<Button />,UI,button`;

      const merged = mergeComponentsCSV(csv1, csv2);

      // Should only have 1 Button (from csv1)
      expect(merged).toContain('Button v1');
      expect(merged).not.toContain('Button v2');

      const lines = merged.split('\n').filter(l => l.trim());
      expect(lines.length).toBe(2); // 1 header + 1 component
    });

    it('should renumber rows after merge', () => {
      const csv1 = `No,Component_Name,Framework,Import_Path,Props,Props_Types,Default_Props,Events,Slots,API_Style,Description,Usage_Example,Category,Keywords
5,Button,React,@/Button,,,,,,,Button,<Button />,UI,button`;

      const csv2 = `No,Component_Name,Framework,Import_Path,Props,Props_Types,Default_Props,Events,Slots,API_Style,Description,Usage_Example,Category,Keywords
10,Card,React,@/Card,,,,,,,Card,<Card />,UI,card`;

      const merged = mergeComponentsCSV(csv1, csv2);

      // Should renumber to 1, 2
      expect(merged).toContain('\n1,Button');
      expect(merged).toContain('\n2,Card');
    });
  });

  describe('mergeStylesCSV', () => {
    it('should merge two style CSV files', () => {
      const csv1 = `No,Style_Type,Name,Value,Category,Usage,Example,Preprocessor,Keywords
1,CSS Variable,--primary,#blue,Color,var(--primary),var(--primary),CSS,primary`;

      const csv2 = `No,Style_Type,Name,Value,Category,Usage,Example,Preprocessor,Keywords
1,Less Variable,@secondary,#red,Color,@secondary,@secondary,Less,secondary`;

      const merged = mergeStylesCSV(csv1, csv2);

      expect(merged).toContain('--primary');
      expect(merged).toContain('@secondary');

      const lines = merged.split('\n').filter(l => l.trim());
      expect(lines.length).toBe(3); // 1 header + 2 styles
    });

    it('should deduplicate styles by name', () => {
      const csv1 = `No,Style_Type,Name,Value,Category,Usage,Example,Preprocessor,Keywords
1,CSS Variable,--primary,#blue,Color,var(--primary),var(--primary),CSS,primary`;

      const csv2 = `No,Style_Type,Name,Value,Category,Usage,Example,Preprocessor,Keywords
1,CSS Variable,--primary,#red,Color,var(--primary),var(--primary),CSS,primary`;

      const merged = mergeStylesCSV(csv1, csv2);

      // Should only have 1 --primary (from csv1)
      expect(merged).toContain('#blue');
      expect(merged).not.toContain('#red');

      const lines = merged.split('\n').filter(l => l.trim());
      expect(lines.length).toBe(2); // 1 header + 1 style
    });
  });
});
