import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { login as apiLogin, getMe, logout as apiLogout, setOnUnauthorized } from '@/lib/api'
import { createCtx } from '@/lib/create-ctx'
import { tokenStorage } from '@/lib/token'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const [AuthProviderBase, useAuth] = createCtx<AuthContextValue>('Auth')

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const clearAuth = useCallback(() => {
    tokenStorage.remove()
    setUser(null)
  }, [])

  useEffect(() => {
    setOnUnauthorized(clearAuth)
    return () => setOnUnauthorized(() => {})
  }, [clearAuth])

  useEffect(() => {
    const token = tokenStorage.get()
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => clearAuth())
      .finally(() => setLoading(false))
  }, [clearAuth])

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password)
    tokenStorage.set(res.data.token)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // 忽略退出登录时的服务端错误
    }
    clearAuth()
  }, [])

  const updateUser = useCallback((u: User) => setUser(u), [])

  return (
    <AuthProviderBase value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthProviderBase>
  )
}

export { useAuth }