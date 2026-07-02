package handlers

import (
	"github.com/bedrock/backend/internal/database"
	"github.com/bedrock/backend/internal/helpers"
	jwtpkg "github.com/bedrock/backend/internal/jwt"
	"github.com/bedrock/backend/internal/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	JWTSecret string
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helpers.BadRequest(c, "请输入用户名和密码")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		helpers.Unauthorized(c, "用户名或密码错误")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		helpers.Unauthorized(c, "用户名或密码错误")
		return
	}

	tokenStr, err := jwtpkg.GenerateToken(h.JWTSecret, &user)
	if err != nil {
		helpers.InternalError(c, "生成令牌失败")
		return
	}

	helpers.Success(c, gin.H{
		"token": tokenStr,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
		},
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	user, err := helpers.GetCurrentUser(c)
	if err != nil {
		helpers.NotFound(c, "用户不存在")
		return
	}

	helpers.Success(c, gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"created_at": user.CreatedAt,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	helpers.SuccessWithMsg(c, "已退出登录", nil)
}
