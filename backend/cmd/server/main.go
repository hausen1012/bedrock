package main

import (
	"embed"
	"fmt"
	"log/slog"
	"os"

	"github.com/bedrock/backend/internal/config"
	"github.com/bedrock/backend/internal/database"
	"github.com/bedrock/backend/internal/router"
)

//go:embed web/*
var staticFS embed.FS

func main() {
	cfg := config.Load()

	if err := database.Init(cfg); err != nil {
		slog.Error("数据库初始化失败", slog.String("error", err.Error()))
		os.Exit(1)
	}

	r := router.Setup(staticFS, cfg.JWTSecret)
	addr := fmt.Sprintf(":%s", cfg.Port)
	slog.Info("服务启动", slog.String("addr", addr))
	if err := r.Run(addr); err != nil {
		slog.Error("服务启动失败", slog.String("error", err.Error()))
		os.Exit(1)
	}
}
