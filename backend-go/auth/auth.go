package auth

import (
	"backend/db"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionToken, err := c.Cookie("session_token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			return
		}

		var userID string
		err = db.DB.QueryRow(context.Background(),
			"SELECT user_id FROM sessions WHERE token=$1",
			sessionToken,
		).Scan(&userID)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}
