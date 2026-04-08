/**
 * Quality Tracker - Long-term quality metrics tracking
 */

import type { ValidationResult } from './validator.js';
import type { ABTestResult } from './ab-tester.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface TrackedGeneration {
  id: string;
  timestamp: Date;
  prompt: string;
  framework: 'React' | 'Vue' | 'Node';
  validation: ValidationResult;
  usedKB: boolean;
}

export interface QualityStatistics {
  totalGenerations: number;
  withKB: number;
  withoutKB: number;
  averageQualityScore: number;
  averageQualityScoreWithKB: number;
  averageQualityScoreWithoutKB: number;
  improvementRate: number;
  topIssues: Array<{ issue: string; count: number }>;
}

export interface QualityTrend {
  date: string;
  averageScore: number;
  generationsCount: number;
}

export interface TrackerOptions {
  dataDir?: string;
  autoSave?: boolean;
}

/**
 * Quality Tracker
 */
export class QualityTracker {
  private dataDir: string;
  private autoSave: boolean;
  private generations: TrackedGeneration[] = [];
  private abTests: ABTestResult[] = [];

  constructor(options: TrackerOptions = {}) {
    this.dataDir = options.dataDir || join(process.cwd(), '.kb', 'quality-tracking');
    this.autoSave = options.autoSave ?? true;
  }

  /**
   * Initialize tracker (load data)
   */
  async init(): Promise<void> {
    await this.ensureDataDir();
    await this.loadData();
  }

