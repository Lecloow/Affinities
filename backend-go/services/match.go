package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"sort"
	"strings"
)

func (s *UserService) ComputeMatches(ctx context.Context) error {
	rows, err := s.DB.Query(ctx, "SELECT id, class, answers FROM users")
	if err != nil {
		return err
	}
	defer rows.Close()

	type User struct {
		ID      models.UserID
		Class   string
		Answers []int16
	}

	var all []User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Class, &u.Answers); err != nil {
			return err
		}
		all = append(all, u)
	}
	if err := rows.Err(); err != nil {
		return err
	}

	type ScoredMatch struct {
		MatchID models.UserID
		Score   float64
	}

	userMatches := map[models.UserID][]ScoredMatch{}
	for i, a := range all {
		for j, b := range all {
			if i == j {
				continue
			}
			aLevel, _, _ := strings.Cut(a.Class, " ")
			bLevel, _, _ := strings.Cut(b.Class, " ")
			if aLevel != bLevel {
				continue
			}
			score := utils.MatchScore(a.Answers, b.Answers)
			userMatches[a.ID] = append(userMatches[a.ID], ScoredMatch{b.ID, score})
		}
	}

	for userID, scored := range userMatches {
		sort.Slice(scored, func(i, j int) bool {
			return scored[i].Score < scored[j].Score
		})

		for day := 1; day <= utils.EventDuration && day <= len(scored); day++ {
			match := scored[day-1]
			dayRevealTime := utils.GetRevealTime(utils.MatchRevealTime, day)
			_, err := s.DB.Exec(ctx, `
                INSERT INTO matches (user_id, match_id, score, day, reveal_time, revealed)
                VALUES ($1, $2, $3, $4, $5, FALSE)
                ON CONFLICT (user_id, day) DO NOTHING
            `, userID, match.MatchID, match.Score, day, dayRevealTime)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
