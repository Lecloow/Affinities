package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
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
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	var existingID int //TODO: Why ?
	err = tx.QueryRow(ctx,
		"SELECT id FROM guesses WHERE user_id=$1 AND day=$2 AND hint_number=$3",
		guess.UserId, guess.Day, guess.HintNumber).Scan(&existingID)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}
	if existingID != 0 {
		return nil, errors.New("guess already exists for this hint")
	}

	var guessID int
	err = tx.QueryRow(ctx,
		"INSERT INTO guesses (user_id, day, hint_number, guessed_user_id, is_correct) VALUES ($1,$2,$3,$4,$5) RETURNING id",
		guess.UserId, guess.Day, guess.HintNumber, guess.GuessedUserId, isCorrect).Scan(&guessID)
	if err != nil {
		return nil, err
	}

	if isCorrect {
		points := utils.CalculatePoints(guess.HintNumber)
		_, err = tx.Exec(ctx,
			"UPDATE scores SET total_points = total_points + $1 WHERE user_id=$2",
			points, guess.UserId)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	var createdGuess models.Guess
	err = s.DB.QueryRow(ctx,
		"SELECT id, user_id, day, hint_number, guessed_user_id, is_correct, created_at FROM guesses WHERE id=$1",
		guessID).Scan(
		&createdGuess.ID, &createdGuess.UserID, &createdGuess.Day, &createdGuess.HintNumber, &createdGuess.GuessedUserId,
		&createdGuess.IsCorrect, &createdGuess.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &createdGuess, nil
}
