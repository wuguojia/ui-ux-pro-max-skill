/**
 * Vue Component Extractor - Extract Vue component information
 */

import { parse, type SFCDescriptor } from '@vue/compiler-sfc';
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface VueComponentInfo {
  name: string;
  framework: 'Vue';
  props: PropInfo[];
  events: string[];
  slots: string[];
  apiStyle: 'Composition' | 'Options' | 'Unknown';
  fullCode: string;
}

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

/**
 * Extract component information from Vue SFC
 */
export async function extractVueComponent(content: string): Promise<VueComponentInfo> {
  const { descriptor } = parse(content);

  const componentName = extractComponentName(descriptor);
  const apiStyle = detectAPIStyle(descriptor);
  const props = extractProps(descriptor);
  const events = extractEvents(descriptor);
  const slots = extractSlots(descriptor);

  return {
    name: componentName,
    framework: 'Vue',
    props,
    events,
    slots,
    apiStyle,
    fullCode: content,
  };
}

/**
 * Extract component name from descriptor
 */
function extractComponentName(descriptor: SFCDescriptor): string {
  // Try to get name from Options API
  if (descriptor.script && descriptor.script.content) {
    const nameMatch = descriptor.script.content.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      return nameMatch[1];
    }
  }

  // Default to 'Component' if no name found
  return 'Component';
}

/**
 * Detect API style (Composition or Options)
 */
function detectAPIStyle(descriptor: SFCDescriptor): 'Composition' | 'Options' | 'Unknown' {
  const scriptSetup = descriptor.scriptSetup;
  const script = descriptor.script;

  if (scriptSetup) {
    return 'Composition';
  }

  if (script && script.content.includes('export default')) {
    return 'Options';
  }

  return 'Unknown';
}

/**
 * Extract props from Vue component
 */
function extractProps(descriptor: SFCDescriptor): PropInfo[] {
  const props: PropInfo[] = [];

  // Composition API (script setup)
  if (descriptor.scriptSetup) {
    const content = descriptor.scriptSetup.content;

    // Extract from defineProps with TypeScript
    const definePropsMatch = content.match(/defineProps<\{([^}]+)\}>/s);
    if (definePropsMatch) {
      const propsStr = definePropsMatch[1];
      const propMatches = propsStr.matchAll(/(\w+)(\?)?:\s*([^;]+);/g);

      for (const match of propMatches) {
        props.push({
          name: match[1],
          type: match[3].trim(),
          required: !match[2], // No '?' means required
        });
      }
    }

    // Extract from defineProps with runtime
    const runtimePropsMatch = content.match(/defineProps\(\{([^}]+)\}\)/s);
    if (runtimePropsMatch) {
      // Parse runtime props (more complex, simplified here)
      const propsStr = runtimePropsMatch[1];
      const propNames = propsStr.match(/(\w+):/g);
      if (propNames) {
        propNames.forEach((name) => {
          props.push({
            name: name.replace(':', ''),
            type: 'any',
            required: false,
          });
        });
      }
    }
  }

  // Options API
  if (descriptor.script) {
    try {
      const ast = babelParser.parse(descriptor.script.content, {
        sourceType: 'module',
        plugins: ['typescript'],
      });

      traverse(ast, {
        ObjectProperty(path) {
          if (
            t.isIdentifier(path.node.key) &&
            path.node.key.name === 'props' &&
            t.isObjectExpression(path.node.value)
          ) {
            path.node.value.properties.forEach((prop) => {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                const propName = prop.key.name;
                let propType = 'any';
                let required = false;

                // Extract type and required from Options API prop definition
                if (t.isObjectExpression(prop.value)) {
                  prop.value.properties.forEach((innerProp) => {
                    if (t.isObjectProperty(innerProp) && t.isIdentifier(innerProp.key)) {
                      if (innerProp.key.name === 'type' && t.isIdentifier(innerProp.value)) {
                        propType = innerProp.value.name;
                      }
                      if (innerProp.key.name === 'required' && t.isBooleanLiteral(innerProp.value)) {
                        required = innerProp.value.value;
                      }
                    }
                  });
                }

                props.push({
                  name: propName,
                  type: propType,
                  required,
                });
              }
            });
          }
        },
      });
    } catch (error) {
      console.warn('Failed to parse Vue script:', error);
    }
  }

  return props;
}

/**
 * Extract events (emits) from Vue component
 */
function extractEvents(descriptor: SFCDescriptor): string[] {
  const events: string[] = [];

  if (descriptor.scriptSetup) {
    const content = descriptor.scriptSetup.content;

    // Extract from defineEmits with TypeScript
    const defineEmitsMatch = content.match(/defineEmits<\{([^}]+)\}>/s);
    if (defineEmitsMatch) {
      const emitsStr = defineEmitsMatch[1];
      const eventMatches = emitsStr.matchAll(/(\w+):/g);

      for (const match of eventMatches) {
        events.push(match[1]);
      }
    }

    // Extract from emit calls
    const emitMatches = content.matchAll(/emit\(['"](\w+)['"]/g);
    for (const match of emitMatches) {
      if (!events.includes(match[1])) {
        events.push(match[1]);
      }
    }
  }

  return events;
}

/**
 * Extract slots from Vue template
 */
function extractSlots(descriptor: SFCDescriptor): string[] {
  const slots: string[] = [];

  if (descriptor.template) {
    const content = descriptor.template.content;

    // Extract named slots
    const namedSlotMatches = content.matchAll(/<slot\s+name=['"](\w+)['"]/g);
    for (const match of namedSlotMatches) {
      slots.push(match[1]);
    }

    // Check for default slot
    if (content.includes('<slot') && !content.match(/<slot\s+name=/)) {
      slots.push('default');
    } else if (content.match(/<slot\s*\/?>/) || content.match(/<slot\s*><\/slot>/)) {
      if (!slots.includes('default')) {
        slots.push('default');
      }
    }
  }

  return slots;
}
