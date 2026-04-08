/**
 * A/B Testing Tool - Compare code generated with/without KB
 */

import type { KnowledgeBase, ValidationResult } from './types.js';
import { CodeValidator } from './validator.js';

export interface ABTestVersion {
  code: string;
  validation: ValidationResult;
  withKB: boolean;
}

export interface ABTestImprovements {
  correctnessImprovement: number;
  consistencyImprovement: number;
  maintainabilityImprovement: number;
  qualityScoreImprovement: number;
  issuesReduced: number;
}

export interface ABTestComparison {
  imports: {
    versionA: { accuracy: number; issues: number };
    versionB: { accuracy: number; issues: number };
    improvement: number;
  };
  props: {
    versionA: { accuracy: number; issues: number };
    versionB: { accuracy: number; issues: number };
    improvement: number;
  };
  styles: {
    versionA: { score: number; hardcoded: number };
    versionB: { score: number; hardcoded: number };
    improvement: number;
  };
}

export interface ABTestResult {
  prompt: string;
  timestamp: Date;
  versionA: ABTestVersion;  // Without KB
  versionB: ABTestVersion;  // With KB
  improvements: ABTestImprovements;
  comparison: ABTestComparison;
  summary: string;
  winner: 'A' | 'B' | 'tie';
}

export interface ABTestOptions {
  kb?: KnowledgeBase;
  validator?: CodeValidator;
}

/**
 * A/B Testing Tool
 */
export class ABTester {
  private kb?: KnowledgeBase;
  private validator: CodeValidator;

  constructor(options: ABTestOptions = {}) {
    this.kb = options.kb;
    this.validator = options.validator || new CodeValidator({ kb: options.kb });
  }

  /**
   * Set knowledge base
   */
  setKnowledgeBase(kb: KnowledgeBase): void {
    this.kb = kb;
    this.validator.setKnowledgeBase(kb);
  }

  /**
   * Run A/B test
   *
   * @param prompt - The code generation prompt
   * @param codeWithoutKB - Code generated WITHOUT KB context
   * @param codeWithKB - Code generated WITH KB context
   * @param framework - Target framework
   */
  async runTest(
    prompt: string,
    codeWithoutKB: string,
    codeWithKB: string,
    framework: 'React' | 'Vue' | 'Node'
  ): Promise<ABTestResult> {
    // Validate both versions
    const validationA = await this.validator.validate(codeWithoutKB, framework);
    const validationB = await this.validator.validate(codeWithKB, framework);

    const versionA: ABTestVersion = {
      code: codeWithoutKB,
      validation: validationA,
      withKB: false,
    };

    const versionB: ABTestVersion = {
      code: codeWithKB,
      validation: validationB,
      withKB: true,
    };

    // Calculate improvements
    const improvements = this.calculateImprovements(validationA, validationB);

    // Generate comparison
    const comparison = this.generateComparison(validationA, validationB);

    // Determine winner
    const winner = this.determineWinner(improvements);

    // Generate summary
    const summary = this.generateSummary(improvements, winner);

    return {
      prompt,
      timestamp: new Date(),
      versionA,
      versionB,
      improvements,
      comparison,
      summary,
      winner,
    };
  }

  /**
   * Calculate improvements from A to B
   */
  private calculateImprovements(
    validationA: ValidationResult,
    validationB: ValidationResult
  ): ABTestImprovements {
    const correctnessImprovement =
      validationB.qualityScore.correctness - validationA.qualityScore.correctness;

    const consistencyImprovement =
      validationB.qualityScore.consistency - validationA.qualityScore.consistency;

    const maintainabilityImprovement =
      validationB.qualityScore.maintainability - validationA.qualityScore.maintainability;

    const qualityScoreImprovement =
      validationB.qualityScore.overall - validationA.qualityScore.overall;

    const issuesA =
      validationA.checks.imports.issues.length +
      validationA.checks.props.issues.length +
      validationA.checks.styles.issues.length +
      validationA.checks.types.errors.length;

    const issuesB =
      validationB.checks.imports.issues.length +
      validationB.checks.props.issues.length +
      validationB.checks.styles.issues.length +
      validationB.checks.types.errors.length;

    const issuesReduced = issuesA - issuesB;

    return {
      correctnessImprovement,
      consistencyImprovement,
      maintainabilityImprovement,
      qualityScoreImprovement,
      issuesReduced,
    };
  }

  /**
   * Generate detailed comparison
   */
  private generateComparison(
    validationA: ValidationResult,
    validationB: ValidationResult
  ): ABTestComparison {
    return {
      imports: {
        versionA: {
          accuracy: validationA.checks.imports.accuracy,
          issues: validationA.checks.imports.issues.length,
        },
        versionB: {
          accuracy: validationB.checks.imports.accuracy,
          issues: validationB.checks.imports.issues.length,
        },
        improvement: validationB.checks.imports.accuracy - validationA.checks.imports.accuracy,
      },
      props: {
        versionA: {
          accuracy: validationA.checks.props.accuracy,
          issues: validationA.checks.props.issues.length,
        },
        versionB: {
          accuracy: validationB.checks.props.accuracy,
          issues: validationB.checks.props.issues.length,
        },
        improvement: validationB.checks.props.accuracy - validationA.checks.props.accuracy,
      },
      styles: {
        versionA: {
          score: validationA.checks.styles.score,
          hardcoded: validationA.checks.styles.hardcodedCount,
        },
        versionB: {
          score: validationB.checks.styles.score,
          hardcoded: validationB.checks.styles.hardcodedCount,
        },
        improvement: validationB.checks.styles.score - validationA.checks.styles.score,
      },
    };
  }

