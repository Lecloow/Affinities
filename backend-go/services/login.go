package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
	"errors"

	"github.com/jackc/pgx/v5"
)

func (s *UserService) Login(ctx context.Context, password string) (*models.User, error) {

	lookup := sha256.Sum256([]byte(password))
	lookupStr := hex.EncodeToString(lookup[:])

	var user models.User

	err := s.DB.QueryRow(ctx, `
		SELECT u.id, u.first_name, u.last_name, u.email, u.class
		FROM credentials c
		JOIN users u ON u.id = c.user_id
		WHERE c.password_lookup = $1
	`, lookupStr).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Class,
	)
	if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, pgx.ErrNoRows
        }
        return nil, fmt.Errorf("database error: %w", err)
    }

	return &user, nil
}

func (s *UserService) CreateSession(ctx context.Context, userId models.UserID) (string, error) {

	var token string
	for {
		token = utils.GenerateSecureToken()

		var count int
		err := s.DB.QueryRow(ctx, "SELECT COUNT(*) FROM sessions WHERE token = $1", token).Scan(&count)
		if err != nil {
			return "", err
		}
		if count == 0 {
			break
		}
	}

	expirationDate := time.Now().UTC().Add(48 * time.Hour) // Session expires in 48 hours
	_, err := s.DB.Exec(ctx, "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)", token, userId, expirationDate)
	if err != nil {
		return "", err
	}
	return token, nil
}
