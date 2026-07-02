# CLAUDE.md

## 语言要求

- 所有对话使用中文。
- 所有文档使用中文。
- 除了 powershell 脚本，所有代码注释使用中文。

## 执行要求

- 在生成说明、总结、计划、提交说明时，统一使用中文。
- 在新增或修改 Markdown 文档时，统一使用中文。
- 在新增或修改代码注释时，统一使用中文。
- 所有界面开发需适配移动端，使用 Tailwind 响应式断点（sm/md/lg）确保在手机、平板、桌面均正常显示。

### Environment config (see .env.example)

| Variable | Default | Description |
|---|---|---|
| PORT | 8080 | Listen port |
| DB_PATH | /data/db/bedrock.db | SQLite database path |
| JWT_SECRET | auto-generated | HMAC signing key |
| INIT_USERNAME | admin | Seed admin username |
| INIT_PASSWORD | admin123 | Seed admin password |