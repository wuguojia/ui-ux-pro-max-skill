/**
 * CSS Extractor - Extract CSS variables and utility classes
 */

import postcss from 'postcss';

export interface CSSVariable {
  name: string;
  value: string;
  category: string;
}

export interface UtilityClass {
  selector: string;
  properties: Record<string, string>;
  category: string;
}

export interface ExtractedCSS {
  variables: CSSVariable[];
  utilities: UtilityClass[];
}

/**
 * Extract CSS variables and utility classes from CSS content
 */
export async function extractCSS(content: string): Promise<ExtractedCSS> {
  const variables: CSSVariable[] = [];
  const utilities: UtilityClass[] = [];

  if (!content.trim()) {
    return { variables, utilities };
  }

  try {
    const root = postcss.parse(content);

    // Traverse all rules
    root.walkRules((rule) => {
      // Extract CSS variables from :root
      if (rule.selector === ':root') {
        rule.walkDecls((decl) => {
          if (decl.prop.startsWith('--')) {
            variables.push({
              name: decl.prop,
              value: decl.value,
              category: categorizeVariable(decl.prop, decl.value),
            });
          }
        });
      }
      // Extract utility classes
      else if (isUtilityClass(rule.selector)) {
        const properties: Record<string, string> = {};
        rule.walkDecls((decl) => {
          properties[decl.prop] = decl.value;
        });

        utilities.push({
          selector: rule.selector,
          properties,
          category: categorizeUtility(rule.selector),
        });
      }
    });
  } catch (error) {
    console.warn('Failed to parse CSS:', error);
  }

  return { variables, utilities };
}

/**
 * Categorize CSS variable by name and value
 */
export function categorizeVariable(name: string, value: string): string {
  const nameLower = name.toLowerCase();
  const valueLower = value.toLowerCase();

  // Color detection
  if (
    nameLower.includes('color') ||
    nameLower.includes('bg') ||
    nameLower.includes('text') ||
    valueLower.match(/^(#|rgb|hsl|var\(--.*color)/)
  ) {
    return 'Color';
  }

  // Spacing detection
  if (
    nameLower.includes('spacing') ||
    nameLower.includes('gap') ||
    nameLower.includes('padding') ||
    nameLower.includes('margin')
  ) {
    return 'Spacing';
  }

  // Typography detection
  if (
    nameLower.includes('font') ||
    (nameLower.includes('text') && !nameLower.includes('color'))
  ) {
    return 'Typography';
  }

  // Shadow detection
  if (nameLower.includes('shadow')) {
    return 'Shadow';
  }

  return 'Other';
}

/**
 * Check if selector is a utility class (simple class selector)
 */
function isUtilityClass(selector: string): boolean {
  // Match simple class selectors like .bg-primary, .text-lg
  // Exclude complex selectors with spaces, >, +, ~, etc.
  return /^\.[a-z][a-z0-9-]*$/i.test(selector);
}

/**
 * Categorize utility class by selector name
 */
export function categorizeUtility(selector: string): string {
  const selectorLower = selector.toLowerCase();

  if (selectorLower.includes('bg-') || selectorLower.includes('text-')) {
    return 'Color';
  }

  if (
    selectorLower.includes('p-') ||
    selectorLower.includes('m-') ||
    selectorLower.includes('gap-')
  ) {
    return 'Spacing';
  }

  if (selectorLower.includes('text-') || selectorLower.includes('font-')) {
    return 'Typography';
  }

  return 'Layout';
}
