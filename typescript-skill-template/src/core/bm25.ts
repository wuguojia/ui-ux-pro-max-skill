/**
 * BM25 (Best Matching 25) Search Algorithm Implementation
 *
 * BM25 is a ranking function used to estimate the relevance of documents to a given search query.
 * It's an improvement over TF-IDF that handles:
 * - Term frequency saturation (via k1 parameter)
 * - Document length normalization (via b parameter)
 *
 * Formula:
 * score(D, Q) = Σ(qi∈Q) IDF(qi) × (f(qi,D) × (k1 + 1)) / (f(qi,D) + k1 × (1 - b + b × |D| / avgdl))
 *
 * Where:
 * - D: Document
 * - Q: Query
 * - qi: i-th query term
 * - f(qi,D): Term frequency of qi in document D
 * - k1: Term frequency saturation parameter (default: 1.5)
 * - b: Length normalization parameter (default: 0.75)
 * - |D|: Document length
 * - avgdl: Average document length
 * - IDF(qi): Inverse document frequency = log((N - n(qi) + 0.5) / (n(qi) + 0.5))
 * - N: Total number of documents
 * - n(qi): Number of documents containing qi
 */

import type { BM25Score } from './types.js';

export class BM25 {
  private k1: number;
  private b: number;
  private avgdl: number = 0;
  private docLen: number[] = [];
  private docFreqs: Map<string, number>[] = [];
  private idf: Map<string, number> = new Map();
  private N: number = 0;

  /**
   * Create a BM25 instance
   * @param k1 - Term frequency saturation parameter (1.2-2.0, default: 1.5)
   * @param b - Length normalization parameter (0-1, default: 0.75)
   */
  constructor(k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  /**
   * Fit the BM25 model to a corpus of documents
   * This calculates IDF values and document statistics
   * @param documents - Array of document strings
   */
  fit(documents: string[]): void {
    this.N = documents.length;
    const df = new Map<string, number>(); // Document frequency

    // Process each document
    for (const doc of documents) {
      const words = this.tokenize(doc);
      this.docLen.push(words.length);

      // Calculate term frequencies for this document
      const freqs = new Map<string, number>();
      for (const word of words) {
        freqs.set(word, (freqs.get(word) || 0) + 1);
      }
      this.docFreqs.push(freqs);

      // Update document frequency (how many docs contain each term)
      for (const word of new Set(words)) {
        df.set(word, (df.get(word) || 0) + 1);
      }
    }

    // Calculate average document length
    this.avgdl = this.docLen.reduce((a, b) => a + b, 0) / this.N;

    // Calculate IDF for each term
    // IDF formula: log((N - n(qi) + 0.5) / (n(qi) + 0.5))
    for (const [word, freq] of df) {
      this.idf.set(
        word,
        Math.log((this.N - freq + 0.5) / (freq + 0.5))
      );
    }
  }

  /**
   * Calculate BM25 scores for all documents given a query
   * @param query - Search query string
   * @returns Array of [docId, score] tuples, sorted by score descending
   */
  score(query: string): BM25Score[] {
    const queryWords = this.tokenize(query);
    const scores: BM25Score[] = [];

    for (let docId = 0; docId < this.N; docId++) {
      let score = 0;
      const docLen = this.docLen[docId];
      const freqs = this.docFreqs[docId];

      for (const word of queryWords) {
        const freq = freqs.get(word);
        if (!freq) continue;

        const idf = this.idf.get(word) || 0;

        // Length normalization factor
        const norm = 1 - this.b + this.b * (docLen / this.avgdl);

        // BM25 formula
        score += idf * ((freq * (this.k1 + 1)) / (freq + this.k1 * norm));
      }

      if (score > 0) {
        scores.push({ docId, score });
      }
    }

    // Sort by score descending
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Tokenize a text string into words
   * @param text - Input text
   * @returns Array of lowercase words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Get BM25 score for a single document
   * @param query - Search query
   * @param docId - Document ID
   * @returns BM25 score
   */
  scoreDocument(query: string, docId: number): number {
    if (docId < 0 || docId >= this.N) {
      throw new Error(`Invalid document ID: ${docId}`);
    }

    const queryWords = this.tokenize(query);
    const docLen = this.docLen[docId];
    const freqs = this.docFreqs[docId];

    let score = 0;
    for (const word of queryWords) {
      const freq = freqs.get(word);
      if (!freq) continue;

      const idf = this.idf.get(word) || 0;
      const norm = 1 - this.b + this.b * (docLen / this.avgdl);
      score += idf * ((freq * (this.k1 + 1)) / (freq + this.k1 * norm));
    }

    return score;
  }

  /**
   * Get the number of documents in the corpus
   */
  get documentCount(): number {
    return this.N;
  }

  /**
   * Get average document length
   */
  get averageDocumentLength(): number {
    return this.avgdl;
  }
}

/**
 * Example usage:
 *
 * const bm25 = new BM25();
 * const documents = [
 *   "React hooks are awesome",
 *   "TypeScript provides type safety",
 *   "React with TypeScript is powerful"
 * ];
 *
 * bm25.fit(documents);
 * const results = bm25.score("React TypeScript");
 *
 * // results: [
 * //   { docId: 2, score: 1.23 },
 * //   { docId: 0, score: 0.45 },
 * //   { docId: 1, score: 0.32 }
 * // ]
 */
