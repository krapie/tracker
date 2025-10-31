package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/handlers"
)

func RegisterHealthRoutes(r *gin.Engine) {
	health := r.Group("/api/health")
	health.Use(handlers.AuthMiddleware()) // Protect all health routes with JWT authentication
	{
		health.POST("/endpoints", handlers.RegisterHealthEndpoint)
		health.GET("/status", handlers.ListHealthStatuses)
		health.PUT("/endpoints/:id", handlers.UpdateHealthEndpoint)
		health.DELETE("/endpoints/:id", handlers.DeleteHealthEndpoint)
	}
	// Add /healthz endpoint at root for probes (unprotected for k8s health checks)
	r.GET("/healthz", handlers.HealthzHandler)
}
