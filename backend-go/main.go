package main

import (
	"backend/handlers"
	"backend/services"
	"backend/utils"
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

	// For prod

	var router *gin.Engine

	if utils.IsProduction {
		gin.SetMode(gin.ReleaseMode)
		router = gin.Default()
		err := router.SetTrustedProxies([]string{"127.0.0.1"})
		if err != nil {
			return
		}
	} else {
		gin.SetMode(gin.DebugMode)
		router = gin.Default()
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "https://comitedepromo2026.com"},
		//AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		//AllowHeaders:     []string{"Origin", "Content-Type"},
		//ExposeHeaders:    []string{"Content-Length"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
		MaxAge:           24 * time.Hour,
	}))

	userService := &services.UserService{DB: db}
	userHandler := &handlers.UserHandler{Service: userService}

	router.Use(func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 1<<20) // Limit to 1MB to avoid DDoS attacks
	})

	auth := router.Group("/")
	auth.Use(handlers.AuthMiddleware(userService))
	{
		auth.POST("/guess", userHandler.Guess)
		auth.GET("/leaderboard", userHandler.Leaderboard)
		auth.GET("/me/candidates", userHandler.Candidates)
		auth.GET("/me/stats", userHandler.Stats)
		auth.GET("/me/hints", userHandler.GetHints)
		auth.POST("/me/hints/:day/:hintNumber/reveal", userHandler.RevealHint)
		auth.POST("/me/hints/:day/reveal-all", userHandler.RevealAllHints)
		auth.GET("/me/codes/:day", userHandler.GetRevealCode)
		auth.POST("/me/codes/:day/exchange", userHandler.ExchangeCode)
	}

	// The only router that doesn't require auth is the login one, which returns a JWT token
	router.POST("/login", userHandler.Login)

	// Need admin perms
	authAdmin := router.Group("/admin/")
	authAdmin.Use(handlers.AdminAuth())
	{
		authAdmin.POST("/users", userHandler.CreateUser)
		authAdmin.GET("/users", userHandler.GetAllUsers)
		authAdmin.GET("/users/:id", userHandler.GetUserByID)
	}

	if err := router.Run(":8080"); err != nil {
		panic(fmt.Errorf("failed to run server: %v", err))
	}
}
