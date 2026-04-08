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

  // Components: UI components and design system elements
  components: {
    file: 'components.csv',
    searchColumns: ['Component_Name', 'Framework', 'Category', 'Keywords', 'Description'],
    outputColumns: ['Component_Name', 'Framework', 'Description', 'Usage', 'Example', 'Category'],
  },

  // Patterns: Design and code patterns
  patterns: {
    file: 'patterns.csv',
    searchColumns: ['Pattern_Name', 'Category', 'Keywords', 'Problem', 'Solution'],
    outputColumns: ['Pattern_Name', 'Category', 'Problem', 'Solution', 'When_To_Use', 'Example'],
  },
};

/**
 * Domain keyword patterns for automatic domain detection
 */
export const DOMAIN_KEYWORDS: DomainKeywords = {
  knowledge: /react|typescript|javascript|frontend|backend|database|api|testing|performance/i,
  tips: /tip|best practice|guideline|how to|should|recommend|avoid|anti-pattern/i,
  components: /component|button|card|modal|input|form|ui|widget|element/i,
  patterns: /pattern|architecture|design pattern|observer|factory|strategy|layout/i,
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
