import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { getSettings } from '@/lib/api'
import { createCtx } from '@/lib/create-ctx'

interface SiteConfig {
  site_name: string
  site_icon: string
}

interface SiteContextValue {
  config: SiteConfig
  loading: boolean
  refresh: () => Promise<void>
}

const defaultConfig: SiteConfig = {
  site_name: 'Bedrock',
  site_icon: '',
}

const [SiteProviderBase, useSite] = createCtx<SiteContextValue>('Site')

export function SiteProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await getSettings()
      setConfig({
        site_name: res.data.site_name || 'Bedrock',
        site_icon: res.data.site_icon || '',
      })
    } catch {
      // 保持默认值
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    document.title = config.site_name
  }, [config.site_name])

  return (
    <SiteProviderBase value={{ config, loading, refresh }}>
      {children}
    </SiteProviderBase>
  )
}

export { useSite }
