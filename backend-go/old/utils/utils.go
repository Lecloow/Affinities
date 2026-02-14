package utils

import (
	"crypto/rand"
	"encoding/base64"
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
