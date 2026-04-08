/**
 * Smart Deduplication and Merging for Knowledge Base
 */

import { ComponentData, StyleData, ConventionData } from '../kb/types';

export interface DeduplicationResult {
  original: number;
  duplicates: number;
  merged: number;
  final: number;
  duplicateGroups: DuplicateGroup[];
}

export interface DuplicateGroup {
  type: 'exact' | 'similar' | 'variant';
  items: ComponentData[] | StyleData[] | ConventionData[];
  similarity: number;
  recommendedAction: 'merge' | 'keep-separate' | 'review';
}

export interface MergeStrategy {
  type: 'prefer-first' | 'prefer-last' | 'prefer-most-complete' | 'manual';
  conflictResolution: 'keep-both' | 'prefer-newer' | 'prefer-older' | 'combine';
}

/**
 * Deduplicate components
 */
export async function deduplicateComponents(
  components: ComponentData[],
  strategy: MergeStrategy = { type: 'prefer-most-complete', conflictResolution: 'combine' }
): Promise<DeduplicationResult> {
  const groups: DuplicateGroup[] = [];
  const seen = new Set<number>();
  const merged: ComponentData[] = [];

  for (let i = 0; i < components.length; i++) {
    if (seen.has(i)) continue;

    const duplicates: ComponentData[] = [components[i]];
    const indices: number[] = [i];

    for (let j = i + 1; j < components.length; j++) {
      if (seen.has(j)) continue;

      const similarity = calculateComponentSimilarity(components[i], components[j]);

      if (similarity >= 0.9) {
        // Exact or near-exact duplicate
        duplicates.push(components[j]);
        indices.push(j);
        seen.add(j);
      } else if (similarity >= 0.7) {
        // Similar component (might be variant)
        duplicates.push(components[j]);
        indices.push(j);
      }
    }

    if (duplicates.length > 1) {
      const groupType = duplicates.every((c, idx) =>
        idx === 0 || calculateComponentSimilarity(c, duplicates[0]) >= 0.9
      ) ? 'exact' : 'similar';

      groups.push({
        type: groupType,
        items: duplicates,
        similarity: calculateAvgSimilarity(duplicates),
        recommendedAction: groupType === 'exact' ? 'merge' : 'review',
      });

      // Merge if exact duplicates
      if (groupType === 'exact') {
        const mergedComponent = mergeComponents(duplicates, strategy);
        merged.push(mergedComponent);
        indices.forEach(idx => seen.add(idx));
      } else {
        // Keep similar but not exact
        merged.push(...duplicates);
        indices.forEach(idx => seen.add(idx));
      }
    } else {
      merged.push(components[i]);
      seen.add(i);
    }
  }

  return {
    original: components.length,
    duplicates: groups.reduce((sum, g) => sum + g.items.length - 1, 0),
    merged: merged.length,
    final: merged.length,
    duplicateGroups: groups,
  };
}

/**
 * Calculate similarity between two components
 */
function calculateComponentSimilarity(a: ComponentData, b: ComponentData): number {
  let score = 0;
  let factors = 0;

  // Component name similarity
  if (a.componentName === b.componentName) {
    score += 30;
  } else if (normalizeString(a.componentName) === normalizeString(b.componentName)) {
    score += 25;
  }
  factors += 30;

  // Framework match
  if (a.framework === b.framework) {
    score += 20;
  }
  factors += 20;

  // Import path similarity
  if (a.importPath === b.importPath) {
    score += 25;
  } else if (normalizeString(a.importPath) === normalizeString(b.importPath)) {
    score += 15;
  }
  factors += 25;

  // Props similarity
  const propsSimilarity = calculatePropsSimilarity(a.props, b.props);
  score += propsSimilarity * 15;
  factors += 15;

  // Keywords similarity
  const keywordsSimilarity = calculateArraySimilarity(a.keywords, b.keywords);
  score += keywordsSimilarity * 10;
  factors += 10;

  return (score / factors) * 100;
}

/**
 * Calculate props similarity
 */
function calculatePropsSimilarity(propsA: any[], propsB: any[]): number {
  if (propsA.length === 0 && propsB.length === 0) return 1;
  if (propsA.length === 0 || propsB.length === 0) return 0;

  const namesA = new Set(propsA.map(p => p.name));
  const namesB = new Set(propsB.map(p => p.name));

  const intersection = new Set([...namesA].filter(x => namesB.has(x)));
  const union = new Set([...namesA, ...namesB]);

  return intersection.size / union.size;
}

/**
 * Calculate array similarity (Jaccard index)
 */
function calculateArraySimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const setA = new Set(a.map(normalizeString));
  const setB = new Set(b.map(normalizeString));

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

/**
 * Calculate average similarity in a group
 */
function calculateAvgSimilarity(items: ComponentData[]): number {
  if (items.length <= 1) return 100;

  let totalSimilarity = 0;
  let comparisons = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      totalSimilarity += calculateComponentSimilarity(items[i], items[j]);
      comparisons++;
    }
  }

  return comparisons > 0 ? totalSimilarity / comparisons : 100;
}

/**
 * Merge components according to strategy
 */
function mergeComponents(components: ComponentData[], strategy: MergeStrategy): ComponentData {
  if (components.length === 1) return components[0];

  // Choose base component
  let base: ComponentData;
  if (strategy.type === 'prefer-first') {
    base = components[0];
  } else if (strategy.type === 'prefer-last') {
    base = components[components.length - 1];
  } else if (strategy.type === 'prefer-most-complete') {
    base = components.reduce((most, current) => {
      const mostComplete = calculateCompleteness(most);
      const currentComplete = calculateCompleteness(current);
      return currentComplete > mostComplete ? current : most;
    });
  } else {
    base = components[0];
  }

  // Merge props from all components
  const allProps = components.flatMap(c => c.props);
  const uniqueProps = Array.from(
    new Map(allProps.map(p => [p.name, p])).values()
  );

  // Merge keywords
  const allKeywords = new Set(components.flatMap(c => c.keywords));

  // Combine descriptions
  const descriptions = components
    .map(c => c.description)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);

  return {
    ...base,
    props: uniqueProps,
    keywords: Array.from(allKeywords),
    description: descriptions.join('. ') || base.description,
  };
}

