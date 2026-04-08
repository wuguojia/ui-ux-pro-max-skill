/**
 * React Hooks Extractor - Extract React Hooks, Context, and advanced patterns
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface HookInfo {
  name: string;
  type: 'useState' | 'useEffect' | 'useContext' | 'useRef' | 'useMemo' | 'useCallback' | 'useReducer' | 'custom';
  parameters: string[];
  returnType?: string;
  dependencies?: string[];
}

export interface ContextInfo {
  name: string;
  defaultValue?: string;
  providerProps?: string[];
  consumerPattern?: string;
}

export interface CustomHookInfo {
  name: string;
  parameters: HookParameter[];
  returnType: string;
  usesHooks: string[];
  description?: string;
}

export interface HookParameter {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
}

export interface GenericInfo {
  name: string;
  constraint?: string;
  defaultType?: string;
}

export interface EnhancedComponentInfo {
  name: string;
  props: PropInfo[];
  hooks: HookInfo[];
  contexts: ContextInfo[];
  customHooks: CustomHookInfo[];
  generics: GenericInfo[];
  stateVariables: StateVariable[];
  effects: EffectInfo[];
}

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface StateVariable {
  name: string;
  setter: string;
  initialValue?: string;
  type?: string;
}

export interface EffectInfo {
  dependencies: string[];
  hasCleanup: boolean;
  description?: string;
}

/**
 * Extract enhanced React component information including Hooks and Context
 */
export async function extractEnhancedReactComponent(code: string): Promise<EnhancedComponentInfo> {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let componentName = '';
  const hooks: HookInfo[] = [];
  const contexts: ContextInfo[] = [];
  const customHooks: CustomHookInfo[] = [];
  const generics: GenericInfo[] = [];
  const stateVariables: StateVariable[] = [];
  const effects: EffectInfo[] = [];
  const props: PropInfo[] = [];

  traverse(ast, {
    // Extract component name and generics
    FunctionDeclaration(path) {
      if (path.node.id && /^[A-Z]/.test(path.node.id.name)) {
        componentName = path.node.id.name;

        // Extract generics
        if (path.node.typeParameters) {
          generics.push(...extractGenerics(path.node.typeParameters));
        }

        // Extract props
        if (path.node.params.length > 0) {
          props.push(...extractPropsWithDefaults(path.node.params[0]));
        }
      }
    },

    // Extract custom hooks (functions starting with 'use')
    FunctionDeclaration(path) {
      if (path.node.id && path.node.id.name.startsWith('use') && path.node.id.name !== 'use') {
        const customHook = extractCustomHook(path.node);
        if (customHook) {
          customHooks.push(customHook);
        }
      }
    },

    VariableDeclaration(path) {
      path.node.declarations.forEach((decl) => {
        if (
          t.isIdentifier(decl.id) &&
          decl.id.name.startsWith('use') &&
          t.isArrowFunctionExpression(decl.init)
        ) {
          const customHook = extractCustomHookFromArrow(decl.id.name, decl.init);
          if (customHook) {
            customHooks.push(customHook);
          }
        }
      });
    },

    // Extract Context creation
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object) &&
        path.node.callee.object.name === 'React' &&
        t.isIdentifier(path.node.callee.property) &&
        path.node.callee.property.name === 'createContext'
      ) {
        const contextInfo = extractContext(path.node);
        if (contextInfo) {
          contexts.push(contextInfo);
        }
      }

      // Extract createContext without React prefix
      if (
        t.isIdentifier(path.node.callee) &&
        path.node.callee.name === 'createContext'
      ) {
        const contextInfo = extractContext(path.node);
        if (contextInfo) {
          contexts.push(contextInfo);
        }
      }

      // Extract Hook calls
      if (t.isIdentifier(path.node.callee)) {
        const hookName = path.node.callee.name;
        if (hookName.startsWith('use')) {
          const hookInfo = extractHookCall(path.node);
          if (hookInfo) {
            hooks.push(hookInfo);

            // Track state variables
            if (hookInfo.type === 'useState') {
              const stateVar = extractStateVariable(path.parent);
              if (stateVar) {
                stateVariables.push(stateVar);
              }
            }

            // Track effects
            if (hookInfo.type === 'useEffect') {
              const effectInfo = extractEffectInfo(path.node);
              if (effectInfo) {
                effects.push(effectInfo);
              }
            }
          }
        }
      }
    },
  });

  return {
    name: componentName,
    props,
    hooks,
    contexts,
    customHooks,
    generics,
    stateVariables,
    effects,
  };
}

