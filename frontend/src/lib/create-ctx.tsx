import { createContext, useContext, type ReactNode } from 'react'

/**
 * 创建一个带守卫的 Context，在 useContext 使用时自动检查是否在 Provider 内。
 * 返回 [Provider, useCtx] 元组。
 *
 * @example
 * const [ThemeProvider, useTheme] = createCtx<ThemeContextValue>('Theme')
 */
export function createCtx<T>(name: string) {
  const Ctx = createContext<T | undefined>(undefined)

  function Provider({ children, value }: { children: ReactNode; value: T }) {
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>
  }

  function useCtx() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error(`use${name} must be used within ${name}Provider`)
    return ctx
  }

  return [Provider, useCtx] as const
}
