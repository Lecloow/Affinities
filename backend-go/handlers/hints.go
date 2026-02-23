package handlers

import (
	"backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) GetHints(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.MustGet("userID").(models.UserID)

	hints, err := h.Service.GetHints(ctx, userID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, hints)
}

func (h *UserHandler) RevealHint(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.MustGet("userID").(models.UserID)
	dayStr := c.Param("day")
	hintStr := c.Param("hintNumber")

	day, err := strconv.Atoi(dayStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid day"})
		return
	}

	hintNumber, err := strconv.Atoi(hintStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid hintNumber"})
		return
	}
	hintRevealed, err := h.Service.RevealHint(ctx, userID, day, hintNumber)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"hint revealed": hintRevealed})
}

func (h *UserHandler) RevealAllHints(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.MustGet("userID").(models.UserID)
	dayStr := c.Param("day")

	day, err := strconv.Atoi(dayStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid day"})
		return
	}

	var hintsRevealed []int
	hintsRevealed, err = h.Service.RevealAllHints(ctx, userID, day)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"day": day, "hints revealed": hintsRevealed})
}
