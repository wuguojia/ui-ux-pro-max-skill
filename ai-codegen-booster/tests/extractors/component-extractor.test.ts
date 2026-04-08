/**
 * Tests for Component Extractor
 */

import { describe, it, expect } from 'vitest';
import {
  extractComponent,
  extractPropsFromType,
  typeNodeToString,
} from '../../src/extractors/component-extractor';

describe('Component Extractor', () => {
  describe('extractComponent()', () => {
    it('should extract component name from function declaration', async () => {
      const code = `
        export function Button() {
          return <button>Click</button>;
        }
      `;

      const result = await extractComponent(code);

      expect(result.name).toBe('Button');
    });

    it('should extract props from TypeScript interface', async () => {
      const code = `
        interface ButtonProps {
          variant: 'primary' | 'secondary';
          size?: 'sm' | 'lg';
          disabled: boolean;
        }

        export function Button(props: ButtonProps) {
          return <button>Click</button>;
        }
      `;

      const result = await extractComponent(code);

      expect(result.props).toHaveLength(3);
      expect(result.props.find(p => p.name === 'variant')).toMatchObject({
        name: 'variant',
        required: true,
      });
      expect(result.props.find(p => p.name === 'size')).toMatchObject({
        name: 'size',
        required: false,
      });
    });

    it('should extract import dependencies', async () => {
      const code = `
        import { Card } from '@/components/ui/card';
        import { Button } from './Button';

        export function Feature() {
          return (
            <Card>
              <Button />
            </Card>
          );
        }
      `;

      const result = await extractComponent(code);

      expect(result.dependencies).toContain('Card');
      expect(result.dependencies).toContain('Button');
    });

    it('should handle component without props', async () => {
      const code = `
        export function Header() {
          return <header>My App</header>;
        }
      `;

      const result = await extractComponent(code);

      expect(result.name).toBe('Header');
      expect(result.props).toHaveLength(0);
    });

    it('should extract from arrow function', async () => {
      const code = `
        export const Button = () => {
          return <button>Click</button>;
        };
      `;

      const result = await extractComponent(code);

      expect(result.name).toBe('Button');
    });
  });

  describe('typeNodeToString()', () => {
    it('should convert string keyword', () => {
      expect(typeNodeToString({ type: 'TSStringKeyword' })).toBe('string');
    });

    it('should convert number keyword', () => {
      expect(typeNodeToString({ type: 'TSNumberKeyword' })).toBe('number');
    });

    it('should convert boolean keyword', () => {
      expect(typeNodeToString({ type: 'TSBooleanKeyword' })).toBe('boolean');
    });

    it('should handle null input', () => {
      expect(typeNodeToString(null)).toBe('any');
    });
  });
});
