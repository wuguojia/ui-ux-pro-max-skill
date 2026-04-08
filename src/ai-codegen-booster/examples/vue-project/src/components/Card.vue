<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  bordered?: boolean
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  hoverable: false,
  padding: 'md'
})

const cardClasses = computed(() => {
  return [
    'card',
    `card-padding-${props.padding}`,
    {
      'card-bordered': props.bordered,
      'card-hoverable': props.hoverable
    }
  ]
})
</script>

<style scoped>
.card {
  background-color: var(--white);
  border-radius: var(--radius-lg);
  transition: all 0.2s;
}

.card-bordered {
  border: 1px solid var(--border-color);
}

.card-hoverable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Padding variants */
.card-padding-none {
  padding: 0;
}

.card-padding-sm {
  padding: var(--spacing-sm);
}

.card-padding-md {
  padding: var(--spacing-md);
}

.card-padding-lg {
  padding: var(--spacing-lg);
}

.card-header {
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-md);
}

.card-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  color: var(--text-secondary);
}

.card-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-md);
}
</style>
