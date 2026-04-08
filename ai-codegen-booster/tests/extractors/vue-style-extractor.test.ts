/**
 * Tests for Vue Style Extractor
 */

import { describe, it, expect } from 'vitest';
import { extractVueStyles } from '../../src/extractors/vue-style-extractor';

describe('Vue Style Extractor', () => {
  describe('extractVueStyles()', () => {
    it('should extract CSS from Vue SFC', async () => {
      const vueCode = `
<template>
  <button class="btn">Click</button>
</template>

<style scoped>
.btn {
  background-color: #3b82f6;
  padding: 0.5rem 1rem;
}
</style>
      `;

      const result = await extractVueStyles(vueCode);

      expect(result.styles).toHaveLength(1);
      expect(result.styles[0].scoped).toBe(true);
      expect(result.styles[0].lang).toBe('css');
      expect(result.variables.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract Less from Vue SFC', async () => {
      const vueCode = `
<template>
  <div>Content</div>
</template>

<style lang="less">
@primary-color: #3b82f6;

.container {
  color: @primary-color;
}
</style>
      `;

      const result = await extractVueStyles(vueCode);

      expect(result.styles).toHaveLength(1);
      expect(result.styles[0].lang).toBe('less');
      expect(result.variables.some(v => v.name === '@primary-color')).toBe(true);
    });

    it('should extract SCSS from Vue SFC', async () => {
      const vueCode = `
<template>
  <div>Content</div>
</template>

<style lang="scss">
$primary-color: #3b82f6;

.container {
  color: $primary-color;
}
</style>
      `;

      const result = await extractVueStyles(vueCode);

      expect(result.styles).toHaveLength(1);
      expect(result.styles[0].lang).toBe('scss');
      expect(result.variables.some(v => v.name === '$primary-color')).toBe(true);
    });

    it('should handle multiple style blocks', async () => {
      const vueCode = `
<template>
  <div>Content</div>
</template>

<style>
.global-style {
  margin: 0;
}
</style>

<style scoped>
.scoped-style {
  padding: 1rem;
}
</style>
      `;

      const result = await extractVueStyles(vueCode);

      expect(result.styles).toHaveLength(2);
      expect(result.styles[0].scoped).toBe(false);
      expect(result.styles[1].scoped).toBe(true);
    });

    it('should handle Vue SFC without style', async () => {
      const vueCode = `
<template>
  <div>Content</div>
</template>

<script setup>
</script>
      `;

      const result = await extractVueStyles(vueCode);

      expect(result.styles).toHaveLength(0);
      expect(result.variables).toHaveLength(0);
    });
  });
});
