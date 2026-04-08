/**
 * Schema definitions for AI Codegen Booster
 */

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description?: string;
}

export interface SchemaDefinition {
  domain: string;
  csvFile: string;
  description: string;
  fields: SchemaField[];
}

/**
 * Components Schema - UI components and design system elements
 */
export const componentsSchema: SchemaDefinition = {
  domain: 'components',
  csvFile: 'components.csv',
  description: 'UI components from your component library',
  fields: [
    { name: 'No', type: 'number', required: true },
    { name: 'Component_Name', type: 'string', required: true },
    { name: 'Framework', type: 'string', required: true, description: 'React, Vue, Svelte' },
    { name: 'Import_Path', type: 'string', required: true },
    { name: 'Props', type: 'string', required: false },
    { name: 'Props_Types', type: 'string', required: false },
    { name: 'Default_Props', type: 'string', required: false },
    { name: 'Events', type: 'string', required: false, description: 'Vue events (optional)' },
    { name: 'Slots', type: 'string', required: false, description: 'Vue slots (optional)' },
    { name: 'API_Style', type: 'string', required: false, description: 'Composition | Options (Vue only)' },
    { name: 'Description', type: 'string', required: true },
    { name: 'Usage_Example', type: 'string', required: true },
    { name: 'Category', type: 'string', required: true },
    { name: 'Keywords', type: 'string', required: true },
  ],
};

/**
 * Styles Schema - CSS variables, utility classes, theme tokens
 */
export const stylesSchema: SchemaDefinition = {
  domain: 'styles',
  csvFile: 'styles.csv',
  description: 'CSS variables, utility classes, and theme tokens',
  fields: [
    { name: 'No', type: 'number', required: true },
    { name: 'Style_Type', type: 'string', required: true, description: 'CSS Variable | Less Variable | Sass Variable | Utility Class' },
    { name: 'Name', type: 'string', required: true },
    { name: 'Value', type: 'string', required: true },
    { name: 'Category', type: 'string', required: true },
    { name: 'Usage', type: 'string', required: true },
    { name: 'Example', type: 'string', required: true },
    { name: 'Preprocessor', type: 'string', required: false, description: 'CSS | Less | Sass | SCSS' },
    { name: 'Keywords', type: 'string', required: true },
  ],
};

/**
 * Conventions Schema - Coding conventions and best practices
 */
export const conventionsSchema: SchemaDefinition = {
  domain: 'conventions',
  csvFile: 'conventions.csv',
  description: 'Project coding conventions and naming rules',
  fields: [
    { name: 'No', type: 'number', required: true },
    { name: 'Convention_Type', type: 'string', required: true },
    { name: 'Rule', type: 'string', required: true },
    { name: 'Good_Example', type: 'string', required: true },
    { name: 'Bad_Example', type: 'string', required: true },
    { name: 'Reason', type: 'string', required: true },
    { name: 'Severity', type: 'string', required: true },
    { name: 'Keywords', type: 'string', required: true },
  ],
};

/**
 * All available schemas
 */
export const SCHEMAS: Record<string, SchemaDefinition> = {
  components: componentsSchema,
  styles: stylesSchema,
  conventions: conventionsSchema,
};

/**
 * Get schema by domain name
 */
export function getSchema(domain: string): SchemaDefinition | undefined {
  return SCHEMAS[domain];
}

/**
 * Validate if a domain exists
 */
export function isValidDomain(domain: string): boolean {
  return domain in SCHEMAS;
}
