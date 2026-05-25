package utils

import (
    "context"
	"crypto/rand"
	"encoding/base64"
	"math/big"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GenerateSecureToken() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)
}


func GetCurrentDay(db *pgxpool.Pool) int {
    // Implement logic to determine the current day of the event
    // For example, if the event starts on a specific date, calculate the difference in days from that date to today
	var eventStartDate time.Time
	err := db.QueryRow(context.Background(), "SELECT event_start_date FROM game_config LIMIT 1").Scan(&eventStartDate)
	if err != nil {
		return 1  // Fallback
	}

	daysPassed := int(time.Since(eventStartDate).Hours() / 24)
	return daysPassed + 1
}

func CalculatePoints(hints int) int {
	switch hints {
	case 1:
		return 100
	case 2:
		return 75
	case 3:
		return 50
	default:
		return 0
	}
}

func GenerateRevealCode() (string, error) {

	charsets := "abcdefghijklmnopqrstuvwxyz0123456789"
	var length = 6

	revealCode, err := GenerateString(charsets, length)
	if err != nil {
		return "", err
	}

	return revealCode, nil
}

func GeneratePassword(length int) (string, error) {
	charsets := "abcdefghijklmnopqrstuvwxyz0123456789"

	password, err := GenerateString(charsets, length)
	if err != nil {
		return "", err
	}

	return password, nil
}

func GenerateString(charsets string, length int) (string, error) {
	result := make([]byte, length)
	charsetLen := big.NewInt(int64(len(charsets)))
	for i := 0; i < length; i++ {
		randomIndex, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", err
		}
		result[i] = charsets[randomIndex.Int64()]
	}

	return string(result), nil
}

//func HashPassword(password string) (string, error) {
//	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
//	return string(bytes), err
//}

//func VerifyPassword(password, hash string) bool {
//	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
//	return err == nil
//}
