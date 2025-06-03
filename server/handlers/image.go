package handlers

import (
	"net/http"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/storage"
)

var storageBackend storage.Storage

func InitStorageBackend(s storage.Storage) {
	storageBackend = s
}

// sanitizeFilename removes or replaces invalid characters for URI paths
func sanitizeFilename(filename string) string {
	// Get file extension
	ext := filepath.Ext(filename)
	name := strings.TrimSuffix(filename, ext)

	// Replace spaces with hyphens
	name = strings.ReplaceAll(name, " ", "-")

	// Remove or replace invalid URI characters, keeping only alphanumeric, hyphens, underscores
	reg := regexp.MustCompile(`[^a-zA-Z0-9\-_.]`)
	name = reg.ReplaceAllString(name, "")

	// Remove multiple consecutive hyphens
	reg = regexp.MustCompile(`-+`)
	name = reg.ReplaceAllString(name, "-")

	// Remove leading/trailing hyphens
	name = strings.Trim(name, "-")

	// If name is empty after sanitization, use a default
	if name == "" {
		name = "image"
	}

	return name + ext
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

	// Sanitize filename for valid URI path
	filename := sanitizeFilename(header.Filename)

	// Set image name to issue + timestamp + sanitized filename
	imageName := "issue-" + time.Now().Format("20060102-150405") + "-" + filename

	url, err := storageBackend.Upload(c.Request.Context(), imageName, file, size, contentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}
