package handlers

import (
	"backend/old/db"
	"backend/old/utils"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func MeHandler(c *gin.Context) {
	userID := c.GetString("user_id")

	var user utils.User

	err := db.DB.QueryRow(context.Background(),
		`SELECT id, first_name, last_name, email, "currentClass"
		 FROM users WHERE id=$1`,
		userID,
	).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.CurrentClass,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
