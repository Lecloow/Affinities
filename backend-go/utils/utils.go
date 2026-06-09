package utils

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"math/big"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

func GenerateSecureToken() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)
}

func GetCurrentDay() int {
	// Implement logic to determine the current day of the event
	// For example, if the event starts on a specific date, calculate the difference in days from that date to today
	eventStartDate, err := time.Parse("2006-01-02", "2026-05-28") //2006-01-02 is just the format (YYYY-MM_DD)
	if err != nil {
		return 0
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

func MatchScore(a, b []int16) float64 {
	if len(a) != len(b) {
		return 0
	}
	matches := 0
	for i := range a {
		if a[i] == b[i] {
			matches++
		}
	}
	return float64(matches) / float64(len(a))
}

func IsUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

//func VerifyPassword(password, hash string) bool {
//	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
//	return err == nil
//}
