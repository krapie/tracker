package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Report struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title       string            `json:"title" bson:"title"`
	Content     string            `json:"content" bson:"content"`
	CreatedBy   string            `json:"createdBy" bson:"createdBy"`
	CreatedAt   time.Time         `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt" bson:"updatedAt"`
}