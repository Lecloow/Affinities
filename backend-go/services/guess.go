package services

import (
	"backend/models"
	"context"
)

func (s *UserService) CheckGuess(ctx context.Context, guess models.GuessRequest) (bool, error) {

	var matchId models.UserID
	err := s.DB.QueryRow(ctx,
		"SELECT match_id FROM matches WHERE user_id = $1 AND day = $2",
		guess.UserId, guess.Day).Scan(&matchId)

	if err != nil {
		return false, err
	}

	isCorrect := matchId == guess.GuessedUserId

	return isCorrect, nil

}

func (s *UserService) CreateGuess(ctx context.Context, guess models.GuessRequest, isCorrect bool) (*models.Guess, error) {

	var id int
	err := s.DB.QueryRow(ctx,
		"INSERT INTO guesses (user_id, day, hint_number, guessed_user_id, is_correct) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		guess.UserId, guess.Day, guess.HintNumber, guess.GuessedUserId, isCorrect).Scan(&id)

	if err != nil {
		return nil, err
	}

	var c models.Guess
	err = s.DB.QueryRow(ctx,
		"SELECT id, user_id, day, hint_number, guessed_user_id, is_correct, created_at FROM guesses WHERE id = $1 ", id).
		Scan(&c.ID, &c.UserID, &c.Day, &c.HintNumber, &c.GuessedUserId, &c.IsCorrect, &c.CreatedAt)
	return &c, nil
}
