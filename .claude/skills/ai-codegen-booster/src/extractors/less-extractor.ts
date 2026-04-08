/**
 * Less Extractor - Extract variables and classes from Less files
 */

import less from 'less';

export interface LessVariable {
  name: string;
  value: string;
  category: string;
}

export interface LessUtility {
  selector: string;
  properties: Record<string, string>;
  category: string;
}

export interface ExtractedLess {
  variables: LessVariable[];
  utilities: LessUtility[];
}

/**
 * Extract Less variables and utilities from Less content
 */
export async function extractLess(content: string): Promise<ExtractedLess> {
  const variables: LessVariable[] = [];
  const utilities: LessUtility[] = [];

  if (!content.trim()) {
    return { variables, utilities };
  }

  try {
    // Parse Less to CSS
    const output = await less.render(content, {
      // Don't compress to preserve structure
      compress: false,
    });

    // Extract variables from original Less content
    const variableMatches = content.matchAll(/@([\w-]+)\s*:\s*([^;]+);/g);
    for (const match of variableMatches) {
      const name = '@' + match[1];
      const value = match[2].trim();
      variables.push({
        name,
        value,
        category: categorizeLessVariable(name, value),
      });
    }

    // Extract utility classes from compiled CSS
    const classMatches = output.css.matchAll(/\.([\w-]+)\s*{([^}]+)}/g);
    for (const match of classMatches) {
      const selector = '.' + match[1];
      const propertiesStr = match[2];
      const properties: Record<string, string> = {};

      // Parse properties
      const propMatches = propertiesStr.matchAll(/([\w-]+)\s*:\s*([^;]+);/g);
      for (const propMatch of propMatches) {
        properties[propMatch[1].trim()] = propMatch[2].trim();
      }

      if (Object.keys(properties).length > 0) {
        utilities.push({
          selector,
          properties,
          category: categorizeUtility(selector),
        });
      }
    }
  } catch (error) {
    console.warn('Failed to parse Less:', error);
  }

  return { variables, utilities };
}

/**
 * Categorize Less variable by name and value
 */
export function categorizeLessVariable(name: string, value: string): string {
  const nameLower = name.toLowerCase();
  const valueLower = value.toLowerCase();

  // Color detection
  if (
    nameLower.includes('color') ||
    nameLower.includes('bg') ||
    valueLower.match(/^(#|rgb|hsl)/)
  ) {
    return 'Color';
  }

  // Spacing detection
  if (
    nameLower.includes('spacing') ||
    nameLower.includes('padding') ||
    nameLower.includes('margin') ||
    nameLower.includes('gap')
  ) {
    return 'Spacing';
  }

  // Typography detection
  if (
    nameLower.includes('font') ||
    nameLower.includes('text')
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
 * Categorize utility class
 */
function categorizeUtility(selector: string): string {
  const selectorLower = selector.toLowerCase();

  if (selectorLower.includes('color') || selectorLower.includes('bg-')) {
    return 'Color';
  }

  if (
    selectorLower.includes('padding') ||
    selectorLower.includes('margin') ||
    selectorLower.includes('gap')
  ) {
    return 'Spacing';
  }

  if (selectorLower.includes('text-') || selectorLower.includes('font-')) {
    return 'Typography';
  }

  return 'Layout';
}
