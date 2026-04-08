/**
 * Documentation Extractor - Extract documentation from JSDoc, TSDoc, and Markdown
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface DocComment {
  description: string;
  params: ParamDoc[];
  returns?: string;
  examples: string[];
  tags: Record<string, string>;
}

export interface ParamDoc {
  name: string;
  type?: string;
  description: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ComponentDoc {
  componentName: string;
  description: string;
  props: PropDoc[];
  events: EventDoc[];
  slots: SlotDoc[];
  examples: string[];
  usage: string;
}

export interface PropDoc {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface EventDoc {
  name: string;
  description: string;
  payload?: string;
}

export interface SlotDoc {
  name: string;
  description: string;
  props?: string;
}

export interface MarkdownDoc {
  title: string;
  sections: MarkdownSection[];
  codeBlocks: CodeBlock[];
  links: Link[];
}

export interface MarkdownSection {
  heading: string;
  level: number;
  content: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  description?: string;
}

export interface Link {
  text: string;
  url: string;
  type: 'internal' | 'external';
}

/**
 * Extract JSDoc/TSDoc comments from TypeScript/JavaScript code
 */
export async function extractJSDoc(code: string): Promise<Map<string, DocComment>> {
  const docs = new Map<string, DocComment>();

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  traverse(ast, {
    FunctionDeclaration(path) {
      const leadingComments = path.node.leadingComments;
      if (leadingComments && leadingComments.length > 0) {
        const comment = leadingComments[leadingComments.length - 1];
        if (comment.type === 'CommentBlock' && comment.value.startsWith('*')) {
          const docComment = parseJSDocComment(comment.value);
          if (path.node.id) {
            docs.set(path.node.id.name, docComment);
          }
        }
      }
    },

    VariableDeclaration(path) {
      const leadingComments = path.node.leadingComments;
      if (leadingComments && leadingComments.length > 0) {
        const comment = leadingComments[leadingComments.length - 1];
        if (comment.type === 'CommentBlock' && comment.value.startsWith('*')) {
          const docComment = parseJSDocComment(comment.value);
          path.node.declarations.forEach((decl) => {
            if (t.isIdentifier(decl.id)) {
              docs.set(decl.id.name, docComment);
            }
          });
        }
      }
    },

    ClassDeclaration(path) {
      const leadingComments = path.node.leadingComments;
      if (leadingComments && leadingComments.length > 0) {
        const comment = leadingComments[leadingComments.length - 1];
        if (comment.type === 'CommentBlock' && comment.value.startsWith('*')) {
          const docComment = parseJSDocComment(comment.value);
          if (path.node.id) {
            docs.set(path.node.id.name, docComment);
          }
        }
      }
    },
  });

  return docs;
}

/**
 * Parse JSDoc comment string
 */
function parseJSDocComment(comment: string): DocComment {
  const lines = comment.split('\n').map(line => line.trim().replace(/^\*\s*/, ''));

  const doc: DocComment = {
    description: '',
    params: [],
    examples: [],
    tags: {},
  };

  let currentSection: 'description' | 'param' | 'returns' | 'example' | 'tag' = 'description';
  let descriptionLines: string[] = [];
  let exampleLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('@param')) {
      currentSection = 'param';
      const paramMatch = line.match(/@param\s+(?:\{([^}]+)\}\s+)?(\w+)(?:\s+-\s+)?(.+)?/);
      if (paramMatch) {
        doc.params.push({
          name: paramMatch[2],
          type: paramMatch[1] || undefined,
          description: paramMatch[3] || '',
          optional: paramMatch[2].includes('?') || line.includes('['),
        });
      }
    } else if (line.startsWith('@returns') || line.startsWith('@return')) {
      currentSection = 'returns';
      const returnsMatch = line.match(/@returns?\s+(?:\{([^}]+)\}\s+)?(.+)?/);
      if (returnsMatch) {
        doc.returns = returnsMatch[2] || returnsMatch[1] || '';
      }
    } else if (line.startsWith('@example')) {
      currentSection = 'example';
      exampleLines = [];
    } else if (line.startsWith('@')) {
      currentSection = 'tag';
      const tagMatch = line.match(/@(\w+)\s+(.+)/);
      if (tagMatch) {
        doc.tags[tagMatch[1]] = tagMatch[2];
      }
    } else {
      if (currentSection === 'description') {
        descriptionLines.push(line);
      } else if (currentSection === 'example') {
        exampleLines.push(line);
        if (exampleLines.length > 0 && lines[lines.indexOf(line) + 1]?.startsWith('@')) {
          doc.examples.push(exampleLines.join('\n'));
          exampleLines = [];
        }
      } else if (currentSection === 'param' && doc.params.length > 0) {
        const lastParam = doc.params[doc.params.length - 1];
        lastParam.description += ' ' + line;
      } else if (currentSection === 'returns' && doc.returns) {
        doc.returns += ' ' + line;
      }
    }
  }

  doc.description = descriptionLines.join(' ').trim();
  if (exampleLines.length > 0) {
    doc.examples.push(exampleLines.join('\n'));
  }

  return doc;
}

