/**
 * Knowledge Base Scanner - Scan project files and extract components/styles
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join, extname, relative, dirname } from 'path';
import type {
  ScanSource,
  ScanOptions,
  ScanResult,
  ComponentData,
  StyleData,
  ConventionData,
  ScanStats,
  ScanError,
} from './types';
import { extractComponent } from '../extractors/component-extractor';
import { extractVueComponent } from '../extractors/vue-component-extractor';
import { extractCSS } from '../extractors/css-extractor';
import { extractLess } from '../extractors/less-extractor';
import { extractSass } from '../extractors/sass-extractor';
import { extractVueStyles } from '../extractors/vue-style-extractor';

const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/coverage/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/__tests__/**',
  '**/__mocks__/**',
];

/**
 * Scanner class for extracting knowledge from project files
 */
export class KnowledgeBaseScanner {
  private options: ScanOptions;
  private errors: ScanError[] = [];
  private stats: ScanStats = {
    filesScanned: 0,
    componentsFound: 0,
    stylesFound: 0,
    conventionsFound: 0,
    duration: 0,
    filesSkipped: 0,
  };

  constructor(options: Partial<ScanOptions> = {}) {
    this.options = {
      frameworks: options.frameworks || ['React', 'Vue', 'Node'],
      extensions: options.extensions || ['.tsx', '.jsx', '.vue', '.ts', '.js', '.css', '.less', '.scss', '.sass'],
      maxDepth: options.maxDepth || 10,
      followSymlinks: options.followSymlinks || false,
      ignore: [...DEFAULT_IGNORE_PATTERNS, ...(options.ignore || [])],
      verbose: options.verbose || false,
    };
  }

