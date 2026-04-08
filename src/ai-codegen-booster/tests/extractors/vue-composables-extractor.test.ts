/**
 * Vue Composables 提取器测试
 * 测试 Vue 3 Composition API、Composables 和指令提取功能
 */

import { describe, it, expect } from 'vitest';
import {
  extractEnhancedVueComponent,
} from '../../src/extractors/vue-composables-extractor';

describe('Vue Composables 提取器', () => {
  describe('基础响应式提取', () => {
    it('应该提取 ref 变量', async () => {
      const code = `
        <script setup>
        import { ref } from 'vue';
        const count = ref(0);
        const message = ref('Hello Vue');
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.reactivity.refs).toHaveLength(2);
      expect(result.reactivity.refs).toContain('count');
      expect(result.reactivity.refs).toContain('message');
    });

    it('应该提取 reactive 对象', async () => {
      const code = `
        <script setup>
        import { reactive } from 'vue';
        const state = reactive({
          count: 0,
          name: 'Vue'
        });
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.reactivity.reactives).toHaveLength(1);
      expect(result.reactivity.reactives).toContain('state');
    });

    it('应该提取 computed 属性', async () => {
      const code = `
        <script setup>
        import { ref, computed } from 'vue';
        const count = ref(0);
        const doubleCount = computed(() => count.value * 2);
        const isEven = computed(() => count.value % 2 === 0);
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.reactivity.computeds).toHaveLength(2);
      expect(result.reactivity.computeds).toContain('doubleCount');
      expect(result.reactivity.computeds).toContain('isEven');
    });

    it('应该提取 watch 和 watchEffect', async () => {
      const code = `
        <script setup>
        import { ref, watch, watchEffect } from 'vue';
        const count = ref(0);

        watch(count, (newValue, oldValue) => {
          console.log(newValue);
        });

        watchEffect(() => {
          console.log(count.value);
        });
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.reactivity.watches).toHaveLength(2);
    });
  });

  describe('Composables 提取', () => {
    it('应该识别 Composable 函数', async () => {
      const code = `
        <script>
        export function useCounter(initialValue = 0) {
          const count = ref(initialValue);
          const increment = () => count.value++;
          const decrement = () => count.value--;
          return { count, increment, decrement };
        }
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.composables).toHaveLength(1);
      expect(result.composables[0].name).toBe('useCounter');
      expect(result.composables[0].parameters).toEqual(['initialValue']);
      expect(result.composables[0].returns).toContain('count');
      expect(result.composables[0].returns).toContain('increment');
      expect(result.composables[0].returns).toContain('decrement');
    });

    it('应该提取使用其他 Composable 的 Composable', async () => {
      const code = `
        <script>
        export function useUserProfile() {
          const { user } = useUser();
          const { settings } = useSettings();
          const isComplete = computed(() => user.value && settings.value);
          return { user, settings, isComplete };
        }
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.composables).toHaveLength(1);
      expect(result.composables[0].usedComposables).toContain('useUser');
      expect(result.composables[0].usedComposables).toContain('useSettings');
    });

    it('应该提取 Composable 中的生命周期钩子', async () => {
      const code = `
        <script>
        export function useDataFetch(url) {
          const data = ref(null);

          onMounted(() => {
            fetch(url).then(res => data.value = res);
          });

          onUnmounted(() => {
            cleanup();
          });

          return { data };
        }
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.composables).toHaveLength(1);
      expect(result.composables[0].lifecycleHooks).toContain('onMounted');
      expect(result.composables[0].lifecycleHooks).toContain('onUnmounted');
    });
  });

  describe('生命周期钩子提取', () => {
    it('应该提取所有生命周期钩子', async () => {
      const code = `
        <script setup>
        import {
          onMounted,
          onUpdated,
          onUnmounted,
          onBeforeMount,
          onBeforeUpdate,
          onBeforeUnmount
        } from 'vue';

        onBeforeMount(() => console.log('before mount'));
        onMounted(() => console.log('mounted'));
        onBeforeUpdate(() => console.log('before update'));
        onUpdated(() => console.log('updated'));
        onBeforeUnmount(() => console.log('before unmount'));
        onUnmounted(() => console.log('unmounted'));
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.lifecycleHooks).toContain('onBeforeMount');
      expect(result.lifecycleHooks).toContain('onMounted');
      expect(result.lifecycleHooks).toContain('onBeforeUpdate');
      expect(result.lifecycleHooks).toContain('onUpdated');
      expect(result.lifecycleHooks).toContain('onBeforeUnmount');
      expect(result.lifecycleHooks).toContain('onUnmounted');
    });

    it('应该提取 Options API 生命周期', async () => {
      const code = `
        <script>
        export default {
          mounted() {
            console.log('mounted');
          },
          updated() {
            console.log('updated');
          },
          unmounted() {
            console.log('unmounted');
          }
        }
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.lifecycleHooks).toContain('mounted');
      expect(result.lifecycleHooks).toContain('updated');
      expect(result.lifecycleHooks).toContain('unmounted');
    });
  });

  describe('Provide/Inject 提取', () => {
    it('应该提取 provide', async () => {
      const code = `
        <script setup>
        import { provide, ref } from 'vue';
        const theme = ref('dark');
        provide('theme', theme);
        provide('config', { api: 'https://api.example.com' });
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.provides).toHaveLength(2);
      expect(result.provides[0].key).toBe('theme');
      expect(result.provides[1].key).toBe('config');
    });

    it('应该提取 inject', async () => {
      const code = `
        <script setup>
        import { inject } from 'vue';
        const theme = inject('theme', 'light');
        const config = inject('config');
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.injects).toHaveLength(2);
      expect(result.injects[0].key).toBe('theme');
      expect(result.injects[0].defaultValue).toBe('light');
      expect(result.injects[1].key).toBe('config');
    });
  });

  describe('自定义指令提取', () => {
    it('应该提取自定义指令定义', async () => {
      const code = `
        <script>
        export default {
          directives: {
            focus: {
              mounted(el) {
                el.focus();
              }
            },
            highlight: {
              mounted(el, binding) {
                el.style.backgroundColor = binding.value;
              }
            }
          }
        }
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.directives).toHaveLength(2);
      expect(result.directives[0].name).toBe('focus');
      expect(result.directives[1].name).toBe('highlight');
    });

    it('应该提取函数式指令', async () => {
      const code = `
        <script setup>
        const vClickOutside = {
          mounted(el, binding) {
            el._clickOutside = (event) => {
              if (!el.contains(event.target)) {
                binding.value();
              }
            };
            document.addEventListener('click', el._clickOutside);
          },
          unmounted(el) {
            document.removeEventListener('click', el._clickOutside);
          }
        };
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.directives.length).toBeGreaterThan(0);
    });
  });

  describe('Props 和 Emits 提取', () => {
    it('应该提取 defineProps', async () => {
      const code = `
        <script setup>
        const props = defineProps({
          title: String,
          count: {
            type: Number,
            default: 0
          },
          items: Array
        });
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.props).toHaveLength(3);
      expect(result.props.find(p => p.name === 'title')?.type).toBe('String');
      expect(result.props.find(p => p.name === 'count')?.defaultValue).toBe('0');
    });

    it('应该提取 TypeScript 类型的 Props', async () => {
      const code = `
        <script setup lang="ts">
        interface Props {
          title: string;
          count?: number;
          items: string[];
        }

        const props = defineProps<Props>();
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.props).toHaveLength(3);
      expect(result.props.find(p => p.name === 'count')?.optional).toBe(true);
    });

    it('应该提取 defineEmits', async () => {
      const code = `
        <script setup>
        const emit = defineEmits(['update', 'delete', 'submit']);
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.emits).toHaveLength(3);
      expect(result.emits).toContain('update');
      expect(result.emits).toContain('delete');
      expect(result.emits).toContain('submit');
    });

    it('应该提取 TypeScript 类型的 Emits', async () => {
      const code = `
        <script setup lang="ts">
        const emit = defineEmits<{
          update: [value: string];
          delete: [id: number];
          submit: [data: FormData];
        }>();
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.emits).toHaveLength(3);
    });
  });

  describe('复杂组件场景', () => {
    it('应该处理完整的 Composition API 组件', async () => {
      const code = `
        <script setup>
        import { ref, computed, watch, onMounted } from 'vue';
        import { useUser } from '@/composables/useUser';

        const props = defineProps({
          userId: String
        });

        const emit = defineEmits(['update']);

        const { user, loading } = useUser(props.userId);
        const count = ref(0);
        const doubleCount = computed(() => count.value * 2);

        watch(count, (newValue) => {
          emit('update', newValue);
        });

        onMounted(() => {
          console.log('Component mounted');
        });
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.props).toHaveLength(1);
      expect(result.emits).toHaveLength(1);
      expect(result.composables.some(c => c.name === 'useUser')).toBe(true);
      expect(result.reactivity.refs).toContain('count');
      expect(result.reactivity.computeds).toContain('doubleCount');
      expect(result.reactivity.watches.length).toBeGreaterThan(0);
      expect(result.lifecycleHooks).toContain('onMounted');
    });

    it('应该处理 Options API 组件', async () => {
      const code = `
        <script>
        export default {
          name: 'UserProfile',
          props: {
            userId: {
              type: String,
              required: true
            }
          },
          data() {
            return {
              user: null,
              loading: true
            };
          },
          computed: {
            fullName() {
              return this.user?.firstName + ' ' + this.user?.lastName;
            }
          },
          watch: {
            userId(newId) {
              this.fetchUser(newId);
            }
          },
          mounted() {
            this.fetchUser(this.userId);
          },
          methods: {
            fetchUser(id) {
              // fetch logic
            }
          }
        }
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.componentName).toBe('UserProfile');
      expect(result.props).toHaveLength(1);
      expect(result.reactivity.data).toContain('user');
      expect(result.reactivity.data).toContain('loading');
      expect(result.methods).toContain('fetchUser');
    });

    it('应该处理混合使用 Composables 的组件', async () => {
      const code = `
        <script setup>
        import { useCounter } from './useCounter';
        import { useUser } from './useUser';
        import { useMouse } from '@vueuse/core';

        const { count, increment } = useCounter();
        const { user, loading } = useUser();
        const { x, y } = useMouse();
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.composables.length).toBeGreaterThanOrEqual(3);
      expect(result.composables.some(c => c.name === 'useCounter')).toBe(true);
      expect(result.composables.some(c => c.name === 'useUser')).toBe(true);
      expect(result.composables.some(c => c.name === 'useMouse')).toBe(true);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空组件', async () => {
      const code = `
        <script setup>
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.props).toHaveLength(0);
      expect(result.composables).toHaveLength(0);
    });

    it('应该处理只有模板的组件', async () => {
      const code = `
        <template>
          <div>Hello World</div>
        </template>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result).toBeDefined();
    });

    it('应该处理 SFC 的多个 script 块', async () => {
      const code = `
        <script>
        export default {
          name: 'MyComponent'
        }
        </script>

        <script setup>
        import { ref } from 'vue';
        const count = ref(0);
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.componentName).toBe('MyComponent');
      expect(result.reactivity.refs).toContain('count');
    });

    it('应该处理复杂的响应式嵌套', async () => {
      const code = `
        <script setup>
        import { ref, reactive, computed } from 'vue';

        const state = reactive({
          nested: {
            deep: {
              value: 0
            }
          }
        });

        const deepValue = computed(() => state.nested.deep.value);
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.reactivity.reactives).toContain('state');
      expect(result.reactivity.computeds).toContain('deepValue');
    });

    it('应该处理解构的 Composable 返回值', async () => {
      const code = `
        <script setup>
        const {
          data,
          loading,
          error,
          refetch
        } = useQuery(query);
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.composables.some(c => c.name === 'useQuery')).toBe(true);
    });

    it('应该处理动态 provide/inject key', async () => {
      const code = `
        <script setup>
        import { provide, inject } from 'vue';

        const key = Symbol('myKey');
        provide(key, 'value');

        const injected = inject(key);
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.provides.length).toBeGreaterThan(0);
      expect(result.injects.length).toBeGreaterThan(0);
    });
  });

  describe('TypeScript 支持', () => {
    it('应该处理 TypeScript 组件', async () => {
      const code = `
        <script setup lang="ts">
        import { ref, Ref } from 'vue';

        interface User {
          id: number;
          name: string;
        }

        const user: Ref<User | null> = ref(null);
        const users: Ref<User[]> = ref([]);
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.reactivity.refs).toContain('user');
      expect(result.reactivity.refs).toContain('users');
    });

    it('应该处理泛型 Composable', async () => {
      const code = `
        <script setup lang="ts">
        function useList<T>(initialItems: T[] = []) {
          const items = ref<T[]>(initialItems);
          const add = (item: T) => items.value.push(item);
          return { items, add };
        }

        const { items, add } = useList<string>([]);
        </script>
      `;

      const result = await extractEnhancedVueComponent(code);

      expect(result.composables.length).toBeGreaterThan(0);
    });
  });
});
