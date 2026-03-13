package handlers

import (
	"backend/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

func (h *UserHandler) Login(c *gin.Context) {

	var body struct {
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password required"})
		return
	}

	user, err := h.Service.Login(c.Request.Context(), body.Password)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	var sessionToken string

	sessionToken, err = h.Service.CreateSession(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.SetCookie("session_token", sessionToken, 3600*48, "/", "", utils.IsProduction, true)
	c.JSON(http.StatusOK, user)
}
