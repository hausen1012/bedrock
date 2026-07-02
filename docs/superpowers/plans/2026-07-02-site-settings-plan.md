# 站点信息修改功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增配置项表（key-value），支持修改站点名称和站点图标，前端动态读取展示

**Architecture:** 后端新增 Setting model（key-value 表）+ 两个 API（公开 GET、认证 PUT），前端新增 SiteContext 统一管理站点配置，Profile 页新增编辑区，Sidebar 和 Login 页动态消费

**Tech Stack:** Go/Gin/GORM/SQLite + React/TypeScript/Tailwind

---

### Task 1: 后端 Setting 模型与数据库迁移

**Files:**
- Create: `backend/internal/models/setting.go`
- Modify: `backend/internal/database/database.go:28`

- [ ] **Step 1: 创建 Setting 模型**

```go
// backend/internal/models/setting.go
package models

type Setting struct {
    Key   string `gorm:"primaryKey;size:128" json:"key"`
    Value string `gorm:"type:text" json:"value"`
}
```

- [ ] **Step 2: 在 AutoMigrate 中添加 Setting**

```go
// backend/internal/database/database.go:28
if err := db.AutoMigrate(&models.User{}, &models.Setting{}); err != nil {
```

- [ ] **Step 3: 编译验证**

Run: `cd backend && go build ./...`
Expected: 编译成功，无错误

- [ ] **Step 4: 提交**

```bash
git add backend/internal/models/setting.go backend/internal/database/database.go
git commit -m "feat: 新增 Setting 模型用于 key-value 配置存储"
```

---

### Task 2: 后端设置项读写 Handler

**Files:**
- Create: `backend/internal/handlers/setting.go`

- [ ] **Step 1: 创建 setting handler 文件**

```go
// backend/internal/handlers/setting.go
package handlers

import (
    "net/http"

    "github.com/bedrock/backend/internal/database"
    "github.com/bedrock/backend/internal/models"
    "github.com/gin-gonic/gin"
)

// 默认值常量
const (
    DefaultSiteName = "Bedrock"
)

// GetSettings 公开接口，返回所有站点配置
func GetSettings(c *gin.Context) {
    var settings []models.Setting
    database.DB.Find(&settings)

    data := map[string]string{
        "site_name": DefaultSiteName,
        "site_icon": "",
    }
    for _, s := range settings {
        data[s.Key] = s.Value
    }

    c.JSON(http.StatusOK, gin.H{
        "code":    200,
        "message": "ok",
        "data":    data,
    })
}

// UpdateSettings 认证接口，批量更新站点配置
func UpdateSettings(c *gin.Context) {
    var req map[string]string
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "code":    400,
            "message": "请求格式错误",
            "data":    nil,
        })
        return
    }

    for key, value := range req {
        // 只允许更新白名单内的 key
        if key != "site_name" && key != "site_icon" {
            continue
        }
        database.DB.Where("key = ?", key).Assign(models.Setting{
            Key:   key,
            Value: value,
        }).FirstOrCreate(&models.Setting{})
    }

    c.JSON(http.StatusOK, gin.H{
        "code":    200,
        "message": "保存成功",
        "data":    nil,
    })
}
```

- [ ] **Step 2: 编译验证**

Run: `cd backend && go build ./...`
Expected: 编译成功

- [ ] **Step 3: 提交**

```bash
git add backend/internal/handlers/setting.go
git commit -m "feat: 新增站点配置读写接口"
```

---

### Task 3: 注册路由

**Files:**
- Modify: `backend/internal/router/router.go:24`

- [ ] **Step 1: 在路由中添加 settings 端点**

```go
// backend/internal/router/router.go
// 在 api 分组中（公开路由），与 health 同级：
api.GET("/health", handlers.HealthCheck)
api.GET("/settings", handlers.GetSettings)           // 新增
api.POST("/auth/login", authHandler.Login)

// 在 auth 分组中（认证路由）：
auth.PUT("/settings", handlers.UpdateSettings)       // 新增
```

