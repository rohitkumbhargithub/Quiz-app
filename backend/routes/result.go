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

func SubmitResult(c *fiber.Ctx) error {
	userId := c.Locals("userId").(string)

	var input struct {
		Score          int   `json:"score"`
		TotalQuestions int   `json:"totalQuestions"`
		CorrectAnswers int   `json:"correctAnswers"`
		WrongAnswers   int   `json:"wrongAnswers"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var percentage float64
	if input.TotalQuestions > 0 {
		percentage = float64(input.CorrectAnswers) / float64(input.TotalQuestions) * 100
	}

	result := models.Result{
		ID:             primitive.NewObjectID(),
		UserID:         userId,
		Score:          input.Score,
		TotalQuestions: input.TotalQuestions,
		CorrectAnswers: input.CorrectAnswers,
		WrongAnswers:   input.WrongAnswers,
		Percentage:     percentage,
		CreatedAt:      time.Now().UnixMilli(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := database.ResultCollection.InsertOne(ctx, result)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save result"})
	}

	return c.Status(201).JSON(result)
}

func GetMyResults(c *fiber.Ctx) error {
	userId := c.Locals("userId").(string)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.M{"createdAt": -1}).SetLimit(20)
	cursor, err := database.ResultCollection.Find(ctx, bson.M{"userId": userId}, opts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	var results []models.Result
	if err = cursor.All(ctx, &results); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	if results == nil {
		results = []models.Result{}
	}

	return c.JSON(results)
}

func GetDashboardStats(c *fiber.Ctx) error {
	userId := c.Locals("userId").(string)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	totalQuestions, _ := database.QuestionCollection.CountDocuments(ctx, bson.M{})

	totalResults, _ := database.ResultCollection.CountDocuments(ctx, bson.M{"userId": userId})

	var stats struct {
		TotalQuestions int64   `json:"totalQuestions"`
		Completed      int64   `json:"completed"`
		Upcoming       int64   `json:"upcoming"`
		AverageScore   float64 `json:"averageScore"`
		BestScore      float64 `json:"bestScore"`
	}

	stats.TotalQuestions = totalQuestions
	stats.Completed = totalResults
	stats.Upcoming = totalQuestions - totalResults
	if stats.Upcoming < 0 {
		stats.Upcoming = 0
	}

	pipeline := bson.A{
		bson.M{"$match": bson.M{"userId": userId}},
		bson.M{"$group": bson.M{
			"_id":      nil,
			"avgScore": bson.M{"$avg": "$percentage"},
			"maxScore": bson.M{"$max": "$percentage"},
		}},
	}

	cursor, err := database.ResultCollection.Aggregate(ctx, pipeline)
	if err == nil {
		var aggResults []bson.M
		if err = cursor.All(ctx, &aggResults); err == nil && len(aggResults) > 0 {
			if avg, ok := aggResults[0]["avgScore"]; ok {
				stats.AverageScore = avg.(float64)
			}
			if max, ok := aggResults[0]["maxScore"]; ok {
				stats.BestScore = max.(float64)
			}
		}
	}

	return c.JSON(stats)
}
