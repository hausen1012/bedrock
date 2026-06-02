package config

import (
	"crypto/rand"
	"encoding/hex"
	"os"
)

type Config struct {
	Port         string
	DBPath       string
	JWTSecret    string
	InitUsername string
	InitPassword string
}

func Load() *Config {
	return &Config{
		Port:         getEnv("PORT", "8080"),
		DBPath:       getEnv("DB_PATH", "/data/db/bedrock.db"),
		JWTSecret:    getEnv("JWT_SECRET", randomSecret()),
		InitUsername: getEnv("INIT_USERNAME", "admin"),
		InitPassword: getEnv("INIT_PASSWORD", "admin123"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func randomSecret() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}