完整改动后的相关部分：
```go
api := r.Group("/api")
{
    api.GET("/health", handlers.HealthCheck)
    api.GET("/settings", handlers.GetSettings)
    api.POST("/auth/login", authHandler.Login)
}

auth := api.Group("/auth")
auth.Use(middleware.JWTAuth(jwtSecret))
{
    auth.GET("/me", authHandler.Me)
    auth.POST("/logout", authHandler.Logout)
    auth.PUT("/password", handlers.UpdatePassword)
    auth.PUT("/settings", handlers.UpdateSettings)
}
```

- [ ] **Step 2: 编译验证**

Run: `cd backend && go build ./...`
Expected: 编译成功

- [ ] **Step 3: 提交**

```bash
git add backend/internal/router/router.go
git commit -m "feat: 注册 settings 读写路由"
```

---

### Task 4: 前端 API 函数与 SiteContext

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Create: `frontend/src/contexts/SiteContext.tsx`

- [ ] **Step 1: 在 api.ts 中添加 settings 相关方法**

```typescript
// 添加类型导入（如果 SiteSettings 未在 types 中定义，先使用 Record<string, string>）
export async function getSettings() {
  const res = await api.get<ApiResponse<Record<string, string>>>('/settings')
  return res.data
}

export async function updateSettings(data: Record<string, string>) {
  const res = await api.put<ApiResponse<null>>('/settings', data)
  return res.data
}
```

- [ ] **Step 2: 创建 SiteContext.tsx**

```tsx
// frontend/src/contexts/SiteContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getSettings } from '@/lib/api'

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

const SiteContext = createContext<SiteContextValue | undefined>(undefined)

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

  return (
    <SiteContext.Provider value={{ config, loading, refresh }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used within SiteProvider')
  return ctx
}
```

- [ ] **Step 3: 编译验证**

Run: `cd frontend && npx tsc --noEmit`
Expected: 类型检查通过

- [ ] **Step 4: 提交**

```bash
git add frontend/src/lib/api.ts frontend/src/contexts/SiteContext.tsx
git commit -m "feat: 前端新增站点配置 API 和 SiteContext"
```

---

### Task 5: 在 App.tsx 中接入 SiteProvider

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 包裹 SiteProvider**

```tsx
// 在 ThemeProvider 和 AuthProvider 之间或外层包裹
// SiteProvider 不依赖 AuthContext，放在 ThemeProvider 内、AuthProvider 外即可
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SiteProvider>
          <AuthProvider>
            <Routes>
              {/* 原有路由不变 */}
            </Routes>
          </AuthProvider>
        </SiteProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: 编译验证**

Run: `cd frontend && npx tsc --noEmit`
Expected: 类型检查通过

- [ ] **Step 3: 提交**

```bash
git add frontend/src/App.tsx
git commit -m "feat: App 根组件接入 SiteProvider"
```

---

### Task 6: Sidebar 动态站点名称和图标

**Files:**
- Modify: `frontend/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: 引入 useSite 并动态渲染 Logo 区域**

```tsx
// 新增导入
import { useSite } from '@/contexts/SiteContext'

// 在组件内
export function Sidebar() {
  const { theme, toggle } = useTheme()
  const { user, logout } = useAuth()
  const { config } = useSite()  // 新增

  // 修改 Logo 区域
  <div className="flex h-14 items-center gap-2 px-6 font-medium text-base leading-none">
    {config.site_icon ? (
      <img src={config.site_icon} alt="logo" className="h-5 w-5 object-contain" />
    ) : (
      <Mountain className="h-5 w-5" strokeWidth={1.5} />
    )}
    {config.site_name}
  </div>
```

- [ ] **Step 2: 编译验证**