/**
 * Extract documentation from Markdown files
 */
export async function extractMarkdown(markdown: string): Promise<MarkdownDoc> {
  const doc: MarkdownDoc = {
    title: '',
    sections: [],
    codeBlocks: [],
    links: [],
  };

  const lines = markdown.split('\n');
  let currentSection: MarkdownSection | null = null;
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract title (first h1)
    if (!doc.title && line.startsWith('# ')) {
      doc.title = line.substring(2).trim();
      continue;
    }

    // Extract headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch && !inCodeBlock) {
      if (currentSection) {
        doc.sections.push(currentSection);
      }
      currentSection = {
        heading: headingMatch[2].trim(),
        level: headingMatch[1].length,
        content: '',
      };
      continue;
    }

    // Extract code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = line.substring(3).trim();
        codeBlockLines = [];
      } else {
        inCodeBlock = false;
        doc.codeBlocks.push({
          language: codeBlockLang,
          code: codeBlockLines.join('\n'),
        });
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Extract links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(line)) !== null) {
      doc.links.push({
        text: linkMatch[1],
        url: linkMatch[2],
        type: linkMatch[2].startsWith('http') ? 'external' : 'internal',
      });
    }

    // Add to current section content
    if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    doc.sections.push(currentSection);
  }

  return doc;
}

/**
 * Extract component documentation from component file
 */
export async function extractComponentDoc(code: string, framework: 'React' | 'Vue'): Promise<ComponentDoc | null> {
  if (framework === 'React') {
    return extractReactComponentDoc(code);
  } else if (framework === 'Vue') {
    return extractVueComponentDoc(code);
  }
  return null;
}

/**
 * Extract React component documentation
 */
async function extractReactComponentDoc(code: string): Promise<ComponentDoc | null> {
  const jsDocs = await extractJSDoc(code);

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let componentName = '';
  let componentDoc: ComponentDoc | null = null;

  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.id && /^[A-Z]/.test(path.node.id.name)) {
        componentName = path.node.id.name;
        const doc = jsDocs.get(componentName);

        if (doc) {
          componentDoc = {
            componentName,
            description: doc.description,
            props: doc.params.map(p => ({
              name: p.name,
              type: p.type || 'any',
              description: p.description,
              required: !p.optional,
              defaultValue: p.defaultValue,
            })),
            events: [],
            slots: [],
            examples: doc.examples,
            usage: doc.examples[0] || '',
          };
        }
      }
    },
  });

  return componentDoc;
}

/**
 * Extract Vue component documentation
 */
async function extractVueComponentDoc(code: string): Promise<ComponentDoc | null> {
  // Simple extraction for Vue components
  // In a real implementation, you would parse the Vue SFC properly
  const doc: ComponentDoc = {
    componentName: '',
    description: '',
    props: [],
    events: [],
    slots: [],
    examples: [],
    usage: '',
  };

  // Extract component name from script setup or export default
  const nameMatch = code.match(/name:\s*['"]([^'"]+)['"]/);
  if (nameMatch) {
    doc.componentName = nameMatch[1];
  }

  // Extract JSDoc if present
  const jsDocs = await extractJSDoc(code);
  if (jsDocs.size > 0) {
    const firstDoc = Array.from(jsDocs.values())[0];
    doc.description = firstDoc.description;
    doc.examples = firstDoc.examples;
  }

  return doc.componentName ? doc : null;
}

/**
 * Extract usage examples from code
 */
export function extractUsageExamples(markdown: string): string[] {
  const examples: string[] = [];
  const codeBlockRegex = /```(?:tsx?|jsx?|vue)\n([\s\S]*?)```/g;

  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    examples.push(match[1].trim());
  }

  return examples;
}
