package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var QuestionCollection *mongo.Collection
var UserCollection *mongo.Collection
var ResultCollection *mongo.Collection

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func Connect() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	uri := getEnv("MONGODB_URI", "mongodb://localhost:27017")
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB")

	dbName := getEnv("DB_NAME", "quickquiz")
	Client = client
	QuestionCollection = client.Database(dbName).Collection("questions")
	UserCollection = client.Database(dbName).Collection("users")
	ResultCollection = client.Database(dbName).Collection("results")
}
