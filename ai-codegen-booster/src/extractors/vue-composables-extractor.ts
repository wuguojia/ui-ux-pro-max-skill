/**
 * Vue Composables and Directives Extractor
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface ComposableInfo {
  name: string;
  parameters: ComposableParameter[];
  returnType: string;
  usesComposables: string[];
  usesVueAPIs: string[];
  description?: string;
}

export interface ComposableParameter {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
}

export interface DirectiveInfo {
  name: string;
  hooks: DirectiveHook[];
  value?: string;
  modifiers?: string[];
  binding?: DirectiveBinding;
}

export interface DirectiveHook {
  name: 'mounted' | 'updated' | 'unmounted' | 'beforeMount' | 'beforeUpdate' | 'beforeUnmount';
  parameters: string[];
}

export interface DirectiveBinding {
  value?: string;
  oldValue?: string;
  arg?: string;
  modifiers?: string[];
}

export interface VueReactivityInfo {
  refs: RefInfo[];
  computed: ComputedInfo[];
  watchers: WatcherInfo[];
  reactives: ReactiveInfo[];
}

export interface RefInfo {
  name: string;
  initialValue?: string;
  type?: string;
}

export interface ComputedInfo {
  name: string;
  dependencies: string[];
  getter: boolean;
  setter: boolean;
}

export interface WatcherInfo {
  source: string;
  dependencies: string[];
  immediate: boolean;
  deep: boolean;
}

export interface ReactiveInfo {
  name: string;
  properties: string[];
  type?: string;
}

export interface EnhancedVueComponentInfo {
  componentName: string;
  composables: ComposableInfo[];
  directives: DirectiveInfo[];
  reactivity: VueReactivityInfo;
  lifecycleHooks: string[];
  provides: ProvideInfo[];
  injects: InjectInfo[];
}

export interface ProvideInfo {
  key: string;
  value: string;
}

export interface InjectInfo {
  key: string;
  defaultValue?: string;
}

/**
 * Extract enhanced Vue component information including Composables and Directives
 */
export async function extractEnhancedVueComponent(code: string): Promise<EnhancedVueComponentInfo> {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  let componentName = '';
  const composables: ComposableInfo[] = [];
  const directives: DirectiveInfo[] = [];
  const reactivity: VueReactivityInfo = {
    refs: [],
    computed: [],
    watchers: [],
    reactives: [],
  };
  const lifecycleHooks: string[] = [];
  const provides: ProvideInfo[] = [];
  const injects: InjectInfo[] = [];

  traverse(ast, {
    // Extract Composables (functions starting with 'use')
    FunctionDeclaration(path) {
      if (path.node.id && path.node.id.name.startsWith('use')) {
        const composable = extractComposable(path.node);
        if (composable) {
          composables.push(composable);
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
          const composable = extractComposableFromArrow(decl.id.name, decl.init);
          if (composable) {
            composables.push(composable);
          }
        }
      });
    },

    // Extract Vue reactivity APIs
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee)) {
        const apiName = path.node.callee.name;

        // Extract ref()
        if (apiName === 'ref') {
          const refInfo = extractRef(path.node, path.parent);
          if (refInfo) {
            reactivity.refs.push(refInfo);
          }
        }

        // Extract reactive()
        if (apiName === 'reactive') {
          const reactiveInfo = extractReactive(path.node, path.parent);
          if (reactiveInfo) {
            reactivity.reactives.push(reactiveInfo);
          }
        }

        // Extract computed()
        if (apiName === 'computed') {
          const computedInfo = extractComputed(path.node, path.parent);
          if (computedInfo) {
            reactivity.computed.push(computedInfo);
          }
        }

        // Extract watch() / watchEffect()
        if (apiName === 'watch' || apiName === 'watchEffect') {
          const watcherInfo = extractWatcher(path.node);
          if (watcherInfo) {
            reactivity.watchers.push(watcherInfo);
          }
        }

        // Extract lifecycle hooks
        if (isLifecycleHook(apiName)) {
          lifecycleHooks.push(apiName);
        }

        // Extract provide/inject
        if (apiName === 'provide') {
          const provideInfo = extractProvide(path.node);
          if (provideInfo) {
            provides.push(provideInfo);
          }
        }

        if (apiName === 'inject') {
          const injectInfo = extractInject(path.node);
          if (injectInfo) {
            injects.push(injectInfo);
          }
        }
      }
    },

    // Extract custom directives
    ObjectExpression(path) {
      const directiveInfo = extractDirective(path.node);
      if (directiveInfo) {
        directives.push(directiveInfo);
      }
    },
  });

  return {
    componentName,
    composables,
    directives,
    reactivity,
    lifecycleHooks,
    provides,
    injects,
  };
}

/**
 * Extract Composable information
 */
function extractComposable(node: t.FunctionDeclaration): ComposableInfo | null {
  if (!node.id) return null;

  const composable: ComposableInfo = {
    name: node.id.name,
    parameters: [],
    returnType: 'any',
    usesComposables: [],
    usesVueAPIs: [],
  };

  // Extract parameters
  node.params.forEach((param) => {
    if (t.isIdentifier(param)) {
      composable.parameters.push({
        name: param.name,
        type: param.typeAnnotation ? extractTypeString((param.typeAnnotation as any).typeAnnotation) : 'any',
        optional: false,
      });
    } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
      composable.parameters.push({
        name: param.left.name,
        type: 'any',
        optional: true,
        defaultValue: generateCode(param.right),
      });
    }
  });

  // Extract return type
  if (node.returnType) {
    composable.returnType = extractTypeString((node.returnType as any).typeAnnotation);
  }

  // Scan body for Vue APIs and other composables
  traverse(
    t.file(t.program([node])),
    {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          const name = path.node.callee.name;
          if (isVueAPI(name)) {
            if (!composable.usesVueAPIs.includes(name)) {
              composable.usesVueAPIs.push(name);
            }
          } else if (name.startsWith('use')) {
            if (!composable.usesComposables.includes(name)) {
              composable.usesComposables.push(name);
            }
          }
        }
      },
    },
    undefined,
    {}
  );

  return composable;
}

