#!/usr/bin/env node
/**
 * Import CSV data into existing CSV files
 */

import { readFile, writeFile, copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CSVParser } from '../../core/csv-parser.js';
import { SCHEMAS } from '../../config/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ImportOptions {
  domain: string;
  dryRun?: boolean;
  backup?: boolean;
}

interface ImportResult {
  filesProcessed: number;
  itemsAdded: number;
  totalItems: number;
  backupPath?: string;
}

/**
 * Import CSV data into knowledge base
 */
export async function importCsv(
  sourcePath: string,
  options: ImportOptions
): Promise<ImportResult> {
  const { domain, dryRun = false, backup = true } = options;

  // 1. Validate schema exists
  const schema = SCHEMAS[domain];
  if (!schema) {
    throw new Error(`Unknown domain: ${domain}. Available: ${Object.keys(SCHEMAS).join(', ')}`);
  }

  // 2. Load source CSV
  const sourceContent = await readFile(sourcePath, 'utf-8');
  const sourceData = CSVParser.parse(sourceContent);

  if (sourceData.length === 0) {
    throw new Error('Source CSV is empty');
  }

  // 3. Get target CSV path
  const targetPath = join(__dirname, '../../data', schema.csvFile);

  // 4. Load existing data (if exists)
  let existingData: any[] = [];
  const targetExists = existsSync(targetPath);

  if (targetExists) {
    const targetContent = await readFile(targetPath, 'utf-8');
    existingData = CSVParser.parse(targetContent);
  }

  // 5. Calculate next No
  const nextNo = existingData.length > 0
    ? Math.max(...existingData.map(r => parseInt(r.No) || 0)) + 1
    : 1;

  // 6. Prepare new data (renumber)
  const newData = sourceData.map((row, i) => ({
    ...row,
    No: (nextNo + i).toString(),
  }));

  // 7. Merge data
  const mergedData = [...existingData, ...newData];

  // 8. If dry run, just preview
  if (dryRun) {
    return {
      filesProcessed: 1,
      itemsAdded: newData.length,
      totalItems: mergedData.length,
    };
  }

  // 9. Create backup if requested
  let backupPath: string | undefined;
  if (backup && targetExists) {
    backupPath = `${targetPath}.backup-${Date.now()}`;
    await copyFile(targetPath, backupPath);
  }

  // 10. Ensure target directory exists
  await mkdir(dirname(targetPath), { recursive: true });

  // 11. Write merged data
  const csvContent = CSVParser.stringify(mergedData);
  await writeFile(targetPath, csvContent, 'utf-8');

  return {
    filesProcessed: 1,
    itemsAdded: newData.length,
    totalItems: mergedData.length,
    backupPath,
  };
}

/**
 * CLI entry point
 */
export async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let sourcePath = '';
  let domain = '';
  let dryRun = false;
  let backup = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--domain' && i + 1 < args.length) {
      domain = args[++i];
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--no-backup') {
      backup = false;
    } else if (!args[i].startsWith('-')) {
      sourcePath = args[i];
    }
  }

  // Validate arguments
  if (!sourcePath) {
    console.error('Error: CSV file path is required');
    console.log('\nUsage: npm run import <file> --domain <domain> [--dry-run] [--no-backup]');
    console.log('\nAvailable domains:', Object.keys(SCHEMAS).join(', '));
    process.exit(1);
  }

  if (!domain) {
    console.error('Error: --domain parameter is required');
    console.log('\nUsage: npm run import <file> --domain <domain> [--dry-run] [--no-backup]');
    console.log('\nAvailable domains:', Object.keys(SCHEMAS).join(', '));
    process.exit(1);
  }

  // Run import
  try {
    console.log('📥 Importing data...\n');

    const result = await importCsv(sourcePath, { domain, dryRun, backup });

    if (dryRun) {
      console.log('🔍 Dry run mode - no files will be modified\n');
      console.log(`Would add: ${result.itemsAdded} rows`);
      console.log(`Total after import: ${result.totalItems} rows`);
      console.log('\nRun without --dry-run to actually import');
    } else {
      console.log('✅ Import completed!\n');
      console.log(`Added: ${result.itemsAdded} rows`);
      console.log(`Total: ${result.totalItems} rows`);
      if (result.backupPath) {
        console.log(`Backup: ${result.backupPath}`);
      }
      console.log('\nTest with:');
      console.log(`npm run search "your query" --domain ${domain}`);
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
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
