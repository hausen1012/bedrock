package handlers

import (
	"github.com/bedrock/backend/internal/database"
	"github.com/bedrock/backend/internal/helpers"
	"github.com/bedrock/backend/internal/models"
	"github.com/gin-gonic/gin"
)

// 默认值常量
const (
	DefaultSiteName = "Bedrock"
)

// GetSettings 公开接口，返回所有站点配置
func GetSettings(c *gin.Context) {
	var configs []models.Config
	database.DB.Find(&configs)

	data := map[string]string{
		"site_name": DefaultSiteName,
		"site_icon": "",
	}
	for _, s := range configs {
		data[s.Key] = s.Value
	}

	helpers.Success(c, data)
}

// UpdateSettings 认证接口，批量更新站点配置
func UpdateSettings(c *gin.Context) {
	var req map[string]string
	if err := c.ShouldBindJSON(&req); err != nil {
		helpers.BadRequest(c, "请求格式错误")
		return
	}

	for key, value := range req {
		// 只允许更新白名单内的 key
		if key != "site_name" && key != "site_icon" {
			continue
		}
		var count int64
		database.DB.Model(&models.Config{}).Where("key = ?", key).Count(&count)
		if count == 0 {
			database.DB.Create(&models.Config{Key: key, Value: value})
		} else {
			database.DB.Model(&models.Config{}).Where("key = ?", key).Update("value", value)
		}
	}

	helpers.SuccessWithMsg(c, "保存成功", nil)
}