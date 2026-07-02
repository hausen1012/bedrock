package middleware

import (
	"strings"

	"github.com/bedrock/backend/internal/helpers"
	jwtpkg "github.com/bedrock/backend/internal/jwt"
	"github.com/gin-gonic/gin"
)

func JWTAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			helpers.Unauthorized(c, "未提供认证令牌")
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		claims, err := jwtpkg.ParseToken(secret, tokenStr)
		if err != nil {
			helpers.Unauthorized(c, "认证令牌无效或已过期")
			c.Abort()
			return
		}

		userID, _ := claims["user_id"].(float64)
		username, _ := claims["username"].(string)

		c.Set("user_id", uint(userID))
		c.Set("username", username)
		c.Next()
	}
}
