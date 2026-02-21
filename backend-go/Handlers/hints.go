package handlers

import "github.com/gin-gonic/gin"

func (h *UserHandler) GetHints(c *gin.Context) {
	//ctx := c.Request.Context()
	c.JSON(200, gin.H{"message": "GetHints endpoint is working!"})
}
