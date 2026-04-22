package services

import (
	"backend/models"
	"context"
	"fmt"
	"strings"
)

func (s *UserService) ImportUserAnswers(ctx context.Context, userID models.UserID, answers map[string]int) error {
	if len(answers) == 0 {
		return fmt.Errorf("no valid answers")
	}

	columns := []string{"user_id"}
	placeholders := []string{"$1"}
	values := []any{userID}

	for col, val := range answers {
		columns = append(columns, col)
		placeholders = append(placeholders, fmt.Sprintf("$%d", len(values)+1))
		values = append(values, val)
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

	if _, err := s.DB.Exec(ctx, query, values...); err != nil {
		return fmt.Errorf("failed to insert answers: %w", err)
	}
	return nil
}
