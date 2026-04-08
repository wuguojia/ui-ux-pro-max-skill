/**
 * Code Quality Validator - Validate generated code quality
 */

import { parse as parseTS } from '@babel/parser';
import traverse from '@babel/traverse';
import type { ComponentData, StyleData, KnowledgeBase, PropData } from './types.js';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export interface ValidationCheck {
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  issues: string[];
}

export interface ValidationChecks {
  imports: ValidationCheck;
  props: ValidationCheck;
  styles: {
    usesProjectStyles: boolean;
    hardcodedCount: number;
    score: number;
    issues: string[];
  };
  types: {
    hasErrors: boolean;
    errorCount: number;
    errors: string[];
  };
  compilation: {
    compiles: boolean;
    errors: string[];
  };
}

export interface QualityScore {
  correctness: number;      // 0-100
  consistency: number;       // 0-100
  maintainability: number;   // 0-100
  overall: number;           // 0-100
}

export interface ValidationResult {
  timestamp: Date;
  code: string;
  framework: 'React' | 'Vue' | 'Node';
  checks: ValidationChecks;
  qualityScore: QualityScore;
  suggestions: string[];
  kbUsage: {
    componentsFromKB: number;
    totalComponents: number;
    usageRate: number;
  };
}

export interface ValidatorOptions {
  kb?: KnowledgeBase;
  framework?: 'React' | 'Vue' | 'Node';
  strict?: boolean;
  checkTypes?: boolean;
  checkCompilation?: boolean;
}

/**
 * Code Quality Validator
 */
export class CodeValidator {
  private kb?: KnowledgeBase;
  private options: ValidatorOptions;

  constructor(options: ValidatorOptions = {}) {
    this.kb = options.kb;
    this.options = {
      strict: false,
      checkTypes: true,
      checkCompilation: false,
      ...options,
    };
  }

  /**
   * Load knowledge base
   */
  setKnowledgeBase(kb: KnowledgeBase): void {
    this.kb = kb;
  }

  /**
   * Validate code quality
   */
  async validate(code: string, framework?: 'React' | 'Vue' | 'Node'): Promise<ValidationResult> {
    const fw = framework || this.options.framework || this.detectFramework(code);

    const checks: ValidationChecks = {
      imports: await this.checkImports(code, fw),
      props: await this.checkPropsUsage(code, fw),
      styles: await this.checkStyleUsage(code),
      types: await this.checkTypes(code, fw),
      compilation: await this.checkCompilation(code, fw),
    };

    const qualityScore = this.calculateQualityScore(checks);
    const suggestions = this.generateSuggestions(checks);
    const kbUsage = this.calculateKBUsage(code);

    return {
      timestamp: new Date(),
      code,
      framework: fw,
      checks,
      qualityScore,
      suggestions,
      kbUsage,
    };
  }

  /**
   * Detect framework from code
   */
  private detectFramework(code: string): 'React' | 'Vue' | 'Node' {
    if (code.includes('import React') || code.includes('from "react"') || code.includes('from \'react\'')) {
      return 'React';
    }
    if (code.includes('<template>') || code.includes('defineComponent') || code.includes('defineProps')) {
      return 'Vue';
    }
    return 'Node';
  }

