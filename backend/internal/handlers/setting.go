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
