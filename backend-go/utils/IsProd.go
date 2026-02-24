package utils

import (
	"log"
	"os"
)

func loadEnv() bool {
	env := os.Getenv("ENV")

	log.Print(env == "")
	if env == "" {
		return true
	}
	return false
}

// IsProduction To know if it's prod or not, it's used to set security on cookie and to create the main router
var IsProduction = loadEnv()