Run: `cd frontend && npx tsc --noEmit`
Expected: 类型检查通过

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/layout/Sidebar.tsx
git commit -m "feat: Sidebar 动态使用站点名称和图标"
```

---

### Task 7: Login 页动态站点名称

**Files:**
- Modify: `frontend/src/pages/Login.tsx`

- [ ] **Step 1: 引入 useSite 并替换 CardTitle**

```tsx
// 新增导入
import { useSite } from '@/contexts/SiteContext'

// 在组件内
export default function Login() {
  const { login } = useAuth()
  const { config } = useSite()  // 新增
  // ...原有 state

  // 修改 CardTitle
  <CardTitle>{config.site_name}</CardTitle>
```

- [ ] **Step 2: 编译验证**

Run: `cd frontend && npx tsc --noEmit`
Expected: 类型检查通过

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/Login.tsx
git commit -m "feat: 登录页动态使用站点名称"
```

---

### Task 8: Profile 页新增站点信息编辑区

**Files:**
- Modify: `frontend/src/pages/Profile.tsx`

- [ ] **Step 1: 在 Profile 页新增站点信息卡片**

```tsx
// 新增导入
import { useSite } from '@/contexts/SiteContext'
import { updateSettings } from '@/lib/api'

export default function Profile() {
  const { config, refresh } = useSite()

  // 站点信息状态
  const [siteName, setSiteName] = useState(config.site_name)
  const [siteIcon, setSiteIcon] = useState(config.site_icon)
  const [siteMsg, setSiteMsg] = useState('')
  const [siteError, setSiteError] = useState('')
  const [saving, setSaving] = useState(false)

  // 当 config 加载完成后同步到本地状态
  useEffect(() => {
    setSiteName(config.site_name)
    setSiteIcon(config.site_icon)
  }, [config.site_name, config.site_icon])

  function handleIconFile(e: React.ChangeEvent<HTMLInputElement>) {
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">设置</h1>

      {/* 站点信息卡片 — 新增 */}
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

      {/* 原有的修改密码卡片 */}
      <Card>
        {/* ...保持不变 */}
      </Card>
    </div>
  )
}
```

> **注意:** 需要在顶部新增 `useEffect` 导入（如果尚未导入）。

- [ ] **Step 2: 编译验证**

Run: `cd frontend && npx tsc --noEmit`
Expected: 类型检查通过

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/Profile.tsx
git commit -m "feat: 设置页新增站点信息编辑功能"
```

---

### Task 9: 浏览器标签页动态标题

**Files:**
- Modify: `frontend/src/contexts/SiteContext.tsx`

- [ ] **Step 1: 在 SiteContext 中添加 document.title 同步**

```tsx
// 在设置 config 的 setConfig 调用旁添加
useEffect(() => {
  document.title = config.site_name
}, [config.site_name])
```

将这个 effect 放在 SiteProvider 组件中（在已有的 effect 之后即可）。

- [ ] **Step 2: 编译验证**

Run: `cd frontend && npx tsc --noEmit`
Expected: 类型检查通过

- [ ] **Step 3: 提交**

```bash
git add frontend/src/contexts/SiteContext.tsx
git commit -m "feat: 浏览器标签页标题跟随站点名称"
```

---

### Task 10: 端到端验证

- [ ] **Step 1: 启动后端**

Run: `cd backend && go run ./cmd/server`
Expected: 服务启动无错误

- [ ] **Step 2: 启动前端**

Run: `cd frontend && npm run dev`
Expected: 前端开发服务器启动

- [ ] **Step 3: 验证流程**
  1. 访问登录页 → 看到站点名称 "Bedrock"
  2. 登录 admin/admin123 → 进入首页
  3. 浏览器标签页标题为 "Bedrock"
  4. 侧边栏显示 Mountain 图标 + "Bedrock"
  5. 进入设置页 → 看到「站点信息」卡片
  6. 修改站点名称为 "MyApp" → 保存 → 提示成功
  7. 选一张图片上传 → 保存 → 侧边栏图标刷新
  8. 刷新页面 → 配置持久化
