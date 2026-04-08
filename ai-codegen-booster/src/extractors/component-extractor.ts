/**
 * Component Extractor - Extract React component information
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ComponentInfo {
  name: string;
  props: PropInfo[];
  dependencies: string[];
  fullCode: string;
}

/**
 * Extract component information from React/TypeScript code
 */
export async function extractComponent(code: string): Promise<ComponentInfo> {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let componentName = '';
  let propsInterface: PropInfo[] = [];
  const dependencies: string[] = [];
  const interfaceProps: Map<string, PropInfo[]> = new Map();

  traverse(ast, {
    // Find function declarations
    FunctionDeclaration(path) {
      if (path.node.id && isComponentFunction(path.node.id.name)) {
        componentName = path.node.id.name;

        // Extract props from parameters
        const params = path.node.params;
        if (params.length > 0) {
          propsInterface = extractPropsFromParams(params[0]);

          // If props interface wasn't extracted from params, check if we have a matching interface
          if (propsInterface.length === 0) {
            const propsInterfaceName = componentName + 'Props';
            if (interfaceProps.has(propsInterfaceName)) {
              propsInterface = interfaceProps.get(propsInterfaceName)!;
            }
          }
        }
      }
    },

    // Find arrow function exports
    VariableDeclaration(path) {
      path.node.declarations.forEach((decl) => {
        if (
          t.isIdentifier(decl.id) &&
          isComponentFunction(decl.id.name) &&
          t.isArrowFunctionExpression(decl.init)
        ) {
          componentName = decl.id.name;
        }
      });
    },

    // Find TypeScript interface definitions
    TSInterfaceDeclaration(path) {
      const name = path.node.id.name;
      if (name.endsWith('Props')) {
        const extractedProps = extractPropsFromInterface(path.node);
        interfaceProps.set(name, extractedProps);

        // If component name is already known and matches, use these props
        if (componentName && name.startsWith(componentName)) {
          propsInterface = extractedProps;
        }
      }
    },

    // Extract import dependencies
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (source.startsWith('@/components') || source.startsWith('./') || source.startsWith('../')) {
        path.node.specifiers.forEach((spec) => {
          if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
            dependencies.push(spec.imported.name);
          } else if (t.isImportDefaultSpecifier(spec)) {
            dependencies.push(spec.local.name);
          }
        });
      }
    },
  });

  return {
    name: componentName,
    props: propsInterface,
    dependencies,
    fullCode: code,
  };
}

/**
 * Check if name is a React component (starts with uppercase)
 */
function isComponentFunction(name: string): boolean {
  return /^[A-Z]/.test(name);
}

/**
 * Extract props from function parameters
 */
function extractPropsFromParams(param: any): PropInfo[] {
  if (t.isIdentifier(param) && param.typeAnnotation) {
    const typeAnnotation = param.typeAnnotation;
    if (t.isTSTypeAnnotation(typeAnnotation)) {
      return extractPropsFromType(typeAnnotation.typeAnnotation);
    }
  }
  return [];
}

/**
 * Extract props from TypeScript type
 */
export function extractPropsFromType(typeNode: any): PropInfo[] {
  const props: PropInfo[] = [];

  if (t.isTSTypeLiteral(typeNode)) {
    typeNode.members.forEach((member: any) => {
      if (t.isTSPropertySignature(member) && t.isIdentifier(member.key)) {
        props.push({
          name: member.key.name,
          type: typeNodeToString(member.typeAnnotation?.typeAnnotation),
          required: !member.optional,
        });
      }
    });
  }

  return props;
}

/**
 * Extract props from interface declaration
 */
function extractPropsFromInterface(node: t.TSInterfaceDeclaration): PropInfo[] {
  const props: PropInfo[] = [];

  node.body.body.forEach((member) => {
    if (t.isTSPropertySignature(member) && t.isIdentifier(member.key)) {
      props.push({
        name: member.key.name,
        type: typeNodeToString(member.typeAnnotation?.typeAnnotation),
        required: !member.optional,
      });
    }
  });

  return props;
}

/**
 * Convert TypeScript type node to string representation
 */
export function typeNodeToString(typeNode: any): string {
  if (!typeNode) return 'any';

  if (typeNode.type === 'TSStringKeyword') return 'string';
  if (typeNode.type === 'TSNumberKeyword') return 'number';
  if (typeNode.type === 'TSBooleanKeyword') return 'boolean';

  if (t.isTSUnionType(typeNode)) {
    return typeNode.types.map(typeNodeToString).join(' | ');
  }

  if (t.isTSLiteralType(typeNode)) {
    if (t.isStringLiteral(typeNode.literal)) {
      return `'${typeNode.literal.value}'`;
    }
    if (t.isNumericLiteral(typeNode.literal)) {
      return typeNode.literal.value.toString();
    }
  }

  return 'unknown';
}
