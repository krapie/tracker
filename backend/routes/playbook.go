package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/handlers"
)

func RegisterPlaybookRoutes(r *gin.Engine) {
	playbooks := r.Group("/api/playbooks")
	{
		playbooks.GET("/", handlers.GetPlaybooks)
		playbooks.GET("/:id", handlers.GetPlaybook)
		playbooks.POST("/", handlers.CreatePlaybook)
		playbooks.PUT("/:id", handlers.UpdatePlaybook)
	}
}
