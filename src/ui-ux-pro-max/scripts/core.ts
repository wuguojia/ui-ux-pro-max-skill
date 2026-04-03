#!/usr/bin/env node
/**
 * UI/UX Pro Max Core - BM25 search engine for UI/UX style guides
 *
 * TypeScript reimplementation of core.py.
 * Zero external dependencies — runs on Node 18+ or Bun.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ============ CONFIGURATION ============

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const DATA_DIR = join(__dirname, "..", "data");
export const MAX_RESULTS = 3;

export interface CsvDomainConfig {
  file: string;
  search_cols: string[];
  output_cols: string[];
}

export const CSV_CONFIG: Record<string, CsvDomainConfig> = {
  style: {
    file: "styles.csv",
    search_cols: [
      "Style Category",
      "Keywords",
      "Best For",
      "Type",
      "AI Prompt Keywords",
    ],
    output_cols: [
      "Style Category",
      "Type",
      "Keywords",
      "Primary Colors",
      "Effects & Animation",
      "Best For",
      "Light Mode ✓",
      "Dark Mode ✓",
      "Performance",
      "Accessibility",
      "Framework Compatibility",
      "Complexity",
      "AI Prompt Keywords",
      "CSS/Technical Keywords",
      "Implementation Checklist",
      "Design System Variables",
    ],
  },
  color: {
    file: "colors.csv",
    search_cols: ["Product Type", "Notes"],
    output_cols: [
      "Product Type",
      "Primary",
      "On Primary",
      "Secondary",
      "On Secondary",
      "Accent",
      "On Accent",
      "Background",
      "Foreground",
      "Card",
      "Card Foreground",
      "Muted",
      "Muted Foreground",
      "Border",
      "Destructive",
      "On Destructive",
      "Ring",
      "Notes",
    ],
  },
  chart: {
    file: "charts.csv",
    search_cols: [
      "Data Type",
      "Keywords",
      "Best Chart Type",
      "When to Use",
      "When NOT to Use",
      "Accessibility Notes",
    ],
    output_cols: [
      "Data Type",
      "Keywords",
      "Best Chart Type",
      "Secondary Options",
      "When to Use",
      "When NOT to Use",
      "Data Volume Threshold",
      "Color Guidance",
      "Accessibility Grade",
      "Accessibility Notes",
      "A11y Fallback",
      "Library Recommendation",
      "Interactive Level",
    ],
  },
  landing: {
    file: "landing.csv",
    search_cols: [
      "Pattern Name",
      "Keywords",
      "Conversion Optimization",
      "Section Order",
    ],
    output_cols: [
      "Pattern Name",
      "Keywords",
      "Section Order",
      "Primary CTA Placement",
      "Color Strategy",
      "Conversion Optimization",
    ],
  },
  product: {
    file: "products.csv",
    search_cols: [
      "Product Type",
      "Keywords",
      "Primary Style Recommendation",
      "Key Considerations",
    ],
    output_cols: [
      "Product Type",
      "Keywords",
      "Primary Style Recommendation",
      "Secondary Styles",
      "Landing Page Pattern",
      "Dashboard Style (if applicable)",
      "Color Palette Focus",
    ],
  },
  ux: {
    file: "ux-guidelines.csv",
    search_cols: ["Category", "Issue", "Description", "Platform"],
    output_cols: [
      "Category",
      "Issue",
      "Platform",
      "Description",
      "Do",
      "Don't",
      "Code Example Good",
      "Code Example Bad",
      "Severity",
    ],
  },
  typography: {
    file: "typography.csv",
    search_cols: [
      "Font Pairing Name",
      "Category",
      "Mood/Style Keywords",
      "Best For",
      "Heading Font",
      "Body Font",
    ],
    output_cols: [
      "Font Pairing Name",
      "Category",
      "Heading Font",
      "Body Font",
      "Mood/Style Keywords",
      "Best For",
      "Google Fonts URL",
      "CSS Import",
      "Tailwind Config",
      "Notes",
    ],
  },
  icons: {
    file: "icons.csv",
    search_cols: ["Category", "Icon Name", "Keywords", "Best For"],
    output_cols: [
      "Category",
      "Icon Name",
      "Keywords",
      "Library",
      "Import Code",
      "Usage",
      "Best For",
      "Style",
    ],
  },
  react: {
    file: "react-performance.csv",
    search_cols: ["Category", "Issue", "Keywords", "Description"],
    output_cols: [
      "Category",
      "Issue",
      "Platform",
      "Description",
      "Do",
      "Don't",
      "Code Example Good",
      "Code Example Bad",
      "Severity",
    ],
  },
  web: {
    file: "app-interface.csv",
    search_cols: ["Category", "Issue", "Keywords", "Description"],
    output_cols: [
      "Category",
      "Issue",
      "Platform",
      "Description",
      "Do",
      "Don't",
      "Code Example Good",
      "Code Example Bad",
      "Severity",
    ],
  },
  "google-fonts": {
    file: "google-fonts.csv",
    search_cols: [
      "Family",
      "Category",
      "Stroke",
      "Classifications",
      "Keywords",
      "Subsets",
      "Designers",
    ],
    output_cols: [
      "Family",
      "Category",
      "Stroke",
      "Classifications",
      "Styles",
      "Variable Axes",
      "Subsets",
      "Designers",
      "Popularity Rank",
      "Google Fonts URL",
    ],
  },
};

export interface StackDomainConfig {
  file: string;
}

export const STACK_CONFIG: Record<string, StackDomainConfig> = {
  react: { file: "stacks/react.csv" },
  nextjs: { file: "stacks/nextjs.csv" },
  vue: { file: "stacks/vue.csv" },
  svelte: { file: "stacks/svelte.csv" },
  astro: { file: "stacks/astro.csv" },
  swiftui: { file: "stacks/swiftui.csv" },
  "react-native": { file: "stacks/react-native.csv" },
  flutter: { file: "stacks/flutter.csv" },
  nuxtjs: { file: "stacks/nuxtjs.csv" },
  "nuxt-ui": { file: "stacks/nuxt-ui.csv" },
  "html-tailwind": { file: "stacks/html-tailwind.csv" },
  shadcn: { file: "stacks/shadcn.csv" },
  "jetpack-compose": { file: "stacks/jetpack-compose.csv" },
  threejs: { file: "stacks/threejs.csv" },
  angular: { file: "stacks/angular.csv" },
  laravel: { file: "stacks/laravel.csv" },
};

/** Common columns for all stacks */
const STACK_COLS = {
  search_cols: ["Category", "Guideline", "Description", "Do", "Don't"],
  output_cols: [
    "Category",
    "Guideline",
    "Description",
    "Do",
    "Don't",
    "Code Good",
    "Code Bad",
    "Severity",
    "Docs URL",
  ],
};

