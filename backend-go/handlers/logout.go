package handlers

import (
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) Logout(c *gin.Context) {
    c.SetCookie("session_token", "", -1, "/", "", utils.IsProduction, true)
    c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}