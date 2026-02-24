package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/joho/godotenv/autoload"
)

var db *pgxpool.Pool

func initDB() {
	dbURL := os.Getenv("DATABASE_URL")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var err error
	db, err = pgxpool.New(ctx, dbURL)
	if err != nil {
		panic(fmt.Errorf("unable to connect to DB: %w", err))
	}

	if err := db.Ping(ctx); err != nil {
		panic(fmt.Errorf("cannot ping DB: %w", err))
	}

	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id BIGSERIAL PRIMARY KEY,
		first_name TEXT NOT NULL,
		last_name TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		class TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS credentials (
		user_id BIGSERIAL PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		password_hash TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS sessions (
		token TEXT PRIMARY KEY,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		expires_at TIMESTAMP NOT NULL
	);


	CREATE TABLE IF NOT EXISTS matches (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		match_id BIGINT NOT NULL, 
		day INTEGER NOT NULL CHECK (day > 0),
		UNIQUE(user_id, match_id)
	);

	CREATE TABLE IF NOT EXISTS hints (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		day INTEGER NOT NULL CHECK (day > 0),
		hint_number INTEGER NOT NULL CHECK (hint_number > 0),
		difficulty TEXT NOT NULL,
		content TEXT NOT NULL,
		reveal_time TIMESTAMP,
		revealed BOOLEAN DEFAULT FALSE,
		UNIQUE(user_id, day, hint_number)
	);

	CREATE TABLE IF NOT EXISTS guesses (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		day INTEGER NOT NULL CHECK (day > 0),
		hint_number INTEGER NOT NULL CHECK (hint_number > 0),
		guessed_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		is_correct BOOLEAN NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id, day, hint_number)
	);

	CREATE TABLE IF NOT EXISTS scores (
		user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
		total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
		code_exchange_bonus INTEGER DEFAULT 0 CHECK (code_exchange_bonus >= 0),
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS reveal_codes (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		
		day INTEGER NOT NULL CHECK (day > 0),
		code TEXT NOT NULL,
		exchanged BOOLEAN DEFAULT FALSE,
		exchanged_at TIMESTAMP,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id, day)
	);

	CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
	CREATE INDEX IF NOT EXISTS idx_matches_day ON matches(day);
	CREATE INDEX IF NOT EXISTS idx_hints_user_id ON hints(user_id);
	CREATE INDEX IF NOT EXISTS idx_guesses_user_id ON guesses(user_id);
	`

	if _, err := db.Exec(ctx, schema); err != nil {
		panic(fmt.Errorf("cannot initialize schema: %w", err))
	}
}
