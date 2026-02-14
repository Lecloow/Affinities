package main

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	dbuser   = "thomasconchon"
	password = ""
	dbname   = "thomasconchon"
)

const dbURL = "postgres://thomasconchon:@localhost:5432/thomasconchon?sslmode=disable"

type user struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	LastName string `json:"lastName"`
}

var db *sql.DB // global db variable

func main() {
	//psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
	//	"password=%s dbname=%s sslmode=disable",
	//	host, port, dbuser, password, dbname)
	var err error
	//db, err = sql.Open("postgres", psqlInfo)
	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		panic(err)
	}
	defer db.Close()

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

	router := gin.Default()

	router.GET("/users", getUsers)
	router.GET("/user/:id", getUserByID)
	router.POST("/albums", postAlbums)
	router.POST("/login", login)

	router.Run("localhost:8080")
}

func getUsers(c *gin.Context) {
	rows, err := db.Query("SELECT id, name, lastName FROM users")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var users []user
	for rows.Next() {
		var u user
		if err := rows.Scan(&u.ID, &u.Name, &u.LastName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		users = append(users, u)
	}
	c.IndentedJSON(http.StatusOK, users)
}

func postAlbums(c *gin.Context) {
	var newUser user
	if err := c.BindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var id int
	err := db.QueryRow(
		"INSERT INTO users (name, lastName) VALUES ($1, $2) RETURNING id",
		newUser.Name, newUser.LastName).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	newUser.ID = fmt.Sprintf("%d", id)
	c.IndentedJSON(http.StatusCreated, newUser)
}

func getUserByID(c *gin.Context) {
	id := c.Param("id")

	var u user
	err := db.QueryRow("SELECT id, name, lastName FROM users WHERE id = $1", id).Scan(&u.ID, &u.Name, &u.LastName)
	if err == sql.ErrNoRows {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, u)
}
