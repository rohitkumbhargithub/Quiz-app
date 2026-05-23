package routes

import (
	"context"
	"time"

	"quiz-backend/database"
	"quiz-backend/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/questions", GetQuestions)
	api.Get("/questions/:id", GetQuestion)
}

func GetQuestions(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var questions []models.Question
	opts := options.Find().SetSort(bson.M{"position": 1})
	cursor, err := database.QuestionCollection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &questions); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	if questions == nil {
		questions = []models.Question{}
	}

	return c.JSON(questions)
}

func GetQuestion(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var question models.Question
	err = database.QuestionCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&question)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Question not found"})
	}

	return c.JSON(question)
}

func CreateQuestion(c *fiber.Ctx) error {
	var question models.Question
	if err := c.BodyParser(&question); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if question.Question == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Question text is required"})
	}
	if len(question.Answers) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "At least one answer is required"})
	}

	question.ID = primitive.NewObjectID()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var lastQuestion models.Question
	opts := options.FindOne().SetSort(bson.M{"position": -1})
	err := database.QuestionCollection.FindOne(ctx, bson.M{}, opts).Decode(&lastQuestion)
	if err == nil {
		question.Position = lastQuestion.Position + 1
	} else {
		question.Position = 0
	}

	_, err = database.QuestionCollection.InsertOne(ctx, question)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(question)
}

func UpdateQuestion(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var question models.Question
	if err := c.BodyParser(&question); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	update := bson.M{
		"question": question.Question,
		"answers":  question.Answers,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := database.QuestionCollection.UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": update},
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	if result.MatchedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Question not found"})
	}

	return c.JSON(fiber.Map{"message": "Question updated successfully"})
}

func ReorderQuestions(c *fiber.Ctx) error {
	var items []struct {
		ID       string `json:"id"`
		Position int    `json:"position"`
	}
	if err := c.BodyParser(&items); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	for _, item := range items {
		objID, err := primitive.ObjectIDFromHex(item.ID)
		if err != nil {
			continue
		}
		database.QuestionCollection.UpdateOne(
			ctx,
			bson.M{"_id": objID},
			bson.M{"$set": bson.M{"position": item.Position}},
		)
	}

	return c.JSON(fiber.Map{"message": "Order updated"})
}

func DeleteQuestion(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := database.QuestionCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	if result.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Question not found"})
	}

	return c.JSON(fiber.Map{"message": "Question deleted successfully"})
}
