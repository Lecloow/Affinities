package handlers

import (
	"backend/models"
	"context"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

func (h *UserHandler) ImportXlsx(c *gin.Context) {
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

	importedUsers, err := importUsersFromFile(xf, h, passwordLength, c.Request.Context())
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"imported_users": importedUsers})
}

func importUsersFromFile(
	xf *excelize.File,
	h *UserHandler,
	passwordLength int,
	ctx context.Context,
) ([]*models.EmailUser, error) {

	sheetName := xf.GetSheetName(0)
	rows, err := xf.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("could not read rows: %w", err)
	}
	if len(rows) < 2 {
		return nil, fmt.Errorf("no data")
	}

	colIndex := map[string]int{}
	for i, col := range rows[0] {
		colIndex[col] = i
	}
	requiredColumns := []string{FormResponse.Name, FormResponse.Email, FormResponse.Level, FormResponse.Letter}
	for _, key := range requiredColumns {
		if _, ok := colIndex[key]; !ok {
			return nil, fmt.Errorf("missing column: %s", key)
		}
	}

	importedUsers := []*models.EmailUser{}

	get := func(row []string, key string) string {
		idx := colIndex[key]
		if idx >= len(row) {
			return ""
		}
		return row[idx]
	}

	for _, row := range rows[1:] {
		name := get(row, FormResponse.Name)
		email := get(row, FormResponse.Email)
		level := get(row, FormResponse.Level)
		classLetter := get(row, FormResponse.Letter)

		//if name == "" || email == "" || level == "" || classLetter == "" {
		//	continue
		//}

		firstName, lastName := splitName(name)

		newUser := &models.User{
			FirstName: firstName,
			LastName:  lastName,
			Email:     email,
			Class:     level + " " + classLetter,
		}

		password, err := h.Service.ImportUser(ctx, newUser, passwordLength)
		if err != nil {
			continue
		}

		emailUser := &models.EmailUser{
			Email:    newUser.Email,
			Name:     firstName,
			Password: password,
		}

		importedUsers = append(importedUsers, emailUser)
	}

	return importedUsers, nil
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
