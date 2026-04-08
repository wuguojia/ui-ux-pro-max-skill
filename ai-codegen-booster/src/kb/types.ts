/**
 * Knowledge Base System Types
 */

export interface KnowledgeBaseConfig {
  /** Mode: project-specific or global */
  mode: 'project' | 'global' | 'hybrid';

  /** Base path for the knowledge base */
  basePath: string;

  /** Output directory for CSV files */
  outputDir: string;

  /** Source directories to scan */
  sources: ScanSource[];

  /** Priority when in hybrid mode */
  priority?: 'local-first' | 'global-first';

  /** Auto-sync on file changes */
  autoSync?: boolean;
}

export interface ScanSource {
  /** Source name/identifier */
  name: string;

  /** Path to scan */
  path: string;

  /** Framework type */
  framework: 'React' | 'Vue' | 'Node' | 'Unknown';

  /** File patterns to include */
  include?: string[];

  /** File patterns to exclude */
  exclude?: string[];

  /** Whether this source is enabled */
  enabled?: boolean;
}

export interface ScanOptions {
  /** Frameworks to detect */
  frameworks: ('React' | 'Vue' | 'Node')[];

  /** File extensions to scan */
  extensions: string[];

  /** Maximum depth for directory traversal */
  maxDepth?: number;

  /** Follow symbolic links */
  followSymlinks?: boolean;

  /** Ignore patterns (glob) */
  ignore?: string[];

  /** Verbose output */
  verbose?: boolean;
}

export interface ScanResult {
  /** Scanned source */
  source: ScanSource;

  /** Extracted components */
  components: ComponentData[];

  /** Extracted styles */
  styles: StyleData[];

  /** Extracted conventions (if any) */
  conventions: ConventionData[];

  /** Scan statistics */
  stats: ScanStats;

  /** Errors encountered */
  errors: ScanError[];
}

export interface ComponentData {
  componentName: string;
  framework: 'React' | 'Vue';
  importPath: string;
  filePath: string;
  props: PropData[];
  events?: string[];
  slots?: string[];
  apiStyle?: 'Composition' | 'Options';
  description?: string;
  usageExample?: string;
  category?: string;
  keywords: string[];
}

export interface PropData {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
}

export interface StyleData {
  styleType: 'CSS Variable' | 'Less Variable' | 'Sass Variable' | 'Utility Class';
  name: string;
  value: string;
  category: string;
  usage: string;
  example: string;
  preprocessor?: 'CSS' | 'Less' | 'Sass' | 'SCSS';
  keywords: string[];
  filePath: string;
}

export interface ConventionData {
  conventionType: string;
  rule: string;
  goodExample: string;
  badExample: string;
  reason: string;
  severity: 'error' | 'warning' | 'info';
  keywords: string[];
}

export interface ScanStats {
  /** Total files scanned */
  filesScanned: number;

  /** Components found */
  componentsFound: number;

  /** Styles found */
  stylesFound: number;

  /** Conventions found */
  conventionsFound: number;

  /** Time taken (ms) */
  duration: number;

  /** Files skipped */
  filesSkipped: number;
}

export interface ScanError {
  file: string;
  error: string;
  line?: number;
  column?: number;
}

export interface KnowledgeBase {
  /** KB configuration */
  config: KnowledgeBaseConfig;

  /** All components */
  components: ComponentData[];

  /** All styles */
  styles: StyleData[];

  /** All conventions */
  conventions: ConventionData[];

  /** Last updated timestamp */
  lastUpdated: Date;

  /** Version */
  version: string;
}
