package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func (s *UserService) ImportUser(
	ctx context.Context,
	user *models.User,
	passwordLength int,
	answers []int16,
) (string, error) {

	for tries := 0; tries < 5; tries++ {
		password, err := utils.GeneratePassword(passwordLength)
		if err != nil {
			return "", err
		}

		err = s.tryImportUser(ctx, user, password, answers)
		if err == nil {
			return password, nil
		}

		if !utils.IsUniqueViolation(err) {
			return "", err
		}
	}

	return "", fmt.Errorf("failed to generate a unique password after 5 attempts")
}

func (s *UserService) tryImportUser(
	ctx context.Context,
	user *models.User,
	password string,
	answers []int16,
) error {

	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer func(tx pgx.Tx, ctx context.Context) {
		err := tx.Rollback(ctx)
		if err != nil {
			return
		}
	}(tx, ctx)

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	err = tx.QueryRow(
		ctx,
		`INSERT INTO users (first_name, last_name, email, class, answers)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id`,
		user.FirstName,
		user.LastName,
		user.Email,
		user.Class,
		answers,
	).Scan(&user.ID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(
		ctx,
		`INSERT INTO non_hashed_passwords (user_id, password)
		 VALUES ($1, $2)`,
		user.ID,
		password,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(
		ctx,
		`INSERT INTO credentials (user_id, password_hash)
		 VALUES ($1, $2)`,
		user.ID,
		hashedPassword,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
