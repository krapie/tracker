package handlers

import (
	"context"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/krapie/tracker/db"
	"github.com/krapie/tracker/health"
	"github.com/krapie/tracker/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterHealthEndpoint(c *gin.Context) {
	var endpoint models.HealthEndpoint
	if err := c.ShouldBindJSON(&endpoint); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	endpoint.Status = -1 // unknown
	if endpoint.Threshold <= 0 {
		endpoint.Threshold = 3 // default threshold
	}
	if endpoint.Interval <= 0 {
		endpoint.Interval = 30 // default interval
	}
	endpoint.FailCount = 0
	collection := db.GetHealthCollection()
	res, err := collection.InsertOne(context.Background(), endpoint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		endpoint.ID = oid
		health.StartHealthChecker(oid.Hex(), endpoint.URL, endpoint.Threshold, endpoint.Interval)
	}
	c.JSON(http.StatusOK, endpoint)
}

func ListHealthStatuses(c *gin.Context) {
	collection := db.GetHealthCollection()
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var endpoints []models.HealthEndpoint
	if err := cursor.All(context.Background(), &endpoints); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, endpoints)
}

func UpdateHealthEndpoint(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid endpoint ID"})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Only allow updating name, url, threshold, interval
	allowed := map[string]bool{"name": true, "url": true, "threshold": true, "interval": true}
	updateFields := bson.M{}
	for k, v := range updateData {
		if allowed[k] {
			updateFields[k] = v
		}
	}
	if len(updateFields) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No valid fields to update"})
		return
	}

	collection := db.GetHealthCollection()
	_, err = collection.UpdateByID(
		context.Background(),
		objID,
		bson.M{"$set": updateFields},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Fetch the updated endpoint from DB to get latest values for restart
	var updated models.HealthEndpoint
	if err := collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updated); err == nil {
		log.Printf("[HealthCheck] Restarting checker for endpoint %s (url=%s, threshold=%d, interval=%d)", id, updated.URL, updated.Threshold, updated.Interval)
		health.RestartHealthChecker(id, updated.URL, updated.Threshold, updated.Interval)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Health endpoint updated"})
}
