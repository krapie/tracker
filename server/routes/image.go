package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/handlers"
)

func RegisterImageRoutes(r *gin.Engine) {
	r.POST("/api/images/upload", handlers.UploadImage)
}
