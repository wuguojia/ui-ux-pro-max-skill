/**
 * Quality Scoring System for Knowledge Base
 */

import { ComponentData, StyleData, ConventionData, KnowledgeBase } from './types';

export interface QualityScore {
  overall: number; // 0-100
  completeness: number;
  consistency: number;
  reusability: number;
  documentation: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  components: ComponentQualityScore;
  styles: StyleQualityScore;
  conventions: ConventionQualityScore;
}

export interface ComponentQualityScore {
  score: number;
  metrics: {
    hasProps: number;
    hasDescription: number;
    hasUsageExample: number;
    hasKeywords: number;
    propsDocumented: number;
    importPathValid: number;
  };
  issues: QualityIssue[];
}

export interface StyleQualityScore {
  score: number;
  metrics: {
    hasCategory: number;
    hasUsage: number;
    hasExample: number;
    hasKeywords: number;
    consistent: number;
  };
  issues: QualityIssue[];
}

export interface ConventionQualityScore {
  score: number;
  metrics: {
    hasGoodExample: number;
    hasBadExample: number;
    hasReason: number;
    hasSeverity: number;
    actionable: number;
  };
  issues: QualityIssue[];
}

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  description: string;
  item: string;
  suggestion?: string;
}

export interface ReusabilityMetrics {
  componentReuse: Map<string, number>; // How many times a component is used
  styleReuse: Map<string, number>;
  averageReuse: number;
  topReused: Array<{ name: string; count: number }>;
}

/**
 * Calculate quality score for entire knowledge base
 */
export async function calculateKBQuality(kb: KnowledgeBase): Promise<QualityScore> {
  const componentScore = calculateComponentsQuality(kb.components);
  const styleScore = calculateStylesQuality(kb.styles);
  const conventionScore = calculateConventionsQuality(kb.conventions);

  const overall =
    (componentScore.score * 0.4 + styleScore.score * 0.3 + conventionScore.score * 0.3);

  const completeness = (
    componentScore.metrics.hasProps +
    componentScore.metrics.hasDescription +
    styleScore.metrics.hasUsage
  ) / 3;

  const consistency = (
    componentScore.metrics.importPathValid +
    styleScore.metrics.consistent
  ) / 2;

  const reusability = calculateReusabilityScore(kb);

  const documentation = (
    componentScore.metrics.hasUsageExample +
    conventionScore.metrics.hasReason
  ) / 2;

  return {
    overall,
    completeness,
    consistency,
    reusability,
    documentation,
    breakdown: {
      components: componentScore,
      styles: styleScore,
      conventions: conventionScore,
    },
  };
}

/**
 * Calculate quality score for components
 */
function calculateComponentsQuality(components: ComponentData[]): ComponentQualityScore {
  if (components.length === 0) {
    return {
      score: 0,
      metrics: {
        hasProps: 0,
        hasDescription: 0,
        hasUsageExample: 0,
        hasKeywords: 0,
        propsDocumented: 0,
        importPathValid: 0,
      },
      issues: [],
    };
  }

  const metrics = {
    hasProps: 0,
    hasDescription: 0,
    hasUsageExample: 0,
    hasKeywords: 0,
    propsDocumented: 0,
    importPathValid: 0,
  };

  const issues: QualityIssue[] = [];

  components.forEach((component) => {
    // Check props
    if (component.props && component.props.length > 0) {
      metrics.hasProps++;

      // Check if props are documented
      const documentedProps = component.props.filter(p => p.description || p.type).length;
      metrics.propsDocumented += documentedProps / component.props.length;
    } else {
      issues.push({
        severity: 'warning',
        category: 'Completeness',
        description: 'Component has no props defined',
        item: component.componentName,
        suggestion: 'Add props information to improve usability',
      });
    }

    // Check description
    if (component.description) {
      metrics.hasDescription++;
    } else {
      issues.push({
        severity: 'warning',
        category: 'Documentation',
        description: 'Component missing description',
        item: component.componentName,
      });
    }

    // Check usage example
    if (component.usageExample) {
      metrics.hasUsageExample++;
    } else {
      issues.push({
        severity: 'info',
        category: 'Documentation',
        description: 'Component missing usage example',
        item: component.componentName,
      });
    }

    // Check keywords
    if (component.keywords && component.keywords.length > 0) {
      metrics.hasKeywords++;
    } else {
      issues.push({
        severity: 'info',
        category: 'Searchability',
        description: 'Component missing keywords',
        item: component.componentName,
      });
    }

    // Check import path
    if (component.importPath && (component.importPath.startsWith('@/') || component.importPath.startsWith('.'))) {
      metrics.importPathValid++;
    } else {
      issues.push({
        severity: 'error',
        category: 'Consistency',
        description: 'Invalid or missing import path',
        item: component.componentName,
        suggestion: 'Use @ alias or relative path',
      });
    }
  });

  const total = components.length;
  const score = (
    (metrics.hasProps / total) * 20 +
    (metrics.hasDescription / total) * 25 +
    (metrics.hasUsageExample / total) * 20 +
    (metrics.hasKeywords / total) * 15 +
    (metrics.propsDocumented / total) * 10 +
    (metrics.importPathValid / total) * 10
  );

  return {
    score,
    metrics: {
      hasProps: (metrics.hasProps / total) * 100,
      hasDescription: (metrics.hasDescription / total) * 100,
      hasUsageExample: (metrics.hasUsageExample / total) * 100,
      hasKeywords: (metrics.hasKeywords / total) * 100,
      propsDocumented: (metrics.propsDocumented / total) * 100,
      importPathValid: (metrics.importPathValid / total) * 100,
    },
    issues,
  };
}