  /**
   * Check if imports use correct paths from KB
   */
  private async checkImports(code: string, framework: 'React' | 'Vue' | 'Node'): Promise<ValidationCheck> {
    if (!this.kb) {
      return {
        total: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 100,
        issues: ['KB not loaded - cannot validate imports'],
      };
    }

    const issues: string[] = [];
    let total = 0;
    let correct = 0;

    try {
      const ast = parseTS(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const kb = this.kb!;

      traverse(ast, {
        ImportDeclaration(path) {
          total++;
          const importPath = path.node.source.value;
          const componentName = path.node.specifiers[0]?.local.name;

          if (!componentName) return;

          // Check if component exists in KB
          const kbComponent = kb.components.find(
            (c: ComponentData) => c.componentName === componentName && c.framework === framework
          );

          if (kbComponent) {
            // Verify import path matches KB
            if (kbComponent.importPath === importPath) {
              correct++;
            } else {
              issues.push(
                `Import path mismatch: "${componentName}" imports from "${importPath}" but KB suggests "${kbComponent.importPath}"`
              );
            }
          } else {
            // Component not in KB - might be from node_modules
            if (!importPath.startsWith('@/') && !importPath.startsWith('./') && !importPath.startsWith('../')) {
              correct++; // External library - OK
            } else {
              issues.push(`Component "${componentName}" not found in KB`);
            }
          }
        },
      });
    } catch (error) {
      issues.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      total,
      correct,
      incorrect: total - correct,
      accuracy: total > 0 ? (correct / total) * 100 : 100,
      issues,
    };
  }

  /**
   * Check if props usage matches KB definitions
   */
  private async checkPropsUsage(code: string, framework: 'React' | 'Vue' | 'Node'): Promise<ValidationCheck> {
    if (!this.kb) {
      return {
        total: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 100,
        issues: ['KB not loaded - cannot validate props'],
      };
    }

    const issues: string[] = [];
    let total = 0;
    let correct = 0;

    try {
      const ast = parseTS(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const kb = this.kb!;

      traverse(ast, {
        JSXElement(path) {
          const elementName = path.node.openingElement.name;
          if (elementName.type !== 'JSXIdentifier') return;

          const componentName = elementName.name;
          const kbComponent = kb.components.find(
            (c: ComponentData) => c.componentName === componentName && c.framework === framework
          );

          if (!kbComponent) return;

          total++;

          // Check props
          const usedProps = new Set(
            path.node.openingElement.attributes
              .filter(attr => attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier')
              .map((attr: any) => attr.name.name)
          );

          const requiredProps = kbComponent.props
            .filter((p: PropData) => p.required)
            .map((p: PropData) => p.name);

          const validProps = new Set(kbComponent.props.map((p: PropData) => p.name));

          // Check missing required props
          const missingRequired = requiredProps.filter((p: string) => !usedProps.has(p));
          if (missingRequired.length > 0) {
            issues.push(
              `<${componentName}> missing required props: ${missingRequired.join(', ')}`
            );
          } else {
            correct++;
          }

          // Check invalid props
          const invalidProps = Array.from(usedProps).filter(p => !validProps.has(p));
          if (invalidProps.length > 0) {
            issues.push(
              `<${componentName}> has invalid props: ${invalidProps.join(', ')}`
            );
          }
        },
      });
    } catch (error) {
      issues.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      total,
      correct,
      incorrect: total - correct,
      accuracy: total > 0 ? (correct / total) * 100 : 100,
      issues,
    };
  }

  /**
   * Check if styles use project variables/utilities from KB
   */
  private async checkStyleUsage(code: string): Promise<ValidationChecks['styles']> {
    if (!this.kb) {
      return {
        usesProjectStyles: false,
        hardcodedCount: 0,
        score: 100,
        issues: ['KB not loaded - cannot validate styles'],
      };
    }

    const issues: string[] = [];
    let hardcodedCount = 0;
    let usesProjectStyles = false;

    // Extract style-related code
    const stylePatterns = [
      /style=\{\{([^}]+)\}\}/g,           // Vue inline styles
      /style=\{([^}]+)\}/g,               // React inline styles
      /className=['"]([\w\s-]+)['"]/g,   // Class names
      /class=['"]([\w\s-]+)['"]/g,       // Vue class
    ];

    for (const pattern of stylePatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const styleContent = match[1];

        // Check for hardcoded colors
        if (/#+[0-9a-fA-F]{3,6}/.test(styleContent)) {
          hardcodedCount++;
          issues.push(`Hardcoded color found: ${match[0]}`);
        }

        // Check for hardcoded sizes
        if (/\d+px/.test(styleContent)) {
          hardcodedCount++;
          issues.push(`Hardcoded size found: ${match[0]}`);
        }

        // Check if using KB styles
        const kbStyles = this.kb.styles.map(s => s.name);
        const usesKBStyle = kbStyles.some(styleName => styleContent.includes(styleName));
        if (usesKBStyle) {
          usesProjectStyles = true;
        }
      }
    }

    const score = Math.max(0, 100 - hardcodedCount * 10);

    return {
      usesProjectStyles,
      hardcodedCount,
      score,
      issues,
    };
  }

  /**
   * Check for TypeScript type errors (basic check)
   */
  private async checkTypes(code: string, framework: 'React' | 'Vue' | 'Node'): Promise<ValidationChecks['types']> {
    if (!this.options.checkTypes) {
      return {
        hasErrors: false,
        errorCount: 0,
        errors: [],
      };
    }

    const errors: string[] = [];

    try {
      // Basic TypeScript checks
      parseTS(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown type error');
    }

    return {
      hasErrors: errors.length > 0,
      errorCount: errors.length,
      errors,
    };
  }

  /**
   * Check if code compiles (placeholder for now)
   */
  private async checkCompilation(code: string, framework: 'React' | 'Vue' | 'Node'): Promise<ValidationChecks['compilation']> {
    if (!this.options.checkCompilation) {
      return {
        compiles: true,
        errors: [],
      };
    }

    // TODO: Implement actual compilation check with tsc/vue-tsc
    return {
      compiles: true,
      errors: [],
    };
  }

  /**
   * Calculate quality scores (0-100)
   */
  private calculateQualityScore(checks: ValidationChecks): QualityScore {
    // Correctness: imports + props + types
    const correctness = (
      (checks.imports.accuracy +
        checks.props.accuracy +
        (checks.types.hasErrors ? 0 : 100)) / 3
    );

    // Consistency: style usage
    const consistency = checks.styles.score;

    // Maintainability: KB usage + no hardcoded values
    const maintainability = (
      (checks.styles.usesProjectStyles ? 50 : 0) +
      Math.max(0, 50 - checks.styles.hardcodedCount * 5)
    );

    const overall = (correctness + consistency + maintainability) / 3;

    return {
      correctness: Math.round(correctness),
      consistency: Math.round(consistency),
      maintainability: Math.round(maintainability),
      overall: Math.round(overall),
    };
  }

  /**
   * Generate actionable suggestions
   */
  private generateSuggestions(checks: ValidationChecks): string[] {
    const suggestions: string[] = [];

    if (checks.imports.accuracy < 100) {
      suggestions.push('Fix import paths to match your project structure (check KB for correct paths)');
    }

    if (checks.props.accuracy < 100) {
      suggestions.push('Verify component props match their definitions (check KB for required props)');
    }

    if (checks.styles.hardcodedCount > 0) {
      suggestions.push(`Replace ${checks.styles.hardcodedCount} hardcoded style(s) with project variables`);
    }

    if (!checks.styles.usesProjectStyles) {
      suggestions.push('Consider using project style variables/utilities from KB');
    }

    if (checks.types.hasErrors) {
      suggestions.push('Fix TypeScript type errors');
    }

    if (suggestions.length === 0) {
      suggestions.push('Code quality looks good! ✓');
    }

    return suggestions;
  }

  /**
   * Calculate KB usage rate
   */
  private calculateKBUsage(code: string): ValidationResult['kbUsage'] {
    if (!this.kb) {
      return {
        componentsFromKB: 0,
        totalComponents: 0,
        usageRate: 0,
      };
    }

    let totalComponents = 0;
    let componentsFromKB = 0;

    try {
      const ast = parseTS(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const usedComponents = new Set<string>();

      traverse(ast, {
        JSXElement(path) {
          const elementName = path.node.openingElement.name;
          if (elementName.type === 'JSXIdentifier') {
            usedComponents.add(elementName.name);
          }
        },
      });

      totalComponents = usedComponents.size;

      for (const componentName of usedComponents) {
        if (this.kb.components.some(c => c.componentName === componentName)) {
          componentsFromKB++;
        }
      }
    } catch {
      // Ignore parse errors
    }

    return {
      componentsFromKB,
      totalComponents,
      usageRate: totalComponents > 0 ? (componentsFromKB / totalComponents) * 100 : 0,
    };
  }
}
