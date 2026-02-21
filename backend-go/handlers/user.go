package handlers

import (
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) Candidates(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.MustGet("userID").(models.UserID)

	candidates, err := h.Service.GetCandidates(ctx, userID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, candidates)
}

func (h *UserHandler) Stats(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.MustGet("userID").(models.UserID)

	stats, err := h.Service.GetStats(ctx, userID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