/**
 * Extract generic type parameters
 */
function extractGenerics(typeParameters: t.TSTypeParameterDeclaration | t.TypeParameterDeclaration): GenericInfo[] {
  const generics: GenericInfo[] = [];

  typeParameters.params.forEach((param) => {
    if (t.isTSTypeParameter(param)) {
      const generic: GenericInfo = {
        name: param.name,
      };

      if (param.constraint) {
        generic.constraint = typeToString(param.constraint);
      }

      if (param.default) {
        generic.defaultType = typeToString(param.default);
      }

      generics.push(generic);
    }
  });

  return generics;
}

/**
 * Extract props with default values
 */
function extractPropsWithDefaults(param: any): PropInfo[] {
  const props: PropInfo[] = [];

  if (t.isObjectPattern(param)) {
    param.properties.forEach((prop: any) => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const propInfo: PropInfo = {
          name: prop.key.name,
          type: 'any',
          required: true,
        };

        // Extract default value
        if (t.isAssignmentPattern(prop.value) && t.isIdentifier(prop.value.left)) {
          propInfo.required = false;
          propInfo.defaultValue = generateCodeFromNode(prop.value.right);
        }

        props.push(propInfo);
      }
    }
);
  } else if (t.isIdentifier(param) && param.typeAnnotation) {
    // Extract from type annotation
    const typeAnnotation = param.typeAnnotation;
    if (t.isTSTypeAnnotation(typeAnnotation) && t.isTSTypeLiteral(typeAnnotation.typeAnnotation)) {
      typeAnnotation.typeAnnotation.members.forEach((member: any) => {
        if (t.isTSPropertySignature(member) && t.isIdentifier(member.key)) {
          props.push({
            name: member.key.name,
            type: typeToString(member.typeAnnotation?.typeAnnotation),
            required: !member.optional,
          });
        }
      });
    }
  }

  return props;
}

/**
 * Extract custom hook information
 */
function extractCustomHook(node: t.FunctionDeclaration): CustomHookInfo | null {
  if (!node.id) return null;

  const hookInfo: CustomHookInfo = {
    name: node.id.name,
    parameters: [],
    returnType: 'any',
    usesHooks: [],
  };

  // Extract parameters
  node.params.forEach((param) => {
    if (t.isIdentifier(param)) {
      hookInfo.parameters.push({
        name: param.name,
        type: param.typeAnnotation ? typeToString((param.typeAnnotation as any).typeAnnotation) : 'any',
        optional: false,
      });
    }
  });

  // Extract return type
  if (node.returnType) {
    hookInfo.returnType = typeToString((node.returnType as any).typeAnnotation);
  }

  return hookInfo;
}

/**
 * Extract custom hook from arrow function
 */
function extractCustomHookFromArrow(name: string, node: t.ArrowFunctionExpression): CustomHookInfo | null {
  return {
    name,
    parameters: [],
    returnType: 'any',
    usesHooks: [],
  };
}

/**
 * Extract Context information
 */
function extractContext(node: t.CallExpression): ContextInfo | null {
  const contextInfo: ContextInfo = {
    name: 'UnknownContext',
  };

  // Extract default value
  if (node.arguments.length > 0) {
    contextInfo.defaultValue = generateCodeFromNode(node.arguments[0]);
  }

  return contextInfo;
}

/**
 * Extract Hook call information
 */