export const AVAILABLE_STACKS = Object.keys(STACK_CONFIG);

// ============ CSV PARSER ============

/**
 * Minimal RFC-4180 compliant CSV parser.
 * Handles quoted fields with embedded commas, newlines, and escaped quotes.
 */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        row.push(field);
        field = "";
        i++;
      } else if (ch === "\r") {
        // skip \r (handle \r\n)
        i++;
      } else if (ch === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Last field / row
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0];
  const result: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = rows[r][c] ?? "";
    }
    result.push(obj);
  }
  return result;
}

// ============ BM25 IMPLEMENTATION ============

export class BM25 {
  private k1: number;
  private b: number;
  private corpus: string[][] = [];
  private docLengths: number[] = [];
  private avgdl = 0;
  private idf: Map<string, number> = new Map();
  private docFreqs: Map<string, number> = new Map();
  private N = 0;

  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  /** Lowercase, split, remove punctuation, filter short words */
  tokenize(text: string): string[] {
    const cleaned = String(text)
      .toLowerCase()
      .replace(/[^\w\s]/g, " ");
    return cleaned.split(/\s+/).filter((w) => w.length > 2);
  }

  /** Build BM25 index from documents */
  fit(documents: string[]): void {
    this.corpus = documents.map((doc) => this.tokenize(doc));
    this.N = this.corpus.length;
    if (this.N === 0) return;
    this.docLengths = this.corpus.map((doc) => doc.length);
    this.avgdl =
      this.docLengths.reduce((a, b) => a + b, 0) / this.N;

    for (const doc of this.corpus) {
      const seen = new Set<string>();
      for (const word of doc) {
        if (!seen.has(word)) {
          this.docFreqs.set(word, (this.docFreqs.get(word) ?? 0) + 1);
          seen.add(word);
        }
      }
    }

    for (const [word, freq] of this.docFreqs) {
      this.idf.set(
        word,
        Math.log((this.N - freq + 0.5) / (freq + 0.5) + 1)
      );
    }
  }

