package handlers

import (
	"backend/models"
	"backend/utils"
	"log"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) Guess(ctx *gin.Context) {
	log.Println("Handler /guess appelé")
	var guess models.GuessRequest
	if err := ctx.BindJSON(&guess); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	userID := ctx.MustGet("userID").(models.UserID)
	guess.UserId = userID

	isCorrect, err := h.Service.CheckGuess(ctx, guess)

	createdGuess, err := h.Service.CreateGuess(ctx, guess, isCorrect)
	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Update the score

	if isCorrect {
		points := utils.CalculatePoints(createdGuess.HintNumber)
		err = h.Service.AddPoints(ctx, guess.UserId, points)
		if err != nil {
			ctx.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}

	ctx.JSON(200, createdGuess)
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
