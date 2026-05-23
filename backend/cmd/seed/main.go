package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"quiz-backend/database"
	"quiz-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	database.Connect()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existing models.User
	err := database.UserCollection.FindOne(ctx, bson.M{"email": "admin@quiz.com"}).Decode(&existing)
	if err == nil {
		fmt.Println("Admin already exists")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	admin := models.User{
		ID:       primitive.NewObjectID(),
		Name:     "Admin",
		Email:    "admin@quiz.com",
		Password: string(hashedPassword),
		Role:     "admin",
	}

	_, err = database.UserCollection.InsertOne(ctx, admin)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Admin created: admin@quiz.com / admin123")
}
