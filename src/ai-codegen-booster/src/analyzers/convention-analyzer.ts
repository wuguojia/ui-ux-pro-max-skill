/**
 * Convention Analyzer - Automatically extract coding conventions and detect anti-patterns
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ConventionData } from '../kb/types';

export interface ExtractedConvention {
  type: 'naming' | 'structure' | 'formatting' | 'imports' | 'comments' | 'patterns';
  rule: string;
  examples: string[];
  confidence: number;
  occurrences: number;
}

export interface AntiPattern {
  type: string;
  severity: 'error' | 'warning' | 'info';
  description: string;
  location: string;
  suggestion: string;
  example?: string;
}

export interface ConventionAnalysisResult {
  conventions: ExtractedConvention[];
  antiPatterns: AntiPattern[];
  bestPractices: BestPractice[];
  statistics: ConventionStatistics;
}

export interface BestPractice {
  category: string;
  practice: string;
  examples: string[];
  benefits: string[];
}

export interface ConventionStatistics {
  totalFunctions: number;
  totalClasses: number;
  totalVariables: number;
  avgFunctionLength: number;
  avgFileLength: number;
  commentDensity: number;
}

/**
 * Analyze code for conventions and anti-patterns
 */
export async function analyzeConventions(code: string): Promise<ConventionAnalysisResult> {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const result: ConventionAnalysisResult = {
    conventions: [],
    antiPatterns: [],
    bestPractices: [],
    statistics: {
      totalFunctions: 0,
      totalClasses: 0,
      totalVariables: 0,
      avgFunctionLength: 0,
      avgFileLength: 0,
      commentDensity: 0,
    },
  };

  // Extract naming conventions
  result.conventions.push(...extractNamingConventions(ast, code));

  // Extract import conventions
  result.conventions.push(...extractImportConventions(ast));

  // Extract comment conventions
  result.conventions.push(...extractCommentConventions(ast, code));

  // Detect anti-patterns
  result.antiPatterns.push(...detectAntiPatterns(ast, code));

  // Identify best practices
  result.bestPractices.push(...identifyBestPractices(ast));

  // Calculate statistics
  result.statistics = calculateStatistics(ast, code);

  return result;
}

/**
 * Extract naming conventions
 */
function extractNamingConventions(ast: t.File, code: string): ExtractedConvention[] {
  const conventions: ExtractedConvention[] = [];
  const componentNames: string[] = [];
  const functionNames: string[] = [];
  const variableNames: string[] = [];
  const constantNames: string[] = [];

  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.id) {
        const name = path.node.id.name;
        if (/^[A-Z]/.test(name)) {
          componentNames.push(name);
        } else {
          functionNames.push(name);
        }
      }
    },

    VariableDeclaration(path) {
      path.node.declarations.forEach((decl) => {
        if (t.isIdentifier(decl.id)) {
          const name = decl.id.name;
          if (path.node.kind === 'const' && /^[A-Z_]+$/.test(name)) {
            constantNames.push(name);
          } else {
            variableNames.push(name);
          }
        }
      });
    },
  });

  // Analyze component naming
  if (componentNames.length > 0) {
    const pascalCaseCount = componentNames.filter((n) => /^[A-Z][a-zA-Z0-9]*$/.test(n)).length;
    if (pascalCaseCount / componentNames.length > 0.8) {
      conventions.push({
        type: 'naming',
        rule: 'Components use PascalCase naming',
        examples: componentNames.slice(0, 3),
        confidence: (pascalCaseCount / componentNames.length) * 100,
        occurrences: componentNames.length,
      });
    }
  }

  // Analyze function naming
  if (functionNames.length > 0) {
    const camelCaseCount = functionNames.filter((n) => /^[a-z][a-zA-Z0-9]*$/.test(n)).length;
    if (camelCaseCount / functionNames.length > 0.8) {
      conventions.push({
        type: 'naming',
        rule: 'Functions use camelCase naming',
        examples: functionNames.slice(0, 3),
        confidence: (camelCaseCount / functionNames.length) * 100,
        occurrences: functionNames.length,
      });
    }
  }

  // Analyze constant naming
  if (constantNames.length > 0) {
    const upperCaseCount = constantNames.filter((n) => /^[A-Z_]+$/.test(n)).length;
    if (upperCaseCount / constantNames.length > 0.8) {
      conventions.push({
        type: 'naming',
        rule: 'Constants use UPPER_CASE naming',
        examples: constantNames.slice(0, 3),
        confidence: (upperCaseCount / constantNames.length) * 100,
        occurrences: constantNames.length,
      });
    }
  }

  return conventions;
}

/**
 * Extract import conventions
 */
