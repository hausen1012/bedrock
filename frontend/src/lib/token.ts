const TOKEN_KEY = 'token'

/**
 * token 管理工具，统一 localStorage 中 token 的存取
 */
export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  remove(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
}