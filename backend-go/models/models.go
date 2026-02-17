package models

type User struct {
	ID        int    `json:"id"` // Will maybe change to uuid
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Class     string `json:"class"`
}
