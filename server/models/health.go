package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type HealthEndpoint struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	URL       string             `bson:"url" json:"url"`
	Status    int                `bson:"status" json:"status"`       // 1 = up, 0 = down, -1 = unknown
	Threshold int                `bson:"threshold" json:"threshold"` // Number of failures before DOWN
	FailCount int                `bson:"failCount" json:"failCount"` // Internal: consecutive failures
	Interval  int                `bson:"interval" json:"interval"`   // Health check interval in seconds
	Reason    string             `bson:"reason,omitempty" json:"reason,omitempty"`
}
