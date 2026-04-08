#!/usr/bin/env node
/**
 * Knowledge Base CLI - Command line interface for KB management
 */

import { Command } from 'commander';
import { createKBManager } from '../kb/manager';
import { resolve } from 'path';
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

program.parse();
