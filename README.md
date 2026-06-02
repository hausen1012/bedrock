# Bedrock

全栈一体化基底项目 — 快速搭建新项目的起点。

## 特性

- **全栈一体化**: 前端嵌入 Go 二进制，单文件运行
- **开箱即用**: 内置登录认证、用户管理、主题切换
- **生产级规范**: TypeScript、JWT 鉴权、环境变量配置
- **极致简洁**: 中性灰调设计，无品牌色，克制干净

## 快速开始

### 本地开发

```bash
# 启动后端
make dev-backend

# 新终端，启动前端（热更新）
make dev-frontend
```

然后打开 http://localhost:5173。

### 生产构建

```bash
# 本地二进制
make build
./build/server

# 或 Docker 部署
make docker
```

### 配置

通过环境变量配置，参考 `.env.example`：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 8080 | 监听端口 |
| DB_PATH | /data/db/bedrock.db | 数据库路径 |
| JWT_SECRET | 自动生成 | JWT 签名密钥 |
| INIT_USERNAME | admin | 初始管理员 |
| INIT_PASSWORD | admin123 | 初始密码 |

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **后端**: Go 1.21+ + Gin + GORM + SQLite
- **部署**: Docker 多阶段构建
