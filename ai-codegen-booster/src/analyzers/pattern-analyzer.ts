/**
 * Pattern Analyzer - Identify design patterns, state management, and API patterns
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface DesignPattern {
  type: 'Singleton' | 'Factory' | 'Observer' | 'Builder' | 'Strategy' | 'Decorator' | 'Adapter' | 'Custom';
  name: string;
  description: string;
  location: string;
  confidence: number; // 0-100
  examples: string[];
}

export interface StateManagementPattern {
  type: 'Redux' | 'Zustand' | 'MobX' | 'Pinia' | 'Vuex' | 'Context' | 'Custom';
  storeNames: string[];
  actions: ActionInfo[];
  selectors: SelectorInfo[];
  mutations: MutationInfo[];
  location: string;
}

export interface ActionInfo {
  name: string;
  async: boolean;
  parameters: string[];
}

export interface SelectorInfo {
  name: string;
  dependencies: string[];
}

export interface MutationInfo {
  name: string;
  stateKeys: string[];
}

export interface APIPattern {
  type: 'REST' | 'GraphQL' | 'WebSocket' | 'gRPC' | 'Custom';
  endpoints: EndpointInfo[];
  authPattern?: 'JWT' | 'OAuth' | 'Session' | 'ApiKey' | 'None';
  errorHandling: ErrorHandlingPattern[];
}

export interface EndpointInfo {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  handler?: string;
  middleware?: string[];
}

export interface ErrorHandlingPattern {
  type: 'try-catch' | 'promise-catch' | 'error-boundary' | 'global-handler';
  location: string;
  catches: string[];
}

export interface PatternAnalysisResult {
  designPatterns: DesignPattern[];
  stateManagement: StateManagementPattern[];
  apiPatterns: APIPattern[];
  errorHandling: ErrorHandlingPattern[];
  customPatterns: CustomPattern[];
}

export interface CustomPattern {
  name: string;
  occurrences: number;
  examples: string[];
  description: string;
}

/**
 * Analyze code for design patterns and architectural patterns
 */
export async function analyzePatterns(code: string): Promise<PatternAnalysisResult> {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const result: PatternAnalysisResult = {
    designPatterns: [],
    stateManagement: [],
    apiPatterns: [],
    errorHandling: [],
    customPatterns: [],
  };

  // Detect design patterns
  result.designPatterns.push(...detectSingletonPattern(ast));
  result.designPatterns.push(...detectFactoryPattern(ast));
  result.designPatterns.push(...detectObserverPattern(ast));
  result.designPatterns.push(...detectBuilderPattern(ast));

  // Detect state management
  result.stateManagement.push(...detectStateManagement(ast));

  // Detect API patterns
  result.apiPatterns.push(...detectAPIPatterns(ast));

  // Detect error handling patterns
  result.errorHandling.push(...detectErrorHandling(ast));

  return result;
}

/**
 * Detect Singleton pattern
 */
function detectSingletonPattern(ast: t.File): DesignPattern[] {
  const patterns: DesignPattern[] = [];
  let hasPrivateConstructor = false;
  let hasStaticInstance = false;
  let hasGetInstance = false;

  traverse(ast, {
    ClassDeclaration(path) {
      // Check for static instance property
      path.node.body.body.forEach((member) => {
        if (
          t.isClassProperty(member) &&
          member.static &&
          t.isIdentifier(member.key) &&
          member.key.name === 'instance'
        ) {
          hasStaticInstance = true;
        }

        // Check for getInstance method
        if (
          t.isClassMethod(member) &&
          member.static &&
          t.isIdentifier(member.key) &&
          (member.key.name === 'getInstance' || member.key.name === 'instance')
        ) {
          hasGetInstance = true;
        }
      });

      if (hasStaticInstance && hasGetInstance) {
        patterns.push({
          type: 'Singleton',
          name: path.node.id?.name || 'UnknownSingleton',
          description: 'Ensures a class has only one instance',
          location: 'class definition',
          confidence: 85,
          examples: [],
        });
      }
    },
  });

  return patterns;
}

