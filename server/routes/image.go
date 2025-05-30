package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/handlers"
)

func RegisterImageRoutes(r *gin.Engine) {
	images := r.Group("/api/images")
	images.Use(handlers.AuthMiddleware()) // Protect image upload with JWT authentication
	{
		images.POST("/upload", handlers.UploadImage)
	}
}
