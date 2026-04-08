/**
 * Knowledge Base Manager - Manages KB configuration and operations
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join, resolve } from 'path';
import { homedir } from 'os';
import type { KnowledgeBaseConfig, ScanSource, KnowledgeBase, ScanResult } from './types';
import { KnowledgeBaseScanner } from './scanner';
import { generateComponentsCSV, generateStylesCSV, generateConventionsCSV, mergeComponentsCSV, mergeStylesCSV } from './csv-generator';

const DEFAULT_CONFIG_DIR = join(homedir(), '.ai-codegen-booster');
const DEFAULT_CONFIG_FILE = 'kb-config.json';
const DEFAULT_GLOBAL_KB_DIR = join(DEFAULT_CONFIG_DIR, 'global-kb');

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: KnowledgeBaseConfig = {
  mode: 'project',
  basePath: process.cwd(),
  outputDir: './kb',
  sources: [],
  priority: 'local-first',
  autoSync: false,
};

/**
 * Knowledge Base Manager
 */
export class KnowledgeBaseManager {
  private config: KnowledgeBaseConfig;
  private scanner: KnowledgeBaseScanner;

  constructor(config?: Partial<KnowledgeBaseConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.scanner = new KnowledgeBaseScanner({
      frameworks: ['React', 'Vue', 'Node'],
      verbose: false,
    });
  }

  /**
   * Initialize knowledge base
   */
  async init(mode: 'project' | 'global' = 'project'): Promise<void> {
    this.config.mode = mode;

    if (mode === 'global') {
      this.config.basePath = DEFAULT_GLOBAL_KB_DIR;
      this.config.outputDir = DEFAULT_GLOBAL_KB_DIR;

      // Create global KB directory
      await mkdir(DEFAULT_GLOBAL_KB_DIR, { recursive: true });

      // Save config
      await this.saveConfig(join(DEFAULT_CONFIG_DIR, DEFAULT_CONFIG_FILE));
    } else {
      // Project mode - output to local directory
      this.config.outputDir = join(this.config.basePath, 'kb');
      await mkdir(this.config.outputDir, { recursive: true });

      // Save local config
      await this.saveConfig(join(this.config.basePath, '.kb-config.json'));
    }

    console.log(`✅ Initialized ${mode} knowledge base at: ${this.config.outputDir}`);
  }

  /**
   * Add a source to scan
   */
  async addSource(source: ScanSource): Promise<void> {
    // Check if source already exists
    const existing = this.config.sources.find(s => s.name === source.name);
    if (existing) {
      throw new Error(`Source '${source.name}' already exists`);
    }

    // Verify path exists
    try {
      await access(source.path);
    } catch {
      throw new Error(`Path does not exist: ${source.path}`);
    }

    this.config.sources.push({
      ...source,
      enabled: source.enabled !== false,
    });

    await this.saveCurrentConfig();
    console.log(`✅ Added source: ${source.name} at ${source.path}`);
  }

  /**
   * Remove a source
   */
  async removeSource(name: string): Promise<void> {
    const index = this.config.sources.findIndex(s => s.name === name);
    if (index === -1) {
      throw new Error(`Source '${name}' not found`);
    }

    this.config.sources.splice(index, 1);
    await this.saveCurrentConfig();
    console.log(`✅ Removed source: ${name}`);
  }

  /**
   * List all sources
   */
  listSources(): ScanSource[] {
    return this.config.sources;
  }

  /**
   * Scan all enabled sources and build knowledge base
   */
  async build(options: { verbose?: boolean; merge?: boolean } = {}): Promise<KnowledgeBase> {
    const startTime = Date.now();
    console.log('🔍 Scanning sources...');

    if (options.verbose) {
      this.scanner = new KnowledgeBaseScanner({
        frameworks: ['React', 'Vue', 'Node'],
        verbose: true,
      });
    }

    const results: ScanResult[] = [];

    for (const source of this.config.sources) {
      if (source.enabled !== false) {
        console.log(`📂 Scanning: ${source.name} (${source.path})`);
        const result = await this.scanner.scan(source);
        results.push(result);

        console.log(`   Components: ${result.stats.componentsFound}`);
        console.log(`   Styles: ${result.stats.stylesFound}`);
        console.log(`   Files scanned: ${result.stats.filesScanned}`);
        if (result.errors.length > 0) {
          console.log(`   ⚠️  Errors: ${result.errors.length}`);
        }
      }
    }

    // Aggregate results
    const allComponents = results.flatMap(r => r.components);
    const allStyles = results.flatMap(r => r.styles);
    const allConventions = results.flatMap(r => r.conventions);

    // Generate CSV files
    console.log('\n📝 Generating CSV files...');
    await mkdir(this.config.outputDir, { recursive: true });

    const componentsCSV = generateComponentsCSV(allComponents);
    const stylesCSV = generateStylesCSV(allStyles);
    const conventionsCSV = generateConventionsCSV(allConventions);

    // Write or merge CSV files
    const componentsPath = join(this.config.outputDir, 'components.csv');
    const stylesPath = join(this.config.outputDir, 'styles.csv');
    const conventionsPath = join(this.config.outputDir, 'conventions.csv');

    if (options.merge) {
      // Merge with existing
      try {
        const existingComponents = await readFile(componentsPath, 'utf-8');
        const merged = mergeComponentsCSV(existingComponents, componentsCSV);
        await writeFile(componentsPath, merged, 'utf-8');
      } catch {
        await writeFile(componentsPath, componentsCSV, 'utf-8');
      }

      try {
        const existingStyles = await readFile(stylesPath, 'utf-8');
        const merged = mergeStylesCSV(existingStyles, stylesCSV);
        await writeFile(stylesPath, merged, 'utf-8');
      } catch {
        await writeFile(stylesPath, stylesCSV, 'utf-8');
      }
    } else {
      // Overwrite
      await writeFile(componentsPath, componentsCSV, 'utf-8');
      await writeFile(stylesPath, stylesCSV, 'utf-8');
    }

    await writeFile(conventionsPath, conventionsCSV, 'utf-8');

    const kb: KnowledgeBase = {
      config: this.config,
      components: allComponents,
      styles: allStyles,
      conventions: allConventions,
      lastUpdated: new Date(),
      version: '1.3.0',
    };

    const duration = Date.now() - startTime;
    console.log(`\n✅ Knowledge base built successfully in ${duration}ms`);
    console.log(`📊 Summary:`);
    console.log(`   Total components: ${allComponents.length}`);
    console.log(`   Total styles: ${allStyles.length}`);
    console.log(`   Total conventions: ${allConventions.length}`);
    console.log(`\n📁 Output: ${this.config.outputDir}`);

    return kb;
  }

