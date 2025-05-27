package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/storage"
)

var storageBackend storage.Storage

func InitStorageBackend(s storage.Storage) {
	storageBackend = s
}

func UploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	contentType := header.Header.Get("Content-Type")
	size := header.Size

	url, err := storageBackend.Upload(c.Request.Context(), header.Filename, file, size, contentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}
