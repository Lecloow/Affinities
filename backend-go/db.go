package main

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var db *pgxpool.Pool

const dbURL = "postgres://thomasconchon:@localhost:5432/thomasconchon?sslmode=disable"

func initdb() {
	var err error
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	db, err = pgxpool.New(ctx, dbURL)
	if err != nil {
		panic(fmt.Errorf("unable to connect to DB: %v", err))
	}

	err = db.Ping(ctx)
	if err != nil {
		panic(fmt.Errorf("cannot ping DB: %v", err))
	}

	createPasswords := `
    CREATE TABLE IF NOT EXISTS passwords (
        id SERIAL PRIMARY KEY,
        password TEXT NOT NULL
    )`
	_, err = db.Exec(ctx, createPasswords)
	if err != nil {
		panic(fmt.Errorf("cannot create table passwords: %v", err))
	}

	createUsers := `CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		first_name TEXT NOT NULL,
		last_name TEXT NOT NULL,
		email TEXT NOT NULL,
		class TEXT NOT NULL
	)`
	_, err = db.Exec(ctx, createUsers)
	if err != nil {
		panic(fmt.Errorf("cannot create table users: %v", err))
	}

}
