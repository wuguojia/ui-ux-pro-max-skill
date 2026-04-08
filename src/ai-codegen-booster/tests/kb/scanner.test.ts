/**
 * Tests for Knowledge Base Scanner
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KnowledgeBaseScanner } from '../../src/kb/scanner';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('KnowledgeBaseScanner', () => {
  let testDir: string;
  let scanner: KnowledgeBaseScanner;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = join(tmpdir(), `kb-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    scanner = new KnowledgeBaseScanner({
      frameworks: ['React', 'Vue'],
      extensions: ['.tsx', '.vue', '.css', '.less'],
      verbose: false,
    });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('React Component Extraction', () => {
    it('should extract React component with props', async () => {
      const componentCode = `
        interface ButtonProps {
          variant: 'primary' | 'secondary';
          onClick?: () => void;
        }

        export function Button(props: ButtonProps) {
          return <button>Click</button>;
        }
      `;

      await writeFile(join(testDir, 'Button.tsx'), componentCode);

      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'React',
        enabled: true,
      });

      expect(result.components).toHaveLength(1);
      expect(result.components[0].componentName).toBe('Button');
      expect(result.components[0].framework).toBe('React');
      expect(result.components[0].props).toHaveLength(2);
      expect(result.stats.componentsFound).toBe(1);
    });

    it('should handle empty directory', async () => {
      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'React',
        enabled: true,
      });

      expect(result.components).toHaveLength(0);
      expect(result.styles).toHaveLength(0);
      expect(result.stats.filesScanned).toBe(0);
    });
  });

  describe('Vue Component Extraction', () => {
    it('should extract Vue 3 Composition API component', async () => {
      const vueCode = `
<template>
  <button @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant: 'primary' | 'secondary';
}>();

const emit = defineEmits<{
  click: [];
}>();

function handleClick() {
  emit('click');
}
</script>
      `;

      await writeFile(join(testDir, 'Button.vue'), vueCode);

      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'Vue',
        enabled: true,
      });

      expect(result.components).toHaveLength(1);
      expect(result.components[0].framework).toBe('Vue');
      expect(result.components[0].props).toHaveLength(1);
      expect(result.components[0].events).toContain('click');
      expect(result.components[0].slots).toContain('default');
      expect(result.components[0].apiStyle).toBe('Composition');
    });
  });

  describe('Style Extraction', () => {
    it('should extract CSS variables', async () => {
      const cssCode = `
        :root {
          --primary-color: #3b82f6;
          --spacing-4: 1rem;
        }
      `;

      await writeFile(join(testDir, 'styles.css'), cssCode);

      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'React',
        enabled: true,
      });

      expect(result.styles.length).toBeGreaterThan(0);
      const primaryColor = result.styles.find(s => s.name === '--primary-color');
      expect(primaryColor).toBeDefined();
      expect(primaryColor?.styleType).toBe('CSS Variable');
      expect(primaryColor?.value).toBe('#3b82f6');
    });

    it('should extract Less variables', async () => {
      const lessCode = `
        @primary-color: #3b82f6;
        @spacing-4: 1rem;

        .button {
          background: @primary-color;
          padding: @spacing-4;
        }
      `;

      await writeFile(join(testDir, 'styles.less'), lessCode);

      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'React',
        enabled: true,
      });

      expect(result.styles.length).toBeGreaterThan(0);
      const primaryColor = result.styles.find(s => s.name === '@primary-color');
      expect(primaryColor).toBeDefined();
      expect(primaryColor?.styleType).toBe('Less Variable');
    });
  });

  describe('Vue Style Extraction', () => {
    it('should extract styles from Vue SFC with Less', async () => {
      const vueCode = `
<template>
  <div class="card">Content</div>
</template>

<style lang="less" scoped>
@card-padding: 1rem;

.card {
  padding: @card-padding;
}
</style>
      `;

      await writeFile(join(testDir, 'Card.vue'), vueCode);

      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'Vue',
        enabled: true,
      });

      // Should find component
      expect(result.components.length).toBeGreaterThan(0);

      // Should find styles
      expect(result.styles.length).toBeGreaterThan(0);
      const cardPadding = result.styles.find(s => s.name === '@card-padding');
      expect(cardPadding).toBeDefined();
      expect(cardPadding?.preprocessor).toBe('Less');
    });
  });

  describe('File Filtering', () => {
    it('should skip ignored directories', async () => {
      // Create node_modules directory
      await mkdir(join(testDir, 'node_modules'), { recursive: true });
      await writeFile(join(testDir, 'node_modules', 'test.tsx'), 'export function Test() {}');

      // Create regular file
      await writeFile(join(testDir, 'Button.tsx'), 'export function Button() {}');

      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'React',
        enabled: true,
      });

      // Should only scan Button.tsx, not node_modules
      expect(result.stats.filesScanned).toBe(1);
      expect(result.stats.filesSkipped).toBeGreaterThan(0);
    });

    it('should only scan specified extensions', async () => {
      await writeFile(join(testDir, 'Button.tsx'), 'export function Button() {}');
      await writeFile(join(testDir, 'README.md'), '# README');
      await writeFile(join(testDir, 'package.json'), '{}');

      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'React',
        enabled: true,
      });

      // Should only scan .tsx file
      expect(result.stats.filesScanned).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should continue scanning on extraction errors', async () => {
      // Create invalid file
      await writeFile(join(testDir, 'Invalid.tsx'), 'this is not valid TypeScript {{{');

      // Create valid file
      await writeFile(join(testDir, 'Valid.tsx'), 'export function Valid() { return <div />; }');

      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'React',
        enabled: true,
      });

      // Should scan both files but only extract from valid one
      expect(result.stats.filesScanned).toBe(2);
      // Errors are recorded but don't stop scanning
    });
  });

  describe('Statistics', () => {
    it('should provide accurate scan statistics', async () => {
      await writeFile(join(testDir, 'Button.tsx'), 'export function Button() { return <button />; }');
      await writeFile(join(testDir, 'Card.vue'), '<template><div /></template><script setup></script>');
      await writeFile(join(testDir, 'styles.css'), ':root { --color: red; }');

      const result = await scanner.scan({
        name: 'test',
        path: testDir,
        framework: 'React',
        enabled: true,
      });

      expect(result.stats.filesScanned).toBe(3);
      expect(result.stats.componentsFound).toBeGreaterThan(0);
      expect(result.stats.stylesFound).toBeGreaterThan(0);
      expect(result.stats.duration).toBeGreaterThan(0);
    });
  });
});