/**
 * Calculate completeness score of a component
 */
function calculateCompleteness(component: ComponentData): number {
  let score = 0;

  if (component.componentName) score += 10;
  if (component.framework) score += 10;
  if (component.importPath) score += 15;
  if (component.props && component.props.length > 0) score += 20;
  if (component.description) score += 15;
  if (component.usageExample) score += 20;
  if (component.keywords && component.keywords.length > 0) score += 10;

  return score;
}

/**
 * Deduplicate styles
 */
export async function deduplicateStyles(
  styles: StyleData[],
  strategy: MergeStrategy = { type: 'prefer-most-complete', conflictResolution: 'combine' }
): Promise<DeduplicationResult> {
  const groups: DuplicateGroup[] = [];
  const seen = new Set<number>();
  const merged: StyleData[] = [];

  for (let i = 0; i < styles.length; i++) {
    if (seen.has(i)) continue;

    const duplicates: StyleData[] = [styles[i]];
    const indices: number[] = [i];

    for (let j = i + 1; j < styles.length; j++) {
      if (seen.has(j)) continue;

      const similarity = calculateStyleSimilarity(styles[i], styles[j]);

      if (similarity >= 0.95) {
        duplicates.push(styles[j]);
        indices.push(j);
        seen.add(j);
      }
    }

    if (duplicates.length > 1) {
      groups.push({
        type: 'exact',
        items: duplicates,
        similarity: 100,
        recommendedAction: 'merge',
      });

      const mergedStyle = mergeStyles(duplicates, strategy);
      merged.push(mergedStyle);
      indices.forEach(idx => seen.add(idx));
    } else {
      merged.push(styles[i]);
      seen.add(i);
    }
  }

  return {
    original: styles.length,
    duplicates: groups.reduce((sum, g) => sum + g.items.length - 1, 0),
    merged: merged.length,
    final: merged.length,
    duplicateGroups: groups,
  };
}

/**
 * Calculate similarity between two styles
 */
function calculateStyleSimilarity(a: StyleData, b: StyleData): number {
  let score = 0;

  if (a.name === b.name) score += 40;
  if (a.value === b.value) score += 30;
  if (a.styleType === b.styleType) score += 20;
  if (a.category === b.category) score += 10;

  return score;
}

/**
 * Merge styles
 */
function mergeStyles(styles: StyleData[], strategy: MergeStrategy): StyleData {
  if (styles.length === 1) return styles[0];

  const base = strategy.type === 'prefer-last' ? styles[styles.length - 1] : styles[0];

  const allKeywords = new Set(styles.flatMap(s => s.keywords));

  return {
    ...base,
    keywords: Array.from(allKeywords),
  };
}

/**
 * Deduplicate conventions
 */
export async function deduplicateConventions(
  conventions: ConventionData[],
  strategy: MergeStrategy = { type: 'prefer-most-complete', conflictResolution: 'combine' }
): Promise<DeduplicationResult> {
  const groups: DuplicateGroup[] = [];
  const seen = new Set<number>();
  const merged: ConventionData[] = [];

  for (let i = 0; i < conventions.length; i++) {
    if (seen.has(i)) continue;

    const duplicates: ConventionData[] = [conventions[i]];
    const indices: number[] = [i];

    for (let j = i + 1; j < conventions.length; j++) {
      if (seen.has(j)) continue;

      if (
        conventions[i].conventionType === conventions[j].conventionType &&
        normalizeString(conventions[i].rule) === normalizeString(conventions[j].rule)
      ) {
        duplicates.push(conventions[j]);
        indices.push(j);
        seen.add(j);
      }
    }

    if (duplicates.length > 1) {
      groups.push({
        type: 'exact',
        items: duplicates,
        similarity: 100,
        recommendedAction: 'merge',
      });

      const mergedConvention = mergeConventions(duplicates, strategy);
      merged.push(mergedConvention);
      indices.forEach(idx => seen.add(idx));
    } else {
      merged.push(conventions[i]);
      seen.add(i);
    }
  }

  return {
    original: conventions.length,
    duplicates: groups.reduce((sum, g) => sum + g.items.length - 1, 0),
    merged: merged.length,
    final: merged.length,
    duplicateGroups: groups,
  };
}

/**
 * Merge conventions
 */
function mergeConventions(conventions: ConventionData[], strategy: MergeStrategy): ConventionData {
  if (conventions.length === 1) return conventions[0];

  const base = conventions[0];

  const allKeywords = new Set(conventions.flatMap(c => c.keywords));

  return {
    ...base,
    keywords: Array.from(allKeywords),
  };
}

/**
 * Normalize string for comparison
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Find similar but not duplicate components (for suggestions)
 */
export function findSimilarComponents(
  component: ComponentData,
  allComponents: ComponentData[],
  threshold: number = 0.6
): Array<{ component: ComponentData; similarity: number }> {
  const similar: Array<{ component: ComponentData; similarity: number }> = [];

  for (const other of allComponents) {
    if (other === component) continue;

    const similarity = calculateComponentSimilarity(component, other) / 100;
    if (similarity >= threshold && similarity < 0.9) {
      similar.push({ component: other, similarity });
    }
  }

  return similar.sort((a, b) => b.similarity - a.similarity);
}
