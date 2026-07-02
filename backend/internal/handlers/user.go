package handlers

import (
	"github.com/bedrock/backend/internal/database"
	"github.com/bedrock/backend/internal/helpers"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type PasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func UpdatePassword(c *gin.Context) {
	var req PasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helpers.BadRequest(c, "密码至少6个字符")
		return
	}

	user, err := helpers.GetCurrentUser(c)
	if err != nil {
		helpers.NotFound(c, "用户不存在")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		helpers.BadRequest(c, "原密码错误")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		helpers.InternalError(c, "密码加密失败")
		return
	}

	user.Password = string(hash)
	if err := database.DB.Save(&user).Error; err != nil {
		helpers.InternalError(c, "密码修改失败")
		return
	}

	helpers.SuccessWithMsg(c, "密码修改成功", nil)
}