package main

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/krapie/tracker/health"
	"github.com/krapie/tracker/routes"
)

func main() {
	// Load .env file if present
	_ = godotenv.Load()

	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.RegisterIssueRoutes(r)
	routes.RegisterPlaybookRoutes(r)
	routes.RegisterHealthRoutes(r)

	// Start health checkers for all endpoints
	health.StartAllHealthCheckers()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}
	r.Run(":" + port)
}
