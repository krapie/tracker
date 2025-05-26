package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Issue struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name"`
	CreatedAt int64              `json:"createdAt" bson:"createdAt"`
	Status    int                `json:"status" bson:"status"`
}
