package services

import (
	"backend/models"
	"context"
)

func (s *UserService) GetLeaderboard(ctx context.Context) ([]*models.LeaderboardEntry, error) {

	rows, err := s.DB.Query(ctx, `
				SELECT
					ROW_NUMBER() OVER (ORDER BY s.total_points DESC, s.updated_at ASC) AS rank,
					s.user_id,
					u.first_name,
					u.last_name,
					u.class, 
					s.total_points,
					s.code_exchange_bonus,
					s.updated_at
				FROM scores s
				JOIN users u ON s.user_id = u.id
			`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaderboard []*models.LeaderboardEntry
	for rows.Next() {
		entry := &models.LeaderboardEntry{}
		err := rows.Scan(
			&entry.Rank,
			&entry.UserID,
			&entry.FirstName,
			&entry.LastName,
			&entry.Class,
			&entry.TotalPoints,
			&entry.BonusPoints,
			&entry.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		leaderboard = append(leaderboard, entry)
	}

	return leaderboard, rows.Err()
}
