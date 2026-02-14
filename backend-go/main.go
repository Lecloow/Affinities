package main

import (
	"backend/Handlers"
	"context"
	"fmt"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type user struct {
	ID        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Class     string `json:"class"`
}

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

	router.GET("/users", getAllUsers)
	router.GET("/user/:id", getUserByID)
	router.POST("/createUser", createUser)
	router.POST("/login", handler.Login)

	router.Run("localhost:8080")
}

func getAllUsers(c *gin.Context) {
	ctx := context.Background()
	rows, err := db.Query(ctx, "SELECT id, name, last_name FROM users")
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var users []user
	for rows.Next() {
		var u user
		var id int
		if err := rows.Scan(&id, &u.FirstName, &u.LastName); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		u.ID = fmt.Sprintf("%d", id)
		users = append(users, u)
	}
	c.IndentedJSON(200, users)
}

func createUser(c *gin.Context) {
	ctx := context.Background()
	var newUser user
	if err := c.BindJSON(&newUser); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var id int
	err := db.QueryRow(ctx,
		"INSERT INTO users (first_name, last_name, email, class) VALUES ($1, $2, $3, $4) RETURNING id",
		newUser.FirstName, newUser.LastName, newUser.Email, newUser.Class).Scan(&id)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	newUser.ID = fmt.Sprintf("%d", id)
	c.IndentedJSON(201, newUser)
}

func getUserByID(c *gin.Context) {
	ctx := context.Background()
	id := c.Param("id")

	var u user
	var intID int
	err := db.QueryRow(ctx, "SELECT id, first_name, last_name FROM users WHERE id = $1", id).
		Scan(&intID, &u.FirstName, &u.LastName)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	u.ID = fmt.Sprintf("%d", intID)

	c.IndentedJSON(200, u)
}
