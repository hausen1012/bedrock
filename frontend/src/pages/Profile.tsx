import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { updatePassword, updateSettings } from '@/lib/api'
import { useSite } from '@/contexts/SiteContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Profile() {
  const { config, refresh } = useSite()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [siteName, setSiteName] = useState(config.site_name)
  const [siteIcon, setSiteIcon] = useState(config.site_icon)
  const [siteMsg, setSiteMsg] = useState('')
  const [siteError, setSiteError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSiteName(config.site_name)
    setSiteIcon(config.site_icon)
  }, [config.site_name, config.site_icon])

  function handleIconFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSiteIcon(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSiteSave(e: FormEvent) {
    e.preventDefault()
    setSiteMsg('')
    setSiteError('')
    setSaving(true)
    try {
      await updateSettings({
        site_name: siteName,
        site_icon: siteIcon,
      })
      await refresh()
      setSiteMsg('站点信息保存成功')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '保存失败'
      setSiteError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault()
    setPwdMsg('')
    setPwdError('')
    if (newPassword !== confirmPassword) {
      setPwdError('两次输入的新密码不一致')
      return
    }
    try {
      await updatePassword(oldPassword, newPassword)
      setPwdMsg('密码修改成功')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '修改失败'
      setPwdError(msg)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">设置</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
        <CardHeader>
          <CardTitle>站点信息</CardTitle>
          <CardDescription>修改站点名称和图标</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSiteSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">站点名称</Label>
              <Input
                id="site-name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-icon">站点图标</Label>
              <Input
                id="site-icon"
                type="file"
                accept="image/*"
                onChange={handleIconFile}
              />
              {siteIcon && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={siteIcon} alt="图标预览" className="h-8 w-8 rounded object-contain border" />
                  <span className="text-xs text-muted-foreground">图标预览</span>
                  <Button type="button" variant="ghost" size="sm" className="text-xs text-destructive h-auto px-2 py-0" onClick={() => setSiteIcon('')}>清除</Button>
                </div>
              )}
            </div>
            {siteMsg && <p className="text-sm text-green-600 dark:text-green-400">{siteMsg}</p>}
            {siteError && <p className="text-sm text-destructive">{siteError}</p>}
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? '保存中...' : '保存站点信息'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>请定期更换密码以确保安全</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">原密码</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认新密码</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {pwdMsg && <p className="text-sm text-green-600 dark:text-green-400">{pwdMsg}</p>}
            {pwdError && <p className="text-sm text-destructive">{pwdError}</p>}
            <Button type="submit" size="sm">修改密码</Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}