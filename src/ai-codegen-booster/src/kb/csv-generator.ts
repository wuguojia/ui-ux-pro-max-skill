/**
 * CSV Generator - Convert extracted data to CSV format
 */

import type { ComponentData, StyleData, ConventionData } from './types';

/**
 * Generate CSV content from components
 */
export function generateComponentsCSV(components: ComponentData[]): string {
  const headers = [
    'No',
    'Component_Name',
    'Framework',
    'Import_Path',
    'Props',
    'Props_Types',
    'Default_Props',
    'Events',
    'Slots',
    'API_Style',
    'Description',
    'Usage_Example',
    'Category',
    'Keywords',
  ];

  const rows: string[][] = [headers];

  components.forEach((comp, index) => {
    const props = comp.props.map(p => p.name).join(', ');
    const propsTypes = comp.props.map(p => `${p.name}: ${p.type}`).join('; ');
    const defaultProps = comp.props
      .filter(p => p.default)
      .map(p => `${p.name}=${p.default}`)
      .join(', ');
    const events = comp.events?.join(', ') || '';
    const slots = comp.slots?.join(', ') || '';
    const apiStyle = comp.apiStyle || '';

    // Generate usage example
    const usageExample = generateUsageExample(comp);

    rows.push([
      String(index + 1),
      comp.componentName,
      comp.framework,
      comp.importPath,
      props,
      propsTypes,
      defaultProps,
      events,
      slots,
      apiStyle,
      comp.description || `${comp.componentName} component`,
      usageExample,
      comp.category || 'UI',
      comp.keywords.join(', '),
    ]);
  });

  return rowsToCSV(rows);
}

/**
 * Generate CSV content from styles
 */
export function generateStylesCSV(styles: StyleData[]): string {
  const headers = [
    'No',
    'Style_Type',
    'Name',
    'Value',
    'Category',
    'Usage',
    'Example',
    'Preprocessor',
    'Keywords',
  ];

  const rows: string[][] = [headers];

  styles.forEach((style, index) => {
    rows.push([
      String(index + 1),
      style.styleType,
      style.name,
      style.value,
      style.category,
      style.usage,
      style.example,
      style.preprocessor || '',
      style.keywords.join(', '),
    ]);
  });

  return rowsToCSV(rows);
}

/**
 * Generate CSV content from conventions
 */
export function generateConventionsCSV(conventions: ConventionData[]): string {
  const headers = [
    'No',
    'Convention_Type',
    'Rule',
    'Good_Example',
    'Bad_Example',
    'Reason',
    'Severity',
    'Keywords',
  ];

  const rows: string[][] = [headers];

  conventions.forEach((conv, index) => {
    rows.push([
      String(index + 1),
      conv.conventionType,
      conv.rule,
      conv.goodExample,
      conv.badExample,
      conv.reason,
      conv.severity,
      conv.keywords.join(', '),
    ]);
  });

  return rowsToCSV(rows);
}

/**
 * Generate usage example for component
 */
function generateUsageExample(comp: ComponentData): string {
  if (comp.framework === 'React') {
    const propsExample = comp.props
      .filter(p => p.required)
      .map(p => {
        if (p.type.includes('string')) {
          return `${p.name}="value"`;
        } else if (p.type.includes('number')) {
          return `${p.name}={42}`;
        } else if (p.type.includes('boolean')) {
          return p.name;
        } else {
          return `${p.name}={value}`;
        }
      })
      .join(' ');

    return `<${comp.componentName}${propsExample ? ' ' + propsExample : ''} />`;
  } else if (comp.framework === 'Vue') {
    const propsExample = comp.props
      .filter(p => p.required)
      .map(p => {
        if (p.type.includes('string')) {
          return `${p.name}="value"`;
        } else {
          return `:${p.name}="value"`;
        }
      })
      .join(' ');

    return `<${comp.componentName}${propsExample ? ' ' + propsExample : ''} />`;
  }

  return `<${comp.componentName} />`;
}

/**
 * Convert rows to CSV string
 */
function rowsToCSV(rows: string[][]): string {
  return rows.map(row => row.map(cell => escapeCSVCell(cell)).join(',')).join('\n');
}

/**
 * Escape CSV cell value
 */
function escapeCSVCell(value: string): string {
  // If contains comma, newline, or quote, wrap in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    // Escape quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Merge multiple CSV files (deduplicate by component name or style name)
 */
export function mergeComponentsCSV(csv1: string, csv2: string): string {
  const rows1 = parseCSV(csv1);
  const rows2 = parseCSV(csv2);

  if (rows1.length === 0) return csv2;
  if (rows2.length === 0) return csv1;

  const headers = rows1[0];
  const nameIndex = headers.indexOf('Component_Name');

  const merged = [...rows1];
  const existingNames = new Set(rows1.slice(1).map(row => row[nameIndex]));

  // Add rows from csv2 that don't exist in csv1
  for (let i = 1; i < rows2.length; i++) {
    const name = rows2[i][nameIndex];
    if (!existingNames.has(name)) {
      merged.push(rows2[i]);
      existingNames.add(name);
    }
  }

  // Re-number rows
  for (let i = 1; i < merged.length; i++) {
    merged[i][0] = String(i);
  }

  return rowsToCSV(merged);
}

/**
 * Merge styles CSV files
 */
export function mergeStylesCSV(csv1: string, csv2: string): string {
  const rows1 = parseCSV(csv1);
  const rows2 = parseCSV(csv2);

  if (rows1.length === 0) return csv2;
  if (rows2.length === 0) return csv1;

  const headers = rows1[0];
  const nameIndex = headers.indexOf('Name');

  const merged = [...rows1];
  const existingNames = new Set(rows1.slice(1).map(row => row[nameIndex]));

  // Add rows from csv2 that don't exist in csv1
  for (let i = 1; i < rows2.length; i++) {
    const name = rows2[i][nameIndex];
    if (!existingNames.has(name)) {
      merged.push(rows2[i]);
      existingNames.add(name);
    }
  }

  // Re-number rows
  for (let i = 1; i < merged.length; i++) {
    merged[i][0] = String(i);
  }

  return rowsToCSV(merged);
}

/**
 * Parse CSV string to rows
 */
function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  const lines = csv.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quotes
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of cell
        row.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add last cell
    row.push(current);
    rows.push(row);
  }

  return rows;
}
