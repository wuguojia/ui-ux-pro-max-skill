/**
 * Tests for schema definitions
 */

import { describe, it, expect } from 'vitest';
import {
  componentsSchema,
  stylesSchema,
  conventionsSchema,
  SCHEMAS,
  getSchema,
  isValidDomain
} from '../src/config/schemas';

describe('Schema Definitions', () => {
  describe('componentsSchema', () => {
    it('should have correct domain name', () => {
      expect(componentsSchema.domain).toBe('components');
    });

    it('should have correct CSV file name', () => {
      expect(componentsSchema.csvFile).toBe('components.csv');
    });

    it('should have required fields', () => {
      const requiredFields = componentsSchema.fields.filter(f => f.required);
      const requiredNames = requiredFields.map(f => f.name);

      expect(requiredNames).toContain('No');
      expect(requiredNames).toContain('Component_Name');
      expect(requiredNames).toContain('Framework');
      expect(requiredNames).toContain('Description');
      expect(requiredNames).toContain('Usage_Example');
      expect(requiredNames).toContain('Keywords');
    });

    it('should have No field as number type', () => {
      const noField = componentsSchema.fields.find(f => f.name === 'No');
      expect(noField?.type).toBe('number');
    });
  });

  describe('stylesSchema', () => {
    it('should have correct domain name', () => {
      expect(stylesSchema.domain).toBe('styles');
    });

    it('should have Style_Type field', () => {
      const styleTypeField = stylesSchema.fields.find(f => f.name === 'Style_Type');
      expect(styleTypeField).toBeDefined();
      expect(styleTypeField?.required).toBe(true);
    });
  });

  describe('conventionsSchema', () => {
    it('should have correct domain name', () => {
      expect(conventionsSchema.domain).toBe('conventions');
    });

    it('should have Good_Example and Bad_Example fields', () => {
      const fieldNames = conventionsSchema.fields.map(f => f.name);
      expect(fieldNames).toContain('Good_Example');
      expect(fieldNames).toContain('Bad_Example');
    });
  });

  describe('SCHEMAS registry', () => {
    it('should contain all schemas', () => {
      expect(SCHEMAS.components).toBeDefined();
      expect(SCHEMAS.styles).toBeDefined();
      expect(SCHEMAS.conventions).toBeDefined();
    });

    it('should return correct schema by domain', () => {
      expect(SCHEMAS.components.domain).toBe('components');
      expect(SCHEMAS.styles.domain).toBe('styles');
    });
  });

  describe('getSchema()', () => {
    it('should return schema for valid domain', () => {
      const schema = getSchema('components');
      expect(schema).toBeDefined();
      expect(schema?.domain).toBe('components');
    });

    it('should return undefined for invalid domain', () => {
      const schema = getSchema('invalid');
      expect(schema).toBeUndefined();
    });
  });

  describe('isValidDomain()', () => {
    it('should return true for valid domains', () => {
      expect(isValidDomain('components')).toBe(true);
      expect(isValidDomain('styles')).toBe(true);
      expect(isValidDomain('conventions')).toBe(true);
    });

    it('should return false for invalid domains', () => {
      expect(isValidDomain('invalid')).toBe(false);
      expect(isValidDomain('')).toBe(false);
      expect(isValidDomain('Components')).toBe(false); // case-sensitive
    });
  });
});
