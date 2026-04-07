/**
 * Configuration for CSV data files and search domains
 */

import type { DomainConfig, DomainKeywords } from './core/types.js';

/**
 * CSV configuration for each search domain
 * Define which columns to search and which to output
 */
export const CSV_CONFIGS: DomainConfig = {
  // Example: knowledge base
  knowledge: {
    file: 'knowledge.csv',
    searchColumns: ['Name', 'Category', 'Keywords', 'Description'],
    outputColumns: ['Name', 'Category', 'Description', 'Best_Practice', 'Example'],
  },

  // Example: tips and best practices
  tips: {
    file: 'tips.csv',
    searchColumns: ['Name', 'Category', 'Keywords', 'Description'],
    outputColumns: ['Name', 'Category', 'Description', 'Do', 'Dont', 'Severity'],
  },

  // Add your own domains here
  // patterns: {
  //   file: 'patterns.csv',
  //   searchColumns: ['Pattern_Name', 'Category', 'Keywords'],
  //   outputColumns: ['Pattern_Name', 'Use_Case', 'Implementation'],
  // },
};

/**
 * Domain keyword patterns for automatic domain detection
 */
export const DOMAIN_KEYWORDS: DomainKeywords = {
  knowledge: /react|typescript|javascript|frontend|backend|database|api|testing|performance/i,
  tips: /tip|best practice|guideline|how to|should|recommend|avoid|anti-pattern/i,
  // Add your own patterns here
};

/**
 * Default domain when detection fails
 */
export const DEFAULT_DOMAIN = 'knowledge';

/**
 * Data directory path (relative to project root)
 */
export const DATA_DIR = './src/data';

/**
 * BM25 parameters
 */
export const BM25_PARAMS = {
  k1: 1.5,  // Term frequency saturation (1.2-2.0)
  b: 0.75,  // Length normalization (0-1)
};
