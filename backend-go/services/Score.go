package services

import (
	"backend/models"
	"context"
)

func (s *UserService) AddPoints(ctx context.Context, userId models.UserID, points int) error {
	// Get the current score
	var currentScore int
	err := s.DB.QueryRow(ctx, "SELECT total_points FROM scores WHERE user_id = $1", userId).Scan(&currentScore)
	if err != nil {
		return err
	}

	// Update the score with bonus points
	newScore := currentScore + points

	_, err = s.DB.Exec(ctx, "UPDATE scores SET total_points = $1 WHERE user_id = $2", newScore, userId)
	if err != nil {
		return err
	}

	return nil
}
