import { NavLink } from 'react-router-dom'
import { LayoutDashboard, User, Moon, Sun, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: '控制台', icon: LayoutDashboard },
  { to: '/profile', label: '个人中心', icon: User },
]

export function Sidebar() {
  const { theme, toggle } = useTheme()
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center px-6 font-semibold text-lg">
        Bedrock
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-secondary text-secondary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Separator />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <span className="truncate">{user?.username}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={toggle} title={theme === 'light' ? '切换深色' : '切换浅色'}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} title="退出登录">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