  /** Score all documents against query */
  score(query: string): [number, number][] {
    const queryTokens = this.tokenize(query);
    const scores: [number, number][] = [];

    for (let idx = 0; idx < this.corpus.length; idx++) {
      const doc = this.corpus[idx];
      const docLen = this.docLengths[idx];
      const termFreqs = new Map<string, number>();
      for (const word of doc) {
        termFreqs.set(word, (termFreqs.get(word) ?? 0) + 1);
      }

      let s = 0;
      for (const token of queryTokens) {
        const idfVal = this.idf.get(token);
        if (idfVal !== undefined) {
          const tf = termFreqs.get(token) ?? 0;
          const numerator = tf * (this.k1 + 1);
          const denominator =
            tf +
            this.k1 *
              (1 - this.b + (this.b * docLen) / this.avgdl);
          s += idfVal * (numerator / denominator);
        }
      }
      scores.push([idx, s]);
    }

    return scores.sort((a, b) => b[1] - a[1]);
  }
}

// ============ SEARCH FUNCTIONS ============

/** Load CSV and return list of dicts */
export function loadCsv(filepath: string): Record<string, string>[] {
  const text = readFileSync(filepath, "utf-8");
  return parseCsv(text);
}

/** Core search function using BM25 */
function searchCsv(
  filepath: string,
  searchCols: string[],
  outputCols: string[],
  query: string,
  maxResults: number
): Record<string, string>[] {
  if (!existsSync(filepath)) return [];

  const data = loadCsv(filepath);

  // Build documents from search columns
  const documents = data.map((row) =>
    searchCols.map((col) => row[col] ?? "").join(" ")
  );

  // BM25 search
  const bm25 = new BM25();
  bm25.fit(documents);
  const ranked = bm25.score(query);

  // Get top results with score > 0
  const results: Record<string, string>[] = [];
  for (const [idx, score] of ranked.slice(0, maxResults)) {
    if (score > 0) {
      const row = data[idx];
      const entry: Record<string, string> = {};
      for (const col of outputCols) {
        if (col in row) {
          entry[col] = row[col];
        }
      }
      results.push(entry);
    }
  }
  return results;
}

