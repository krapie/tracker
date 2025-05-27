package main

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/krapie/tracker/handlers"
	"github.com/krapie/tracker/health"
	"github.com/krapie/tracker/routes"
	"github.com/krapie/tracker/storage"
)

func main() {
	// Load .env file if present
	_ = godotenv.Load()

	// Initialize MinIO storage
	minioStorage, err := storage.NewMinioStorage()
	if err != nil {
		panic(err)
	}
	handlers.InitStorageBackend(minioStorage)

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
	routes.RegisterImageRoutes(r)

	// Start health checkers for all endpoints
	health.StartAllHealthCheckers()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}
	r.Run(":" + port)
}
