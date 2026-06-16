package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func (s *UserService) ImportUser(
	ctx context.Context,
	user *models.User,
	passwordLength int,
	answers []int16,
) error {

	for range 5 {
		password, err := utils.GeneratePassword(passwordLength)
		if err != nil {
			return err
		}

		err = s.tryImportUser(ctx, user, password, answers)
		if err == nil {
			return nil
		}

		if !utils.IsUniqueViolation(err) {
			return err
		}
	}

	return fmt.Errorf("failed to generate a unique password after 5 attempts")
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

	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback(ctx)
		}
	}()

	lookup := sha256.Sum256([]byte(password))
	lookupStr := hex.EncodeToString(lookup[:])

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	err = tx.QueryRow(
		ctx,
		`INSERT INTO users (first_name, last_name, email, class, answers, gender)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id`,
		user.FirstName,
		user.LastName,
		user.Email,
		user.Class,
		answers,
		user.Gender,
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
		`INSERT INTO credentials (user_id, password_hash, password_lookup)
		 VALUES ($1, $2, $3)`,
		user.ID,
		hashedPassword,
		lookupStr,
	)
	if err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	committed = true
	return nil
}
