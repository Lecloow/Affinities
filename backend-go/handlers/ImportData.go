package handlers

import (
	"backend/models"
	"backend/utils"
	"context"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/xuri/excelize/v2"
)

func (h *UserHandler) ImportXlsx(c *gin.Context) {
	passwordLength := 8

	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "no file"})
		return
	}
	defer func() { _ = file.Close() }()

	xf, err := excelize.OpenReader(file)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid xlsx"})
		return
	}

	defer func() { _ = xf.Close() }()

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
	requiredColumns := []string{utils.FormResponse.Name, utils.FormResponse.Email, utils.FormResponse.Level, utils.FormResponse.Letter}
	for _, key := range requiredColumns {
		if _, ok := colIndex[key]; !ok {
			return nil, fmt.Errorf("missing column: %s", key)
		}
	}

	var importedUsers []*models.EmailUser

	get := func(row []string, key string) string {
		idx := colIndex[key]
		if idx >= len(row) {
			return ""
		}
		return row[idx]
	}

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

		emailUser := &models.EmailUser{
			Email:    newUser.Email,
			Name:     firstName,
			Password: password,
		}
		err = importUserAnswers(ctx, h.Service.DB, newUser.ID, row, colIndex)
		if err != nil {
			return nil, err
		}

		importedUsers = append(importedUsers, emailUser)
	}

	return importedUsers, nil
}

func importUserAnswers(ctx context.Context, db *pgxpool.Pool, userID models.UserID, row []string, colIndex map[string]int) error {
	columns := []string{"user_id"}
	placeholders := []string{"$1"}
	values := []any{userID}

	for rawHeader, idx := range colIndex {
		cfg, ok := utils.GetQuestion(rawHeader)
		if !ok || idx >= len(row) {
			continue
		}
		val, ok := utils.GetAnswerValue(rawHeader, row[idx])
		if !ok {
			continue
		}
		columns = append(columns, cfg.Column)
		placeholders = append(placeholders, fmt.Sprintf("$%d", len(values)+1))
		values = append(values, val)
	}

	if len(columns) == 1 {
		return fmt.Errorf("no valid answers")
	}

	var setClauses []string

	for _, col := range columns[1:] {
		setClauses = append(setClauses, fmt.Sprintf("%s = EXCLUDED.%s", col, col))
	}

	query := fmt.Sprintf(
		"INSERT INTO answers (%s) VALUES (%s) ON CONFLICT (user_id) DO UPDATE SET %s",
		strings.Join(columns, ", "),
		strings.Join(placeholders, ", "),
		strings.Join(setClauses, ", "),
	)
	if _, err := db.Exec(ctx, query, values...); err != nil {
		return err
	}
	return nil
}