/**
 * Calculate quality score for styles
 */
function calculateStylesQuality(styles: StyleData[]): StyleQualityScore {
  if (styles.length === 0) {
    return {
      score: 0,
      metrics: {
        hasCategory: 0,
        hasUsage: 0,
        hasExample: 0,
        hasKeywords: 0,
        consistent: 0,
      },
      issues: [],
    };
  }

  const metrics = {
    hasCategory: 0,
    hasUsage: 0,
    hasExample: 0,
    hasKeywords: 0,
    consistent: 0,
  };

  const issues: QualityIssue[] = [];
  const categories = new Set<string>();
  const preprocessors = new Set<string>();

  styles.forEach((style) => {
    if (style.category) {
      metrics.hasCategory++;
      categories.add(style.category);
    }

    if (style.usage) {
      metrics.hasUsage++;
    } else {
      issues.push({
        severity: 'warning',
        category: 'Documentation',
        description: 'Style missing usage information',
        item: style.name,
      });
    }

    if (style.example) {
      metrics.hasExample++;
    }

    if (style.keywords && style.keywords.length > 0) {
      metrics.hasKeywords++;
    }

    if (style.preprocessor) {
      preprocessors.add(style.preprocessor);
    }

    // Check consistency
    if (style.styleType && style.name) {
      const expectedPrefix = getExpectedPrefix(style.styleType);
      if (style.name.startsWith(expectedPrefix)) {
        metrics.consistent++;
      } else {
        issues.push({
          severity: 'info',
          category: 'Consistency',
          description: `Style name doesn't match type (expected ${expectedPrefix})`,
          item: style.name,
        });
      }
    }
  });

  const total = styles.length;
  const score = (
    (metrics.hasCategory / total) * 20 +
    (metrics.hasUsage / total) * 30 +
    (metrics.hasExample / total) * 20 +
    (metrics.hasKeywords / total) * 15 +
    (metrics.consistent / total) * 15
  );

  return {
    score,
    metrics: {
      hasCategory: (metrics.hasCategory / total) * 100,
      hasUsage: (metrics.hasUsage / total) * 100,
      hasExample: (metrics.hasExample / total) * 100,
      hasKeywords: (metrics.hasKeywords / total) * 100,
      consistent: (metrics.consistent / total) * 100,
    },
    issues,
  };
}

/**
 * Get expected prefix for style type
 */
function getExpectedPrefix(styleType: string): string {
  if (styleType === 'CSS Variable') return '--';
  if (styleType === 'Less Variable') return '@';
  if (styleType === 'Sass Variable') return '$';
  return '';
}

/**
 * Calculate quality score for conventions
 */
function calculateConventionsQuality(conventions: ConventionData[]): ConventionQualityScore {
  if (conventions.length === 0) {
    return {
      score: 0,
      metrics: {
        hasGoodExample: 0,
        hasBadExample: 0,
        hasReason: 0,
        hasSeverity: 0,
        actionable: 0,
      },
      issues: [],
    };
  }

  const metrics = {
    hasGoodExample: 0,
    hasBadExample: 0,
    hasReason: 0,
    hasSeverity: 0,
    actionable: 0,
  };

  const issues: QualityIssue[] = [];

  conventions.forEach((convention) => {
    if (convention.goodExample) {
      metrics.hasGoodExample++;
    }

    if (convention.badExample) {
      metrics.hasBadExample++;
    } else {
      issues.push({
        severity: 'info',
        category: 'Completeness',
        description: 'Convention missing bad example',
        item: convention.rule,
      });
    }

    if (convention.reason) {
      metrics.hasReason++;
    } else {
      issues.push({
        severity: 'warning',
        category: 'Documentation',
        description: 'Convention missing reason',
        item: convention.rule,
      });
    }

    if (convention.severity) {
      metrics.hasSeverity++;
    }

    // Check if actionable
    if (convention.goodExample && convention.badExample && convention.reason) {
      metrics.actionable++;
    }
  });

  const total = conventions.length;
  const score = (
    (metrics.hasGoodExample / total) * 20 +
    (metrics.hasBadExample / total) * 20 +
    (metrics.hasReason / total) * 30 +
    (metrics.hasSeverity / total) * 10 +
    (metrics.actionable / total) * 20
  );

  return {
    score,
    metrics: {
      hasGoodExample: (metrics.hasGoodExample / total) * 100,
      hasBadExample: (metrics.hasBadExample / total) * 100,
      hasReason: (metrics.hasReason / total) * 100,
      hasSeverity: (metrics.hasSeverity / total) * 100,
      actionable: (metrics.actionable / total) * 100,
    },
    issues,
  };
}

