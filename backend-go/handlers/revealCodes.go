package handlers

import (
	"backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) GetRevealCode(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.MustGet("userID").(models.UserID)
	//dayStr := c.Param("day")
	//
	//day, err := strconv.Atoi(dayStr)
	//if err != nil {
	//	c.JSON(http.StatusBadRequest, gin.H{"error": "invalid day"})
	//	return
	//}

	revealCode, err := h.Service.GetRevealCode(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, revealCode)
}

func (h *UserHandler) ExchangeCode(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.MustGet("userID").(models.UserID)
	dayStr := c.Param("day")
	//code := c.PostForm("code")

	var body struct {
		Code string `json:"code"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.Code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exchange code required"})
		return
	}

	day, err := strconv.Atoi(dayStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid day"})
		return
	}

	message, err := h.Service.ExchangeCode(ctx, userID, day, body.Code)
	if err != nil {
		if err.Error() == "invalid code" {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"detail":  "invalid code",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	detail := ""
	if message != nil {
		detail = *message
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"detail":  detail,
	})
}