/** Auto-detect the most relevant domain from query */
export function detectDomain(query: string): string {
  const queryLower = query.toLowerCase();

  const domainKeywords: Record<string, string[]> = {
    color: [
      "color", "palette", "hex", "#", "rgb", "token", "semantic",
      "accent", "destructive", "muted", "foreground",
    ],
    chart: [
      "chart", "graph", "visualization", "trend", "bar", "pie",
      "scatter", "heatmap", "funnel",
    ],
    landing: [
      "landing", "page", "cta", "conversion", "hero", "testimonial",
      "pricing", "section",
    ],
    product: [
      "saas", "ecommerce", "e-commerce", "fintech", "healthcare", "gaming",
      "portfolio", "crypto", "dashboard", "fitness", "restaurant", "hotel",
      "travel", "music", "education", "learning", "legal", "insurance",
      "medical", "beauty", "pharmacy", "dental", "pet", "dating", "wedding",
      "recipe", "delivery", "ride", "booking", "calendar", "timer", "tracker",
      "diary", "note", "chat", "messenger", "crm", "invoice", "parking",
      "transit", "vpn", "alarm", "weather", "sleep", "meditation", "fasting",
      "habit", "grocery", "meme", "wardrobe", "plant care", "reading",
      "flashcard", "puzzle", "trivia", "arcade", "photography", "streaming",
      "podcast", "newsletter", "marketplace", "freelancer", "coworking",
      "airline", "museum", "theater", "church", "non-profit", "charity",
      "kindergarten", "daycare", "senior care", "veterinary", "florist",
      "bakery", "brewery", "construction", "automotive", "real estate",
      "logistics", "agriculture", "coding bootcamp",
    ],
    style: [
      "style", "design", "ui", "minimalism", "glassmorphism", "neumorphism",
      "brutalism", "dark mode", "flat", "aurora", "prompt", "css",
      "implementation", "variable", "checklist", "tailwind",
    ],
    ux: [
      "ux", "usability", "accessibility", "wcag", "touch", "scroll",
      "animation", "keyboard", "navigation", "mobile",
    ],
    typography: [
      "font pairing", "typography pairing", "heading font", "body font",
    ],
    "google-fonts": [
      "google font", "font family", "font weight", "font style",
      "variable font", "noto", "font for", "find font", "font subset",
      "font language", "monospace font", "serif font", "sans serif font",
      "display font", "handwriting font", "font", "typography", "serif",
      "sans",
    ],
    icons: [
      "icon", "icons", "lucide", "heroicons", "symbol", "glyph",
      "pictogram", "svg icon",
    ],
    react: [
      "react", "next.js", "nextjs", "suspense", "memo", "usecallback",
      "useeffect", "rerender", "bundle", "waterfall", "barrel",
      "dynamic import", "rsc", "server component",
    ],
    web: [
      "aria", "focus", "outline", "semantic", "virtualize", "autocomplete",
      "form", "input type", "preconnect",
    ],
  };

  const scores: Record<string, number> = {};
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    let count = 0;
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`).test(queryLower)) {
        count++;
      }
    }
    scores[domain] = count;
  }

  let best = "style";
  let bestScore = 0;
  for (const [domain, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = domain;
    }
  }
  return bestScore > 0 ? best : "style";
}

export interface SearchResult {
  domain?: string;
  stack?: string;
  query: string;
  file: string;
  count: number;
  results: Record<string, string>[];
  error?: string;
}

/** Main search function with auto-domain detection */
export function search(
  query: string,
  domain?: string | null,
  maxResults = MAX_RESULTS
): SearchResult {
  if (!domain) {
    domain = detectDomain(query);
  }

  const config = CSV_CONFIG[domain] ?? CSV_CONFIG["style"];
  const filepath = join(DATA_DIR, config.file);

  if (!existsSync(filepath)) {
    return {
      error: `File not found: ${filepath}`,
      domain,
      query,
      file: config.file,
      count: 0,
      results: [],
    };
  }

  const results = searchCsv(
    filepath,
    config.search_cols,
    config.output_cols,
    query,
    maxResults
  );

  return {
    domain,
    query,
    file: config.file,
    count: results.length,
    results,
  };
}

/** Search stack-specific guidelines */
export function searchStack(
  query: string,
  stack: string,
  maxResults = MAX_RESULTS
): SearchResult {
  if (!(stack in STACK_CONFIG)) {
    return {
      error: `Unknown stack: ${stack}. Available: ${AVAILABLE_STACKS.join(", ")}`,
      query,
      file: "",
      count: 0,
      results: [],
    };
  }

  const filepath = join(DATA_DIR, STACK_CONFIG[stack].file);

  if (!existsSync(filepath)) {
    return {
      error: `Stack file not found: ${filepath}`,
      stack,
      query,
      file: STACK_CONFIG[stack].file,
      count: 0,
      results: [],
    };
  }

  const results = searchCsv(
    filepath,
    STACK_COLS.search_cols,
    STACK_COLS.output_cols,
    query,
    maxResults
  );

  return {
    domain: "stack",
    stack,
    query,
    file: STACK_CONFIG[stack].file,
    count: results.length,
    results,
  };
}
