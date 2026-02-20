package handlers

import (
	"backend/services"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(service *services.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"error": "missing Authorization header"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(401, gin.H{"error": "invalid Authorization header"})
			c.Abort()
			return
		}
		token := parts[1]

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
