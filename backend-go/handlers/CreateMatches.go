package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) CreateMatches(c *gin.Context) {
	ctx := c.Request.Context()

	if err := h.Service.ComputeMatches(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "matches computed"})
}
