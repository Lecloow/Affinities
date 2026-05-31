package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

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

	currentDay := utils.GetCurrentDay()

	guessesToday := guessesPerDay[currentDay]
	// Add one to the number of guesses because it's the point for the next guess
	stats.PointsForNextGuess = utils.CalculatePoints(guessesToday + 1)

	return stats, nil
}

func (s *UserService) GetMatches(ctx context.Context, id models.UserID) ([]*models.Match, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT m.id, m.match_id, m.day, m.reveal_time, m.revealed,
		        u.first_name, u.last_name, u.class
		 FROM matches m
		 LEFT JOIN users u ON m.match_id = u.id
		 WHERE m.user_id = $1
		 ORDER BY m.day`,
		id,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []*models.Match

	for rows.Next() {
		match := &models.Match{}
		if err := rows.Scan(
			&match.ID,
			&match.MatchID,
			&match.Day,
			&match.RevealTime,
			&match.Revealed,
			&match.FirstName,
			&match.LastName,
			&match.Class,
		); err != nil {
			return nil, err
		}

		if !match.Revealed {
			match.FirstName = "Locked"
			match.LastName = "Locked"
			match.Class = "Locked"
		}

		matches = append(matches, match)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return matches, nil
}

func (s *UserService) RevealMatch(ctx context.Context, userId models.UserID, day int) (int, error) {
	match := &models.Match{}

	err := s.DB.QueryRow(ctx, `SELECT id, reveal_time, revealed FROM matches WHERE user_id = $1 AND day = $2`, userId, day).Scan(&match.ID, &match.RevealTime, &match.Revealed)
	if err != nil {
		return 0, err
	}
	if !match.RevealTime.Before(time.Now().UTC()) {
		return 0, errors.New("cannot be revealed before reveal time")
	}

	if match.Revealed {
		return 0, nil
	}
	_, err = s.DB.Exec(ctx, "UPDATE matches SET revealed = $1 WHERE id = $2 ", true, match.ID)
	if err != nil {
		return 0, err
	}

	return match.ID, nil
}