  /**
   * Scan a source directory
   */
  async scan(source: ScanSource): Promise<ScanResult> {
    const startTime = Date.now();
    this.resetStats();
    this.errors = [];

    const components: ComponentData[] = [];
    const styles: StyleData[] = [];
    const conventions: ConventionData[] = [];

    try {
      await this.scanDirectory(source.path, source, components, styles, conventions, 0);
    } catch (error) {
      this.errors.push({
        file: source.path,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    this.stats.duration = Date.now() - startTime;

    return {
      source,
      components,
      styles,
      conventions,
      stats: this.stats,
      errors: this.errors,
    };
  }

  /**
   * Recursively scan directory
   */
  private async scanDirectory(
    dirPath: string,
    source: ScanSource,
    components: ComponentData[],
    styles: StyleData[],
    conventions: ConventionData[],
    depth: number
  ): Promise<void> {
    if (depth > (this.options.maxDepth || 10)) {
      return;
    }

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        const relativePath = relative(source.path, fullPath);

        // Check ignore patterns
        if (this.shouldIgnore(relativePath)) {
          this.stats.filesSkipped++;
          continue;
        }

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, source, components, styles, conventions, depth + 1);
        } else if (entry.isFile()) {
          await this.scanFile(fullPath, source, components, styles);
        }
      }
    } catch (error) {
      this.errors.push({
        file: dirPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Scan a single file
   */
  private async scanFile(
    filePath: string,
    source: ScanSource,
    components: ComponentData[],
    styles: StyleData[]
  ): Promise<void> {
    const ext = extname(filePath);

    // Check if extension is supported
    if (!this.options.extensions.includes(ext)) {
      return;
    }

    this.stats.filesScanned++;

    try {
      const content = await readFile(filePath, 'utf-8');

      // Extract components
      if (ext === '.tsx' || ext === '.jsx') {
        await this.extractReactComponent(filePath, content, source, components);
      } else if (ext === '.vue') {
        await this.extractVueComponent(filePath, content, source, components, styles);
      }

      // Extract styles
      if (ext === '.css') {
        await this.extractCSSStyles(filePath, content, styles);
      } else if (ext === '.less') {
        await this.extractLessStyles(filePath, content, styles);
      } else if (ext === '.scss' || ext === '.sass') {
        await this.extractSassStyles(filePath, content, styles);
      }

      if (this.options.verbose) {
        console.log(`Scanned: ${filePath}`);
      }
    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Extract React component
   */
  private async extractReactComponent(
    filePath: string,
    content: string,
    source: ScanSource,
    components: ComponentData[]
  ): Promise<void> {
    try {
      const result = await extractComponent(content);

      if (result.name) {
        const importPath = this.generateImportPath(filePath, source.path);

        components.push({
          componentName: result.name,
          framework: 'React',
          importPath,
          filePath,
          props: result.props.map(p => ({
            name: p.name,
            type: p.type,
            required: p.required,
          })),
          description: `${result.name} component`,
          category: 'UI',
          keywords: [result.name.toLowerCase(), 'react', 'component'],
        });

        this.stats.componentsFound++;
      }
    } catch (error) {
      // Component extraction failed, skip
    }
  }

  /**
   * Extract Vue component
   */
  private async extractVueComponent(
    filePath: string,
    content: string,
    source: ScanSource,
    components: ComponentData[],
    styles: StyleData[]
  ): Promise<void> {
    try {
      const result = await extractVueComponent(content);

      if (result.name) {
        const importPath = this.generateImportPath(filePath, source.path);

        components.push({
          componentName: result.name,
          framework: 'Vue',
          importPath,
          filePath,
          props: result.props.map(p => ({
            name: p.name,
            type: p.type,
            required: p.required,
          })),
          events: result.events,
          slots: result.slots,
          apiStyle: (result.apiStyle === 'Composition' || result.apiStyle === 'Options') ? result.apiStyle : undefined,
          description: `${result.name} component`,
          category: 'UI',
          keywords: [result.name.toLowerCase(), 'vue', 'component'],
        });

        this.stats.componentsFound++;
      }

      // Extract styles from Vue SFC
      const styleResult = await extractVueStyles(content);

      // Variables
      if (styleResult.variables && styleResult.variables.length > 0) {
        for (const variable of styleResult.variables) {
          styles.push({
            styleType: this.getStyleType(variable.lang, true),
            name: variable.name,
            value: variable.value,
            category: variable.category,
            usage: `Use in ${variable.lang}`,
            example: variable.name,
            preprocessor: this.getPreprocessor(variable.lang),
            keywords: [variable.name, variable.category.toLowerCase(), variable.lang],
            filePath,
          });
          this.stats.stylesFound++;
        }
      }

      // Utilities
      if (styleResult.utilities && styleResult.utilities.length > 0) {
        for (const utility of styleResult.utilities) {
          const lang = styleResult.styles[0]?.lang || 'css';
          styles.push({
            styleType: 'Utility Class',
            name: utility.selector,
            value: JSON.stringify(utility.properties),
            category: utility.category,
            usage: `Apply class`,
            example: utility.selector,
            preprocessor: this.getPreprocessor(lang),
            keywords: [utility.selector, utility.category.toLowerCase()],
            filePath,
          });
          this.stats.stylesFound++;
        }
      }
    } catch (error) {
      // Vue component extraction failed, skip
    }
  }

  /**
   * Extract CSS styles
   */
  private async extractCSSStyles(filePath: string, content: string, styles: StyleData[]): Promise<void> {
    try {
      const result = await extractCSS(content);

      // Variables
      for (const variable of result.variables) {
        styles.push({
          styleType: 'CSS Variable',
          name: variable.name,
          value: variable.value,
          category: variable.category,
          usage: `Use var(${variable.name})`,
          example: `var(${variable.name})`,
          preprocessor: 'CSS',
          keywords: [variable.name, variable.category.toLowerCase(), 'css'],
          filePath,
        });
        this.stats.stylesFound++;
      }

      // Utilities
      for (const utility of result.utilities) {
        styles.push({
          styleType: 'Utility Class',
          name: utility.selector,
          value: JSON.stringify(utility.properties),
          category: utility.category,
          usage: `Apply class`,
          example: utility.selector,
          preprocessor: 'CSS',
          keywords: [utility.selector, utility.category.toLowerCase()],
          filePath,
        });
        this.stats.stylesFound++;
      }
    } catch (error) {
      // CSS extraction failed, skip
    }
  }

  /**
   * Extract Less styles
   */
  private async extractLessStyles(filePath: string, content: string, styles: StyleData[]): Promise<void> {
    try {
      const result = await extractLess(content);

      // Variables
      for (const variable of result.variables) {
        styles.push({
          styleType: 'Less Variable',
          name: variable.name,
          value: variable.value,
          category: variable.category,
          usage: `Use ${variable.name}`,
          example: variable.name,
          preprocessor: 'Less',
          keywords: [variable.name, variable.category.toLowerCase(), 'less'],
          filePath,
        });
        this.stats.stylesFound++;
      }

      // Utilities
      for (const utility of result.utilities) {
        styles.push({
          styleType: 'Utility Class',
          name: utility.selector,
          value: JSON.stringify(utility.properties),
          category: utility.category,
          usage: `Apply class`,
          example: utility.selector,
          preprocessor: 'Less',
          keywords: [utility.selector, utility.category.toLowerCase()],
          filePath,
        });
        this.stats.stylesFound++;
      }
    } catch (error) {
      // Less extraction failed, skip
    }
  }

  /**
   * Extract Sass/SCSS styles
   */
  private async extractSassStyles(filePath: string, content: string, styles: StyleData[]): Promise<void> {
    try {
      const result = await extractSass(content);
      const isSass = extname(filePath) === '.sass';
      const preprocessor = isSass ? 'Sass' : 'SCSS';

      // Variables
      for (const variable of result.variables) {
        styles.push({
          styleType: 'Sass Variable',
          name: variable.name,
          value: variable.value,
          category: variable.category,
          usage: `Use ${variable.name}`,
          example: variable.name,
          preprocessor,
          keywords: [variable.name, variable.category.toLowerCase(), preprocessor.toLowerCase()],
          filePath,
        });
        this.stats.stylesFound++;
      }

      // Utilities
      for (const utility of result.utilities) {
        styles.push({
          styleType: 'Utility Class',
          name: utility.selector,
          value: JSON.stringify(utility.properties),
          category: utility.category,
          usage: `Apply class`,
          example: utility.selector,
          preprocessor,
          keywords: [utility.selector, utility.category.toLowerCase()],
          filePath,
        });
        this.stats.stylesFound++;
      }
    } catch (error) {
      // Sass extraction failed, skip
    }
  }

  /**
   * Generate import path from file path
   */
  private generateImportPath(filePath: string, basePath: string): string {
    const rel = relative(basePath, filePath);
    const withoutExt = rel.replace(/\.(tsx|jsx|vue|ts|js)$/, '');
    return '@/' + withoutExt.replace(/\\/g, '/');
  }

  /**
   * Get style type from language
   */
  private getStyleType(lang: string, isVariable: boolean): 'CSS Variable' | 'Less Variable' | 'Sass Variable' | 'Utility Class' {
    if (!isVariable) return 'Utility Class';

    switch (lang.toLowerCase()) {
      case 'less':
        return 'Less Variable';
      case 'scss':
      case 'sass':
        return 'Sass Variable';
      default:
        return 'CSS Variable';
    }
  }

  /**
   * Get preprocessor name
   */
  private getPreprocessor(lang: string): 'CSS' | 'Less' | 'Sass' | 'SCSS' {
    switch (lang.toLowerCase()) {
      case 'less':
        return 'Less';
      case 'sass':
        return 'Sass';
      case 'scss':
        return 'SCSS';
      default:
        return 'CSS';
    }
  }

  /**
   * Check if path should be ignored
   */
  private shouldIgnore(relativePath: string): boolean {
    return this.options.ignore?.some(pattern => {
      // Simple glob matching (supports ** and *)
      const regex = new RegExp(
        '^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'
      );
      return regex.test(relativePath);
    }) || false;
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      filesScanned: 0,
      componentsFound: 0,
      stylesFound: 0,
      conventionsFound: 0,
      duration: 0,
      filesSkipped: 0,
    };
  }
}
