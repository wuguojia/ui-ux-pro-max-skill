/**
 * Core TypeScript types for AI Skill Template
 */

export interface SearchResult {
  [key: string]: string | number;
  score?: number;
}

export interface CSVConfig {
  file: string;
  searchColumns: string[];
  outputColumns: string[];
}

export interface DomainConfig {
  [domain: string]: CSVConfig;
}

export interface ReasoningRule {
  Recommended_Pattern?: string;
  Style_Priority?: string;
  Color_Mood?: string;
  Typography_Mood?: string;
  Key_Effects?: string;
  Anti_Patterns?: string[];
  Severity?: string;
  Notes?: string;
}

export interface ProductMatch {
  Product_Name: string;
  Category: string;
  Keywords: string;
  Description: string;
  Decision_Rules?: ReasoningRule;
  score?: number;
}

export interface DesignSystem {
  project_name: string;
  category: string;
  pattern: SearchResult;
  style: SearchResult;
  colors: SearchResult;
  typography: SearchResult;
  key_effects: string;
  anti_patterns: string;
  decision_rules: ReasoningRule;
  severity: string;
}

export interface BM25Score {
  docId: number;
  score: number;
}

export interface PlatformConfig {
  platform: string;
  displayName: string;
  installType: 'full' | 'workflow';
  folderStructure: {
    root: string;
    skillPath: string;
    filename: string;
  };
  scriptPath: string;
  frontmatter?: Record<string, any>;
  supportsQuickReference?: boolean;
}

export interface TemplateVariables {
  TITLE: string;
  DESCRIPTION: string;
  SKILL_OR_WORKFLOW: string;
  SCRIPT_PATH: string;
  QUICK_REFERENCE?: string;
  platform?: string;
  installType?: string;
}
