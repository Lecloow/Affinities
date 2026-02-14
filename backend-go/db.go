package main

import "database/sql"

const dbURL = "postgres://thomasconchon:@localhost:5432/thomasconchon?sslmode=disable"

func initdb() {
	var err error
	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	// Create table if not exists

	//createTable := `CREATE TABLE IF NOT EXISTS users (
	//	id SERIAL PRIMARY KEY,
	//	name TEXT NOT NULL,
	//	lastName TEXT NOT NULL
	//)`

	createTable := `CREATE TABLE IF NOT EXISTS passwords (
		id SERIAL PRIMARY KEY,
		password TEXT NOT NULL
	)`

	_, err = db.Exec(createTable)
	if err != nil {
		panic(err)
	}
}
