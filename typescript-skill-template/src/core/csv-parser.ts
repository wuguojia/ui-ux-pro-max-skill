/**
 * CSV Parser - RFC 4180 Compliant
 *
 * Parses CSV files according to RFC 4180 specification:
 * - Fields may be quoted with double quotes
 * - Quoted fields can contain commas, newlines, and double quotes (escaped as "")
 * - First row is treated as header
 * - Returns array of objects with header keys
 */

export interface CSVRow {
  [key: string]: string;
}

export class CSVParser {
  /**
   * Parse CSV string into array of objects
   * @param csvString - CSV content as string
   * @returns Array of objects with header keys
   */
  static parse(csvString: string): CSVRow[] {
    const lines = this.splitLines(csvString);
    if (lines.length === 0) {
      return [];
    }

    // First line is header
    const headers = this.parseLine(lines[0]);
    const rows: CSVRow[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseLine(lines[i]);

      // Skip empty rows
      if (values.length === 0 || (values.length === 1 && values[0] === '')) {
        continue;
      }

      const row: CSVRow = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
      }
      rows.push(row);
    }

    return rows;
  }

  /**
   * Split CSV string into lines, handling quoted fields with newlines
   * @param csvString - CSV content
   * @returns Array of CSV lines
   */
  private static splitLines(csvString: string): string[] {
    const lines: string[] = [];
    let currentLine = '';
    let inQuotes = false;

    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      const nextChar = csvString[i + 1];

      if (char === '"') {
        // Handle escaped quotes ("")
        if (inQuotes && nextChar === '"') {
          currentLine += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
        currentLine += char;
      } else if (char === '\n' && !inQuotes) {
        // End of line (not inside quotes)
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = '';
      } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
        // Windows line ending
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = '';
        i++; // Skip \n
      } else {
        currentLine += char;
      }
    }

    // Add last line if not empty
    if (currentLine.trim()) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Parse a single CSV line into fields
   * @param line - CSV line
   * @returns Array of field values
   */
  private static parseLine(line: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote inside quoted field
          currentField += '"';
          i++; // Skip next quote
        } else if (inQuotes) {
          // End of quoted field
          inQuotes = false;
        } else {
          // Start of quoted field
          inQuotes = true;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator (not inside quotes)
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }

    // Add last field
    fields.push(currentField.trim());

    return fields;
  }

  /**
   * Convert array of objects to CSV string
   * @param data - Array of objects
   * @returns CSV string
   */
  static stringify(data: CSVRow[]): string {
    if (data.length === 0) {
      return '';
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create header row
    const headerRow = headers.map(h => this.escapeField(h)).join(',');

    // Create data rows
    const dataRows = data.map(row => {
      return headers.map(header => {
        return this.escapeField(row[header] || '');
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Escape a field value for CSV
   * @param field - Field value
   * @returns Escaped field value
   */
  private static escapeField(field: string): string {
    // Quote field if it contains comma, quote, or newline
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      // Escape quotes by doubling them
      const escaped = field.replace(/"/g, '""');
      return `"${escaped}"`;
    }
    return field;
  }
}

/**
 * Load CSV file from filesystem
 * @param filePath - Path to CSV file
 * @returns Array of objects
 */
export async function loadCSV(filePath: string): Promise<CSVRow[]> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  return CSVParser.parse(content);
}

/**
 * Load CSV file synchronously
 * @param filePath - Path to CSV file
 * @returns Array of objects
 */
export function loadCSVSync(filePath: string): CSVRow[] {
  const fs = require('fs');
  const content = fs.readFileSync(filePath, 'utf-8');
  return CSVParser.parse(content);
}

/**
 * Example usage:
 *
 * const csv = `Name,Age,City
 * "John Doe",30,"New York"
 * "Jane Smith",25,"Los Angeles"
 * "Bob Johnson",35,"Chicago"`;
 *
 * const data = CSVParser.parse(csv);
 * // [
 * //   { Name: 'John Doe', Age: '30', City: 'New York' },
 * //   { Name: 'Jane Smith', Age: '25', City: 'Los Angeles' },
 * //   { Name: 'Bob Johnson', Age: '35', City: 'Chicago' }
 * // ]
 *
 * // From file:
 * const rows = await loadCSV('./data/knowledge.csv');
 */
