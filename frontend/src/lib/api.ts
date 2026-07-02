import axios from 'axios'
import type { ApiResponse, LoginResponse, User } from '@/types'
import { tokenStorage } from '@/lib/token'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/auth/login') {
      tokenStorage.remove()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export async function login(username: string, password: string) {
  const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', { username, password })
  return res.data
}

export async function getMe() {
  const res = await api.get<ApiResponse<User>>('/auth/me')
  return res.data
}

export async function updatePassword(oldPassword: string, newPassword: string) {
  const res = await api.put<ApiResponse<null>>('/auth/password', { old_password: oldPassword, new_password: newPassword })
  return res.data
}

export async function logout() {
  const res = await api.post<ApiResponse<null>>('/auth/logout')
  return res.data
}

export async function getSettings() {
  const res = await api.get<ApiResponse<Record<string, string>>>('/settings')
  return res.data
}

export async function updateSettings(data: Record<string, string>) {
  const res = await api.put<ApiResponse<null>>('/auth/settings', data)
  return res.data
}