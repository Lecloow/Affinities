package main

import (
	"backend/handlers"
	"backend/services"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	initDB()
	defer db.Close()
	//runMigrations()
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

	userService := &services.UserService{DB: db}
	userHandler := &handlers.UserHandler{Service: userService}

	router.Use(func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 1<<20) // Limit to 1MB
	})

	auth := router.Group("/")
	auth.Use(handlers.AuthMiddleware(userService))
	{
		auth.POST("/guess", userHandler.Guess)
		//auth.GET("/candidates/:id", userHandler.Candidates)
		//auth.GET("/user-stats/:id", userHandler.Stats)
		//auth.GET("/leaderboard", userHandler.Leaderboard)
		//auth.GET("/hints/:id", userHandler.GetHints)
	}

	router.POST("/login", userHandler.Login)
	router.GET("/candidates/:id", userHandler.Candidates)
	router.GET("/user-stats/:id", userHandler.Stats)
	//router.POST("/guess", userHandler.Guess)
	router.GET("/leaderboard", userHandler.Leaderboard)
	router.GET("/hints/:id", userHandler.GetHints)

	// Need Admin perms
	router.POST("/users", userHandler.CreateUser)
	router.GET("/users", userHandler.GetAllUsers)
	router.GET("/users/:id", userHandler.GetUserByID)

	//router.Run(":8080") // Perhaps :10000
	if err := router.Run("localhost:8080"); err != nil {
		panic(fmt.Errorf("failed to run server: %v", err))
	}

}
