/**
 * HTML Extractor - Extract HTML structure patterns and layouts
 */

export interface HTMLStructure {
  tagName: string;
  id?: string;
  classes: string[];
  attributes: Record<string, string>;
  semanticRole?: string;
  ariaAttributes: Record<string, string>;
}

export interface LayoutPattern {
  type: 'header' | 'footer' | 'sidebar' | 'main' | 'nav' | 'section' | 'article' | 'aside' | 'custom';
  elements: HTMLStructure[];
  description: string;
}

export interface HTMLExtractionResult {
  layouts: LayoutPattern[];
  semanticTags: string[];
  ariaPatterns: string[];
  commonClasses: string[];
  commonIds: string[];
  structureDepth: number;
}

/**
 * Extract HTML structure patterns from HTML content
 */
export async function extractHTML(html: string): Promise<HTMLExtractionResult> {
  const layouts: LayoutPattern[] = [];
  const semanticTags = new Set<string>();
  const ariaPatterns = new Set<string>();
  const commonClasses = new Set<string>();
  const commonIds = new Set<string>();
  let maxDepth = 0;

  // Simple HTML parsing using regex (for basic extraction)
  const tagRegex = /<(\w+)([^>]*)>/g;
  const classRegex = /class=["']([^"']*)["']/;
  const idRegex = /id=["']([^"']*)["']/;
  const ariaRegex = /aria-[\w-]+=/g;

  let match;
  const elements: HTMLStructure[] = [];

  while ((match = tagRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const attributes = match[2];

    // Track semantic tags
    if (isSemanticTag(tagName)) {
      semanticTags.add(tagName);
    }

    // Extract classes
    const classMatch = attributes.match(classRegex);
    const classes = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];
    classes.forEach(cls => commonClasses.add(cls));

    // Extract id
    const idMatch = attributes.match(idRegex);
    if (idMatch) {
      commonIds.add(idMatch[1]);
    }

    // Extract ARIA attributes
    const ariaAttrs: Record<string, string> = {};
    const ariaMatches = attributes.match(ariaRegex);
    if (ariaMatches) {
      ariaMatches.forEach(aria => {
        const attrMatch = attributes.match(new RegExp(`${aria}["']([^"']*)["']`));
        if (attrMatch) {
          ariaAttrs[aria.replace('=', '')] = attrMatch[1];
          ariaPatterns.add(aria.replace('=', ''));
        }
      });
    }

    const element: HTMLStructure = {
      tagName,
      classes,
      attributes: {},
      ariaAttributes: ariaAttrs,
      semanticRole: getSemanticRole(tagName),
    };

    if (idMatch) {
      element.id = idMatch[1];
    }

    elements.push(element);
  }

  // Identify layout patterns
  layouts.push(...identifyLayoutPatterns(elements));

  // Calculate structure depth (simple estimation)
  maxDepth = estimateDepth(html);

  return {
    layouts,
    semanticTags: Array.from(semanticTags),
    ariaPatterns: Array.from(ariaPatterns),
    commonClasses: Array.from(commonClasses),
    commonIds: Array.from(commonIds),
    structureDepth: maxDepth,
  };
}

/**
 * Check if tag is a semantic HTML5 tag
 */
function isSemanticTag(tagName: string): boolean {
  const semanticTags = [
    'header', 'footer', 'main', 'nav', 'section', 'article',
    'aside', 'figure', 'figcaption', 'details', 'summary',
    'mark', 'time'
  ];
  return semanticTags.includes(tagName);
}

/**
 * Get semantic role of a tag
 */
function getSemanticRole(tagName: string): string | undefined {
  const roles: Record<string, string> = {
    'header': 'banner',
    'footer': 'contentinfo',
    'main': 'main',
    'nav': 'navigation',
    'aside': 'complementary',
    'section': 'region',
    'article': 'article',
    'form': 'form',
    'search': 'search',
  };
  return roles[tagName];
}

/**
 * Identify common layout patterns
 */
function identifyLayoutPatterns(elements: HTMLStructure[]): LayoutPattern[] {
  const patterns: LayoutPattern[] = [];

  // Group by semantic tags
  const headerElements = elements.filter(e => e.tagName === 'header');
  const footerElements = elements.filter(e => e.tagName === 'footer');
  const navElements = elements.filter(e => e.tagName === 'nav');
  const mainElements = elements.filter(e => e.tagName === 'main');
  const asideElements = elements.filter(e => e.tagName === 'aside');

  if (headerElements.length > 0) {
    patterns.push({
      type: 'header',
      elements: headerElements,
      description: 'Header layout with navigation and branding',
    });
  }

  if (footerElements.length > 0) {
    patterns.push({
      type: 'footer',
      elements: footerElements,
      description: 'Footer layout with links and copyright',
    });
  }

  if (navElements.length > 0) {
    patterns.push({
      type: 'nav',
      elements: navElements,
      description: 'Navigation menu structure',
    });
  }

  if (mainElements.length > 0) {
    patterns.push({
      type: 'main',
      elements: mainElements,
      description: 'Main content area',
    });
  }

  if (asideElements.length > 0) {
    patterns.push({
      type: 'sidebar',
      elements: asideElements,
      description: 'Sidebar with supplementary content',
    });
  }

  return patterns;
}

/**
 * Estimate HTML structure depth
 */
function estimateDepth(html: string): number {
  let depth = 0;
  let currentDepth = 0;

  for (let i = 0; i < html.length; i++) {
    if (html[i] === '<' && html[i + 1] !== '/') {
      currentDepth++;
      depth = Math.max(depth, currentDepth);
    } else if (html[i] === '<' && html[i + 1] === '/') {
      currentDepth--;
    }
  }

  return depth;
}

/**
 * Extract accessibility patterns
 */
export function extractAccessibilityPatterns(html: string): {
  ariaLabels: string[];
  ariaDescribedBy: string[];
  ariaLabelledBy: string[];
  roles: string[];
  landmarks: string[];
} {
  const ariaLabels: string[] = [];
  const ariaDescribedBy: string[] = [];
  const ariaLabelledBy: string[] = [];
  const roles: string[] = [];
  const landmarks: string[] = [];

  // Extract aria-label
  const ariaLabelRegex = /aria-label=["']([^"']*)["']/g;
  let match;
  while ((match = ariaLabelRegex.exec(html)) !== null) {
    ariaLabels.push(match[1]);
  }

  // Extract aria-describedby
  const ariaDescribedByRegex = /aria-describedby=["']([^"']*)["']/g;
  while ((match = ariaDescribedByRegex.exec(html)) !== null) {
    ariaDescribedBy.push(match[1]);
  }

  // Extract aria-labelledby
  const ariaLabelledByRegex = /aria-labelledby=["']([^"']*)["']/g;
  while ((match = ariaLabelledByRegex.exec(html)) !== null) {
    ariaLabelledBy.push(match[1]);
  }

  // Extract role
  const roleRegex = /role=["']([^"']*)["']/g;
  while ((match = roleRegex.exec(html)) !== null) {
    roles.push(match[1]);
  }

  // Identify landmark roles
  const landmarkRoles = ['banner', 'main', 'navigation', 'complementary', 'contentinfo', 'search', 'form'];
  landmarks.push(...roles.filter(r => landmarkRoles.includes(r)));

  return {
    ariaLabels,
    ariaDescribedBy,
    ariaLabelledBy,
    roles,
    landmarks,
  };
}