/**
 * Detect Factory pattern
 */
function detectFactoryPattern(ast: t.File): DesignPattern[] {
  const patterns: DesignPattern[] = [];

  traverse(ast, {
    FunctionDeclaration(path) {
      const name = path.node.id?.name || '';
      if (name.toLowerCase().includes('factory') || name.startsWith('create')) {
        // Check if function returns different types based on parameters
        let hasConditionalReturn = false;

        traverse(
          path.node,
          {
            IfStatement(innerPath) {
              const consequent = innerPath.node.consequent;
              if (
                t.isBlockStatement(consequent) &&
                consequent.body.some((stmt) => t.isReturnStatement(stmt))
              ) {
                hasConditionalReturn = true;
              }
            },
            SwitchStatement(innerPath) {
              hasConditionalReturn = true;
            },
          },
          path.scope
        );

        if (hasConditionalReturn) {
          patterns.push({
            type: 'Factory',
            name,
            description: 'Creates objects without specifying exact class',
            location: 'function declaration',
            confidence: 75,
            examples: [],
          });
        }
      }
    },
  });

  return patterns;
}

/**
 * Detect Observer pattern
 */
function detectObserverPattern(ast: t.File): DesignPattern[] {
  const patterns: DesignPattern[] = [];

  traverse(ast, {
    ClassDeclaration(path) {
      let hasSubscribe = false;
      let hasNotify = false;
      let hasObserversList = false;

      path.node.body.body.forEach((member) => {
        if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
          const methodName = member.key.name.toLowerCase();
          if (methodName.includes('subscribe') || methodName.includes('addobserver')) {
            hasSubscribe = true;
          }
          if (methodName.includes('notify') || methodName.includes('update')) {
            hasNotify = true;
          }
        }

        if (
          t.isClassProperty(member) &&
          t.isIdentifier(member.key) &&
          (member.key.name.includes('observer') || member.key.name.includes('listener'))
        ) {
          hasObserversList = true;
        }
      });

      if (hasSubscribe && hasNotify) {
        patterns.push({
          type: 'Observer',
          name: path.node.id?.name || 'UnknownObserver',
          description: 'Defines subscription mechanism to notify multiple objects',
          location: 'class definition',
          confidence: hasObserversList ? 90 : 70,
          examples: [],
        });
      }
    },
  });

  return patterns;
}

/**
 * Detect Builder pattern
 */
function detectBuilderPattern(ast: t.File): DesignPattern[] {
  const patterns: DesignPattern[] = [];

  traverse(ast, {
    ClassDeclaration(path) {
      let chainedMethods = 0;
      let hasBuildMethod = false;

      path.node.body.body.forEach((member) => {
        if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
          // Check if method returns 'this'
          const body = member.body;
          if (t.isBlockStatement(body)) {
            const lastStatement = body.body[body.body.length - 1];
            if (
              t.isReturnStatement(lastStatement) &&
              t.isThisExpression(lastStatement.argument)
            ) {
              chainedMethods++;
            }
          }

          if (member.key.name === 'build') {
            hasBuildMethod = true;
          }
        }
      });

      if (chainedMethods >= 2 && hasBuildMethod) {
        patterns.push({
          type: 'Builder',
          name: path.node.id?.name || 'UnknownBuilder',
          description: 'Constructs complex objects step by step',
          location: 'class definition',
          confidence: 85,
          examples: [],
        });
      }
    },
  });

  return patterns;
}

/**
 * Detect state management patterns
 */
