package services

import (
	"backend/models"
	"backend/utils"
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

func (s *UserService) GetRevealCode(ctx context.Context, userId models.UserID, day int) (*models.RevealCode, error) {

	var id int
	var revealCode models.RevealCode

	err := s.DB.QueryRow(ctx, `
		SELECT id, code, exchanged
		FROM reveal_codes 
		WHERE user_id = $1 AND day = $2
	`, userId, day).Scan(&id, &revealCode.Code, &revealCode.PartnerExchanged) // We check if the user has already written his partner code.
	// In fact, it's not exchanged, but do I have exchanged
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

	matchId, err := s.GetMatchId(ctx, userId, day)
	if err != nil {
		return nil, err
	}

	err = s.DB.QueryRow(ctx, `
		SELECT exchanged
		FROM reveal_codes 
		WHERE user_id = $1 AND day = $2
	`, matchId, day).Scan(&revealCode.Exchanged)

	if revealCode.PartnerExchanged && revealCode.Exchanged {
		revealCode.BothExchanged = true
	}

	return &revealCode, nil
}

func (s *UserService) CreateRevealCode(ctx context.Context, userId models.UserID, day int) (string, error) {
	newCode, err := utils.GenerateRevealCode()
	if err != nil {
		return "", err
	}

	_, insertErr := s.DB.Exec(ctx, `
				INSERT INTO reveal_codes (user_id, day, code)
				VALUES ($1, $2, $3)
			`, userId, day, newCode)
	if insertErr != nil {
		return "", insertErr
	}

	return newCode, nil
}

func (s *UserService) ExchangeCode(ctx context.Context, userId models.UserID, day int, code string) (*string, error) {
	var realCode string
	var id int
	var exchanged bool

	codeAlreadyExchanged := "code already exchanged"
	codeExchanged := "code exchanged successfully"

	matchId, err := s.GetMatchId(ctx, userId, day)
	if err != nil {
		return nil, err
	}

	err = s.DB.QueryRow(ctx, `SELECT id, code, exchanged FROM reveal_codes WHERE user_id = $1 AND day = $2`, matchId, day).Scan(&id, &realCode, &exchanged)

	if code != realCode {
		return nil, errors.New("invalid code")
	}

	if exchanged {
		return &codeAlreadyExchanged, nil
	}

	_, err = s.DB.Exec(ctx, `
				UPDATE reveal_codes
				SET exchanged = $1, exchanged_at = $2
				WHERE id = $3
				`, true, time.Now().UTC(), id)
	if err != nil {
		return nil, err
	}
	return &codeExchanged, nil
}

func (s *UserService) GetMatchId(ctx context.Context, userId models.UserID, day int) (*models.UserID, error) {
	var matchId models.UserID
	err := s.DB.QueryRow(ctx, `
		SELECT match_id
		FROM matches 
		WHERE user_id = $1 AND day = $2
	`, userId, day).Scan(&matchId)
	if err != nil {
		return nil, err
	}

	return &matchId, nil
}
