/**
 * Architecture Analyzer - Analyze project architecture and file organization
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ArchitecturePattern {
  type: 'MVC' | 'MVVM' | 'Clean Architecture' | 'Feature-Based' | 'Layered' | 'Modular' | 'Unknown';
  confidence: number;
  evidence: string[];
  structure: DirectoryStructure;
}

export interface DirectoryStructure {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: DirectoryStructure[];
  purpose?: DirectoryPurpose;
}

export type DirectoryPurpose =
  | 'components'
  | 'views'
  | 'pages'
  | 'models'
  | 'controllers'
  | 'services'
  | 'utils'
  | 'hooks'
  | 'store'
  | 'api'
  | 'types'
  | 'styles'
  | 'assets'
  | 'config'
  | 'tests'
  | 'unknown';

export interface RoutePattern {
  type: 'file-based' | 'config-based' | 'component-based';
  framework?: 'Next.js' | 'Nuxt' | 'React Router' | 'Vue Router' | 'Express';
  routes: RouteInfo[];
}

export interface RouteInfo {
  path: string;
  component?: string;
  file?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  middleware?: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  circular: CircularDependency[];
}

export interface DependencyNode {
  id: string;
  path: string;
  type: 'component' | 'utility' | 'service' | 'store' | 'type' | 'unknown';
  imports: number;
  exports: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'import' | 'require' | 'dynamic-import';
}

export interface CircularDependency {
  cycle: string[];
  severity: 'warning' | 'error';
}

export interface FileOrganization {
  namingConvention: NamingConvention;
  filesByPurpose: Record<DirectoryPurpose, string[]>;
  deepestNesting: number;
  avgFilesPerDirectory: number;
}

export interface NamingConvention {
  components: 'PascalCase' | 'kebab-case' | 'camelCase' | 'mixed';
  files: 'camelCase' | 'kebab-case' | 'PascalCase' | 'snake_case' | 'mixed';
  directories: 'camelCase' | 'kebab-case' | 'PascalCase' | 'snake_case' | 'mixed';
  constants: 'UPPER_CASE' | 'camelCase' | 'PascalCase' | 'mixed';
}

/**
 * Analyze project architecture
 */
export async function analyzeArchitecture(projectPath: string): Promise<ArchitecturePattern> {
  const structure = await analyzeDirectoryStructure(projectPath);
  const pattern = detectArchitecturePattern(structure);

  return pattern;
}

/**
 * Analyze directory structure
 */
