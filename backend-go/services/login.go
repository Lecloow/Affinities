package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

//func (s *UserService) Login(ctx context.Context, password string) (*models.User, error) {
//
//	var user models.User
//
//	err := s.DB.QueryRow(ctx, "SELECT user_id FROM credentials WHERE password_hash = $1", password).
//		Scan(&user.ID)
//	if err != nil {
//		return nil, err
//	}
//
//	err = s.DB.QueryRow(ctx, "SELECT first_name, last_name, email, class FROM users WHERE id = $1", user.ID).
//		Scan(&user.FirstName, &user.LastName, &user.Email, &user.Class)
//	if err != nil {
//		return nil, err
//	}
//
//	return &user, nil
//}

func (s *UserService) Login(ctx context.Context, password string) (*models.User, error) {
	rows, err := s.DB.Query(ctx, `
		SELECT user_id, password_hash
		FROM credentials
	`)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var userID models.UserID
		var hashedPassword string

		if err := rows.Scan(&userID, &hashedPassword); err != nil {
			continue
		}
		if bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)) == nil {
			user := models.User{ID: userID}
			err = s.DB.QueryRow(ctx, "SELECT first_name, last_name, email, class FROM users WHERE id = $1", user.ID).
				Scan(&user.FirstName, &user.LastName, &user.Email, &user.Class)
			if err != nil {
				return nil, err
			}
			return &user, nil
		}
	}

	return nil, fmt.Errorf("invalid credentials")
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