function extractImportConventions(ast: t.File): ExtractedConvention[] {
  const conventions: ExtractedConvention[] = [];
  const imports: { source: string; specifiers: string[] }[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      const specifiers = path.node.specifiers.map((spec) => {
        if (t.isImportDefaultSpecifier(spec)) return 'default';
        if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) return spec.imported.name;
        return 'unknown';
      });
      imports.push({ source, specifiers });
    },
  });

  // Check for aliased imports (@ symbol)
  const aliasedImports = imports.filter((imp) => imp.source.startsWith('@/'));
  if (aliasedImports.length > 0 && aliasedImports.length / imports.length > 0.5) {
    conventions.push({
      type: 'imports',
      rule: 'Use path aliases (@/) for imports',
      examples: aliasedImports.slice(0, 3).map((imp) => imp.source),
      confidence: (aliasedImports.length / imports.length) * 100,
      occurrences: aliasedImports.length,
    });
  }

  // Check for grouped imports
  const externalImports = imports.filter((imp) => !imp.source.startsWith('.') && !imp.source.startsWith('@/'));
  const internalImports = imports.filter((imp) => imp.source.startsWith('.') || imp.source.startsWith('@/'));

  if (externalImports.length > 0 && internalImports.length > 0) {
    conventions.push({
      type: 'imports',
      rule: 'Separate external and internal imports',
      examples: ['External: ' + externalImports[0]?.source, 'Internal: ' + internalImports[0]?.source],
      confidence: 75,
      occurrences: imports.length,
    });
  }

  return conventions;
}

/**
 * Extract comment conventions
 */
function extractCommentConventions(ast: t.File, code: string): ExtractedConvention[] {
  const conventions: ExtractedConvention[] = [];
  let jsDocCount = 0;
  let inlineCommentCount = 0;
  let blockCommentCount = 0;

  traverse(ast, {
    enter(path) {
      const comments = path.node.leadingComments || [];
      comments.forEach((comment) => {
        if (comment.type === 'CommentBlock' && comment.value.startsWith('*')) {
          jsDocCount++;
        } else if (comment.type === 'CommentBlock') {
          blockCommentCount++;
        } else if (comment.type === 'CommentLine') {
          inlineCommentCount++;
        }
      });
    },
  });

  const totalComments = jsDocCount + inlineCommentCount + blockCommentCount;

  if (jsDocCount > 0 && jsDocCount / totalComments > 0.5) {
    conventions.push({
      type: 'comments',
      rule: 'Use JSDoc comments for function documentation',
      examples: ['/** Function description */'],
      confidence: (jsDocCount / totalComments) * 100,
      occurrences: jsDocCount,
    });
  }

  return conventions;
}

/**
 * Detect anti-patterns
 */
function detectAntiPatterns(ast: t.File, code: string): AntiPattern[] {
  const antiPatterns: AntiPattern[] = [];

  traverse(ast, {
    // Detect long functions
    FunctionDeclaration(path) {
      const body = path.node.body;
      if (t.isBlockStatement(body) && body.body.length > 50) {
        antiPatterns.push({
          type: 'Long Function',
          severity: 'warning',
          description: `Function "${path.node.id?.name}" has ${body.body.length} statements`,
          location: `Function ${path.node.id?.name}`,
          suggestion: 'Break down into smaller functions',
        });
      }
    },

    // Detect deeply nested code
    IfStatement(path) {
      let depth = 0;
      let currentPath = path.parentPath;
      while (currentPath) {
        if (currentPath.isIfStatement() || currentPath.isForStatement() || currentPath.isWhileStatement()) {
          depth++;
        }
        currentPath = currentPath.parentPath;
      }

      if (depth >= 4) {
        antiPatterns.push({
          type: 'Deep Nesting',
          severity: 'warning',
          description: `Code nested ${depth} levels deep`,
          location: 'if statement',
          suggestion: 'Reduce nesting by extracting logic or using early returns',
        });
      }
    },

    // Detect magic numbers
    NumericLiteral(path) {
      const value = path.node.value;
      if (value !== 0 && value !== 1 && !isInConstDeclaration(path)) {
        antiPatterns.push({
          type: 'Magic Number',
          severity: 'info',
          description: `Hardcoded number: ${value}`,
          location: 'numeric literal',
          suggestion: 'Extract to named constant',
          example: `const MAX_ITEMS = ${value};`,
        });
      }
    },

    // Detect TODO comments
    enter(path) {
      const comments = [...(path.node.leadingComments || []), ...(path.node.trailingComments || [])];
      comments.forEach((comment) => {
        if (comment.value.toLowerCase().includes('todo') || comment.value.toLowerCase().includes('fixme')) {
          antiPatterns.push({
            type: 'TODO Comment',
            severity: 'info',
            description: 'Unresolved TODO/FIXME comment',
            location: 'comment',
            suggestion: 'Create a task or resolve the TODO',
            example: comment.value.trim(),
          });
        }
      });
    },

    // Detect console.log (in production code)
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object) &&
        path.node.callee.object.name === 'console'
      ) {
        antiPatterns.push({
          type: 'Console Statement',
          severity: 'warning',
          description: 'console.log statement found',
          location: 'console call',
          suggestion: 'Remove or replace with proper logging',
        });
      }
    },

    // Detect var usage (should use let/const)
    VariableDeclaration(path) {
      if (path.node.kind === 'var') {
        antiPatterns.push({
          type: 'Var Usage',
          severity: 'warning',
          description: 'Use of "var" instead of "let" or "const"',
          location: 'variable declaration',
          suggestion: 'Use "const" for constants, "let" for variables',
        });
      }
    },
  });

  return antiPatterns;
}

