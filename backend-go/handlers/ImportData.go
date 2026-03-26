package handlers

import (
	"backend/models"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

func (h *UserHandler) ImportXlsx(c *gin.Context) {
	ctx := c.Request.Context()
	passwordLength := 8

	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "no file"})
		return
	}
	defer file.Close()

	xf, err := excelize.OpenReader(file)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid xlsx"})
		return
	}

	sheetName := xf.GetSheetName(0)
	rows, err := xf.GetRows(sheetName)

	colIndex := map[string]int{}
	for i, h := range rows[0] {
		colIndex[h] = i
	}

	for _, row := range rows[1:] {
		if len(row) < 2 {
			continue
		}
		name := row[colIndex[FormResponse.Name]]
		email := row[colIndex[FormResponse.Email]]
		level := row[colIndex[FormResponse.Level]]
		classLetter := row[colIndex[FormResponse.Letter]]

		firstName, lastName := splitName(name)

		newUser := &models.User{
			FirstName: firstName,
			LastName:  lastName,
			Email:     email,
			Class:     level + " " + classLetter,
		}

		createdUser, err := h.Service.ImportUser(ctx, newUser, passwordLen)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		log.Printf("firstName: %s, lastName: %s, email: %s, class: %s, end", firstName, lastName, email, class)
	}

	c.JSON(200, gin.H{"imported": len(rows) - 1})
}

func splitName(full string) (firstName, lastName string) {
	parts := strings.Fields(full)
	for _, p := range parts {
		if p == strings.ToUpper(p) {
			lastName = p
		} else {
			firstName += p + " "
		}
	}
	firstName = strings.TrimSpace(firstName)
	return
}

type tFormResponse struct {
	Name   string
	Email  string
	Level  string
	Letter string
}

var FormResponse = tFormResponse{
	Name:   "Name",
	Email:  "Email",
	Level:  "Dans quelle unité es-tu ?",
	Letter: "Dans quelle classe es-tu ?",
}
