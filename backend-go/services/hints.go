package services

import (
	"backend/models"
	"context"
	"time"
)

func (s *UserService) GetHints(ctx context.Context, userId models.UserID) ([]*models.Hint, error) {
	var hints []*models.Hint

	rows, err := s.DB.Query(ctx, `
				SELECT
					id,
					day,
					hint_number,
					difficulty, 
					content,
					reveal_time,
					revealed
				FROM hints 
				WHERE user_id = $1
				ORDER BY id`, userId)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		hint := &models.Hint{UserID: userId}
		err := rows.Scan(
			&hint.ID,
			&hint.Day,
			&hint.HintNumber,
			&hint.Difficulty,
			&hint.Content,
			&hint.RevealTime,
			&hint.Revealed,
		)
		if err != nil {
			return nil, err
		}

		if hint.RevealTime.After(time.Now().UTC()) {
			hint.Content = "Locked"
		}

		hints = append(hints, hint)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return hints, nil
}

func (s *UserService) RevealHint(ctx context.Context, userId models.UserID, day int, hintNumber int) (bool, error) {

	_, err := s.DB.Exec(ctx, "UPDATE hints SET revealed = $1 WHERE user_id = $2 AND day = $3 AND hint_number = $4", true, userId, day, hintNumber)
	if err != nil {
		return false, err
	}

	return true, nil
}
