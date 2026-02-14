package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func InitDB() {
	databaseUrl := "postgresql://saintvalen_user:k9HGnx1B4XsAEeZ9sBv2lYKA9eBFlzJ3@dpg-d61iiinpm1nc738coq9g-a.frankfurt-postgres.render.com/saintvalen_db" //os.Getenv("DATABASE_URL")

	pool, err := pgxpool.New(context.Background(), databaseUrl)
	if err != nil {
		panic(err)
	}

	DB = pool
}
