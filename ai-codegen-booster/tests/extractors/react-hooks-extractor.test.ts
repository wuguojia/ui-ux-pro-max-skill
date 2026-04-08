/**
 * React Hooks 提取器测试
 * 测试 React Hooks、Context API 和泛型提取功能
 */

import { describe, it, expect } from 'vitest';
import {
  extractEnhancedReactComponent,
} from '../../src/extractors/react-hooks-extractor';

describe('React Hooks 提取器', () => {
  describe('基础 Hooks 提取', () => {
    it('应该提取 useState Hook', async () => {
      const code = `
        function Counter() {
          const [count, setCount] = useState(0);
          const [name, setName] = useState('React');
          return <div>{count}</div>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.hooks).toHaveLength(2);
      expect(result.hooks[0].name).toBe('useState');
      expect(result.stateVariables).toHaveLength(2);
      expect(result.stateVariables[0].name).toBe('count');
      expect(result.stateVariables[0].setter).toBe('setCount');
      expect(result.stateVariables[1].name).toBe('name');
    });

    it('应该提取 useEffect Hook', async () => {
      const code = `
        function Component() {
          useEffect(() => {
            console.log('mounted');
          }, []);

          useEffect(() => {
            fetchData();
          }, [userId]);

          return <div>Hello</div>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.hooks.filter(h => h.name === 'useEffect')).toHaveLength(2);
      expect(result.effects).toHaveLength(2);
      expect(result.effects[0].dependencies).toEqual([]);
      expect(result.effects[1].dependencies).toEqual(['userId']);
    });

    it('应该提取 useContext Hook', async () => {
      const code = `
        function UserProfile() {
          const user = useContext(UserContext);
          const theme = useContext(ThemeContext);
          return <div>{user.name}</div>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.hooks.filter(h => h.name === 'useContext')).toHaveLength(2);
      expect(result.contexts).toHaveLength(2);
      expect(result.contexts[0].name).toBe('UserContext');
      expect(result.contexts[1].name).toBe('ThemeContext');
    });

    it('应该提取 useRef Hook', async () => {
      const code = `
        function Input() {
          const inputRef = useRef(null);
          const countRef = useRef(0);
          return <input ref={inputRef} />;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.hooks.filter(h => h.name === 'useRef')).toHaveLength(2);
    });

    it('应该提取 useMemo 和 useCallback', async () => {
      const code = `
        function ExpensiveComponent() {
          const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);
          const memoizedCallback = useCallback(() => {
            doSomething(a, b);
          }, [a, b]);
          return <div>{memoizedValue}</div>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.hooks.filter(h => h.name === 'useMemo')).toHaveLength(1);
      expect(result.hooks.filter(h => h.name === 'useCallback')).toHaveLength(1);
    });
  });

  describe('自定义 Hooks 提取', () => {
    it('应该识别自定义 Hook', async () => {
      const code = `
        function useUser(userId) {
          const [user, setUser] = useState(null);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
            fetchUser(userId).then(setUser);
          }, [userId]);

          return { user, loading };
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.customHooks).toHaveLength(1);
      expect(result.customHooks[0].name).toBe('useUser');
      expect(result.customHooks[0].parameters).toEqual(['userId']);
      expect(result.customHooks[0].usedHooks).toContain('useState');
      expect(result.customHooks[0].usedHooks).toContain('useEffect');
    });

    it('应该提取自定义 Hook 的返回值', async () => {
      const code = `
        function useCounter(initial = 0) {
          const [count, setCount] = useState(initial);
          const increment = () => setCount(c => c + 1);
          const decrement = () => setCount(c => c - 1);
          return { count, increment, decrement };
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.customHooks).toHaveLength(1);
      expect(result.customHooks[0].returnType).toContain('count');
      expect(result.customHooks[0].returnType).toContain('increment');
      expect(result.customHooks[0].returnType).toContain('decrement');
    });

    it('应该识别组合多个自定义 Hook', async () => {
      const code = `
        function useUserProfile() {
          const { user } = useUser();
          const { theme } = useTheme();
          const { notifications } = useNotifications();
          return { user, theme, notifications };
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.customHooks).toHaveLength(1);
      expect(result.customHooks[0].usedHooks).toContain('useUser');
      expect(result.customHooks[0].usedHooks).toContain('useTheme');
      expect(result.customHooks[0].usedHooks).toContain('useNotifications');
    });
  });

  describe('Context API 提取', () => {
    it('应该提取 createContext 定义', async () => {
      const code = `
        const UserContext = createContext(null);
        const ThemeContext = createContext({ theme: 'light' });
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.contexts).toHaveLength(2);
      expect(result.contexts[0].name).toBe('UserContext');
      expect(result.contexts[0].type).toBe('context');
    });

    it('应该提取 Context Provider', async () => {
      const code = `
        function UserProvider({ children }) {
          const [user, setUser] = useState(null);
          return (
            <UserContext.Provider value={{ user, setUser }}>
              {children}
            </UserContext.Provider>
          );
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.contexts.some(c => c.name === 'UserContext')).toBe(true);
    });

    it('应该提取 Context Consumer', async () => {
      const code = `
        function UserDisplay() {
          return (
            <UserContext.Consumer>
              {value => <div>{value.user.name}</div>}
            </UserContext.Consumer>
          );
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.contexts.some(c => c.name === 'UserContext')).toBe(true);
    });
  });

  describe('泛型提取', () => {
    it('应该提取组件泛型参数', async () => {
      const code = `
        function List<T>({ items }: { items: T[] }) {
          return <div>{items.map(item => <div key={item}>{item}</div>)}</div>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.generics).toHaveLength(1);
      expect(result.generics[0].name).toBe('T');
    });

    it('应该提取多个泛型参数', async () => {
      const code = `
        function Table<T, K extends keyof T>({ data, columns }: TableProps<T, K>) {
          return <table>...</table>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.generics).toHaveLength(2);
      expect(result.generics[0].name).toBe('T');
      expect(result.generics[1].name).toBe('K');
      expect(result.generics[1].constraint).toContain('keyof T');
    });

    it('应该提取泛型约束', async () => {
      const code = `
        function Select<T extends string | number>({ value, onChange }: SelectProps<T>) {
          return <select value={value} onChange={onChange} />;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.generics).toHaveLength(1);
      expect(result.generics[0].name).toBe('T');
      expect(result.generics[0].constraint).toBeDefined();
    });
  });

  describe('Props 提取', () => {
    it('应该提取 TypeScript 接口 Props', async () => {
      const code = `
        interface ButtonProps {
          label: string;
          onClick: () => void;
          disabled?: boolean;
        }

        function Button({ label, onClick, disabled }: ButtonProps) {
          return <button onClick={onClick} disabled={disabled}>{label}</button>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.props).toHaveLength(3);
      expect(result.props.find(p => p.name === 'label')?.type).toBe('string');
      expect(result.props.find(p => p.name === 'onClick')?.type).toContain('void');
      expect(result.props.find(p => p.name === 'disabled')?.optional).toBe(true);
    });

    it('应该提取解构的 Props', async () => {
      const code = `
        function Card({ title, content, footer }) {
          return (
            <div>
              <h1>{title}</h1>
              <div>{content}</div>
              <footer>{footer}</footer>
            </div>
          );
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.props).toHaveLength(3);
      expect(result.props.map(p => p.name)).toContain('title');
      expect(result.props.map(p => p.name)).toContain('content');
      expect(result.props.map(p => p.name)).toContain('footer');
    });

    it('应该提取带默认值的 Props', async () => {
      const code = `
        function Button({ size = 'medium', variant = 'primary' }) {
          return <button className={\`btn-\${size} btn-\${variant}\`} />;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.props).toHaveLength(2);
      expect(result.props.find(p => p.name === 'size')?.defaultValue).toBe('medium');
      expect(result.props.find(p => p.name === 'variant')?.defaultValue).toBe('primary');
    });
  });

  describe('复杂组件场景', () => {
    it('应该处理完整的功能组件', async () => {
      const code = `
        interface UserProfileProps {
          userId: string;
          onUpdate?: (user: User) => void;
        }

        function UserProfile({ userId, onUpdate }: UserProfileProps) {
          const [user, setUser] = useState<User | null>(null);
          const [loading, setLoading] = useState(true);
          const { theme } = useContext(ThemeContext);

          useEffect(() => {
            fetchUser(userId)
              .then(setUser)
              .finally(() => setLoading(false));
          }, [userId]);

          const handleUpdate = useCallback(() => {
            if (user && onUpdate) {
              onUpdate(user);
            }
          }, [user, onUpdate]);

          if (loading) return <div>Loading...</div>;
          return <div className={theme}>{user?.name}</div>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.name).toBe('UserProfile');
      expect(result.props).toHaveLength(2);
      expect(result.stateVariables).toHaveLength(2);
      expect(result.effects).toHaveLength(1);
      expect(result.hooks.filter(h => h.name === 'useContext')).toHaveLength(1);
      expect(result.hooks.filter(h => h.name === 'useCallback')).toHaveLength(1);
    });

    it('应该处理高阶组件', async () => {
      const code = `
        function withAuth<P>(Component: React.ComponentType<P>) {
          return function AuthenticatedComponent(props: P) {
            const { user } = useContext(AuthContext);
            if (!user) return <Redirect to="/login" />;
            return <Component {...props} />;
          };
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.generics).toHaveLength(1);
      expect(result.hooks.filter(h => h.name === 'useContext')).toHaveLength(1);
    });

    it('应该处理 Hooks 组合', async () => {
      const code = `
        function useDataFetching(url) {
          const [data, setData] = useState(null);
          const [loading, setLoading] = useState(false);
          const [error, setError] = useState(null);

          useEffect(() => {
            setLoading(true);
            fetch(url)
              .then(res => res.json())
              .then(setData)
              .catch(setError)
              .finally(() => setLoading(false));
          }, [url]);

          return { data, loading, error };
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.customHooks).toHaveLength(1);
      expect(result.stateVariables).toHaveLength(3);
      expect(result.effects).toHaveLength(1);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空组件', async () => {
      const code = `
        function Empty() {
          return null;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.name).toBe('Empty');
      expect(result.hooks).toHaveLength(0);
      expect(result.props).toHaveLength(0);
    });

    it('应该处理箭头函数组件', async () => {
      const code = `
        const ArrowComponent = () => {
          const [count, setCount] = useState(0);
          return <div>{count}</div>;
        };
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.name).toBe('ArrowComponent');
      expect(result.stateVariables).toHaveLength(1);
    });

    it('应该处理没有 JSX 的组件', async () => {
      const code = `
        function useOnlyHook() {
          const [value, setValue] = useState(0);
          return { value, setValue };
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.customHooks).toHaveLength(1);
      expect(result.stateVariables).toHaveLength(1);
    });

    it('应该处理复杂的 Hook 依赖', async () => {
      const code = `
        function Component() {
          const [a, setA] = useState(0);
          const [b, setB] = useState(0);

          useEffect(() => {
            console.log(a + b);
          }, [a, b]);

          useEffect(() => {
            console.log('complex');
          }, [a, b, someObject.prop, otherArray[0]]);

          return <div />;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.effects).toHaveLength(2);
      expect(result.effects[0].dependencies).toEqual(['a', 'b']);
      expect(result.effects[1].dependencies.length).toBeGreaterThan(2);
    });

    it('应该处理条件 Hook（虽然不推荐）', async () => {
      const code = `
        function ConditionalHooks({ condition }) {
          const [state1, setState1] = useState(0);

          if (condition) {
            // 这是反模式，但我们应该能检测到
            const [state2, setState2] = useState(1);
          }

          return <div>{state1}</div>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      // 应该能提取到所有 useState，即使在条件语句中
      expect(result.stateVariables.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('TypeScript 类型提取', () => {
    it('应该提取复杂的 TypeScript 类型', async () => {
      const code = `
        type Status = 'idle' | 'loading' | 'success' | 'error';

        interface User {
          id: string;
          name: string;
          email: string;
        }

        function UserComponent({ user }: { user: User }) {
          const [status, setStatus] = useState<Status>('idle');
          return <div>{user.name}</div>;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.props).toHaveLength(1);
      expect(result.props[0].type).toContain('User');
      expect(result.stateVariables).toHaveLength(1);
    });

    it('应该提取联合类型和交叉类型', async () => {
      const code = `
        type ButtonVariant = 'primary' | 'secondary' | 'danger';
        type Size = 'sm' | 'md' | 'lg';

        interface BaseProps {
          className?: string;
        }

        interface ButtonProps extends BaseProps {
          variant: ButtonVariant;
          size: Size;
          onClick: () => void;
        }

        function Button(props: ButtonProps) {
          return <button {...props} />;
        }
      `;

      const result = await extractEnhancedReactComponent(code);

      expect(result.props.length).toBeGreaterThan(0);
      expect(result.props.some(p => p.name === 'variant')).toBe(true);
      expect(result.props.some(p => p.name === 'size')).toBe(true);
    });
  });
});
