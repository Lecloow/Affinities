package services

import (
	"backend/models"
	"context"
)

func (s *UserService) AddPoints(ctx context.Context, userId models.UserID, points int) error {
	_, err := s.DB.Exec(ctx, "UPDATE scores SET total_points = total_points + $1 WHERE user_id = $2", points, userId)
	if err != nil {
		return err
	}

	return nil
}
