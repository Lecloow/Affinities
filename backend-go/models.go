package main

type User struct {
	ID           string
	FirstName    string
	LastName     string
	Email        string
	CurrentClass string
}

type GuessRequest struct {
	UserID        string `json:"user_id"`
	Day           int    `json:"day"`
	HintNumber    int    `json:"hint_number"`
	GuessedUserID string `json:"guessed_user_id"`
}
