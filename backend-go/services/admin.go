package services

import (
	"backend/models"
	"context"

	"github.com/jackc/pgx/v5"
)

func (s *UserService) GetByID(ctx context.Context, id int) (*models.User, error) {
	var u models.User

	err := s.DB.QueryRow(ctx,
		"SELECT id, first_name, last_name, email, class FROM users WHERE id = $1",
		id,
	).Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.Class)

	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (s *UserService) GetAll(ctx context.Context) ([]*models.User, error) {
	rows, err := s.DB.Query(ctx, "SELECT id, first_name, last_name, email, class FROM users ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		u := &models.User{}
		if err := rows.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.Class); err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	return users, nil
}

func (s *UserService) AddUser(ctx context.Context, user *models.User, hashedPassword string) (*models.User, error) {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer func(tx pgx.Tx, ctx context.Context) {
		err := tx.Rollback(ctx)
		if err != nil {
			// Log the error, but don't return it since we might have already committed
			// and we don't want to override any error that might have occurred in the main function
			// log.Printf("failed to rollback transaction: %v", err)
			return
		}
	}(tx, ctx)

	err = tx.QueryRow(ctx,
		"INSERT INTO users (first_name, last_name, email, class) VALUES ($1, $2, $3, $4) RETURNING id",
		user.FirstName, user.LastName, user.Email, user.Class,
	).Scan(&user.ID)
	if err != nil {
		return nil, err
	}

	//TODO: Hashed Version
	_, err = tx.Exec(ctx,
		"INSERT INTO credentials (user_id, password_hash) VALUES ($1, $2)",
		user.ID, hashedPassword,
	)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return user, nil
}