  /**
   * Ensure data directory exists
   */
  private async ensureDataDir(): Promise<void> {
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }
  }

  /**
   * Load data from disk
   */
  private async loadData(): Promise<void> {
    const generationsFile = join(this.dataDir, 'generations.json');
    const abTestsFile = join(this.dataDir, 'ab-tests.json');

    try {
      if (existsSync(generationsFile)) {
        const data = await readFile(generationsFile, 'utf-8');
        this.generations = JSON.parse(data, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
      }

      if (existsSync(abTestsFile)) {
        const data = await readFile(abTestsFile, 'utf-8');
        this.abTests = JSON.parse(data, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
      }
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    }
  }

  /**
   * Save data to disk
   */
  private async saveData(): Promise<void> {
    const generationsFile = join(this.dataDir, 'generations.json');
    const abTestsFile = join(this.dataDir, 'ab-tests.json');

    try {
      await writeFile(generationsFile, JSON.stringify(this.generations, null, 2));
      await writeFile(abTestsFile, JSON.stringify(this.abTests, null, 2));
    } catch (error) {
      console.error('Failed to save tracking data:', error);
    }
  }

  /**
   * Record a code generation
   */
  async recordGeneration(
    prompt: string,
    validation: ValidationResult,
    usedKB: boolean
  ): Promise<string> {
    const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const generation: TrackedGeneration = {
      id,
      timestamp: new Date(),
      prompt,
      framework: validation.framework,
      validation,
      usedKB,
    };

    this.generations.push(generation);

    if (this.autoSave) {
      await this.saveData();
    }

    return id;
  }

  /**
   * Record an A/B test
   */
  async recordABTest(result: ABTestResult): Promise<void> {
    this.abTests.push(result);

    if (this.autoSave) {
      await this.saveData();
    }
  }

  /**
   * Get overall statistics
   */
  getStatistics(): QualityStatistics {
    const totalGenerations = this.generations.length;
    const withKB = this.generations.filter(g => g.usedKB).length;
    const withoutKB = totalGenerations - withKB;

    const allScores = this.generations.map(g => g.validation.qualityScore.overall);
    const scoresWithKB = this.generations
      .filter(g => g.usedKB)
      .map(g => g.validation.qualityScore.overall);
    const scoresWithoutKB = this.generations
      .filter(g => !g.usedKB)
      .map(g => g.validation.qualityScore.overall);

    const averageQualityScore = this.calculateAverage(allScores);
    const averageQualityScoreWithKB = this.calculateAverage(scoresWithKB);
    const averageQualityScoreWithoutKB = this.calculateAverage(scoresWithoutKB);

    const improvementRate =
      averageQualityScoreWithoutKB > 0
        ? ((averageQualityScoreWithKB - averageQualityScoreWithoutKB) / averageQualityScoreWithoutKB) * 100
        : 0;

    // Collect top issues
    const issueMap = new Map<string, number>();
    for (const gen of this.generations) {
      const allIssues = [
        ...gen.validation.checks.imports.issues,
        ...gen.validation.checks.props.issues,
        ...gen.validation.checks.styles.issues,
        ...gen.validation.checks.types.errors,
      ];
      for (const issue of allIssues) {
        issueMap.set(issue, (issueMap.get(issue) || 0) + 1);
      }
    }

    const topIssues = Array.from(issueMap.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalGenerations,
      withKB,
      withoutKB,
      averageQualityScore,
      averageQualityScoreWithKB,
      averageQualityScoreWithoutKB,
      improvementRate,
      topIssues,
    };
  }

  /**
   * Get quality trends over time
   */
  getTrends(days: number = 30): QualityTrend[] {
    const now = new Date();
    const trends: QualityTrend[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayGenerations = this.generations.filter(g => {
        const genDate = new Date(g.timestamp).toISOString().split('T')[0];
        return genDate === dateStr;
      });

      if (dayGenerations.length > 0) {
        const scores = dayGenerations.map(g => g.validation.qualityScore.overall);
        trends.push({
          date: dateStr,
          averageScore: this.calculateAverage(scores),
          generationsCount: dayGenerations.length,
        });
      } else {
        trends.push({
          date: dateStr,
          averageScore: 0,
          generationsCount: 0,
        });
      }
    }

    return trends;
  }

  /**
   * Get recent generations
   */
  getRecentGenerations(limit: number = 10): TrackedGeneration[] {
    return this.generations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get A/B test results
   */
  getABTests(limit?: number): ABTestResult[] {
    const sorted = this.abTests.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Export quality report
   */
  async exportReport(outputPath: string): Promise<void> {
    const stats = this.getStatistics();
    const trends = this.getTrends(30);
    const recentGens = this.getRecentGenerations(20);

    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════════════');
    lines.push('         QUALITY TRACKING REPORT');
    lines.push('═══════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    lines.push('───────────────────────────────────────────────────');
    lines.push('OVERALL STATISTICS');
    lines.push('───────────────────────────────────────────────────');
    lines.push('');
    lines.push(`Total Generations: ${stats.totalGenerations}`);
    lines.push(`  - With KB: ${stats.withKB} (${((stats.withKB / stats.totalGenerations) * 100).toFixed(1)}%)`);
    lines.push(`  - Without KB: ${stats.withoutKB} (${((stats.withoutKB / stats.totalGenerations) * 100).toFixed(1)}%)`);
    lines.push('');
    lines.push('Average Quality Score:');
    lines.push(`  - Overall: ${stats.averageQualityScore.toFixed(1)}/100`);
    lines.push(`  - With KB: ${stats.averageQualityScoreWithKB.toFixed(1)}/100`);
    lines.push(`  - Without KB: ${stats.averageQualityScoreWithoutKB.toFixed(1)}/100`);
    lines.push(`  - Improvement: ${stats.improvementRate > 0 ? '+' : ''}${stats.improvementRate.toFixed(1)}%`);
    lines.push('');

    if (stats.topIssues.length > 0) {
      lines.push('Top Issues:');
      for (const { issue, count } of stats.topIssues.slice(0, 5)) {
        lines.push(`  - ${issue.substring(0, 60)}... (${count}x)`);
      }
      lines.push('');
    }

    lines.push('───────────────────────────────────────────────────');
    lines.push('30-DAY TRENDS');
    lines.push('───────────────────────────────────────────────────');
    lines.push('');

    const activeDays = trends.filter(t => t.generationsCount > 0);
    if (activeDays.length > 0) {
      lines.push('Date          | Avg Score | Generations');
      lines.push('--------------|-----------|------------');
      for (const trend of activeDays.slice(-10)) {
        lines.push(
          `${trend.date} | ${trend.averageScore.toFixed(1).padStart(9)} | ${trend.generationsCount.toString().padStart(11)}`
        );
      }
    } else {
      lines.push('No data available for the past 30 days');
    }
    lines.push('');

    lines.push('───────────────────────────────────────────────────');
    lines.push('RECENT GENERATIONS');
    lines.push('───────────────────────────────────────────────────');
    lines.push('');

    for (const gen of recentGens.slice(0, 10)) {
      const timestamp = new Date(gen.timestamp).toISOString().split('T').join(' ').split('.')[0];
      const kbLabel = gen.usedKB ? '[KB]' : '[--]';
      lines.push(`${timestamp} ${kbLabel} Score: ${gen.validation.qualityScore.overall}/100`);
      lines.push(`  Prompt: ${gen.prompt.substring(0, 60)}...`);
      lines.push('');
    }

    lines.push('───────────────────────────────────────────────────');
    lines.push('A/B TEST RESULTS');
    lines.push('───────────────────────────────────────────────────');
    lines.push('');

    const abTests = this.getABTests(5);
    if (abTests.length > 0) {
      for (const test of abTests) {
        const timestamp = new Date(test.timestamp).toISOString().split('T').join(' ').split('.')[0];
        lines.push(`${timestamp} - Winner: ${test.winner.toUpperCase()}`);
        lines.push(`  Quality improvement: ${test.improvements.qualityScoreImprovement > 0 ? '+' : ''}${test.improvements.qualityScoreImprovement.toFixed(1)}`);
        lines.push(`  Prompt: ${test.prompt.substring(0, 60)}...`);
        lines.push('');
      }
    } else {
      lines.push('No A/B tests recorded yet');
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════');

    await writeFile(outputPath, lines.join('\n'));
  }

  /**
   * Calculate average of numbers
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    this.generations = [];
    this.abTests = [];
    await this.saveData();
  }
}
