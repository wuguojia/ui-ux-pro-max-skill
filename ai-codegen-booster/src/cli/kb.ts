#!/usr/bin/env node
/**
 * Knowledge Base CLI - Command line interface for KB management
 */

import { Command } from 'commander';
import { createKBManager } from '../kb/manager';
import { CodeValidator } from '../kb/validator';
import { ABTester } from '../kb/ab-tester';
import { QualityTracker } from '../kb/tracker';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import chalk from 'chalk';

const program = new Command();

program
  .name('kb')
  .description('AI Codegen Booster - Knowledge Base Manager')
  .version('1.3.0');

/**
 * Init command - Initialize knowledge base
 */
program
  .command('init')
  .description('Initialize a knowledge base')
  .option('-g, --global', 'Initialize global knowledge base')
  .option('-p, --path <path>', 'Base path for project KB', process.cwd())
  .action(async (options) => {
    try {
      const mode = options.global ? 'global' : 'project';
      const manager = createKBManager({
        mode,
        basePath: options.path,
      });

      await manager.init(mode);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Add source command
 */
program
  .command('add-source')
  .description('Add a source directory to scan')
  .requiredOption('-n, --name <name>', 'Source name')
  .requiredOption('-p, --path <path>', 'Source path')
  .option('-f, --framework <framework>', 'Framework type', 'Unknown')
  .option('-g, --global', 'Add to global KB')
  .action(async (options) => {
    try {
      const mode = options.global ? 'global' : 'project';
      const manager = createKBManager({ mode });

      // Load existing config
      try {
        await manager.loadConfig();
      } catch {
        console.log(chalk.yellow('⚠️  No existing config found, creating new one'));
        await manager.init(mode);
      }

      await manager.addSource({
        name: options.name,
        path: resolve(options.path),
        framework: options.framework,
        enabled: true,
      });
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Remove source command
 */
program
  .command('remove-source')
  .description('Remove a source from the knowledge base')
  .requiredOption('-n, --name <name>', 'Source name to remove')
  .option('-g, --global', 'Remove from global KB')
  .action(async (options) => {
    try {
      const mode = options.global ? 'global' : 'project';
      const manager = createKBManager({ mode });

      await manager.loadConfig();
      await manager.removeSource(options.name);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * List sources command
 */
program
  .command('list')
  .description('List all configured sources')
  .option('-g, --global', 'List global KB sources')
  .action(async (options) => {
    try {
      const mode = options.global ? 'global' : 'project';
      const manager = createKBManager({ mode });

      await manager.loadConfig();
      const sources = manager.listSources();

      if (sources.length === 0) {
        console.log(chalk.yellow('No sources configured'));
        return;
      }

      console.log(chalk.bold(`\n📚 ${mode === 'global' ? 'Global' : 'Project'} Knowledge Base Sources:\n`));

      sources.forEach((source, index) => {
        const status = source.enabled !== false ? chalk.green('✓') : chalk.gray('✗');
        console.log(`${index + 1}. ${status} ${chalk.bold(source.name)}`);
        console.log(`   Path: ${source.path}`);
        console.log(`   Framework: ${source.framework}`);
        console.log('');
      });
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Build command - Scan and build knowledge base
 */
program
  .command('build')
  .description('Scan sources and build knowledge base')
  .option('-g, --global', 'Build global KB')
  .option('-v, --verbose', 'Verbose output')
  .option('-m, --merge', 'Merge with existing KB instead of overwriting')
  .action(async (options) => {
    try {
      const mode = options.global ? 'global' : 'project';
      const manager = createKBManager({ mode });

      await manager.loadConfig();

      const config = manager.getConfig();
      if (config.sources.length === 0) {
        console.log(chalk.yellow('⚠️  No sources configured. Use "kb add-source" to add sources.'));
        return;
      }

      await manager.build({
        verbose: options.verbose,
        merge: options.merge,
      });

      console.log(chalk.green('\n✨ Knowledge base is ready to use!'));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Scan command - Quick scan of a directory
 */
program
  .command('scan')
  .description('Quick scan of a directory (without adding to sources)')
  .requiredOption('-p, --path <path>', 'Path to scan')
  .option('-o, --output <dir>', 'Output directory for CSV files', './kb-scan')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      console.log(chalk.blue(`🔍 Scanning: ${options.path}\n`));

      const manager = createKBManager({
        mode: 'project',
        basePath: process.cwd(),
        outputDir: options.output,
        sources: [
          {
            name: 'scan-temp',
            path: resolve(options.path),
            framework: 'Unknown',
            enabled: true,
          },
        ],
      });

      await manager.build({
        verbose: options.verbose,
        merge: false,
      });

      console.log(chalk.green(`\n✨ Scan complete! Results saved to: ${options.output}`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Config command - Show current configuration
 */
program
  .command('config')
  .description('Show current knowledge base configuration')
  .option('-g, --global', 'Show global KB config')
  .action(async (options) => {
    try {
      const mode = options.global ? 'global' : 'project';
      const manager = createKBManager({ mode });

      await manager.loadConfig();
      const config = manager.getConfig();

      console.log(chalk.bold(`\n⚙️  ${mode === 'global' ? 'Global' : 'Project'} KB Configuration:\n`));
      console.log(`Mode: ${chalk.cyan(config.mode)}`);
      console.log(`Base Path: ${chalk.cyan(config.basePath)}`);
      console.log(`Output Dir: ${chalk.cyan(config.outputDir)}`);
      console.log(`Priority: ${chalk.cyan(config.priority || 'N/A')}`);
      console.log(`Auto Sync: ${chalk.cyan(config.autoSync ? 'Yes' : 'No')}`);
      console.log(`Sources: ${chalk.cyan(config.sources.length)}`);
      console.log('');
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Validate command - Validate code quality
 */
program
  .command('validate')
  .description('Validate code quality against knowledge base')
  .requiredOption('-f, --file <path>', 'File to validate')
  .option('-g, --global', 'Use global KB')
  .option('--framework <framework>', 'Framework (React|Vue|Node)')
  .action(async (options) => {
    try {
      console.log(chalk.blue(`\n🔍 Validating: ${options.file}\n`));

      // Load KB
      const mode = options.global ? 'global' : 'project';
      const manager = createKBManager({ mode });
      await manager.loadConfig();
      const kb = await manager.getKB();

      // Read code
      const code = await readFile(resolve(options.file), 'utf-8');

      // Validate
      const validator = new CodeValidator({ kb, framework: options.framework });
      const result = await validator.validate(code, options.framework);

      // Display results
      console.log(chalk.bold('Quality Score:'));
      console.log(`  Overall: ${result.qualityScore.overall}/100`);
      console.log(`    - Correctness: ${result.qualityScore.correctness}/100`);
      console.log(`    - Consistency: ${result.qualityScore.consistency}/100`);
      console.log(`    - Maintainability: ${result.qualityScore.maintainability}/100`);
      console.log('');

      console.log(chalk.bold('Checks:'));
      console.log(`  Imports: ${result.checks.imports.accuracy.toFixed(1)}% (${result.checks.imports.incorrect} issues)`);
      console.log(`  Props: ${result.checks.props.accuracy.toFixed(1)}% (${result.checks.props.incorrect} issues)`);
      console.log(`  Styles: ${result.checks.styles.score}/100 (${result.checks.styles.hardcodedCount} hardcoded)`);
      console.log('');

      console.log(chalk.bold('KB Usage:'));
      console.log(`  Components from KB: ${result.kbUsage.componentsFromKB}/${result.kbUsage.totalComponents} (${result.kbUsage.usageRate.toFixed(1)}%)`);
      console.log('');

      if (result.suggestions.length > 0) {
        console.log(chalk.bold('Suggestions:'));
        result.suggestions.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s}`);
        });
        console.log('');
      }

      // Track if tracker is available
      try {
        const tracker = new QualityTracker();
        await tracker.init();
        await tracker.recordGeneration('Manual validation', result, true);
        console.log(chalk.gray('✓ Validation recorded'));
      } catch {
        // Tracker not available - OK
      }

      console.log('');
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Test command - Run A/B test
 */
program
  .command('test')
  .description('Run A/B test comparing code with/without KB')
  .requiredOption('-p, --prompt <text>', 'Generation prompt')
  .requiredOption('-a, --file-a <path>', 'Code without KB')
  .requiredOption('-b, --file-b <path>', 'Code with KB')
  .option('-g, --global', 'Use global KB')
  .option('--framework <framework>', 'Framework (React|Vue|Node)')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🧪 Running A/B Test...\n'));

      // Load KB
      const mode = options.global ? 'global' : 'project';
      const manager = createKBManager({ mode });
      await manager.loadConfig();
      const kb = await manager.getKB();

      // Read code files
      const codeA = await readFile(resolve(options.fileA), 'utf-8');
      const codeB = await readFile(resolve(options.fileB), 'utf-8');

      // Run A/B test
      const tester = new ABTester({ kb });
      const result = await tester.runTest(options.prompt, codeA, codeB, options.framework);

      // Display report
      console.log(tester.formatReport(result));

      // Record test
      try {
        const tracker = new QualityTracker();
        await tracker.init();
        await tracker.recordABTest(result);
        console.log(chalk.gray('✓ Test recorded'));
      } catch {
        // Tracker not available - OK
      }

      console.log('');
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Stats command - Show quality statistics
 */
program
  .command('stats')
  .description('Show quality tracking statistics')
  .option('-d, --days <number>', 'Number of days for trends', '30')
  .action(async (options) => {
    try {
      const tracker = new QualityTracker();
      await tracker.init();

      const stats = tracker.getStatistics();
      const trends = tracker.getTrends(parseInt(options.days));

      console.log(chalk.bold('\n📊 Quality Statistics\n'));

      console.log(chalk.bold('Overview:'));
      console.log(`  Total Generations: ${stats.totalGenerations}`);
      console.log(`    - With KB: ${stats.withKB} (${((stats.withKB / stats.totalGenerations) * 100).toFixed(1)}%)`);
      console.log(`    - Without KB: ${stats.withoutKB} (${((stats.withoutKB / stats.totalGenerations) * 100).toFixed(1)}%)`);
      console.log('');

      console.log(chalk.bold('Average Quality Scores:'));
      console.log(`  Overall: ${stats.averageQualityScore.toFixed(1)}/100`);
      console.log(`  With KB: ${stats.averageQualityScoreWithKB.toFixed(1)}/100`);
      console.log(`  Without KB: ${stats.averageQualityScoreWithoutKB.toFixed(1)}/100`);
      console.log(`  Improvement: ${stats.improvementRate > 0 ? '+' : ''}${stats.improvementRate.toFixed(1)}%`);
      console.log('');

      if (stats.topIssues.length > 0) {
        console.log(chalk.bold('Top Issues:'));
        stats.topIssues.slice(0, 5).forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue.issue.substring(0, 60)}... (${issue.count}x)`);
        });
        console.log('');
      }

      const activeTrends = trends.filter(t => t.generationsCount > 0);
      if (activeTrends.length > 0) {
        console.log(chalk.bold(`Trends (last ${options.days} days):`));
        console.log('  Recent activity:');
        activeTrends.slice(-7).forEach(t => {
          console.log(`    ${t.date}: ${t.averageScore.toFixed(1)}/100 (${t.generationsCount} gen)`);
        });
        console.log('');
      }

      console.log('');
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Report command - Generate quality report
 */
program
  .command('report')
  .description('Generate comprehensive quality report')
  .option('-o, --output <path>', 'Output file path', './kb-quality-report.txt')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n📄 Generating quality report...\n'));

      const tracker = new QualityTracker();
      await tracker.init();

      await tracker.exportReport(resolve(options.output));

      console.log(chalk.green(`✨ Report generated: ${options.output}\n`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
