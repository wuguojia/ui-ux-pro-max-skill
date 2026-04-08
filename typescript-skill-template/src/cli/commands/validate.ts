#!/usr/bin/env node
/**
 * Validate CSV file against schema
 */

import { readFile } from 'fs/promises';
import { CSVParser } from '../../core/csv-parser.js';
import { SCHEMAS } from '../../config/schemas.js';

interface ValidationError {
  row?: number;
  field?: string;
  message: string;
}

/**
 * Validate CSV file against a schema
 */
export async function validateCsv(
  filePath: string,
  schemaName: string
): Promise<{ valid: boolean; errors: ValidationError[]; rowCount: number }> {
  const errors: ValidationError[] = [];

  try {
    // 1. Get schema
    const schema = SCHEMAS[schemaName];
    if (!schema) {
      return {
        valid: false,
        errors: [{ message: `Unknown schema: ${schemaName}. Available: ${Object.keys(SCHEMAS).join(', ')}` }],
        rowCount: 0,
      };
    }

    // 2. Load and parse CSV
    const content = await readFile(filePath, 'utf-8');
    const data = CSVParser.parse(content);

    if (data.length === 0) {
      errors.push({ message: 'CSV file is empty' });
      return { valid: false, errors, rowCount: 0 };
    }

    // 3. Validate headers
    const headers = Object.keys(data[0]);
    const requiredFields = schema.fields.filter(f => f.required).map(f => f.name);

    for (const required of requiredFields) {
      if (!headers.includes(required)) {
        errors.push({ message: `Missing required column: ${required}` });
      }
    }

    // Stop if headers are invalid
    if (errors.length > 0) {
      return { valid: false, errors, rowCount: data.length };
    }

    // 4. Validate each row
    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because: +1 for header, +1 for 1-based indexing

      for (const field of schema.fields) {
        const value = row[field.name];

        // Check required fields
        if (field.required && (!value || value.trim() === '')) {
          errors.push({
            row: rowNum,
            field: field.name,
            message: `Row ${rowNum}: Missing required field '${field.name}'`,
          });
        }

        // Check data types
        if (value && field.type === 'number') {
          if (isNaN(Number(value))) {
            errors.push({
              row: rowNum,
              field: field.name,
              message: `Row ${rowNum}: Field '${field.name}' must be a number, got '${value}'`,
            });
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      rowCount: data.length,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{ message: `Failed to read or parse CSV: ${(error as Error).message}` }],
      rowCount: 0,
    };
  }
}

/**
 * CLI entry point
 */
export async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let filePath = '';
  let schemaName = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--schema' && i + 1 < args.length) {
      schemaName = args[++i];
    } else if (!args[i].startsWith('-')) {
      filePath = args[i];
    }
  }

  // Validate arguments
  if (!filePath) {
    console.error('Error: CSV file path is required');
    console.log('\nUsage: npm run validate <file> --schema <schema>');
    console.log('\nAvailable schemas:', Object.keys(SCHEMAS).join(', '));
    process.exit(1);
  }

  if (!schemaName) {
    console.error('Error: --schema parameter is required');
    console.log('\nUsage: npm run validate <file> --schema <schema>');
    console.log('\nAvailable schemas:', Object.keys(SCHEMAS).join(', '));
    process.exit(1);
  }

  // Run validation
  console.log('🔍 Validating CSV file...\n');

  const result = await validateCsv(filePath, schemaName);

  if (result.valid) {
    console.log('✅ Validation passed!\n');
    console.log(`Total rows: ${result.rowCount}`);
    console.log(`Schema: ${schemaName}`);
    console.log('\nReady to import with:');
    console.log(`npm run import ${filePath} --domain ${schemaName}`);
  } else {
    console.log('❌ Validation failed!\n');
    console.log('Errors:');
    result.errors.forEach(err => {
      console.log(`  • ${err.message}`);
    });
    console.log(`\nTotal rows: ${result.rowCount}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
