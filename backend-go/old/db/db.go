package db

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var DB *pgxpool.Pool

func InitDB() {

	godotenv.Load(".env")
	databaseUrl := os.Getenv("DATABASE_URL")

	pool, err := pgxpool.New(context.Background(), databaseUrl)
	if err != nil {
		panic(err)
	}

	DB = pool
}
