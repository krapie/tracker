package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type PlaybookStep struct {
	Content string `json:"content" bson:"content"`
}

type Playbook struct {
	ID    primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name  string             `json:"name" bson:"name"`
	Steps []PlaybookStep     `json:"steps" bson:"steps"`
}
