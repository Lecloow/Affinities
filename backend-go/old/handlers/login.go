package handlers

import (
	"backend/old/db"
	utils2 "backend/old/utils"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func LoginHandler(c *gin.Context) {
	password := c.PostForm("password")

	var user utils2.User

	err := db.DB.QueryRow(context.Background(),
		`SELECT u.id, u.first_name, u.last_name, u.email, u."currentClass"
		 FROM passwords p
		 JOIN users u ON u.id = CAST(p.user_id AS TEXT)
		 WHERE p.password=$1`,
		password,
	).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.CurrentClass,
	)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Code invalide"})
		return
	}

	sessionToken := utils2.GenerateSecureToken()

	_, err = db.DB.Exec(context.Background(),
		"INSERT INTO sessions(token, user_id) VALUES($1, CAST($2 AS INTEGER))",
		sessionToken, user.ID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}

	c.SetCookie(
		"session_token",
		sessionToken,
		3600*24,
		"/",
		"",
		false,
		true,
	)

	c.JSON(http.StatusOK, user)
}
