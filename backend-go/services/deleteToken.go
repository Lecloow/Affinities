package services

import (
	"context"
	"time"
)

func (s *UserService) DeleteToken(ctx context.Context, token string) error {
	_, err := s.DB.Exec(ctx, "DELETE FROM sessions WHERE token = $1", token)
	if err != nil {
		return err
	}
	return nil
}

func (s *UserService) DeleteExpiredTokens(ctx context.Context, expiredBefore time.Time) error {
	_, err := s.DB.Exec(ctx, "DELETE FROM sessions WHERE expires_at < $1", expiredBefore)
	return err
}

func (s *UserService) CleanExpiredTokens() error {
	return s.DeleteExpiredTokens(context.Background(), time.Now())
}