  /**
   * Load configuration from file
   */
  async loadConfig(configPath?: string): Promise<void> {
    const path = configPath || this.getConfigPath();

    try {
      const content = await readFile(path, 'utf-8');
      const loaded = JSON.parse(content);
      this.config = { ...DEFAULT_CONFIG, ...loaded };
      console.log(`✅ Loaded configuration from: ${path}`);
    } catch (error) {
      throw new Error(`Failed to load config from ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfig(configPath: string): Promise<void> {
    await mkdir(resolve(configPath, '..'), { recursive: true });
    await writeFile(configPath, JSON.stringify(this.config, null, 2), 'utf-8');
  }

  /**
   * Save current configuration
   */
  private async saveCurrentConfig(): Promise<void> {
    const path = this.getConfigPath();
    await this.saveConfig(path);
  }

  /**
   * Get configuration file path
   */
  private getConfigPath(): string {
    if (this.config.mode === 'global') {
      return join(DEFAULT_CONFIG_DIR, DEFAULT_CONFIG_FILE);
    } else {
      return join(this.config.basePath, '.kb-config.json');
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): KnowledgeBaseConfig {
    return { ...this.config };
  }

  /**
   * Get knowledge base (load from CSV files)
   */
  async getKB(): Promise<KnowledgeBase> {
    const outputDir = this.config.outputDir;

    // Load CSV files
    const componentsPath = join(outputDir, 'components.csv');
    const stylesPath = join(outputDir, 'styles.csv');
    const conventionsPath = join(outputDir, 'conventions.csv');

    const components = await this.loadComponentsFromCSV(componentsPath);
    const styles = await this.loadStylesFromCSV(stylesPath);
    const conventions = await this.loadConventionsFromCSV(conventionsPath);

    return {
      config: this.config,
      components,
      styles,
      conventions,
      lastUpdated: new Date(),
      version: '1.3.0',
    };
  }

  /**
   * Load components from CSV
   */
  private async loadComponentsFromCSV(path: string): Promise<any[]> {
    try {
      await access(path);
      const content = await readFile(path, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      if (lines.length <= 1) return []; // No data or header only

      const headers = this.parseCSVLine(lines[0]);
      const components: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === 0) continue;

        const component: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';

          // Parse special fields
          if (header === 'props') {
            component.props = value ? JSON.parse(value) : [];
          } else if (header === 'events') {
            component.events = value ? value.split(',').map(e => e.trim()) : [];
          } else if (header === 'slots') {
            component.slots = value ? value.split(',').map(s => s.trim()) : [];
          } else if (header === 'keywords') {
            component.keywords = value ? value.split(',').map(k => k.trim()) : [];
          } else {
            component[header] = value;
          }
        });

        components.push(component);
      }

      return components;
    } catch {
      return [];
    }
  }

  /**
   * Load styles from CSV
   */
  private async loadStylesFromCSV(path: string): Promise<any[]> {
    try {
      await access(path);
      const content = await readFile(path, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      if (lines.length <= 1) return [];

      const headers = this.parseCSVLine(lines[0]);
      const styles: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === 0) continue;

        const style: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';

          if (header === 'keywords') {
            style.keywords = value ? value.split(',').map(k => k.trim()) : [];
          } else {
            style[header] = value;
          }
        });

        styles.push(style);
      }

      return styles;
    } catch {
      return [];
    }
  }

  /**
   * Load conventions from CSV
   */
  private async loadConventionsFromCSV(path: string): Promise<any[]> {
    try {
      await access(path);
      const content = await readFile(path, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      if (lines.length <= 1) return [];

      const headers = this.parseCSVLine(lines[0]);
      const conventions: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === 0) continue;

        const convention: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';

          if (header === 'keywords') {
            convention.keywords = value ? value.split(',').map(k => k.trim()) : [];
          } else {
            convention[header] = value;
          }
        });

        conventions.push(convention);
      }

      return conventions;
    } catch {
      return [];
    }
  }

  /**
   * Parse a single CSV line handling quotes
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current);

    return result;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<KnowledgeBaseConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

/**
 * Create a new Knowledge Base Manager instance
 */
export function createKBManager(config?: Partial<KnowledgeBaseConfig>): KnowledgeBaseManager {
  return new KnowledgeBaseManager(config);
}
