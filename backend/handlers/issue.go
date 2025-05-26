package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/db"
	"github.com/krapie/tracker/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetIssues(c *gin.Context) {
	collection := db.GetIssuesCollection()
	cursor, err := collection.Find(context.Background(), bson.M{}, options.Find())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var issues []models.Issue
	if err := cursor.All(context.Background(), &issues); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if issues == nil {
		issues = []models.Issue{}
	}
	c.JSON(http.StatusOK, issues)
}

func GetIssue(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid issue ID"})
		return
	}

	var issue models.Issue
	collection := db.GetIssuesCollection()
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&issue)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Issue not found"})
		return
	}
	c.JSON(http.StatusOK, issue)
}

func CreateIssue(c *gin.Context) {
	var issue models.Issue
	if err := c.ShouldBindJSON(&issue); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	issue.CreatedAt = time.Now().UnixMilli()
	issue.Status = 1 // 1 = Ongoing
	collection := db.GetIssuesCollection()
	_, err := collection.InsertOne(context.Background(), issue)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, issue)
}

func UpdateIssue(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid issue ID"})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Only allow updating fields that exist in the Issue model
	allowedFields := map[string]bool{
		"name":   true,
		"status": true,
	}

	updateFields := bson.M{}
	for k, v := range updateData {
		if allowedFields[k] {
			updateFields[k] = v
		}
	}

	if len(updateFields) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No valid fields to update"})
		return
	}

	update := bson.M{"$set": updateFields}

	collection := db.GetIssuesCollection()
	res, err := collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objID},
		update,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Issue not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Issue updated"})
}
