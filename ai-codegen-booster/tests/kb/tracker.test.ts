/**
 * Tests for Quality Tracker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QualityTracker } from '../../src/kb/tracker';
import type { ValidationResult } from '../../src/kb/validator';
import type { ABTestResult } from '../../src/kb/ab-tester';
import { rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('QualityTracker', () => {
  let tracker: QualityTracker;
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `tracker-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    tracker = new QualityTracker({
      dataDir: testDir,
      autoSave: false,
    });

    await tracker.init();
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('recordGeneration', () => {
    it('should record a code generation', async () => {
      const validation: ValidationResult = {
        timestamp: new Date(),
        code: 'function test() {}',
        framework: 'React',
        checks: {
          imports: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          props: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          styles: { usesProjectStyles: false, hardcodedCount: 0, score: 100, issues: [] },
          types: { hasErrors: false, errorCount: 0, errors: [] },
          compilation: { compiles: true, errors: [] },
        },
        qualityScore: {
          correctness: 100,
          consistency: 100,
          maintainability: 50,
          overall: 83,
        },
        suggestions: [],
        kbUsage: { componentsFromKB: 0, totalComponents: 0, usageRate: 0 },
      };

      const id = await tracker.recordGeneration('Test prompt', validation, true);

      expect(id).toBeDefined();
      expect(id).toMatch(/^gen_/);

      const stats = tracker.getStatistics();
      expect(stats.totalGenerations).toBe(1);
      expect(stats.withKB).toBe(1);
    });
  });

  describe('getStatistics', () => {
    it('should calculate statistics correctly', async () => {
      const createValidation = (score: number): ValidationResult => ({
        timestamp: new Date(),
        code: 'code',
        framework: 'React',
        checks: {
          imports: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          props: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          styles: { usesProjectStyles: false, hardcodedCount: 0, score: 100, issues: [] },
          types: { hasErrors: false, errorCount: 0, errors: [] },
          compilation: { compiles: true, errors: [] },
        },
        qualityScore: {
          correctness: score,
          consistency: score,
          maintainability: score,
          overall: score,
        },
        suggestions: [],
        kbUsage: { componentsFromKB: 0, totalComponents: 0, usageRate: 0 },
      });

      await tracker.recordGeneration('Test 1', createValidation(80), true);
      await tracker.recordGeneration('Test 2', createValidation(90), true);
      await tracker.recordGeneration('Test 3', createValidation(70), false);

      const stats = tracker.getStatistics();

      expect(stats.totalGenerations).toBe(3);
      expect(stats.withKB).toBe(2);
      expect(stats.withoutKB).toBe(1);
      expect(stats.averageQualityScoreWithKB).toBe(85);
      expect(stats.averageQualityScoreWithoutKB).toBe(70);
      expect(stats.improvementRate).toBeGreaterThan(0);
    });

    it('should collect top issues', async () => {
      const createValidation = (issues: string[]): ValidationResult => ({
        timestamp: new Date(),
        code: 'code',
        framework: 'React',
        checks: {
          imports: { total: 1, correct: 0, incorrect: 1, accuracy: 0, issues },
          props: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          styles: { usesProjectStyles: false, hardcodedCount: 0, score: 100, issues: [] },
          types: { hasErrors: false, errorCount: 0, errors: [] },
          compilation: { compiles: true, errors: [] },
        },
        qualityScore: {
          correctness: 50,
          consistency: 100,
          maintainability: 50,
          overall: 67,
        },
        suggestions: [],
        kbUsage: { componentsFromKB: 0, totalComponents: 0, usageRate: 0 },
      });

      await tracker.recordGeneration('Test 1', createValidation(['Issue A']), true);
      await tracker.recordGeneration('Test 2', createValidation(['Issue A']), true);
      await tracker.recordGeneration('Test 3', createValidation(['Issue B']), true);

      const stats = tracker.getStatistics();

      expect(stats.topIssues.length).toBeGreaterThan(0);
      expect(stats.topIssues[0].issue).toBe('Issue A');
      expect(stats.topIssues[0].count).toBe(2);
    });
  });

  describe('getTrends', () => {
    it('should return trends for specified days', () => {
      const trends = tracker.getTrends(7);

      expect(trends.length).toBe(7);
      trends.forEach(trend => {
        expect(trend.date).toBeDefined();
        expect(trend.averageScore).toBeGreaterThanOrEqual(0);
        expect(trend.generationsCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getRecentGenerations', () => {
    it('should return recent generations', async () => {
      const validation: ValidationResult = {
        timestamp: new Date(),
        code: 'code',
        framework: 'React',
        checks: {
          imports: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          props: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          styles: { usesProjectStyles: false, hardcodedCount: 0, score: 100, issues: [] },
          types: { hasErrors: false, errorCount: 0, errors: [] },
          compilation: { compiles: true, errors: [] },
        },
        qualityScore: {
          correctness: 100,
          consistency: 100,
          maintainability: 50,
          overall: 83,
        },
        suggestions: [],
        kbUsage: { componentsFromKB: 0, totalComponents: 0, usageRate: 0 },
      };

      await tracker.recordGeneration('Test 1', validation, true);
      await tracker.recordGeneration('Test 2', validation, true);
      await tracker.recordGeneration('Test 3', validation, false);

      const recent = tracker.getRecentGenerations(2);

      expect(recent.length).toBe(2);
      expect(recent[0].prompt).toBe('Test 3'); // Most recent first
    });
  });

  describe('exportReport', () => {
    it('should export quality report', async () => {
      const validation: ValidationResult = {
        timestamp: new Date(),
        code: 'code',
        framework: 'React',
        checks: {
          imports: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          props: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          styles: { usesProjectStyles: false, hardcodedCount: 0, score: 100, issues: [] },
          types: { hasErrors: false, errorCount: 0, errors: [] },
          compilation: { compiles: true, errors: [] },
        },
        qualityScore: {
          correctness: 90,
          consistency: 85,
          maintainability: 80,
          overall: 85,
        },
        suggestions: [],
        kbUsage: { componentsFromKB: 1, totalComponents: 2, usageRate: 50 },
      };

      await tracker.recordGeneration('Test', validation, true);

      const reportPath = join(testDir, 'report.txt');
      await tracker.exportReport(reportPath);

      // Report file should exist
      const { readFile } = await import('fs/promises');
      const report = await readFile(reportPath, 'utf-8');

      expect(report).toContain('QUALITY TRACKING REPORT');
      expect(report).toContain('OVERALL STATISTICS');
      expect(report).toContain('Total Generations: 1');
    });
  });

  describe('clear', () => {
    it('should clear all data', async () => {
      const validation: ValidationResult = {
        timestamp: new Date(),
        code: 'code',
        framework: 'React',
        checks: {
          imports: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          props: { total: 0, correct: 0, incorrect: 0, accuracy: 100, issues: [] },
          styles: { usesProjectStyles: false, hardcodedCount: 0, score: 100, issues: [] },
          types: { hasErrors: false, errorCount: 0, errors: [] },
          compilation: { compiles: true, errors: [] },
        },
        qualityScore: {
          correctness: 100,
          consistency: 100,
          maintainability: 50,
          overall: 83,
        },
        suggestions: [],
        kbUsage: { componentsFromKB: 0, totalComponents: 0, usageRate: 0 },
      };

      await tracker.recordGeneration('Test', validation, true);

      let stats = tracker.getStatistics();
      expect(stats.totalGenerations).toBe(1);

      await tracker.clear();

      stats = tracker.getStatistics();
      expect(stats.totalGenerations).toBe(0);
    });
  });
});
