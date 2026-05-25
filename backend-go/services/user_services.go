package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"database/sql"
	"errors"
	"strings"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserService struct {
	DB *pgxpool.Pool
}

func (s *UserService) GetCandidates(ctx context.Context, id models.UserID) ([]*models.Candidates, error) {
	var class string
	err := s.DB.QueryRow(ctx, "SELECT class FROM users WHERE id = $1", id).Scan(&class)
	if err != nil {
		return nil, err
	}

	level := strings.Split(class, " ")[0]

	var candidates []*models.Candidates

	rows, err := s.DB.Query(ctx, "SELECT id, first_name, last_name FROM users WHERE class ILIKE $1", level+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		u := &models.Candidates{}
		if err := rows.Scan(&u.ID, &u.FirstName, &u.LastName); err != nil {
			return nil, err
		}
		if u.ID != id {
			candidates = append(candidates, u)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return candidates, nil
}

func (s *UserService) GetStats(ctx context.Context, id models.UserID) (*models.UserStats, error) {

	stats := &models.UserStats{ID: id}

	err := s.DB.QueryRow(ctx, `SELECT total_points, code_exchange_bonus FROM scores WHERE user_id = $1`, id).
		Scan(&stats.TotalPoints, &stats.BonusPoints)

	if errors.Is(err, sql.ErrNoRows) {
		stats.TotalPoints = 0
		stats.BonusPoints = 0
	} else if err != nil {
		return nil, err
	}

	rows, err := s.DB.Query(ctx,
		`SELECT id, user_id, day, hint_number, guessed_user_id, is_correct, created_at
		 FROM guesses
		 WHERE user_id = $1
		 ORDER BY id`,
		id,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	guessesPerDay := make(map[int]int)

	for rows.Next() {
		var g models.Guess
		if err := rows.Scan(
			&g.ID,
			&g.UserID,
			&g.Day,
			&g.HintNumber,
			&g.GuessedUserId,
			&g.IsCorrect,
			&g.CreatedAt,
		); err != nil {
			return nil, err
		}

		stats.Guesses = append(stats.Guesses, &g)
		guessesPerDay[g.Day]++
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

    currentDay := utils.GetCurrentDay(s.DB)

	guessesToday := guessesPerDay[currentDay]
	// Add one to the number of guesses because it's the point for the next guess
    stats.PointsForNextGuess = utils.CalculatePoints(guessesToday+1)

    return stats, nil
}