  /**
   * Determine winner
   */
  private determineWinner(improvements: ABTestImprovements): 'A' | 'B' | 'tie' {
    const { qualityScoreImprovement } = improvements;

    if (qualityScoreImprovement > 5) {
      return 'B'; // KB version is significantly better
    } else if (qualityScoreImprovement < -5) {
      return 'A'; // Non-KB version is somehow better
    } else {
      return 'tie'; // No significant difference
    }
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(improvements: ABTestImprovements, winner: 'A' | 'B' | 'tie'): string {
    const lines: string[] = [];

    if (winner === 'B') {
      lines.push('✅ KB-enhanced version is BETTER');
      lines.push('');
      lines.push(`Quality improvement: +${improvements.qualityScoreImprovement.toFixed(1)} points`);

      if (improvements.correctnessImprovement > 0) {
        lines.push(`  - Correctness: +${improvements.correctnessImprovement.toFixed(1)}`);
      }
      if (improvements.consistencyImprovement > 0) {
        lines.push(`  - Consistency: +${improvements.consistencyImprovement.toFixed(1)}`);
      }
      if (improvements.maintainabilityImprovement > 0) {
        lines.push(`  - Maintainability: +${improvements.maintainabilityImprovement.toFixed(1)}`);
      }

      if (improvements.issuesReduced > 0) {
        lines.push(`  - Issues reduced: ${improvements.issuesReduced}`);
      }
    } else if (winner === 'A') {
      lines.push('⚠️  Non-KB version performed better (investigate KB quality)');
      lines.push('');
      lines.push(`Quality difference: ${improvements.qualityScoreImprovement.toFixed(1)} points`);
    } else {
      lines.push('🤝 No significant difference between versions');
      lines.push('');
      lines.push('KB might not be providing value for this use case');
    }

    return lines.join('\n');
  }

  /**
   * Generate formatted report
   */
  formatReport(result: ABTestResult): string {
    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════════════');
    lines.push('           A/B TEST REPORT');
    lines.push('═══════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Prompt: ${result.prompt}`);
    lines.push(`Time: ${result.timestamp.toISOString()}`);
    lines.push('');

    lines.push('───────────────────────────────────────────────────');
    lines.push('RESULTS');
    lines.push('───────────────────────────────────────────────────');
    lines.push('');
    lines.push(result.summary);
    lines.push('');

    lines.push('───────────────────────────────────────────────────');
    lines.push('DETAILED COMPARISON');
    lines.push('───────────────────────────────────────────────────');
    lines.push('');

    // Quality scores
    lines.push('Quality Scores:');
    lines.push(`  Version A (no KB):  ${result.versionA.validation.qualityScore.overall}/100`);
    lines.push(`  Version B (w/ KB):  ${result.versionB.validation.qualityScore.overall}/100`);
    lines.push(`  Improvement:        ${result.improvements.qualityScoreImprovement > 0 ? '+' : ''}${result.improvements.qualityScoreImprovement.toFixed(1)}`);
    lines.push('');

    // Imports
    lines.push('Import Accuracy:');
    lines.push(`  Version A: ${result.comparison.imports.versionA.accuracy.toFixed(1)}% (${result.comparison.imports.versionA.issues} issues)`);
    lines.push(`  Version B: ${result.comparison.imports.versionB.accuracy.toFixed(1)}% (${result.comparison.imports.versionB.issues} issues)`);
    lines.push(`  Change: ${result.comparison.imports.improvement > 0 ? '+' : ''}${result.comparison.imports.improvement.toFixed(1)}%`);
    lines.push('');

    // Props
    lines.push('Props Accuracy:');
    lines.push(`  Version A: ${result.comparison.props.versionA.accuracy.toFixed(1)}% (${result.comparison.props.versionA.issues} issues)`);
    lines.push(`  Version B: ${result.comparison.props.versionB.accuracy.toFixed(1)}% (${result.comparison.props.versionB.issues} issues)`);
    lines.push(`  Change: ${result.comparison.props.improvement > 0 ? '+' : ''}${result.comparison.props.improvement.toFixed(1)}%`);
    lines.push('');

    // Styles
    lines.push('Style Consistency:');
    lines.push(`  Version A: ${result.comparison.styles.versionA.score}/100 (${result.comparison.styles.versionA.hardcoded} hardcoded)`);
    lines.push(`  Version B: ${result.comparison.styles.versionB.score}/100 (${result.comparison.styles.versionB.hardcoded} hardcoded)`);
    lines.push(`  Change: ${result.comparison.styles.improvement > 0 ? '+' : ''}${result.comparison.styles.improvement}`);
    lines.push('');

    // KB Usage
    lines.push('KB Usage:');
    lines.push(`  Components from KB: ${result.versionB.validation.kbUsage.componentsFromKB}/${result.versionB.validation.kbUsage.totalComponents}`);
    lines.push(`  Usage rate: ${result.versionB.validation.kbUsage.usageRate.toFixed(1)}%`);
    lines.push('');

    lines.push('═══════════════════════════════════════════════════');

    return lines.join('\n');
  }
}
