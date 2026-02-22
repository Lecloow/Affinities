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

func (s *UserService) RevealHint(ctx context.Context, userId models.UserID, day int, hintNumber int) (int, error) {

	var hint models.Hint
	err := s.DB.QueryRow(ctx, "SELECT id, reveal_time, revealed FROM hints WHERE user_id = $1 AND day = $2 AND hint_number = $3", userId, day, hintNumber).
		Scan(&hint.ID, &hint.RevealTime, &hint.Revealed)
	if err != nil {
		return 0, err
	}

	if hint.Revealed {
		return hint.ID, nil
	}
	if hint.RevealTime.After(time.Now().UTC()) {
		return 0, nil
	}
	_, err = s.DB.Exec(ctx, "UPDATE hints SET revealed = $1 WHERE id = $2 ", true, hint.ID)
	if err != nil {
		return 0, err
	}
	return hint.ID, nil
}

func (s *UserService) RevealAllHints(ctx context.Context, userId models.UserID, day int) ([]int, error) {
	rows, err := s.DB.Query(ctx, `
				SELECT
					id,
					reveal_time,
					revealed
				FROM hints 
				WHERE user_id = $1 AND day = $2
				ORDER BY id`, userId, day)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var hintsRevealed []int
	for rows.Next() {
		hint := &models.Hint{UserID: userId}
		err := rows.Scan(
			&hint.ID,
			&hint.RevealTime,
			&hint.Revealed,
		)
		if err != nil {
			return nil, err
		}

		if hint.RevealTime.Before(time.Now().UTC()) {
			_, err := s.DB.Exec(ctx, "UPDATE hints SET revealed = $1 WHERE id = $2 ", true, hint.ID)
			if err != nil {
				return nil, err
			}
			hintsRevealed = append(hintsRevealed, hint.ID)
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return hintsRevealed, nil
}
