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

	var storageBackend storage.Storage
	if os.Getenv("STORAGE_BACKEND") == "s3" {
		s3Storage, err := storage.NewS3Storage()
		if err != nil {
			panic(err)
		}
		storageBackend = s3Storage
	} else {
		minioStorage, err := storage.NewMinioStorage()
		if err != nil {
			panic(err)
		}
		storageBackend = minioStorage
	}

	handlers.InitStorageBackend(storageBackend)

	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.RegisterIssueRoutes(r)
	routes.RegisterPlaybookRoutes(r)
	routes.RegisterHealthRoutes(r)
	routes.RegisterImageRoutes(r)
	routes.RegisterAuthRoutes(r)

	// Initialize admin user
	handlers.InitializeAdminUser()

	// Start health checkers for all endpoints
	health.StartAllHealthCheckers()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}
	r.Run(":" + port)
}
