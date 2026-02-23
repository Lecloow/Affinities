package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"errors"
	"log"

	"github.com/jackc/pgx/v5"
)

func (s *UserService) GetRevealCode(ctx context.Context, userId models.UserID, day int) (*models.RevealCode, error) {

	var id int
	var revealCode models.RevealCode

	err := s.DB.QueryRow(ctx, `
		SELECT id, code, exchanged
		FROM reveal_codes 
		WHERE user_id = $1 AND day = $2
	`, userId, day).Scan(&id, &revealCode.Code, &revealCode.Exchanged)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			revealCode.Code, err = s.CreateRevealCode(ctx, userId, day)
			if err != nil {
				return nil, err
			}
			return &revealCode, nil
		}
		return nil, err
	}
	err = s.DB.QueryRow(ctx, `
		SELECT exchanged
		FROM reveal_codes 
		WHERE match_id = $1 AND day = $2
	`, userId, day).Scan(&revealCode.PartnerExchanged)

	if revealCode.PartnerExchanged && revealCode.Exchanged {
		revealCode.BothExchanged = true
	}

	return &revealCode, nil
}

func (s *UserService) CreateRevealCode(ctx context.Context, userId models.UserID, day int) (string, error) {
	newCode, err := utils.GenerateRevealCode()

	var matchId int

	err = s.DB.QueryRow(ctx, `
		SELECT match_id
		FROM matches 
		WHERE user_id = $1 AND day = $2
	`, userId, day).Scan(&matchId)
	if err != nil {
		return "", err
	}
	log.Print(matchId)

	_, insertErr := s.DB.Exec(ctx, `
				INSERT INTO reveal_codes (user_id, match_id, day, code)
				VALUES ($1, $2, $3, $4)
			`, userId, matchId, day, newCode)
	if insertErr != nil {
		return "", insertErr
	}

	return newCode, nil
}

//func (s *UserService) ExchangeCode(ctx context.Context, userId models.UserID, day int, code string) (*string, error) {
//	_, err = s.DB.Exec(ctx, `
//		UPDATE reveal_codes
//		SET exchanged = $1, exchanged_at = $2
//		WHERE id = $3
//		`, true, time.Now().UTC(), id)
//}
