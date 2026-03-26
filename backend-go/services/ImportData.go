package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"fmt"
)

//func (s *UserService) ImportUser(ctx context.Context, user *models.User, passwordLength int) (string, error) {
//	tx, err := s.DB.Begin(ctx)
//	if err != nil {
//		return "", err
//	}
//	defer func(tx pgx.Tx, ctx context.Context) {
//		_ = tx.Rollback(ctx)
//	}(tx, ctx)
//
//	var (
//		password       string
//		hashedPassword string
//		number         int
//	)
//
//	//for {
//	//	password, err = utils.GeneratePassword(passwordLength)
//	//	if err != nil {
//	//		return "", err
//	//	}
//	//
//	//	hashedPassword, err = utils.HashPassword(password)
//	//	if err != nil {
//	//		return "", err
//	//	}
//	//
//	//	err = tx.QueryRow(ctx,
//	//		"SELECT COUNT(*) FROM credentials WHERE password_hash = $1",
//	//		hashedPassword,
//	//	).Scan(&number)
//	//	if err != nil {
//	//		return "", err
//	//	}
//	//
//	//	if number == 0 {
//	//		break
//	//	}
//	//}
//
//	for {
//		password, err = utils.GeneratePassword(passwordLength)
//		if err != nil {
//			return "", err
//		}
//
//		err = tx.QueryRow(ctx,
//			"SELECT COUNT(*) FROM credentials WHERE password_hash = $1",
//			password,
//		).Scan(&number)
//		if err != nil {
//			return "", err
//		}
//
//		if number == 0 {
//			break
//		}
//	}
//
//	err = tx.QueryRow(ctx,
//		"INSERT INTO users (first_name, last_name, email, class) VALUES ($1, $2, $3, $4) RETURNING id",
//		user.FirstName, user.LastName, user.Email, user.Class,
//	).Scan(&user.ID)
//	if err != nil {
//		return "", err
//	}
//
//	_, err = tx.Exec(ctx,
//		"INSERT INTO credentials (user_id, password_hash) VALUES ($1, $2)",
//		user.ID, hashedPassword,
//	)
//	if err != nil {
//		return "", err
//	}
//
//	if err := tx.Commit(ctx); err != nil {
//		return "", err
//	}
//
//	return password, nil
//}
//
//// TODO: Security and code improvements

func (s *UserService) ImportUser(ctx context.Context, user *models.User, passwordLength int) (string, error) {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var password string

	for tries := 0; tries < 5; tries++ {
		password, err = utils.GeneratePassword(passwordLength)
		if err != nil {
			return "", err
		}

		err = tx.QueryRow(ctx,
			"INSERT INTO users (first_name, last_name, email, class) VALUES ($1, $2, $3, $4) RETURNING id",
			user.FirstName, user.LastName, user.Email, user.Class,
		).Scan(&user.ID)
		if err != nil {
			return "", err
		}

		_, err = tx.Exec(ctx,
			"INSERT INTO credentials (user_id, password_hash) VALUES ($1, $2)",
			user.ID, password,
		)
		if err == nil {
			if commitErr := tx.Commit(ctx); commitErr != nil {
				return "", commitErr
			}
			return password, nil
		}
		_, _ = tx.Exec(ctx, "DELETE FROM users WHERE id=$1", user.ID)
	}
	return "", fmt.Errorf("failed to generate a unique password after multiple attempts")
}

//TODO: hash
