package handlers

import (
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) Guess(c *gin.Context) {
	ctx := c.Request.Context()

	var guess models.GuessRequest
	if err := c.ShouldBindJSON(&guess); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
    day := utils.GetCurrentDay()
    guess.Day = day

	userID := c.MustGet("userID").(models.UserID)
	guess.UserId = userID

	isCorrect, err := h.Service.CheckGuess(ctx, guess)

	createdGuess, err := h.Service.CreateGuess(ctx, guess, isCorrect)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, createdGuess)
}
