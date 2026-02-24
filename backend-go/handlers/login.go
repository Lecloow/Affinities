package handlers

import (
	"backend/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

func (h *UserHandler) Login(c *gin.Context) {
	password := c.PostForm("password")
	if password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password required"})
		return
	}

	user, err := h.Service.Login(c.Request.Context(), password)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var sessionToken string

	sessionToken, err = h.Service.CreateSession(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie("session_token", sessionToken, 3600*48, "/", "", utils.IsProduction, true)
	c.JSON(http.StatusOK, user)
}
