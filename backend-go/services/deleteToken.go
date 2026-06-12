package services

import (
	"backend/models"
	"context"

	"github.com/jackc/pgx/v5"
)

func (s *UserService) DeleteToken(ctx context.Context, token string) (error) {
}