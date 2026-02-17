package models

import "time"

type User struct {
	ID        int    `json:"id"` // Will maybe change to uuid
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Class     string `json:"class"`
}

type UserStats struct {
	ID          int      `json:"id"`
	TotalPoints int      `json:"totalPoints"`
	BonusPoints int      `json:"bonusPoints"`
	Guesses     []*Guess `json:"guesses"`
}

type Guess struct {
	ID            int       `json:"id"`
	UserID        int       `json:"userId"`
	Day           int       `json:"day"`
	HintNumber    int       `json:"hintNumber"`
	GuessedUserId int       `json:"guessedUser"`
	IsCorrect     bool      `json:"isCorrect"`
	CreatedAt     time.Time `json:"createdAt"`
}
