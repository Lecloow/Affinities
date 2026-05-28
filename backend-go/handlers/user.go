package handlers

import (
	"backend/models"
	"net/http"
	"strconv"

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

func (h *UserHandler) GetMatches(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.MustGet("userID").(models.UserID)

	matches, err := h.Service.GetMatches(ctx, userID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, matches)
}

func (h *UserHandler) RevealMatches(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.MustGet("userID").(models.UserID)
	dayStr := c.Param("day")

	day, err := strconv.Atoi(dayStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid day"})
		return
	}

	matchRevealed, err := h.Service.RevealMatch(ctx, userID, day)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"day": day, "match revealed": matchRevealed})
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
