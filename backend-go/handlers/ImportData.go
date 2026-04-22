package handlers

import (
	"backend/models"
	"backend/utils"
	"context"
	"errors"
	"fmt"

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
	defer func() {
		if err := file.Close(); err != nil {
			fmt.Printf("warn: failed to close file: %v\n", err)
		}
	}()

	xf, err := excelize.OpenReader(file)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid xlsx"})
		return
	}
	defer func() {
		if err := xf.Close(); err != nil {
			fmt.Printf("warn: failed to close xlsx: %v\n", err)
		}
	}()

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
		return nil, errors.New("could not get rows")
	}
	if len(rows) < 2 {
		return nil, errors.New("no data")
	}

	colIndex := map[string]int{}
	for i, col := range rows[0] {
		colIndex[col] = i
	}

	requiredColumns := []string{utils.FormResponse.Name, utils.FormResponse.Email, utils.FormResponse.Level, utils.FormResponse.Letter}
	for _, key := range requiredColumns {
		if _, ok := colIndex[key]; !ok {
			return nil, fmt.Errorf("missing column: %s", key)
		}
	}

	get := func(row []string, key string) string {
		idx, ok := colIndex[key]
		if !ok || idx >= len(row) {
			return ""
		}
		return row[idx]
	}

	var importedUsers []*models.EmailUser

	for _, row := range rows[1:] {
		name := get(row, utils.FormResponse.Name)
		email := get(row, utils.FormResponse.Email)
		level := get(row, utils.FormResponse.Level)
		classLetter := get(row, utils.FormResponse.Letter)

		firstName, lastName := utils.SplitName(name)

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

		answers := parseAnswers(row, colIndex)
		if err := h.Service.ImportUserAnswers(ctx, newUser.ID, answers); err != nil {
			return nil, err
		}

		importedUsers = append(importedUsers, &models.EmailUser{
			Email:    newUser.Email,
			Name:     firstName,
			Password: password,
		})
	}

	return importedUsers, nil
}

func parseAnswers(row []string, colIndex map[string]int) map[string]int {
	answers := map[string]int{}
	for rawHeader, idx := range colIndex {
		cfg, ok := utils.GetQuestion(rawHeader)
		if !ok || idx >= len(row) {
			continue
		}
		val, ok := utils.GetAnswerValue(rawHeader, row[idx])
		if !ok {
			continue
		}
		answers[cfg.Column] = val
	}
	return answers
}
