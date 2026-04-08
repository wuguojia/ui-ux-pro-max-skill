/**
 * HTML 提取器测试
 * 测试 HTML 结构模式和可访问性提取功能
 */

import { describe, it, expect } from 'vitest';
import {
  extractHTML,
  extractAccessibilityPatterns,
} from '../../src/extractors/html-extractor';

describe('HTML 提取器', () => {
  describe('基础 HTML 提取', () => {
    it('应该提取语义化标签', async () => {
      const html = `
        <header>网站头部</header>
        <main>主要内容</main>
        <footer>网站底部</footer>
      `;

      const result = await extractHTML(html);

      expect(result.semanticTags).toContain('header');
      expect(result.semanticTags).toContain('main');
      expect(result.semanticTags).toContain('footer');
    });

    it('应该识别布局模式', async () => {
      const html = `
        <header id="header" class="site-header">
          <nav>导航</nav>
        </header>
        <main>内容</main>
        <footer>底部</footer>
      `;

      const result = await extractHTML(html);

      expect(result.layouts.length).toBeGreaterThan(0);
      const headerLayout = result.layouts.find(l => l.type === 'header');
      expect(headerLayout).toBeDefined();
      expect(headerLayout?.description).toContain('Header');
    });

    it('应该提取常用 class 名称', async () => {
      const html = `
        <div class="container flex-center">
          <div class="card shadow-lg">
            <h1 class="title">标题</h1>
          </div>
        </div>
      `;

      const result = await extractHTML(html);

      expect(result.commonClasses).toContain('container');
      expect(result.commonClasses).toContain('flex-center');
      expect(result.commonClasses).toContain('card');
      expect(result.commonClasses).toContain('shadow-lg');
      expect(result.commonClasses).toContain('title');
    });

    it('应该提取 ID', async () => {
      const html = `
        <div id="app">
          <header id="header">头部</header>
          <main id="main-content">内容</main>
        </div>
      `;

      const result = await extractHTML(html);

      expect(result.commonIds).toContain('app');
      expect(result.commonIds).toContain('header');
      expect(result.commonIds).toContain('main-content');
    });

    it('应该计算结构深度', async () => {
      const html = `
        <div>
          <div>
            <div>
              <div>
                <p>深层嵌套</p>
              </div>
            </div>
          </div>
        </div>
      `;

      const result = await extractHTML(html);

      expect(result.structureDepth).toBeGreaterThan(3);
    });
  });

  describe('可访问性模式提取', () => {
    it('应该提取 ARIA 标签', async () => {
      const html = `
        <button aria-label="关闭对话框">X</button>
        <div aria-describedby="help-text">内容</div>
        <span id="help-text">帮助文本</span>
      `;

      const result = extractAccessibilityPatterns(html);

      expect(result.ariaLabels).toContain('关闭对话框');
      expect(result.ariaDescribedBy).toContain('help-text');
    });

    it('应该提取 ARIA 标签联系', async () => {
      const html = `
        <label id="label-name">姓名</label>
        <input aria-labelledby="label-name" />
      `;

      const result = extractAccessibilityPatterns(html);

      expect(result.ariaLabelledBy).toContain('label-name');
    });

    it('应该提取角色属性', async () => {
      const html = `
        <div role="navigation">导航</div>
        <div role="main">主要内容</div>
        <div role="complementary">侧边栏</div>
      `;

      const result = extractAccessibilityPatterns(html);

      expect(result.roles).toContain('navigation');
      expect(result.roles).toContain('main');
      expect(result.roles).toContain('complementary');
    });

    it('应该识别地标角色', async () => {
      const html = `
        <div role="banner">横幅</div>
        <div role="navigation">导航</div>
        <div role="main">主要内容</div>
        <div role="contentinfo">页脚信息</div>
      `;

      const result = extractAccessibilityPatterns(html);

      expect(result.landmarks).toContain('banner');
      expect(result.landmarks).toContain('navigation');
      expect(result.landmarks).toContain('main');
      expect(result.landmarks).toContain('contentinfo');
    });

    it('应该处理空 HTML', async () => {
      const html = '';
      const result = await extractHTML(html);

      expect(result.semanticTags).toEqual([]);
      expect(result.commonClasses).toEqual([]);
      expect(result.commonIds).toEqual([]);
    });
  });

  describe('复杂场景测试', () => {
    it('应该处理完整的页面结构', async () => {
      const html = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <title>测试页面</title>
        </head>
        <body>
          <header role="banner" class="site-header">
            <nav role="navigation" aria-label="主导航">
              <ul>
                <li><a href="/">首页</a></li>
                <li><a href="/about">关于</a></li>
              </ul>
            </nav>
          </header>
          <main role="main" id="main-content">
            <article>
              <h1>文章标题</h1>
              <section>
                <h2>章节标题</h2>
                <p>段落内容</p>
              </section>
            </article>
            <aside role="complementary">
              <h2>相关内容</h2>
            </aside>
          </main>
          <footer role="contentinfo" class="site-footer">
            <p>&copy; 2026 示例网站</p>
          </footer>
        </body>
        </html>
      `;

      const result = await extractHTML(html);

      // 验证语义化标签
      expect(result.semanticTags).toContain('header');
      expect(result.semanticTags).toContain('nav');
      expect(result.semanticTags).toContain('main');
      expect(result.semanticTags).toContain('article');
      expect(result.semanticTags).toContain('section');
      expect(result.semanticTags).toContain('aside');
      expect(result.semanticTags).toContain('footer');

      // 验证布局
      expect(result.layouts.length).toBeGreaterThan(0);

      // 验证 classes
      expect(result.commonClasses).toContain('site-header');
      expect(result.commonClasses).toContain('site-footer');

      // 验证 IDs
      expect(result.commonIds).toContain('main-content');
    });

    it('应该提取多个 ARIA 属性组合', async () => {
      const html = `
        <dialog
          role="dialog"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-desc"
          aria-modal="true"
        >
          <h2 id="dialog-title">对话框标题</h2>
          <p id="dialog-desc">对话框描述</p>
        </dialog>
      `;

      const result = await extractHTML(html);

      expect(result.ariaPatterns).toContain('aria-labelledby');
      expect(result.ariaPatterns).toContain('aria-describedby');
      expect(result.ariaPatterns).toContain('aria-modal');
    });

    it('应该处理嵌套的语义化结构', async () => {
      const html = `
        <article>
          <header>
            <h1>文章标题</h1>
          </header>
          <section>
            <header>
              <h2>章节标题</h2>
            </header>
            <p>章节内容</p>
            <footer>章节底部</footer>
          </section>
          <footer>文章底部</footer>
        </article>
      `;

      const result = await extractHTML(html);

      expect(result.semanticTags).toContain('article');
      expect(result.semanticTags).toContain('header');
      expect(result.semanticTags).toContain('section');
      expect(result.semanticTags).toContain('footer');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理自闭合标签', async () => {
      const html = `
        <img src="test.jpg" alt="测试图片" />
        <br />
        <hr />
      `;

      const result = await extractHTML(html);

      // 应该能正常处理，不抛出错误
      expect(result).toBeDefined();
    });

    it('应该处理不规范的 HTML', async () => {
      const html = `
        <div class="unclosed">
          <p>段落
          <span>文本
        </div>
      `;

      const result = await extractHTML(html);

      // 应该能处理，不抛出错误
      expect(result).toBeDefined();
      expect(result.commonClasses).toContain('unclosed');
    });

    it('应该处理非常大的 class 列表', async () => {
      const classes = Array.from({ length: 50 }, (_, i) => `class-${i}`).join(' ');
      const html = `<div class="${classes}">内容</div>`;

      const result = await extractHTML(html);

      expect(result.commonClasses.length).toBe(50);
    });
  });
});
