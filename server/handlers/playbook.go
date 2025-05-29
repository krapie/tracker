package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/db"
	"github.com/krapie/tracker/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetPlaybooks(c *gin.Context) {
	collection := db.GetPlaybooksCollection()
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var playbooks []models.Playbook
	if err := cursor.All(context.Background(), &playbooks); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if playbooks == nil {
		playbooks = []models.Playbook{}
	}
	c.JSON(http.StatusOK, playbooks)
}

func GetPlaybook(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid playbook ID"})
		return
	}
	var playbook models.Playbook
	collection := db.GetPlaybooksCollection()
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&playbook)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Playbook not found"})
		return
	}
	c.JSON(http.StatusOK, playbook)
}

func CreatePlaybook(c *gin.Context) {
	var playbook models.Playbook
	if err := c.ShouldBindJSON(&playbook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	collection := db.GetPlaybooksCollection()
	result, err := collection.InsertOne(context.Background(), playbook)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Set the inserted ID to the playbook's ID field
	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		playbook.ID = oid
	}
	c.JSON(http.StatusOK, playbook)
}

func UpdatePlaybook(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid playbook ID"})
		return
	}
	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	allowedFields := map[string]bool{
		"name":  true,
		"steps": true,
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
	collection := db.GetPlaybooksCollection()
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Playbook not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Playbook updated"})
}
