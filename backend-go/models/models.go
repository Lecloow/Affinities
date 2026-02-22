package models

import "time"

type UserID int

type User struct {
	ID        UserID `json:"id"` // Will maybe change to uuid
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Class     string `json:"class"`
}

type Candidates struct {
	ID        UserID `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

type CreateUserRequest struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Class     string `json:"class"`
	Password  string `json:"password"`
}

type UserStats struct {
	ID          UserID   `json:"id"`
	TotalPoints int      `json:"totalPoints"`
	BonusPoints int      `json:"bonusPoints"`
	Guesses     []*Guess `json:"guesses"`
}

type Guess struct {
	ID            int       `json:"id"`
	UserID        UserID    `json:"userId"`
	Day           int       `json:"day"`
	HintNumber    int       `json:"hintNumber"`
	GuessedUserId UserID    `json:"guessedUser"`
	IsCorrect     bool      `json:"isCorrect"`
	CreatedAt     time.Time `json:"createdAt"`
}

type GuessRequest struct {
	UserId        UserID `json:"userId"`
	Day           int    `json:"day"`
	HintNumber    int    `json:"hintNumber"`
	GuessedUserId UserID `json:"guessedUserId"`
}

type LeaderboardEntry struct {
	Rank        int       `json:"rank"`
	UserID      UserID    `json:"userId"`
	FirstName   string    `json:"firstName"`
	LastName    string    `json:"lastName"`
	Class       string    `json:"class"`
	TotalPoints int       `json:"totalPoints"`
	BonusPoints int       `json:"bonusPoints"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Hint struct {
	ID         int       `json:"id"`
	UserID     UserID    `json:"userId"`
	Day        int       `json:"day"`
	HintNumber int       `json:"hintNumber"`
	Difficulty string    `json:"difficulty"`
	Content    string    `json:"content"`
	RevealTime time.Time `json:"revealTime"`
	Revealed   bool      `json:"revealed"`
}
