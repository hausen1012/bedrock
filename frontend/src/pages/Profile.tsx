import { useState, type FormEvent } from 'react'
import { updatePassword } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Profile() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdError, setPwdError] = useState('')

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
  )
}