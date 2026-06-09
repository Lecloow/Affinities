package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) CreateHints(c *gin.Context) {
	//ctx := c.Request.Context()
	//
	//var body struct {
	//	Days       int       `json:"days"`
	//	RevealTime time.Time `json:"reveal_time"`
	//}
	//
	//if err := c.ShouldBindJSON(&body); err != nil {
	//	c.JSON(400, gin.H{"error": err.Error()})
	//	return
	//}
	//
	//if err := h.Service.CreateHints(ctx, body.Days, body.RevealTime); err != nil {
	//	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	//	return
	//}

	c.JSON(http.StatusOK, gin.H{"status": "hints created"})
}
