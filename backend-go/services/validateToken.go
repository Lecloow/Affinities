package services

import (
	"backend/models"
	"context"
	"errors"
	"time"
)

func (s *UserService) ValidateToken(ctx context.Context, token string) (*models.UserID, error) {

	var userId models.UserID
	var expiresAt time.Time
	err := s.DB.QueryRow(ctx, "SELECT user_id, expires_at FROM sessions WHERE token = $1", token). //TODO: Hash token for security
													Scan(&userId, &expiresAt)
	if err != nil {
		return nil, err
	}

	if time.Now().After(expiresAt) {
		_, err := s.DB.Exec(ctx, "DELETE FROM sessions WHERE token = $1", token)
		if err != nil {
			return nil, err
		}
		return nil, errors.New("token expired")
	}

	return &userId, nil
}