export async function analyzeDirectoryStructure(
  dirPath: string,
  maxDepth: number = 5,
  currentDepth: number = 0
): Promise<DirectoryStructure> {
  const stats = await fs.promises.stat(dirPath);
  const name = path.basename(dirPath);

  if (stats.isFile()) {
    return {
      name,
      type: 'file',
      path: dirPath,
    };
  }

  const structure: DirectoryStructure = {
    name,
    type: 'directory',
    path: dirPath,
    children: [],
    purpose: identifyDirectoryPurpose(name),
  };

  if (currentDepth >= maxDepth) {
    return structure;
  }

  try {
    const entries = await fs.promises.readdir(dirPath);

    // Filter out common ignored directories
    const filteredEntries = entries.filter(
      (entry) =>
        !['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'coverage'].includes(entry)
    );

    for (const entry of filteredEntries) {
      const entryPath = path.join(dirPath, entry);
      try {
        const child = await analyzeDirectoryStructure(entryPath, maxDepth, currentDepth + 1);
        structure.children!.push(child);
      } catch (err) {
        // Skip entries we can't access
        continue;
      }
    }
  } catch (err) {
    // Directory not readable
  }

  return structure;
}

/**
 * Identify directory purpose based on name
 */
function identifyDirectoryPurpose(dirName: string): DirectoryPurpose {
  const purposes: Record<string, DirectoryPurpose> = {
    components: 'components',
    component: 'components',
    views: 'views',
    view: 'views',
    pages: 'pages',
    page: 'pages',
    models: 'models',
    model: 'models',
    controllers: 'controllers',
    controller: 'controllers',
    services: 'services',
    service: 'services',
    utils: 'utils',
    util: 'utils',
    helpers: 'utils',
    hooks: 'hooks',
    store: 'store',
    stores: 'store',
    state: 'store',
    api: 'api',
    apis: 'api',
    types: 'types',
    type: 'types',
    interfaces: 'types',
    styles: 'styles',
    style: 'styles',
    css: 'styles',
    scss: 'styles',
    assets: 'assets',
    static: 'assets',
    public: 'assets',
    config: 'config',
    configs: 'config',
    tests: 'tests',
    test: 'tests',
    __tests__: 'tests',
    __test__: 'tests',
  };

  return purposes[dirName.toLowerCase()] || 'unknown';
}

/**
 * Detect architecture pattern from directory structure
 */
function detectArchitecturePattern(structure: DirectoryStructure): ArchitecturePattern {
  const evidence: string[] = [];
  let type: ArchitecturePattern['type'] = 'Unknown';
  let confidence = 0;

  // Count directories by purpose
  const purposes = countPurposes(structure);

  // MVC Detection
  if (purposes.models > 0 && purposes.views > 0 && purposes.controllers > 0) {
    type = 'MVC';
    confidence = 85;
    evidence.push('Found models, views, and controllers directories');
  }

  // MVVM Detection
  else if (purposes.models > 0 && purposes.views > 0 && purposes.components > 0) {
    type = 'MVVM';
    confidence = 75;
    evidence.push('Found models, views, and components directories (MVVM pattern)');
  }

  // Feature-Based Detection
  else if (hasFeatureBasedStructure(structure)) {
    type = 'Feature-Based';
    confidence = 80;
    evidence.push('Features organized by business domain');
  }

  // Layered Architecture Detection
  else if (purposes.services > 0 && purposes.api > 0 && purposes.components > 0) {
    type = 'Layered';
    confidence = 70;
    evidence.push('Clear separation of layers (services, API, components)');
  }

  // Modular Architecture Detection
  else if (hasModularStructure(structure)) {
    type = 'Modular';
    confidence = 75;
    evidence.push('Modular structure with self-contained modules');
  }

  // Clean Architecture Detection
  else if (hasCleanArchitectureStructure(structure)) {
    type = 'Clean Architecture';
    confidence = 80;
    evidence.push('Clean architecture with domain, application, and infrastructure layers');
  }

  return {
    type,
    confidence,
    evidence,
    structure,
  };
}

/**
 * Count directories by purpose
 */
function countPurposes(structure: DirectoryStructure): Record<DirectoryPurpose, number> {
  const counts: Record<DirectoryPurpose, number> = {
    components: 0,
    views: 0,
    pages: 0,
    models: 0,
    controllers: 0,
    services: 0,
    utils: 0,
    hooks: 0,
    store: 0,
    api: 0,
    types: 0,
    styles: 0,
    assets: 0,
    config: 0,
    tests: 0,
    unknown: 0,
  };

  function count(node: DirectoryStructure) {
    if (node.purpose) {
      counts[node.purpose]++;
    }
    if (node.children) {
      node.children.forEach(count);
    }
  }

  count(structure);
  return counts;
}

/**
 * Check if structure follows feature-based organization
 */
function hasFeatureBasedStructure(structure: DirectoryStructure): boolean {
  if (!structure.children) return false;

  // Look for directories that contain their own components, services, etc.
  const featureDirs = structure.children.filter((child) => {
    if (!child.children || child.type !== 'directory') return false;

    const childPurposes = new Set(child.children.map((c) => c.purpose));
    return childPurposes.size >= 2; // Has at least 2 different purposes
  });

  return featureDirs.length >= 2;
}

/**
 * Check if structure follows modular organization
 */
function hasModularStructure(structure: DirectoryStructure): boolean {
  if (!structure.children) return false;

  const modules = structure.children.filter(
    (child) => child.type === 'directory' && child.name.toLowerCase().includes('module')
  );

  return modules.length >= 2;
}

/**
 * Check if structure follows Clean Architecture
 */
function hasCleanArchitectureStructure(structure: DirectoryStructure): boolean {
  if (!structure.children) return false;

  const cleanArchKeywords = ['domain', 'application', 'infrastructure', 'presentation', 'use-cases', 'entities'];

  const matchCount = structure.children.filter((child) =>
    cleanArchKeywords.some((keyword) => child.name.toLowerCase().includes(keyword))
  ).length;

  return matchCount >= 3;
}

/**
 * Analyze file organization and naming conventions
 */
export async function analyzeFileOrganization(projectPath: string): Promise<FileOrganization> {
  const structure = await analyzeDirectoryStructure(projectPath);

  const filesByPurpose: Record<DirectoryPurpose, string[]> = {
    components: [],
    views: [],
    pages: [],
    models: [],
    controllers: [],
    services: [],
    utils: [],
    hooks: [],
    store: [],
    api: [],
    types: [],
    styles: [],
    assets: [],
    config: [],
    tests: [],
    unknown: [],
  };

  const allFiles: string[] = [];
  const allDirs: string[] = [];
  let deepestNesting = 0;

  function traverse(node: DirectoryStructure, depth: number) {
    deepestNesting = Math.max(deepestNesting, depth);

    if (node.type === 'file') {
      allFiles.push(node.name);
      if (node.purpose) {
        filesByPurpose[node.purpose].push(node.path);
      }
    } else {
      allDirs.push(node.name);
    }

    if (node.children) {
      node.children.forEach((child) => traverse(child, depth + 1));
    }
  }

  traverse(structure, 0);

  const avgFilesPerDirectory = allDirs.length > 0 ? allFiles.length / allDirs.length : 0;

  return {
    namingConvention: detectNamingConventions(allFiles, allDirs),
    filesByPurpose,
    deepestNesting,
    avgFilesPerDirectory,
  };
}

/**
 * Detect naming conventions
 */
function detectNamingConventions(files: string[], directories: string[]): NamingConvention {
  return {
    components: detectCase(files.filter((f) => f.match(/\.(tsx?|jsx?|vue)$/))),
    files: detectCase(files),
    directories: detectCase(directories),
    constants: 'UPPER_CASE', // Default assumption
  };
}

/**
 * Detect case style of names
 */
function detectCase(names: string[]): 'PascalCase' | 'camelCase' | 'kebab-case' | 'snake_case' | 'mixed' {
  if (names.length === 0) return 'mixed';

  const basenames = names.map((name) => path.basename(name, path.extname(name)));

  let pascalCount = 0;
  let camelCount = 0;
  let kebabCount = 0;
  let snakeCount = 0;

  basenames.forEach((name) => {
    if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) pascalCount++;
    else if (/^[a-z][a-zA-Z0-9]*$/.test(name)) camelCount++;
    else if (/^[a-z][a-z0-9-]*$/.test(name)) kebabCount++;
    else if (/^[a-z][a-z0-9_]*$/.test(name)) snakeCount++;
  });

  const total = basenames.length;
  if (pascalCount / total > 0.6) return 'PascalCase';
  if (camelCount / total > 0.6) return 'camelCase';
  if (kebabCount / total > 0.6) return 'kebab-case';
  if (snakeCount / total > 0.6) return 'snake_case';

  return 'mixed';
}

/**
 * Detect routing patterns
 */
export function detectRoutingPattern(structure: DirectoryStructure): RoutePattern {
  const routes: RouteInfo[] = [];
  let type: RoutePattern['type'] = 'config-based';
  let framework: RoutePattern['framework'] | undefined;

  // Check for file-based routing (Next.js, Nuxt)
  if (structure.children) {
    const pagesDir = structure.children.find((c) => c.name === 'pages' || c.name === 'app');
    if (pagesDir) {
      type = 'file-based';
      framework = structure.children.some((c) => c.name === 'next.config.js' || c.name === 'next.config.ts')
        ? 'Next.js'
        : structure.children.some((c) => c.name === 'nuxt.config.js' || c.name === 'nuxt.config.ts')
        ? 'Nuxt'
        : undefined;
    }
  }

  return {
    type,
    framework,
    routes,
  };
}
