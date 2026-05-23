package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var QuestionCollection *mongo.Collection
var UserCollection *mongo.Collection
var ResultCollection *mongo.Collection

func Connect() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB")

	Client = client
	QuestionCollection = client.Database("quickquiz").Collection("questions")
	UserCollection = client.Database("quickquiz").Collection("users")
	ResultCollection = client.Database("quickquiz").Collection("results")
}