/**
 * Check if node is in a const declaration
 */
function isInConstDeclaration(path: any): boolean {
  let current = path.parentPath;
  while (current) {
    if (current.isVariableDeclaration() && current.node.kind === 'const') {
      return true;
    }
    current = current.parentPath;
  }
  return false;
}

/**
 * Identify best practices
 */
function identifyBestPractices(ast: t.File): BestPractice[] {
  const practices: BestPractice[] = [];

  let usesConst = false;
  let usesTypeScript = false;
  let hasErrorHandling = false;

  traverse(ast, {
    VariableDeclaration(path) {
      if (path.node.kind === 'const') {
        usesConst = true;
      }
    },

    TSTypeAnnotation() {
      usesTypeScript = true;
    },

    TryStatement() {
      hasErrorHandling = true;
    },
  });

  if (usesConst) {
    practices.push({
      category: 'Modern JavaScript',
      practice: 'Use const for immutable values',
      examples: ['const API_URL = "...";'],
      benefits: ['Prevents accidental reassignment', 'Clearer intent'],
    });
  }

  if (usesTypeScript) {
    practices.push({
      category: 'Type Safety',
      practice: 'Use TypeScript type annotations',
      examples: ['function greet(name: string): string'],
      benefits: ['Catch errors at compile time', 'Better IDE support'],
    });
  }

  if (hasErrorHandling) {
    practices.push({
      category: 'Error Handling',
      practice: 'Use try-catch for error handling',
      examples: ['try { ... } catch (error) { ... }'],
      benefits: ['Graceful error recovery', 'Better user experience'],
    });
  }

  return practices;
}

/**
 * Calculate code statistics
 */
function calculateStatistics(ast: t.File, code: string): ConventionStatistics {
  let totalFunctions = 0;
  let totalClasses = 0;
  let totalVariables = 0;
  let functionLengths: number[] = [];
  let totalComments = 0;

  traverse(ast, {
    FunctionDeclaration(path) {
      totalFunctions++;
      if (t.isBlockStatement(path.node.body)) {
        functionLengths.push(path.node.body.body.length);
      }
    },

    ClassDeclaration() {
      totalClasses++;
    },

    VariableDeclaration(path) {
      totalVariables += path.node.declarations.length;
    },

    enter(path) {
      const comments = [...(path.node.leadingComments || []), ...(path.node.trailingComments || [])];
      totalComments += comments.length;
    },
  });

  const avgFunctionLength = functionLengths.length > 0
    ? functionLengths.reduce((a, b) => a + b, 0) / functionLengths.length
    : 0;

  const lines = code.split('\n').length;
  const commentDensity = lines > 0 ? (totalComments / lines) * 100 : 0;

  return {
    totalFunctions,
    totalClasses,
    totalVariables,
    avgFunctionLength,
    avgFileLength: lines,
    commentDensity,
  };
}

/**
 * Convert extracted conventions to ConventionData format for CSV export
 */
export function conventionsToCSVFormat(conventions: ExtractedConvention[]): ConventionData[] {
  return conventions.map((conv, index) => {
    const goodExample = conv.examples[0] || '';
    const badExample = getBadExample(conv.type, goodExample);

    return {
      conventionType: capitalizeFirst(conv.type),
      rule: conv.rule,
      goodExample,
      badExample,
      reason: `Found in ${conv.occurrences} occurrences with ${Math.round(conv.confidence)}% confidence`,
      severity: conv.confidence > 80 ? 'error' : 'warning',
      keywords: conv.type.split('-'),
    };
  });
}

/**
 * Generate bad example based on convention type
 */
function getBadExample(type: string, goodExample: string): string {
  const badExamples: Record<string, string> = {
    naming: goodExample.toLowerCase(),
    imports: goodExample.replace('@/', '../../../'),
    comments: '// TODO: add comments',
  };

  return badExamples[type] || 'Non-conforming example';
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
