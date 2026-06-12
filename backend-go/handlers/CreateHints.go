package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) CreateHints(c *gin.Context) {
	ctx := c.Request.Context()
	
	err := h.Service.CreateHints(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"status": "hints created"})
}
