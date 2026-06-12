package handlers

import (
	"backend/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) Logout(c *gin.Context) {
	ctx := c.Request.Context()

	sessionToken, err := c.Cookie("session_token")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No session token found"})
		return
	}

	err = h.Service.DeleteToken(ctx, sessionToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete token"})
		return
	}

	c.SetCookie("session_token", "", -1, "/", "", utils.IsProduction, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

func (h *UserHandler) cleanExpiredTokens(c *gin.Context) {
	ctx := c.Request.Context()

	now := time.Now()

	err := h.Service.DeleteExpiredTokens(ctx, now)
	if err != nil {
		return
	}
}
