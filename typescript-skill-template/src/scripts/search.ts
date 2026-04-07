#!/usr/bin/env node
/**
 * Search Script - Command-line interface for searching knowledge base
 *
 * Usage:
 *   npx tsx src/scripts/search.ts "<query>" [--domain <domain>] [-n <max>]
 *   npm run search "<query>" [--domain <domain>] [-n <max>]
 *
 * Examples:
 *   npx tsx src/scripts/search.ts "React hooks"
 *   npx tsx src/scripts/search.ts "TypeScript best practices" --domain tips
 *   npx tsx src/scripts/search.ts "API design" -n 5
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { BM25 } from '../core/bm25.js';
import { CSVParser } from '../core/csv-parser.js';
import { detectDomain } from '../core/domain-detector.js';
import { CSV_CONFIGS, DOMAIN_KEYWORDS, DEFAULT_DOMAIN, DATA_DIR, BM25_PARAMS } from '../config.js';
import type { SearchResult, CSVConfig } from '../core/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse command line arguments
 */
function parseArgs(): {
  query: string;
  domain?: string;
  maxResults: number;
  help: boolean;
} {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { query: '', maxResults: 3, help: true };
  }

  let query = '';
  let domain: string | undefined;
  let maxResults = 3;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--domain' || arg === '-d') {
      domain = args[++i];
    } else if (arg === '-n' || arg === '--max-results') {
      maxResults = parseInt(args[++i], 10);
    } else if (!arg.startsWith('-')) {
      query = arg;
    }
  }

  return { query, domain, maxResults, help: false };
}

/**
 * Load CSV data
 */
function loadData(csvFile: string): SearchResult[] {
  const csvPath = join(__dirname, '..', '..', DATA_DIR, csvFile);
  const content = readFileSync(csvPath, 'utf-8');
  return CSVParser.parse(content);
}

/**
 * Search in a specific domain
 */
function search(
  query: string,
  domain: string,
  maxResults: number = 3
): SearchResult[] {
  // Get domain config
  const config = CSV_CONFIGS[domain];
  if (!config) {
    throw new Error(`Unknown domain: ${domain}. Available: ${Object.keys(CSV_CONFIGS).join(', ')}`);
  }

  // Load data
  const data = loadData(config.file);
  if (data.length === 0) {
    return [];
  }

  // Build search documents
  const documents = data.map(row => {
    return config.searchColumns
      .map(col => row[col] || '')
      .join(' ');
  });

  // BM25 search
  const bm25 = new BM25(BM25_PARAMS.k1, BM25_PARAMS.b);
  bm25.fit(documents);
  const scores = bm25.score(query);

  // Build results
  const results: SearchResult[] = [];
  for (let i = 0; i < Math.min(maxResults, scores.length); i++) {
    const { docId, score } = scores[i];
    const row = data[docId];

    const result: SearchResult = { score };
    for (const col of config.outputColumns) {
      result[col] = row[col] || '';
    }
    results.push(result);
  }

  return results;
}

/**
 * Format output
 */
function formatOutput(
  results: SearchResult[],
  query: string,
  domain: string
): string {
  if (results.length === 0) {
    return `No results found for "${query}" in domain "${domain}"`;
  }

  let output = `\n## Search Results\n`;
  output += `Domain: ${domain} | Query: "${query}" | Results: ${results.length}\n\n`;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    output += `### Result #${i + 1}${result.score ? ` (score: ${result.score.toFixed(2)})` : ''}\n`;

    for (const [key, value] of Object.entries(result)) {
      if (key === 'score' || !value) continue;
      output += `  ${key}: ${value}\n`;
    }
    output += '\n';
  }

  return output;
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
Search Script - Query your knowledge base

Usage:
  npx tsx src/scripts/search.ts "<query>" [options]
  npm run search "<query>" [options]

Options:
  --domain, -d <domain>    Specify search domain (auto-detect if omitted)
  -n, --max-results <num>  Maximum results to return (default: 3)
  --help, -h               Show this help message

Available Domains:
  ${Object.keys(CSV_CONFIGS).join(', ')}

Examples:
  # Auto-detect domain
  npx tsx src/scripts/search.ts "React hooks"

  # Specify domain
  npx tsx src/scripts/search.ts "best practices" --domain tips

  # Limit results
  npx tsx src/scripts/search.ts "TypeScript" -n 5

Configuration:
  Edit src/config.ts to add custom domains and configure search columns
  `);
}

/**
 * Main function
 */
function main(): void {
  const { query, domain, maxResults, help } = parseArgs();

  if (help) {
    showHelp();
    return;
  }

  if (!query) {
    console.error('Error: Query is required');
    showHelp();
    process.exit(1);
  }

  try {
    // Auto-detect domain if not specified
    const searchDomain = domain || detectDomain(query, DOMAIN_KEYWORDS) || DEFAULT_DOMAIN;

    // Perform search
    const results = search(query, searchDomain, maxResults);

    // Output results
    const output = formatOutput(results, query, searchDomain);
    console.log(output);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { search, formatOutput };