/**
 * Extract Composable from arrow function
 */
function extractComposableFromArrow(name: string, node: t.ArrowFunctionExpression): ComposableInfo | null {
  return {
    name,
    parameters: [],
    returnType: 'any',
    usesComposables: [],
    usesVueAPIs: [],
  };
}

/**
 * Extract ref() information
 */
function extractRef(node: t.CallExpression, parent: any): RefInfo | null {
  if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
    return {
      name: parent.id.name,
      initialValue: node.arguments[0] ? generateCode(node.arguments[0]) : undefined,
    };
  }
  return null;
}

/**
 * Extract reactive() information
 */
function extractReactive(node: t.CallExpression, parent: any): ReactiveInfo | null {
  if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
    const properties: string[] = [];

    // Extract properties from object literal
    if (node.arguments[0] && t.isObjectExpression(node.arguments[0])) {
      node.arguments[0].properties.forEach((prop) => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          properties.push(prop.key.name);
        }
      });
    }

    return {
      name: parent.id.name,
      properties,
    };
  }
  return null;
}

/**
 * Extract computed() information
 */
function extractComputed(node: t.CallExpression, parent: any): ComputedInfo | null {
  if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
    return {
      name: parent.id.name,
      dependencies: [],
      getter: true,
      setter: false,
    };
  }
  return null;
}

/**
 * Extract watcher information
 */
function extractWatcher(node: t.CallExpression): WatcherInfo | null {
  const source = node.arguments[0] ? generateCode(node.arguments[0]) : 'unknown';
  const options = node.arguments[2];

  let immediate = false;
  let deep = false;

  if (options && t.isObjectExpression(options)) {
    options.properties.forEach((prop) => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        if (prop.key.name === 'immediate' && t.isBooleanLiteral(prop.value)) {
          immediate = prop.value.value;
        }
        if (prop.key.name === 'deep' && t.isBooleanLiteral(prop.value)) {
          deep = prop.value.value;
        }
      }
    });
  }

  return {
    source,
    dependencies: [],
    immediate,
    deep,
  };
}

/**
 * Extract provide information
 */
function extractProvide(node: t.CallExpression): ProvideInfo | null {
  if (node.arguments.length >= 2) {
    const key = generateCode(node.arguments[0]);
    const value = generateCode(node.arguments[1]);
    return { key, value };
  }
  return null;
}

/**
 * Extract inject information
 */
function extractInject(node: t.CallExpression): InjectInfo | null {
  if (node.arguments.length >= 1) {
    const key = generateCode(node.arguments[0]);
    const defaultValue = node.arguments[1] ? generateCode(node.arguments[1]) : undefined;
    return { key, defaultValue };
  }
  return null;
}

/**
 * Extract custom directive information
 */
function extractDirective(node: t.ObjectExpression): DirectiveInfo | null {
  const hooks: DirectiveHook[] = [];
  let isDirective = false;

  node.properties.forEach((prop) => {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      const hookName = prop.key.name;
      if (isDirectiveHook(hookName)) {
        isDirective = true;
        hooks.push({
          name: hookName as DirectiveHook['name'],
          parameters: [],
        });
      }
    }
  });

  if (!isDirective) return null;

  return {
    name: 'customDirective',
    hooks,
  };
}

/**
 * Check if name is a Vue lifecycle hook
 */
function isLifecycleHook(name: string): boolean {
  const hooks = [
    'onBeforeMount',
    'onMounted',
    'onBeforeUpdate',
    'onUpdated',
    'onBeforeUnmount',
    'onUnmounted',
    'onActivated',
    'onDeactivated',
    'onErrorCaptured',
  ];
  return hooks.includes(name);
}

/**
 * Check if name is a directive hook
 */
function isDirectiveHook(name: string): boolean {
  const hooks = ['mounted', 'updated', 'unmounted', 'beforeMount', 'beforeUpdate', 'beforeUnmount'];
  return hooks.includes(name);
}

/**
 * Check if name is a Vue API
 */
function isVueAPI(name: string): boolean {
  const apis = [
    'ref', 'reactive', 'computed', 'watch', 'watchEffect',
    'onBeforeMount', 'onMounted', 'onBeforeUpdate', 'onUpdated',
    'onBeforeUnmount', 'onUnmounted', 'provide', 'inject',
    'toRef', 'toRefs', 'readonly', 'shallowRef', 'shallowReactive',
    'triggerRef', 'customRef', 'isRef', 'unref', 'isProxy', 'isReactive',
    'isReadonly', 'toRaw', 'markRaw', 'effectScope', 'getCurrentScope',
    'onScopeDispose',
  ];
  return apis.includes(name);
}

/**
 * Extract type string from type annotation
 */
function extractTypeString(typeNode: any): string {
  if (!typeNode) return 'any';

  if (typeNode.type === 'TSStringKeyword') return 'string';
  if (typeNode.type === 'TSNumberKeyword') return 'number';
  if (typeNode.type === 'TSBooleanKeyword') return 'boolean';
  if (typeNode.type === 'TSAnyKeyword') return 'any';

  if (t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) {
    return typeNode.typeName.name;
  }

  return 'unknown';
}

/**
 * Generate code from AST node
 */
function generateCode(node: any): string {
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
