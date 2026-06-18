package services

import (
	"context"
	"backend/models"
)

func (s *UserService) LoadUsers(ctx context.Context) ([]*models.EmailUser, error) {
	rows, err := s.DB.Query(ctx, `
	    SELECT
	        users.id,
	        users.first_name,
			users.email,
	        c.password
	    FROM users
	    JOIN non_hashed_passwords c ON users.id = c.user_id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.EmailUser
	
	for rows.Next() {
		user := models.EmailUser{}
		if err := rows.Scan(&user.ID, &user.FirstName, &user.Email, &user.Password); err != nil {
			return nil, err
		}
		users = append(users, &user)
	}
	
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}
