import { useState, type FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile, updatePassword } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [username, setUsername] = useState(user?.username || '')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdError, setPwdError] = useState('')

  async function handleProfile(e: FormEvent) {
    e.preventDefault()
    setProfileMsg('')
    setProfileError('')
    try {
      const res = await updateProfile(username)
      updateUser(res.data)
      setProfileMsg('用户名修改成功')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '修改失败'
      setProfileError(msg)
    }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault()
    setPwdMsg('')
    setPwdError('')
    try {
      await updatePassword(oldPassword, newPassword)
      setPwdMsg('密码修改成功')
      setOldPassword('')
      setNewPassword('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '修改失败'
      setPwdError(msg)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">个人中心</h1>

      <Card>
        <CardHeader>
          <CardTitle>修改用户名</CardTitle>
          <CardDescription>修改您的显示名称</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
              />
            </div>
            {profileMsg && <p className="text-sm text-green-600 dark:text-green-400">{profileMsg}</p>}
            {profileError && <p className="text-sm text-destructive">{profileError}</p>}
            <Button type="submit">保存</Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

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
            {pwdMsg && <p className="text-sm text-green-600 dark:text-green-400">{pwdMsg}</p>}
            {pwdError && <p className="text-sm text-destructive">{pwdError}</p>}
            <Button type="submit">修改密码</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}