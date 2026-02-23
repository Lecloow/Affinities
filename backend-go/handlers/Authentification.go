package handlers

import (
	"backend/services"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(service *services.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {

		var token string

		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
				token = parts[1]
			}
		}

		if token == "" {
			cookieToken, err := c.Cookie("token")
			if err == nil {
				token = cookieToken
			}
		}

		if token == "" {
			c.JSON(401, gin.H{"error": "missing Authentication token or Authorization header"})
			c.Abort()
			return
		}

		userID, err := service.ValidateToken(c.Request.Context(), token)
		if err != nil {
			c.JSON(401, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}
		c.Set("userID", *userID)
		c.Next()
	}
}
