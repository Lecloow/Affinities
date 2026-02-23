package handlers

import "github.com/gin-gonic/gin"

func (h *UserHandler) Leaderboard(c *gin.Context) {
	ctx := c.Request.Context()

	leaderboard, err := h.Service.GetLeaderboard(ctx)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, leaderboard)
}
