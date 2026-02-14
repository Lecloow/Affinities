package handlers

import (
	"backend/auth"
	"backend/db"
	"backend/utils"
	"context"
	"github.com/gin-gonic/gin"
	"net/http"
)

func LoginHandler(c *gin.Context) {
	password := c.PostForm("password")

	var userID string
	err := db.DB.QueryRow(context.Background(),
		"SELECT user_id FROM passwords WHERE password=$1",
		password,
	).Scan(&userID)

	if err != nil {
		c.JSON(403, gin.H{"error": "Code invalide"})
		return
	}

	sessionToken := utils.GenerateSecureToken()

	_, err = db.DB.Exec(context.Background(),
		"INSERT INTO sessions(token, user_id) VALUES($1,$2)",
		sessionToken, userID,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": "DB error"})
		return
	}

	c.SetCookie("session_token", sessionToken, 3600*24, "/", "", false, true)

	c.JSON(200, gin.H{
		"user_id": userID,
	})
}
