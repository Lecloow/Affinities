package utils

import (
	"crypto/rand"
	"encoding/base64"
	"math/big"

	"golang.org/x/crypto/bcrypt"
)

func GenerateSecureToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
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
	characters := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var length = 6

	result := make([]byte, length)
	charsetLen := big.NewInt(int64(len(characters)))
	for i := 0; i < length; i++ {
		randomIndex, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", err
		}
		result[i] = characters[randomIndex.Int64()]
	}

	return string(result), nil
}

func GeneratePassword(length int) (string, error) {
	characters := "abcdefghijklmnopqrstuvwxyz0123456789"

	result := make([]byte, length)
	charsetLen := big.NewInt(int64(len(characters)))
	for i := 0; i < length; i++ {
		randomIndex, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", err
		}
		result[i] = characters[randomIndex.Int64()]
	}

	return string(result), nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

//func VerifyPassword(password, hash string) bool {
//	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
//	return err == nil
//}