function extractHookCall(node: t.CallExpression): HookInfo | null {
  if (!t.isIdentifier(node.callee)) return null;

  const hookName = node.callee.name;
  const hookInfo: HookInfo = {
    name: hookName,
    type: getHookType(hookName),
    parameters: [],
  };

  // Extract parameters
  node.arguments.forEach((arg) => {
    hookInfo.parameters.push(generateCodeFromNode(arg));
  });

  // Extract dependencies for useEffect, useMemo, useCallback
  if (['useEffect', 'useMemo', 'useCallback'].includes(hookName)) {
    const depsArg = node.arguments[1];
    if (depsArg && t.isArrayExpression(depsArg)) {
      hookInfo.dependencies = depsArg.elements.map((el) =>
        el && t.isIdentifier(el) ? el.name : 'unknown'
      ).filter(Boolean);
    }
  }

  return hookInfo;
}

/**
 * Determine hook type
 */
function getHookType(hookName: string): HookInfo['type'] {
  const builtInHooks: Record<string, HookInfo['type']> = {
    useState: 'useState',
    useEffect: 'useEffect',
    useContext: 'useContext',
    useRef: 'useRef',
    useMemo: 'useMemo',
    useCallback: 'useCallback',
    useReducer: 'useReducer',
  };

  return builtInHooks[hookName] || 'custom';
}

/**
 * Extract state variable from useState destructuring
 */
function extractStateVariable(parent: any): StateVariable | null {
  if (t.isVariableDeclarator(parent) && t.isArrayPattern(parent.id)) {
    const [stateVar, setter] = parent.id.elements;
    if (stateVar && setter && t.isIdentifier(stateVar) && t.isIdentifier(setter)) {
      const initialValue = t.isCallExpression(parent.init) && parent.init.arguments[0]
        ? generateCodeFromNode(parent.init.arguments[0])
        : undefined;

      return {
        name: stateVar.name,
        setter: setter.name,
        initialValue,
      };
    }
  }
  return null;
}

/**
 * Extract effect information
 */
function extractEffectInfo(node: t.CallExpression): EffectInfo | null {
  if (node.arguments.length === 0) return null;

  const effectInfo: EffectInfo = {
    dependencies: [],
    hasCleanup: false,
  };

  // Check for cleanup function
  const effectCallback = node.arguments[0];
  if (t.isArrowFunctionExpression(effectCallback) || t.isFunctionExpression(effectCallback)) {
    const body = effectCallback.body;
    if (t.isBlockStatement(body)) {
      const returnStatement = body.body.find(stmt => t.isReturnStatement(stmt));
      if (returnStatement) {
        effectInfo.hasCleanup = true;
      }
    }
  }

  // Extract dependencies
  if (node.arguments.length > 1) {
    const depsArg = node.arguments[1];
    if (t.isArrayExpression(depsArg)) {
      effectInfo.dependencies = depsArg.elements.map((el) =>
        el && t.isIdentifier(el) ? el.name : 'unknown'
      ).filter(Boolean);
    }
  }

  return effectInfo;
}

/**
 * Convert type node to string
 */
function typeToString(typeNode: any): string {
  if (!typeNode) return 'any';

  if (typeNode.type === 'TSStringKeyword') return 'string';
  if (typeNode.type === 'TSNumberKeyword') return 'number';
  if (typeNode.type === 'TSBooleanKeyword') return 'boolean';
  if (typeNode.type === 'TSAnyKeyword') return 'any';

  if (t.isTSUnionType(typeNode)) {
    return typeNode.types.map(typeToString).join(' | ');
  }

  if (t.isTSArrayType(typeNode)) {
    return typeToString(typeNode.elementType) + '[]';
  }

  if (t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) {
    return typeNode.typeName.name;
  }

  return 'unknown';
}

/**
 * Generate code from AST node (simplified)
 */
function generateCodeFromNode(node: any): string {
  if (t.isStringLiteral(node)) return `'${node.value}'`;
  if (t.isNumericLiteral(node)) return node.value.toString();
  if (t.isBooleanLiteral(node)) return node.value.toString();
  if (t.isNullLiteral(node)) return 'null';
  if (t.isIdentifier(node)) return node.name;
  if (t.isArrayExpression(node)) return '[]';
  if (t.isObjectExpression(node)) return '{}';
  if (t.isArrowFunctionExpression(node)) return '() => {}';
  return 'unknown';
}
