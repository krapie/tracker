package db

import (
	"context"
	"log"
	"os"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	clientInstance    *mongo.Client
	clientInstanceErr error
	mongoOnce         sync.Once
)

const (
	defaultDBName     = "tracker"
	issuesCollName    = "issues"
	playbooksCollName = "playbooks"
	healthCollName    = "health_endpoints"
)

func getMongoClient() (*mongo.Client, error) {
	mongoOnce.Do(func() {
		uri := os.Getenv("MONGO_URI")
		if uri == "" {
			uri = "mongodb://localhost:27017"
		}
		clientOptions := options.Client().ApplyURI(uri)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		client, err := mongo.Connect(ctx, clientOptions)
		if err != nil {
			clientInstanceErr = err
			return
		}
		if err := client.Ping(ctx, nil); err != nil {
			clientInstanceErr = err
			return
		}
		clientInstance = client
	})
	return clientInstance, clientInstanceErr
}

func GetIssuesCollection() *mongo.Collection {
	client, err := getMongoClient()
	if err != nil {
		log.Fatalf("Could not connect to MongoDB: %v", err)
	}
	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = defaultDBName
	}
	db := client.Database(dbName)
	return db.Collection(issuesCollName)
}

func GetPlaybooksCollection() *mongo.Collection {
	client, err := getMongoClient()
	if err != nil {
		log.Fatalf("Could not connect to MongoDB: %v", err)
	}
	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = defaultDBName
	}
	db := client.Database(dbName)
	return db.Collection(playbooksCollName)
}

func GetHealthCollection() *mongo.Collection {
	client, err := getMongoClient()
	if err != nil {
		log.Fatalf("Could not connect to MongoDB: %v", err)
	}
	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = defaultDBName
	}
	db := client.Database(dbName)
	return db.Collection(healthCollName)
}