function detectStateManagement(ast: t.File): StateManagementPattern[] {
  const patterns: StateManagementPattern[] = [];

  let reduxDetected = false;
  let zustandDetected = false;
  let piniaDetected = false;
  let vuexDetected = false;

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;

      if (source === 'redux' || source === '@reduxjs/toolkit') {
        reduxDetected = true;
      }
      if (source === 'zustand') {
        zustandDetected = true;
      }
      if (source === 'pinia') {
        piniaDetected = true;
      }
      if (source === 'vuex') {
        vuexDetected = true;
      }
    },
  });

  if (reduxDetected) {
    patterns.push({
      type: 'Redux',
      storeNames: ['redux-store'],
      actions: [],
      selectors: [],
      mutations: [],
      location: 'detected from imports',
    });
  }

  if (zustandDetected) {
    patterns.push({
      type: 'Zustand',
      storeNames: ['zustand-store'],
      actions: [],
      selectors: [],
      mutations: [],
      location: 'detected from imports',
    });
  }

  if (piniaDetected) {
    patterns.push({
      type: 'Pinia',
      storeNames: ['pinia-store'],
      actions: [],
      selectors: [],
      mutations: [],
      location: 'detected from imports',
    });
  }

  if (vuexDetected) {
    patterns.push({
      type: 'Vuex',
      storeNames: ['vuex-store'],
      actions: [],
      selectors: [],
      mutations: [],
      location: 'detected from imports',
    });
  }

  return patterns;
}

/**
 * Detect API patterns
 */
function detectAPIPatterns(ast: t.File): APIPattern[] {
  const patterns: APIPattern[] = [];
  const endpoints: EndpointInfo[] = [];
  let apiType: APIPattern['type'] = 'REST';
  let authPattern: APIPattern['authPattern'] = 'None';

  traverse(ast, {
    // Detect REST endpoints
    CallExpression(path) {
      if (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.property)) {
        const method = path.node.callee.property.name.toUpperCase();

        if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          const firstArg = path.node.arguments[0];
          if (t.isStringLiteral(firstArg)) {
            endpoints.push({
              path: firstArg.value,
              method: method as EndpointInfo['method'],
            });
          }
        }
      }

      // Detect GraphQL
      if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'gql') {
        apiType = 'GraphQL';
      }

      // Detect fetch/axios calls
      if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'fetch') {
        const firstArg = path.node.arguments[0];
        if (t.isStringLiteral(firstArg)) {
          endpoints.push({
            path: firstArg.value,
            method: 'GET',
          });
        }
      }
    },

    // Detect auth patterns from imports or usage
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (source.includes('jwt')) {
        authPattern = 'JWT';
      } else if (source.includes('oauth')) {
        authPattern = 'OAuth';
      }
    },
  });

  if (endpoints.length > 0) {
    patterns.push({
      type: apiType,
      endpoints,
      authPattern,
      errorHandling: [],
    });
  }

  return patterns;
}

/**
 * Detect error handling patterns
 */
function detectErrorHandling(ast: t.File): ErrorHandlingPattern[] {
  const patterns: ErrorHandlingPattern[] = [];

  traverse(ast, {
    TryStatement(path) {
      const catches: string[] = [];

      if (path.node.handler) {
        const param = path.node.handler.param;
        if (param && t.isIdentifier(param)) {
          catches.push(param.name);
        }
      }

      patterns.push({
        type: 'try-catch',
        location: 'try-catch block',
        catches,
      });
    },

    CallExpression(path) {
      // Detect .catch() on promises
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.property) &&
        path.node.callee.property.name === 'catch'
      ) {
        patterns.push({
          type: 'promise-catch',
          location: 'promise chain',
          catches: [],
        });
      }
    },
  });

  return patterns;
}

/**
 * Analyze file structure and imports for patterns
 */
export function analyzeImportPatterns(code: string): {
  externalDependencies: string[];
  internalImports: string[];
  typeImports: string[];
  sideEffectImports: string[];
} {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const externalDependencies: string[] = [];
  const internalImports: string[] = [];
  const typeImports: string[] = [];
  const sideEffectImports: string[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;

      // Side-effect imports (no specifiers)
      if (path.node.specifiers.length === 0) {
        sideEffectImports.push(source);
        return;
      }

      // Type-only imports
      if (path.node.importKind === 'type') {
        typeImports.push(source);
        return;
      }

      // Internal vs external
      if (source.startsWith('.') || source.startsWith('@/')) {
        internalImports.push(source);
      } else {
        externalDependencies.push(source);
      }
    },
  });

  return {
    externalDependencies,
    internalImports,
    typeImports,
    sideEffectImports,
  };
}
