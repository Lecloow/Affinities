package main

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func login(c *gin.Context) {
	password := c.PostForm("password")
	if password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password required"})
		return
	}

	var id string
	err := db.QueryRow("SELECT id FROM passwords WHERE password = $1", password).Scan(&id)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, id)
}
