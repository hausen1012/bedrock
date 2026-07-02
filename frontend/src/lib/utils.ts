import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 从 axios 错误响应中提取错误消息
 */
export function getErrorMessage(err: unknown, fallback = '操作失败'): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
}