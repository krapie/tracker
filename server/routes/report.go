package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/handlers"
)

func RegisterReportRoutes(r *gin.Engine) {
	reports := r.Group("/api/reports")
	reports.Use(handlers.AuthMiddleware()) // Protect all report routes with JWT authentication
	{
		reports.GET("/", handlers.GetReports)
		reports.GET("/:id", handlers.GetReport)
		reports.POST("/", handlers.CreateReport)
		reports.PUT("/:id", handlers.UpdateReport)
		reports.DELETE("/:id", handlers.DeleteReport)
	}
}