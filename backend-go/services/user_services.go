package services

import (
	"backend/models"
	"context"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserService struct {
	DB *pgxpool.Pool
}

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

func (s *UserService) Login(ctx context.Context, password string) (*models.User, error) {

	var user models.User

	err := s.DB.QueryRow(ctx, "SELECT user_id FROM credentials WHERE password_hash = $1", password).
		Scan(&user.ID)
	if err != nil {
		return nil, err
	}

	err = s.DB.QueryRow(ctx, "SELECT first_name, last_name, email, class FROM users WHERE id = $1", user.ID).
		Scan(&user.FirstName, &user.LastName, &user.Email, &user.Class)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

//TODO: Hashed version -- In progress
//func (s *UserService) Login(ctx context.Context, password string) (*models.User, error) {
//	var user models.User
//	var hashedToken string
//
//	rows, err := s.DB.Query(ctx, `
//		SELECT id, first_name, last_name, class, password_hash
//		FROM users
//	`)
//	if err != nil {
//		return nil, fmt.Errorf("query error: %w", err)
//	}
//	defer rows.Close()
//
//	for rows.Next() {
//		if err := rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Class, &hashedToken); err != nil {
//			continue
//		}
//		if bcrypt.CompareHashAndPassword([]byte(hashedToken), []byte(password)) == nil {
//			return &user, nil
//		}
//	}
//
//	return nil, fmt.Errorf("invalid credentials")
//}

func (s *UserService) GetCandidates(ctx context.Context, id models.UserID) ([]*models.User, error) {
	var class string
	err := s.DB.QueryRow(ctx, "SELECT class FROM users WHERE id = $1", id).Scan(&class)
	if err != nil {
		return nil, err
	}

	level := strings.Split(class, " ")[0]

	var candidates []*models.User

	rows, err := s.DB.Query(ctx, "SELECT id, first_name, last_name FROM users WHERE class LIKE $1", level+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		u := &models.User{}
		if err := rows.Scan(&u.ID, &u.FirstName, &u.LastName); err != nil {
			return nil, err
		}
		if u.ID != id {
			candidates = append(candidates, u)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return candidates, nil
}

func (s *UserService) GetStats(ctx context.Context, id models.UserID) (*models.UserStats, error) {

	stats := &models.UserStats{ID: id}

	err := s.DB.QueryRow(ctx, "SELECT total_points, code_exchange_bonus FROM scores WHERE user_id = $1", id).Scan(&stats.TotalPoints, &stats.BonusPoints)
	if err != nil {
		return nil, err
	}

	rows, err := s.DB.Query(ctx, `
		SELECT id, user_id, day, hint_number, guessed_user_id, is_correct, created_at 
		FROM guesses 
		WHERE user_id = $1
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var g models.Guess
		if err := rows.Scan(&g.ID, &g.UserID, &g.Day, &g.HintNumber, &g.GuessedUserId, &g.IsCorrect, &g.CreatedAt); err != nil {
			continue
		}
		stats.Guesses = append(stats.Guesses, &g)
	}

	return stats, nil
}
