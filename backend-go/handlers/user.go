package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func getIDParam(c *gin.Context) (int, bool) {
	ID := c.Param("id")
	id, err := strconv.Atoi(ID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return 0, false
	}
	return id, true
}

func (h *UserHandler) Candidates(c *gin.Context) {
	ctx := c.Request.Context()
	id, ok := getIDParam(c)
	if !ok {
		return
	}

	candidates, err := h.Service.GetCandidates(ctx, id)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, candidates)
}

func (h *UserHandler) Stats(c *gin.Context) {
	ctx := c.Request.Context()
	id, ok := getIDParam(c)
	if !ok {
		return
	}

	stats, err := h.Service.GetStats(ctx, id)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
