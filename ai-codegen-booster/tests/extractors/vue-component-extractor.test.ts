/**
 * Tests for Vue Component Extractor
 */

import { describe, it, expect } from 'vitest';
import { extractVueComponent } from '../../src/extractors/vue-component-extractor';

describe('Vue Component Extractor', () => {
  describe('extractVueComponent()', () => {
    it('should extract Vue 3 component with Composition API', async () => {
      const vueCode = `
<template>
  <button :class="className">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'lg';
  disabled?: boolean;
}>();
</script>

<style scoped>
.button {
  padding: 0.5rem 1rem;
}
</style>
      `;

      const result = await extractVueComponent(vueCode);

      expect(result.name).toBeTruthy();
      expect(result.framework).toBe('Vue');
      expect(result.props).toHaveLength(3);
      expect(result.props.find(p => p.name === 'variant')).toMatchObject({
        name: 'variant',
        required: true,
      });
      expect(result.props.find(p => p.name === 'size')).toMatchObject({
        name: 'size',
        required: false,
      });
    });

    it('should extract Vue 2 component with Options API', async () => {
      const vueCode = `
<template>
  <div class="card">
    <h3>{{ title }}</h3>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    title: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'default'
    }
  }
}
</script>
      `;

      const result = await extractVueComponent(vueCode);

      expect(result.name).toBe('Card');
      expect(result.framework).toBe('Vue');
      expect(result.props).toHaveLength(2);
      expect(result.props.find(p => p.name === 'title')).toMatchObject({
        name: 'title',
        required: true,
        type: 'String',
      });
    });

    it('should extract slots from template', async () => {
      const vueCode = `
<template>
  <div>
    <slot name="header" />
    <slot />
    <slot name="footer" />
  </div>
</template>

<script setup>
</script>
      `;

      const result = await extractVueComponent(vueCode);

      expect(result.slots).toContain('header');
      expect(result.slots).toContain('default');
      expect(result.slots).toContain('footer');
    });

    it('should extract emits from script', async () => {
      const vueCode = `
<template>
  <button @click="handleClick">Click</button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  click: [];
  change: [value: string];
}>();

function handleClick() {
  emit('click');
}
</script>
      `;

      const result = await extractVueComponent(vueCode);

      expect(result.events).toContain('click');
      expect(result.events).toContain('change');
    });

    it('should handle component without props', async () => {
      const vueCode = `
<template>
  <div>Hello World</div>
</template>

<script setup>
</script>
      `;

      const result = await extractVueComponent(vueCode);

      expect(result.props).toHaveLength(0);
      expect(result.framework).toBe('Vue');
    });
  });
});
