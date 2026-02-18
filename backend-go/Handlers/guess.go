package handlers

import (
	"backend/models"
	"strings"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) Guess(c *gin.Context) {
	ctx := c.Request.Context()
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(401, gin.H{"error": "Missing Authorization header"})
		return
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(401, gin.H{"error": "Invalid Authorization header"})
		return
	}
	token := parts[1]

	var guess models.GuessRequest
	if err := c.BindJSON(&guess); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	userId, err := h.Service.ValidateToken(ctx, token)
	if err != nil {
		c.JSON(401, token)
		return
	}

	guess.UserId = *userId

	isCorrect, err := h.Service.CheckGuess(ctx, guess)

	createdGuess, err := h.Service.CreateGuess(ctx, guess, isCorrect)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, createdGuess)
}
