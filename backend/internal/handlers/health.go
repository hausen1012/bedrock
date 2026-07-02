package handlers

import (
	"github.com/bedrock/backend/internal/helpers"
	"github.com/gin-gonic/gin"
)

func HealthCheck(c *gin.Context) {
	helpers.Success(c, gin.H{
		"status": "healthy",
	})
}
