package database

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/bedrock/backend/internal/config"
	"github.com/bedrock/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(cfg *config.Config) error {
	dir := filepath.Dir(cfg.DBPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("create db dir: %w", err)
	}

	db, err := gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("open db: %w", err)
	}

	if err := db.AutoMigrate(&models.User{}, &models.Setting{}); err != nil {
		return fmt.Errorf("migrate: %w", err)
	}

	DB = db
	return ensureAdmin(cfg)
}

func ensureAdmin(cfg *config.Config) error {
	var count int64
	if err := DB.Model(&models.User{}).Count(&count).Error; err != nil {
		return fmt.Errorf("count users: %w", err)
	}
	if count > 0 {
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(cfg.InitPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := models.User{
		Username: cfg.InitUsername,
		Password: string(hash),
	}
	return DB.Create(&user).Error
}