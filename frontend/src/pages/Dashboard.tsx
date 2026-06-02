import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">欢迎回来</h1>
      <p className="text-muted-foreground">
        你好，{user?.username}。这是一个基底项目，您可以在此基础上快速开发。
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm text-muted-foreground">项目状态</p>
          <p className="mt-2 text-2xl font-semibold">就绪</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm text-muted-foreground">当前用户</p>
          <p className="mt-2 text-2xl font-semibold">{user?.username}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm text-muted-foreground">系统版本</p>
          <p className="mt-2 text-2xl font-semibold">v1.0.0</p>
        </div>
      </div>
    </div>
  )
}