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
	if err := c.BindJSON(&guess); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	userID := c.MustGet("userID").(models.UserID)
	guess.UserId = userID

	isCorrect, err := h.Service.CheckGuess(ctx, guess)

	createdGuess, err := h.Service.CreateGuess(ctx, guess, isCorrect)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Update the score
	if isCorrect {
		points := utils.CalculatePoints(createdGuess.HintNumber)
		err = h.Service.AddPoints(ctx, guess.UserId, points)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, createdGuess)
	//createdGuess, err := h.Service.ProcessGuess(c, guess)
	//if err != nil {
	//	if err == services.ErrAlreadyGuessed {
	//		c.JSON(http.StatusConflict, gin.H{"error": "Guess already submitted"})
	//		return
	//	}
	//	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	//	return
	//}
	//
	//c.JSON(http.StatusOK, createdGuess)
}
