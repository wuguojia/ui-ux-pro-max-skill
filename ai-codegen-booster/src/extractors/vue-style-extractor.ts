/**
 * Vue Style Extractor - Extract styles from Vue SFC <style> tags
 */

import { parse, type SFCStyleBlock } from '@vue/compiler-sfc';
import { extractCSS } from './css-extractor.js';
import { extractLess } from './less-extractor.js';
import { extractSass } from './sass-extractor.js';

export interface VueStyleBlock {
  content: string;
  scoped: boolean;
  lang: string;
}

export interface ExtractedVueStyles {
  styles: VueStyleBlock[];
  variables: Array<{
    name: string;
    value: string;
    category: string;
    lang: string;
  }>;
  utilities: Array<{
    selector: string;
    properties: Record<string, string>;
    category: string;
    scoped: boolean;
  }>;
}

/**
 * Extract styles from Vue SFC <style> tags
 */
export async function extractVueStyles(content: string): Promise<ExtractedVueStyles> {
  const { descriptor } = parse(content);

  const styles: VueStyleBlock[] = [];
  const allVariables: ExtractedVueStyles['variables'] = [];
  const allUtilities: ExtractedVueStyles['utilities'] = [];

  // Process each style block
  for (const styleBlock of descriptor.styles) {
    const lang = styleBlock.lang || 'css';
    const scoped = styleBlock.scoped || false;

    styles.push({
      content: styleBlock.content,
      scoped,
      lang,
    });

    // Extract based on language
    if (lang === 'less') {
      const result = await extractLess(styleBlock.content);
      result.variables.forEach(v => {
        allVariables.push({ ...v, lang: 'less' });
      });
      result.utilities.forEach(u => {
        allUtilities.push({ ...u, scoped });
      });
    } else if (lang === 'scss' || lang === 'sass') {
      const result = await extractSass(styleBlock.content);
      result.variables.forEach(v => {
        allVariables.push({ ...v, lang: 'scss' });
      });
      result.utilities.forEach(u => {
        allUtilities.push({ ...u, scoped });
      });
    } else {
      // CSS
      const result = await extractCSS(styleBlock.content);
      result.variables.forEach(v => {
        allVariables.push({ ...v, lang: 'css' });
      });
      result.utilities.forEach(u => {
        allUtilities.push({ ...u, scoped });
      });
    }
  }

  return {
    styles,
    variables: allVariables,
    utilities: allUtilities,
  };
}
