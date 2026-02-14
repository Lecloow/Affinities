package main

import (
	"backend/Handlers"
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

type user struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	LastName string `json:"lastName"`
}

var db *sql.DB // global db variable

func main() {
	initdb()
	defer db.Close()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "https://comitedepromo2026.com"},
		//AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		//AllowHeaders:     []string{"Origin", "Content-Type"},
		//ExposeHeaders:    []string{"Content-Length"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
		MaxAge:           24 * time.Hour, // So 24 hours
	}))

	handler := &Handlers.Handler{DB: db}

	router.GET("/users", getUsers)
	router.GET("/user/:id", getUserByID)
	router.POST("/albums", createUser)
	router.POST("/login", handler.Login)

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

func createUser(c *gin.Context) {
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
