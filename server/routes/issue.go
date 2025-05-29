package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/handlers"
)

func RegisterIssueRoutes(r *gin.Engine) {
	issues := r.Group("/api/issues")
	{
		issues.GET("/", handlers.GetIssues)
		issues.GET("/:id", handlers.GetIssue)
		issues.POST("/", handlers.CreateIssue)
		issues.PUT("/:id", handlers.UpdateIssue)
	}
}
