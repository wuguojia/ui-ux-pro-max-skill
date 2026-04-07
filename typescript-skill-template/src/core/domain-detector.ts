/**
 * Domain Detection - Automatically detect the search domain from query
 *
 * Uses regex patterns to match query keywords to domains
 */

export interface DomainKeywords {
  [domain: string]: RegExp;
}

/**
 * Default domain keyword patterns
 * Customize these for your specific use case
 */
export const DEFAULT_DOMAIN_KEYWORDS: DomainKeywords = {
  // Example domains - replace with your own
  knowledge: /react|typescript|javascript|frontend|backend|database|api|testing|performance/i,
  tips: /tip|best practice|guideline|how to|should|recommend|avoid|anti-pattern/i,
  patterns: /pattern|design|architecture|structure|template|example/i,
  tools: /tool|library|framework|package|plugin|extension/i,
};

/**
 * Detect domain from query string
 * @param query - Search query
 * @param domainKeywords - Domain keyword patterns (optional)
 * @returns Detected domain name or null
 */
export function detectDomain(
  query: string,
  domainKeywords: DomainKeywords = DEFAULT_DOMAIN_KEYWORDS
): string | null {
  const lowerQuery = query.toLowerCase();

  // Score each domain by number of matches
  const scores: Record<string, number> = {};

  for (const [domain, pattern] of Object.entries(domainKeywords)) {
    const matches = lowerQuery.match(pattern);
    if (matches) {
      scores[domain] = matches.length;
    }
  }

  // Return domain with highest score
  if (Object.keys(scores).length === 0) {
    return null;
  }

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)[0][0];
}

/**
 * Get all matching domains for a query
 * @param query - Search query
 * @param domainKeywords - Domain keyword patterns
 * @returns Array of matching domain names
 */
export function getMatchingDomains(
  query: string,
  domainKeywords: DomainKeywords = DEFAULT_DOMAIN_KEYWORDS
): string[] {
  const lowerQuery = query.toLowerCase();
  const matches: string[] = [];

  for (const [domain, pattern] of Object.entries(domainKeywords)) {
    if (pattern.test(lowerQuery)) {
      matches.push(domain);
    }
  }

  return matches;
}

/**
 * Example usage:
 *
 * const query = "How to use React hooks with TypeScript";
 * const domain = detectDomain(query);
 * // Returns: "knowledge" (matches react, typescript, hooks)
 *
 * const query2 = "Best practices for API design";
 * const domain2 = detectDomain(query2);
 * // Returns: "tips" (matches "best practices", "API")
 */
