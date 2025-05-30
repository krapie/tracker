package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/handlers"
)

func RegisterAuthRoutes(r *gin.Engine) {
	auth := r.Group("/api/auth")
	{
		auth.POST("/login", handlers.Login)
		auth.GET("/profile", handlers.AuthMiddleware(), handlers.GetProfile)
	}
}
