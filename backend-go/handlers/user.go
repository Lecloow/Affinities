package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) Candidates(c *gin.Context) {
	ctx := c.Request.Context()
	ID := c.Param("id")
	id, err := strconv.Atoi(ID)
	if err != nil {
		log.Fatal("failed to convert string to integer", err)
	}

	candidates, err := h.Service.GetCandidates(ctx, id)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, candidates)

}
