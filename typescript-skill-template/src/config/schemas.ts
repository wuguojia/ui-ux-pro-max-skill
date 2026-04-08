/**
 * Schema definitions for different data domains
 */

export interface SchemaField {
  name: string;
  type: 'string' | 'number';
  required: boolean;
  description: string;
}

export interface SchemaDefinition {
  domain: string;
  csvFile: string;
  description: string;
  fields: SchemaField[];
}

/**
 * Available schemas for data import
 */
export const SCHEMAS: Record<string, SchemaDefinition> = {
  components: {
    domain: 'components',
    csvFile: 'components.csv',
    description: 'UI component library documentation',
    fields: [
      { name: 'No', type: 'number', required: true, description: 'Sequential number (auto-increment)' },
      { name: 'Component_Name', type: 'string', required: true, description: 'Component name (e.g., Button, Card)' },
      { name: 'Framework', type: 'string', required: true, description: 'Framework (React, Vue, Svelte, etc.)' },
      { name: 'Props', type: 'string', required: false, description: 'Comma-separated prop names' },
      { name: 'Description', type: 'string', required: true, description: 'What the component does' },
      { name: 'Usage', type: 'string', required: false, description: 'When to use this component' },
      { name: 'Example', type: 'string', required: true, description: 'Code example (JSX/template)' },
      { name: 'Category', type: 'string', required: true, description: 'Component category (UI, Layout, Form, etc.)' },
      { name: 'Keywords', type: 'string', required: true, description: 'Search keywords (comma-separated)' },
    ],
  },

  patterns: {
    domain: 'patterns',
    csvFile: 'patterns.csv',
    description: 'Design and code patterns',
    fields: [
      { name: 'No', type: 'number', required: true, description: 'Sequential number' },
      { name: 'Pattern_Name', type: 'string', required: true, description: 'Pattern name' },
      { name: 'Category', type: 'string', required: true, description: 'Pattern category (Design, Code, Architecture)' },
      { name: 'Problem', type: 'string', required: true, description: 'What problem it solves' },
      { name: 'Solution', type: 'string', required: true, description: 'How it solves the problem' },
      { name: 'When_To_Use', type: 'string', required: true, description: 'Usage scenarios' },
      { name: 'Example', type: 'string', required: true, description: 'Code or design example' },
      { name: 'Keywords', type: 'string', required: true, description: 'Search keywords (comma-separated)' },
    ],
  },

  knowledge: {
    domain: 'knowledge',
    csvFile: 'knowledge.csv',
    description: 'Programming knowledge base',
    fields: [
      { name: 'No', type: 'number', required: true, description: 'Sequential number' },
      { name: 'Name', type: 'string', required: true, description: 'Topic name' },
      { name: 'Category', type: 'string', required: true, description: 'Technology/framework' },
      { name: 'Keywords', type: 'string', required: true, description: 'Search keywords (comma-separated)' },
      { name: 'Description', type: 'string', required: true, description: 'Detailed explanation' },
      { name: 'Best_Practice', type: 'string', required: false, description: 'Recommended approach' },
      { name: 'Anti_Pattern', type: 'string', required: false, description: 'What to avoid' },
      { name: 'Example', type: 'string', required: false, description: 'Code example' },
    ],
  },

  tips: {
    domain: 'tips',
    csvFile: 'tips.csv',
    description: 'Best practices and guidelines',
    fields: [
      { name: 'No', type: 'number', required: true, description: 'Sequential number' },
      { name: 'Name', type: 'string', required: true, description: 'Tip name' },
      { name: 'Category', type: 'string', required: true, description: 'Tip category' },
      { name: 'Keywords', type: 'string', required: true, description: 'Search keywords (comma-separated)' },
      { name: 'Description', type: 'string', required: true, description: 'Detailed description' },
      { name: 'Do', type: 'string', required: true, description: 'Recommended actions' },
      { name: 'Dont', type: 'string', required: true, description: 'Actions to avoid' },
      { name: 'Severity', type: 'string', required: true, description: 'Critical/High/Medium/Low' },
    ],
  },
};

/**
 * Get schema by domain name
 */
export function getSchema(domain: string): SchemaDefinition | undefined {
  return SCHEMAS[domain];
}

/**
 * Get all available domain names
 */
export function getAvailableDomains(): string[] {
  return Object.keys(SCHEMAS);
}

/**
 * Get CSV file path for a domain
 */
export function getCsvFilePath(domain: string): string {
  const schema = SCHEMAS[domain];
  if (!schema) {
    throw new Error(`Unknown domain: ${domain}`);
  }
  return schema.csvFile;
}
