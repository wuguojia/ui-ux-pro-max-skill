/**
 * 架构分析器测试
 * 测试项目架构模式检测功能
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeArchitecture,
} from '../../src/analyzers/architecture-analyzer';

describe('架构分析器', () => {
  describe('MVC 架构检测', () => {
    it('应该检测到 MVC 结构', async () => {
      const files = [
        'src/models/UserModel.ts',
        'src/views/UserView.tsx',
        'src/controllers/UserController.ts',
        'src/models/ProductModel.ts',
        'src/views/ProductView.tsx',
        'src/controllers/ProductController.ts',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.patterns.some(p => p.type === 'MVC')).toBe(true);
      const mvc = result.patterns.find(p => p.type === 'MVC');
      expect(mvc?.confidence).toBeGreaterThan(70);
    });
  });

  describe('MVVM 架构检测', () => {
    it('应该检测到 MVVM 结构', async () => {
      const files = [
        'src/models/User.ts',
        'src/viewmodels/UserViewModel.ts',
        'src/views/UserView.tsx',
        'src/models/Product.ts',
        'src/viewmodels/ProductViewModel.ts',
        'src/views/ProductView.tsx',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.patterns.some(p => p.type === 'MVVM')).toBe(true);
    });
  });

  describe('Clean Architecture 检测', () => {
    it('应该检测到 Clean Architecture 结构', async () => {
      const files = [
        'src/domain/entities/User.ts',
        'src/domain/usecases/GetUser.ts',
        'src/application/services/UserService.ts',
        'src/infrastructure/repositories/UserRepository.ts',
        'src/presentation/components/UserComponent.tsx',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.patterns.some(p => p.type === 'Clean Architecture')).toBe(true);
    });
  });

  describe('Feature-Based 架构检测', () => {
    it('应该检测到 Feature-Based 结构', async () => {
      const files = [
        'src/features/auth/components/LoginForm.tsx',
        'src/features/auth/hooks/useAuth.ts',
        'src/features/auth/api/authApi.ts',
        'src/features/users/components/UserList.tsx',
        'src/features/users/hooks/useUsers.ts',
        'src/features/products/components/ProductGrid.tsx',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.patterns.some(p => p.type === 'Feature-Based')).toBe(true);
    });
  });

  describe('Layered 架构检测', () => {
    it('应该检测到 Layered 结构', async () => {
      const files = [
        'src/presentation/pages/Home.tsx',
        'src/business/services/UserService.ts',
        'src/data/repositories/UserRepository.ts',
        'src/data/api/httpClient.ts',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.patterns.some(p => p.type === 'Layered')).toBe(true);
    });
  });

  describe('Modular 架构检测', () => {
    it('应该检测到 Modular 结构', async () => {
      const files = [
        'src/modules/users/index.ts',
        'src/modules/users/components.ts',
        'src/modules/auth/index.ts',
        'src/modules/auth/services.ts',
        'src/modules/products/index.ts',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.patterns.some(p => p.type === 'Modular')).toBe(true);
    });
  });

  describe('目录结构分析', () => {
    it('应该正确分析目录层级', async () => {
      const files = [
        'src/app/core/services/api.ts',
        'src/app/shared/components/Button.tsx',
        'src/app/features/users/UserList.tsx',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.structure.depth).toBeGreaterThan(2);
      expect(result.structure.topLevelDirs).toContain('src');
    });

    it('应该识别公共目录模式', async () => {
      const files = [
        'src/components/Button.tsx',
        'src/components/Input.tsx',
        'src/utils/format.ts',
        'src/utils/validation.ts',
        'src/hooks/useAuth.ts',
        'src/hooks/useData.ts',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.structure.commonPatterns).toContain('components');
      expect(result.structure.commonPatterns).toContain('utils');
      expect(result.structure.commonPatterns).toContain('hooks');
    });
  });

  describe('复杂架构场景', () => {
    it('应该检测混合架构模式', async () => {
      const files = [
        'src/features/auth/domain/entities/User.ts',
        'src/features/auth/application/usecases/Login.ts',
        'src/features/auth/presentation/LoginForm.tsx',
        'src/features/products/domain/entities/Product.ts',
        'src/features/products/presentation/ProductList.tsx',
      ];

      const result = await analyzeArchitecture(files);

      // 应该检测到 Feature-Based 和 Clean Architecture
      expect(result.patterns.length).toBeGreaterThan(0);
    });

    it('应该处理深层嵌套结构', async () => {
      const files = [
        'src/app/modules/core/features/auth/components/forms/LoginForm.tsx',
        'src/app/modules/core/features/auth/services/api/authApi.ts',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.structure.depth).toBeGreaterThan(5);
    });
  });

  describe('边界情况', () => {
    it('应该处理空文件列表', async () => {
      const files: string[] = [];
      const result = await analyzeArchitecture(files);

      expect(result.patterns.length).toBe(0);
    });

    it('应该处理不规则的目录结构', async () => {
      const files = [
        'randomFile.ts',
        'another/random/file.tsx',
        'yet/another/deeply/nested/file.ts',
      ];

      const result = await analyzeArchitecture(files);

      expect(result.patterns.some(p => p.type === 'Unknown')).toBe(true);
    });

    it('应该处理单一文件', async () => {
      const files = ['src/index.ts'];
      const result = await analyzeArchitecture(files);

      expect(result).toBeDefined();
      expect(result.structure.totalFiles).toBe(1);
    });
  });
});
