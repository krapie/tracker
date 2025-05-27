package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/handlers"
)

func RegisterHealthRoutes(r *gin.Engine) {
	health := r.Group("/api/health")
	{
		health.POST("/endpoints", handlers.RegisterHealthEndpoint)
		health.GET("/status", handlers.ListHealthStatuses)
		health.PUT("/endpoints/:id", handlers.UpdateHealthEndpoint)
	}
}
