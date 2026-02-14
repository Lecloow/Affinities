package main

import (
	"backend/auth"
	"backend/db"
	"backend/handlers"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Init DB
	db.InitDB()

	r := gin.Default()

	// CORS (équivalent FastAPI)
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"https://comitedepromo2026.com",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Routes publiques
	r.POST("/login", handlers.LoginHandler)

	// Routes protégées
	authGroup := r.Group("/")
	authGroup.Use(auth.AuthMiddleware())
	{
		authGroup.GET("/me", handlers.MeHandler)
		// authGroup.POST("/guess", handlers.GuessHandler)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}