/**
 * Calculate reusability score
 */
function calculateReusabilityScore(kb: KnowledgeBase): number {
  // Reusability based on:
  // 1. Components with clear props are more reusable
  // 2. Components with usage examples are more reusable
  // 3. Components with good documentation are more reusable

  let reusabilityScore = 0;
  let factors = 0;

  kb.components.forEach((component) => {
    let componentScore = 50; // Base score

    if (component.props && component.props.length > 0) {
      componentScore += 20;
    }

    if (component.usageExample) {
      componentScore += 15;
    }

    if (component.description) {
      componentScore += 10;
    }

    if (component.keywords && component.keywords.length >= 3) {
      componentScore += 5;
    }

    reusabilityScore += componentScore;
    factors++;
  });

  return factors > 0 ? reusabilityScore / factors : 0;
}

/**
 * Generate quality report
 */
export function generateQualityReport(score: QualityScore): string {
  const lines: string[] = [];

  lines.push('Knowledge Base Quality Report');
  lines.push('=' .repeat(50));
  lines.push('');
  lines.push(`Overall Score: ${score.overall.toFixed(1)}/100`);
  lines.push(`Completeness: ${score.completeness.toFixed(1)}/100`);
  lines.push(`Consistency: ${score.consistency.toFixed(1)}/100`);
  lines.push(`Reusability: ${score.reusability.toFixed(1)}/100`);
  lines.push(`Documentation: ${score.documentation.toFixed(1)}/100`);
  lines.push('');

  lines.push('Component Quality:');
  lines.push(`  Score: ${score.breakdown.components.score.toFixed(1)}/100`);
  lines.push(`  Has Props: ${score.breakdown.components.metrics.hasProps.toFixed(1)}%`);
  lines.push(`  Has Description: ${score.breakdown.components.metrics.hasDescription.toFixed(1)}%`);
  lines.push(`  Has Usage Example: ${score.breakdown.components.metrics.hasUsageExample.toFixed(1)}%`);
  lines.push(`  Issues: ${score.breakdown.components.issues.length}`);
  lines.push('');

  lines.push('Style Quality:');
  lines.push(`  Score: ${score.breakdown.styles.score.toFixed(1)}/100`);
  lines.push(`  Has Category: ${score.breakdown.styles.metrics.hasCategory.toFixed(1)}%`);
  lines.push(`  Has Usage: ${score.breakdown.styles.metrics.hasUsage.toFixed(1)}%`);
  lines.push(`  Issues: ${score.breakdown.styles.issues.length}`);
  lines.push('');

  lines.push('Convention Quality:');
  lines.push(`  Score: ${score.breakdown.conventions.score.toFixed(1)}/100`);
  lines.push(`  Has Good Example: ${score.breakdown.conventions.metrics.hasGoodExample.toFixed(1)}%`);
  lines.push(`  Has Bad Example: ${score.breakdown.conventions.metrics.hasBadExample.toFixed(1)}%`);
  lines.push(`  Actionable: ${score.breakdown.conventions.metrics.actionable.toFixed(1)}%`);
  lines.push(`  Issues: ${score.breakdown.conventions.issues.length}`);
  lines.push('');

  // Top issues
  const allIssues = [
    ...score.breakdown.components.issues,
    ...score.breakdown.styles.issues,
    ...score.breakdown.conventions.issues,
  ];

  const errorIssues = allIssues.filter(i => i.severity === 'error');
  const warningIssues = allIssues.filter(i => i.severity === 'warning');

  if (errorIssues.length > 0) {
    lines.push(`Critical Issues (${errorIssues.length}):`);
    errorIssues.slice(0, 5).forEach(issue => {
      lines.push(`  - ${issue.description} (${issue.item})`);
    });
    lines.push('');
  }

  if (warningIssues.length > 0) {
    lines.push(`Warnings (${warningIssues.length}):`);
    warningIssues.slice(0, 5).forEach(issue => {
      lines.push(`  - ${issue.description} (${issue.item})`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
