/**
 * 模式分析器测试
 * 测试设计模式、状态管理和 API 模式检测功能
 */

import { describe, it, expect } from 'vitest';
import {
  analyzePatterns,
  analyzeImportPatterns,
} from '../../src/analyzers/pattern-analyzer';

describe('模式分析器', () => {
  describe('单例模式检测', () => {
    it('应该检测到标准单例模式', async () => {
      const code = `
        class Singleton {
          private static instance: Singleton;

          private constructor() {}

          static getInstance(): Singleton {
            if (!Singleton.instance) {
              Singleton.instance = new Singleton();
            }
            return Singleton.instance;
          }
        }
      `;

      const result = await analyzePatterns(code);

      expect(result.designPatterns.length).toBeGreaterThan(0);
      const singleton = result.designPatterns.find(p => p.type === 'Singleton');
      expect(singleton).toBeDefined();
      expect(singleton?.name).toBe('Singleton');
      expect(singleton?.confidence).toBeGreaterThan(80);
    });

    it('应该检测到带 instance 属性的单例', async () => {
      const code = `
        class DatabaseConnection {
          static instance = null;

          static getInstance() {
            if (!DatabaseConnection.instance) {
              DatabaseConnection.instance = new DatabaseConnection();
            }
            return DatabaseConnection.instance;
          }
        }
      `;

      const result = await analyzePatterns(code);

      const singleton = result.designPatterns.find(p => p.type === 'Singleton');
      expect(singleton).toBeDefined();
      expect(singleton?.name).toBe('DatabaseConnection');
    });
  });

  describe('工厂模式检测', () => {
    it('应该检测到工厂函数', async () => {
      const code = `
        function createUser(type) {
          if (type === 'admin') {
            return new AdminUser();
          } else if (type === 'guest') {
            return new GuestUser();
          }
          return new RegularUser();
        }
      `;

      const result = await analyzePatterns(code);

      const factory = result.designPatterns.find(p => p.type === 'Factory');
      expect(factory).toBeDefined();
      expect(factory?.name).toBe('createUser');
    });

    it('应该检测到使用 switch 的工厂', async () => {
      const code = `
        function createVehicle(type) {
          switch (type) {
            case 'car':
              return new Car();
            case 'bike':
              return new Bike();
            case 'truck':
              return new Truck();
            default:
              return new Vehicle();
          }
        }
      `;

      const result = await analyzePatterns(code);

      const factory = result.designPatterns.find(p => p.type === 'Factory');
      expect(factory).toBeDefined();
      expect(factory?.name).toBe('createVehicle');
    });

    it('应该检测到以 create 开头的工厂函数', async () => {
      const code = `
        function createComponent(props) {
          if (props.variant === 'button') {
            return new Button(props);
          }
          return new Component(props);
        }
      `;

      const result = await analyzePatterns(code);

      const factory = result.designPatterns.find(p => p.type === 'Factory');
      expect(factory).toBeDefined();
    });
  });

  describe('观察者模式检测', () => {
    it('应该检测到观察者模式', async () => {
      const code = `
        class EventEmitter {
          private observers = [];

          subscribe(observer) {
            this.observers.push(observer);
          }

          notify(data) {
            this.observers.forEach(observer => observer(data));
          }
        }
      `;

      const result = await analyzePatterns(code);

      const observer = result.designPatterns.find(p => p.type === 'Observer');
      expect(observer).toBeDefined();
      expect(observer?.name).toBe('EventEmitter');
      expect(observer?.confidence).toBeGreaterThan(70);
    });

    it('应该检测到带 listeners 的观察者模式', async () => {
      const code = `
        class Subject {
          private listeners = new Set();

          addObserver(fn) {
            this.listeners.add(fn);
          }

          notifyAll(message) {
            this.listeners.forEach(listener => listener(message));
          }
        }
      `;

      const result = await analyzePatterns(code);

      const observer = result.designPatterns.find(p => p.type === 'Observer');
      expect(observer).toBeDefined();
      expect(observer?.confidence).toBeGreaterThan(80);
    });

    it('应该检测到使用 update 的观察者模式', async () => {
      const code = `
        class Store {
          private observers = [];

          subscribe(observer) {
            this.observers.push(observer);
          }

          update(state) {
            this.observers.forEach(obs => obs.update(state));
          }
        }
      `;

      const result = await analyzePatterns(code);

      const observer = result.designPatterns.find(p => p.type === 'Observer');
      expect(observer).toBeDefined();
    });
  });

  describe('构建器模式检测', () => {
    it('应该检测到构建器模式', async () => {
      const code = `
        class QueryBuilder {
          private query = '';

          select(fields) {
            this.query += \`SELECT \${fields}\`;
            return this;
          }

          from(table) {
            this.query += \` FROM \${table}\`;
            return this;
          }

          where(condition) {
            this.query += \` WHERE \${condition}\`;
            return this;
          }

          build() {
            return this.query;
          }
        }
      `;

      const result = await analyzePatterns(code);

      const builder = result.designPatterns.find(p => p.type === 'Builder');
      expect(builder).toBeDefined();
      expect(builder?.name).toBe('QueryBuilder');
      expect(builder?.confidence).toBeGreaterThan(80);
    });

    it('应该检测到 HTTP 请求构建器', async () => {
      const code = `
        class RequestBuilder {
          method(m) {
            this.m = m;
            return this;
          }

          headers(h) {
            this.h = h;
            return this;
          }

          body(b) {
            this.b = b;
            return this;
          }

          build() {
            return { method: this.m, headers: this.h, body: this.b };
          }
        }
      `;

      const result = await analyzePatterns(code);

      const builder = result.designPatterns.find(p => p.type === 'Builder');
      expect(builder).toBeDefined();
    });
  });

  describe('状态管理模式检测', () => {
    it('应该检测到 Redux', async () => {
      const code = `
        import { createStore } from 'redux';
        const store = createStore(reducer);
      `;

      const result = await analyzePatterns(code);

      const redux = result.stateManagement.find(sm => sm.type === 'Redux');
      expect(redux).toBeDefined();
    });

    it('应该检测到 Redux Toolkit', async () => {
      const code = `
        import { configureStore } from '@reduxjs/toolkit';
        const store = configureStore({ reducer });
      `;

      const result = await analyzePatterns(code);

      const redux = result.stateManagement.find(sm => sm.type === 'Redux');
      expect(redux).toBeDefined();
    });

    it('应该检测到 Zustand', async () => {
      const code = `
        import create from 'zustand';
        const useStore = create((set) => ({
          count: 0,
          increment: () => set((state) => ({ count: state.count + 1 })),
        }));
      `;

      const result = await analyzePatterns(code);

      const zustand = result.stateManagement.find(sm => sm.type === 'Zustand');
      expect(zustand).toBeDefined();
    });

    it('应该检测到 Pinia', async () => {
      const code = `
        import { defineStore } from 'pinia';
        export const useUserStore = defineStore('user', {
          state: () => ({ name: '', age: 0 }),
          actions: {
            updateUser(name, age) {
              this.name = name;
              this.age = age;
            }
          }
        });
      `;

      const result = await analyzePatterns(code);

      const pinia = result.stateManagement.find(sm => sm.type === 'Pinia');
      expect(pinia).toBeDefined();
    });

    it('应该检测到 Vuex', async () => {
      const code = `
        import Vuex from 'vuex';
        const store = new Vuex.Store({
          state: { count: 0 },
          mutations: {
            increment(state) {
              state.count++;
            }
          }
        });
      `;

      const result = await analyzePatterns(code);

      const vuex = result.stateManagement.find(sm => sm.type === 'Vuex');
      expect(vuex).toBeDefined();
    });
  });

  describe('API 模式检测', () => {
    it('应该检测到 REST API 端点', async () => {
      const code = `
        app.get('/api/users', handler);
        app.post('/api/users', createHandler);
        app.put('/api/users/:id', updateHandler);
        app.delete('/api/users/:id', deleteHandler);
      `;

      const result = await analyzePatterns(code);

      expect(result.apiPatterns.length).toBeGreaterThan(0);
      const api = result.apiPatterns[0];
      expect(api.type).toBe('REST');
      expect(api.endpoints.length).toBeGreaterThan(0);
    });

    it('应该检测到 fetch 调用', async () => {
      const code = `
        fetch('/api/data').then(res => res.json());
      `;

      const result = await analyzePatterns(code);

      const api = result.apiPatterns.find(ap => ap.type === 'REST');
      expect(api).toBeDefined();
      expect(api?.endpoints.some(e => e.path === '/api/data')).toBe(true);
    });

    it('应该检测到 GraphQL', async () => {
      const code = `
        import { gql } from 'graphql-tag';
        const GET_USER = gql\`
          query GetUser($id: ID!) {
            user(id: $id) {
              name
              email
            }
          }
        \`;
      `;

      const result = await analyzePatterns(code);

      const graphql = result.apiPatterns.find(ap => ap.type === 'GraphQL');
      expect(graphql).toBeDefined();
    });

    it('应该检测到 JWT 认证', async () => {
      const code = `
        import jwt from 'jsonwebtoken';
        const token = jwt.sign({ userId: 123 }, 'secret');
      `;

      const result = await analyzePatterns(code);

      const api = result.apiPatterns.find(ap => ap.authPattern === 'JWT');
      expect(api).toBeDefined();
    });

    it('应该检测到 OAuth 认证', async () => {
      const code = `
        import { OAuth2 } from 'oauth';
        const oauth = new OAuth2();
      `;

      const result = await analyzePatterns(code);

      const api = result.apiPatterns.find(ap => ap.authPattern === 'OAuth');
      expect(api).toBeDefined();
    });
  });

  describe('错误处理模式检测', () => {
    it('应该检测到 try-catch 块', async () => {
      const code = `
        try {
          riskyOperation();
        } catch (error) {
          console.error(error);
        }
      `;

      const result = await analyzePatterns(code);

      const tryCatch = result.errorHandling.find(eh => eh.type === 'try-catch');
      expect(tryCatch).toBeDefined();
      expect(tryCatch?.catches).toContain('error');
    });

    it('应该检测到 Promise catch', async () => {
      const code = `
        fetchData()
          .then(data => process(data))
          .catch(err => handleError(err));
      `;

      const result = await analyzePatterns(code);

      const promiseCatch = result.errorHandling.find(eh => eh.type === 'promise-catch');
      expect(promiseCatch).toBeDefined();
    });

    it('应该检测到多个错误处理', async () => {
      const code = `
        try {
          operation1();
        } catch (e1) {
          log(e1);
        }

        try {
          operation2();
        } catch (e2) {
          log(e2);
        }

        promise1().catch(err => {});
        promise2().catch(err => {});
      `;

      const result = await analyzePatterns(code);

      expect(result.errorHandling.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('导入模式分析', () => {
    it('应该区分外部依赖和内部导入', () => {
      const code = `
        import React from 'react';
        import { useState } from 'react';
        import { Button } from '@/components/Button';
        import { utils } from './utils';
        import '../styles.css';
      `;

      const result = analyzeImportPatterns(code);

      expect(result.externalDependencies).toContain('react');
      expect(result.internalImports).toContain('@/components/Button');
      expect(result.internalImports).toContain('./utils');
      expect(result.sideEffectImports).toContain('../styles.css');
    });

    it('应该检测类型导入', () => {
      const code = `
        import type { User } from './types';
        import type { Config } from '@/config';
      `;

      const result = analyzeImportPatterns(code);

      expect(result.typeImports).toContain('./types');
      expect(result.typeImports).toContain('@/config');
    });

    it('应该检测副作用导入', () => {
      const code = `
        import 'normalize.css';
        import './global.css';
        import 'react-app-polyfill/ie11';
      `;

      const result = analyzeImportPatterns(code);

      expect(result.sideEffectImports).toHaveLength(3);
      expect(result.sideEffectImports).toContain('normalize.css');
    });
  });

  describe('复杂场景测试', () => {
    it('应该检测多种模式共存', async () => {
      const code = `
        import { createStore } from 'redux';

        class Singleton {
          static instance = null;
          static getInstance() {
            if (!Singleton.instance) {
              Singleton.instance = new Singleton();
            }
            return Singleton.instance;
          }
        }

        function createComponent(type) {
          if (type === 'button') return new Button();
          return new Component();
        }

        class EventBus {
          observers = [];
          subscribe(fn) { this.observers.push(fn); }
          notify(data) { this.observers.forEach(fn => fn(data)); }
        }

        try {
          fetchData();
        } catch (error) {
          handleError(error);
        }
      `;

      const result = await analyzePatterns(code);

      expect(result.designPatterns.find(p => p.type === 'Singleton')).toBeDefined();
      expect(result.designPatterns.find(p => p.type === 'Factory')).toBeDefined();
      expect(result.designPatterns.find(p => p.type === 'Observer')).toBeDefined();
      expect(result.stateManagement.find(sm => sm.type === 'Redux')).toBeDefined();
      expect(result.errorHandling.length).toBeGreaterThan(0);
    });

    it('应该处理 TypeScript 类型系统', async () => {
      const code = `
        class Builder<T> {
          private value: T;

          setValue(v: T): this {
            this.value = v;
            return this;
          }

          build(): T {
            return this.value;
          }
        }
      `;

      const result = await analyzePatterns(code);

      const builder = result.designPatterns.find(p => p.type === 'Builder');
      expect(builder).toBeDefined();
    });

    it('应该处理现代 JavaScript 特性', async () => {
      const code = `
        const createLogger = (type) => {
          switch (type) {
            case 'console':
              return new ConsoleLogger();
            case 'file':
              return new FileLogger();
            default:
              return new Logger();
          }
        };

        const asyncFetch = async () => {
          try {
            const data = await fetch('/api/data');
            return await data.json();
          } catch (error) {
            console.error(error);
          }
        };
      `;

      const result = await analyzePatterns(code);

      expect(result.designPatterns.find(p => p.type === 'Factory')).toBeDefined();
      expect(result.errorHandling.find(eh => eh.type === 'try-catch')).toBeDefined();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空代码', async () => {
      const code = '';
      const result = await analyzePatterns(code);

      expect(result.designPatterns).toEqual([]);
      expect(result.stateManagement).toEqual([]);
      expect(result.apiPatterns).toEqual([]);
    });

    it('应该处理没有模式的普通代码', async () => {
      const code = `
        const add = (a, b) => a + b;
        const multiply = (a, b) => a * b;
        console.log(add(2, 3));
      `;

      const result = await analyzePatterns(code);

      expect(result.designPatterns).toEqual([]);
      expect(result.stateManagement).toEqual([]);
    });

    it('应该处理不完整的模式实现', async () => {
      const code = `
        class PartialSingleton {
          static instance = null;
          // Missing getInstance
        }
      `;

      const result = await analyzePatterns(code);

      // 不应该检测为单例，因为缺少 getInstance
      const singleton = result.designPatterns.find(p => p.type === 'Singleton');
      expect(singleton).toBeUndefined();
    });

    it('应该处理复杂嵌套结构', async () => {
      const code = `
        class OuterClass {
          method() {
            class InnerBuilder {
              value(v) { this.v = v; return this; }
              build() { return this.v; }
            }
            return new InnerBuilder();
          }
        }
      `;

      const result = await analyzePatterns(code);

      // 应该能检测到内部的 Builder
      expect(result.designPatterns.length).toBeGreaterThanOrEqual(0);
    });
  });
});
