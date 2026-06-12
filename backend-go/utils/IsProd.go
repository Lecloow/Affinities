package utils

import (
	"os"
)

func loadEnv() bool {
	env := os.Getenv("ENV")

	if env == "" {
		return true
	}
	return false
}

// IsProduction to know if it's prod or not, it's used to set security on cookie and to create the main router
var IsProduction = loadEnv()
