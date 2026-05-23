package routes

import (
	"context"
	"time"

	"quiz-backend/database"
	"quiz-backend/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetProgress(c *fiber.Ctx) error {
	userId := c.Locals("userId").(string)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var progress models.Progress
	err := database.ProgressCollection.FindOne(ctx, bson.M{"userId": userId}).Decode(&progress)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No progress found"})
	}

	return c.JSON(progress)
}

func SaveProgress(c *fiber.Ctx) error {
	userId := c.Locals("userId").(string)

	var input struct {
		QuestionNumber int `json:"questionNumber"`
		Score          int `json:"score"`
		CorrectCount   int `json:"correctCount"`
		WrongCount     int `json:"wrongCount"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"userId": userId}
	update := bson.M{"$set": bson.M{
		"userId":         userId,
		"questionNumber": input.QuestionNumber,
		"score":          input.Score,
		"correctCount":   input.CorrectCount,
		"wrongCount":     input.WrongCount,
	}}

	_, err := database.ProgressCollection.UpdateOne(ctx, filter, update, options.Update().SetUpsert(true))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save progress"})
	}

	return c.JSON(fiber.Map{"message": "Progress saved"})
}

func DeleteProgress(c *fiber.Ctx) error {
	userId := c.Locals("userId").(string)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := database.ProgressCollection.DeleteOne(ctx, bson.M{"userId": userId})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete progress"})
	}

	return c.JSON(fiber.Map{"message": "Progress deleted"})
}
