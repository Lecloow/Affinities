package services

import (
	"backend/utils"
	"backend/models"
	"context"
)

func (s *UserService) CreateHints(ctx context.Context) error {
	rows, err := s.DB.Query(ctx, "SELECT user_id, match_id, day FROM matches")
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var userID, matchID models.UserID
		var day int
		if err := rows.Scan(&userID, &matchID, &day); err != nil {
			return err
		}
		
		var match = models.User{ID: matchID}
	
		err = s.DB.QueryRow(ctx, "SELECT first_name, last_name, class FROM users WHERE id = $1", match.ID).Scan(&match.FirstName, &match.LastName, &match.Class)
		if err != nil {
			return err
		}

		for hintNumber := 1; hintNumber <= utils.NumberOfHintsPerDay; hintNumber++ {	
			hint := generateHint(match, day, hintNumber)
			hint.UserID = userID
			_, err = s.DB.Exec(ctx, "INSERT INTO hints (user_id, day, hint_number, type, content, reveal_time) VALUES ($1, $2, $3, $4, $5, $6)", hint.UserID, hint.Day, hint.HintNumber, hint.Type, hint.Content, hint.RevealTime)
			if err != nil {
				return err
			}
		}

	}
	if err := rows.Err(); err != nil {
    	return err
	}

	return nil
}

func generateHint(match models.User, day int, hintNumber int) *models.Hint {	
	var hint = models.Hint{
		Day: day,
		HintNumber: hintNumber,
		RevealTime: utils.GetRevealTime(utils.HintRevealTime(hintNumber), day),
	}

	hint.Type = utils.RandomHintType(hintNumber)
	hint.Content = utils.GenerateHintContent(match, hint.Type)
	
	return &hint
}