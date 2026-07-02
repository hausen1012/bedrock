# 站点信息修改功能设计

## 概述

为系统增加站点信息修改功能，支持修改站点名称和站点图标（base64），通过 key-value 配置表实现，方便后续扩展。

## 数据模型

### Setting 表

```go
type Setting struct {
    Key   string `gorm:"primaryKey;size:128" json:"key"`
    Value string `gorm:"type:text" json:"value"`
}
```

预定义 Key：
- `site_name` — 站点名称，默认值 `"Bedrock"`
- `site_icon` — 站点图标（base64 编码的图片数据），可为空

## 后端 API

| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | `/api/settings` | 否 | 获取所有站点配置 |
| PUT | `/api/settings` | 是 | 批量更新站点配置 |

### GET /api/settings

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "site_name": "Bedrock",
    "site_icon": "data:image/png;base64,..."
  }
}
```

### PUT /api/settings

请求体：

```json
{
  "site_name": "我的站点",
  "site_icon": "data:image/png;base64,..."
}
```

响应：

```json
{
  "code": 200,
  "message": "保存成功",
  "data": null
}
```

## 前端改动

### 新增文件

- `frontend/src/contexts/SiteContext.tsx` — 站点配置上下文，负责获取并缓存站点设置
- `frontend/src/lib/api.ts` 新增 `getSettings()`、`updateSettings()` 方法

### 修改文件

- **App.tsx** — 包裹 `SiteProvider`
- **Sidebar.tsx** — Logo 区域使用动态站点名称和图标
- **Login.tsx** — 卡片标题使用动态站点名称
- **Profile.tsx** — 新增「站点信息」编辑区域（在修改密码上方）

### 组件关系

```
App
├── SiteProvider          ← 新增，为全应用提供 site_name/site_icon
│   ├── Login             ← 读取 site_name 做标题
│   ├── Sidebar           ← 读取 site_name/site_icon 做 Logo
│   └── Profile           ← 读取+写入 site_name/site_icon
```

### 站点信息编辑卡片

在 Profile 页「修改密码」卡片上方新增卡片：
- 站点名称：文本输入框
- 站点图标：文件选择 → 自动转为 base64 → 预览缩略图
- 保存按钮：调用 PUT /api/settings

### 动态标题

- 浏览器 document.title 跟随 `site_name` 更新
- 登录页 card title、sidebar logo 跟随更新

### 备选方案

不在登录页使用 SiteContext（登录页无需请求），而是直接把 site_name 和 site_icon 预先编译到 HTML 中，或登录时从另一个公共 API 获取。但使用统一 Context 更简洁一致。