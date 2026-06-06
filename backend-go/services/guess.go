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

	createdGuess := models.Guess{
		UserID:        guess.UserId,
		Day:           guess.Day,
		HintNumber:    guess.HintNumber,
		GuessedUserId: guess.GuessedUserId,
		IsCorrect:     isCorrect,
	}

	var existingID int
	err = tx.QueryRow(ctx,
		"SELECT id FROM guesses WHERE user_id=$1 AND day=$2 AND hint_number=$3",
		guess.UserId, guess.Day, guess.HintNumber).Scan(&existingID)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}
	if existingID != 0 {
		return nil, errors.New("guess already exists for this hint")
	}

	var AlreadyCorrect bool
	err = tx.QueryRow(ctx,
		"SELECT is_correct FROM guesses WHERE user_id=$1 AND day=$2",
		guess.UserId, guess.Day).Scan(&AlreadyCorrect)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}
	if AlreadyCorrect {
		return nil, errors.New("a correct guess already exists for this day")
	}

	err = tx.QueryRow(ctx,
		"INSERT INTO guesses (user_id, day, hint_number, guessed_user_id, is_correct) VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at",
		guess.UserId, guess.Day, guess.HintNumber, guess.GuessedUserId, isCorrect).Scan(&createdGuess.ID, &createdGuess.CreatedAt)
	if err != nil {
		return nil, err
	}

	if isCorrect {
		createdGuess.PointsEarned = utils.CalculatePoints(guess.HintNumber)
		err = s.AddPoints(ctx, guess.UserId, createdGuess.PointsEarned)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &createdGuess, nil
}
