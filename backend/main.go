package main

import (
	"log"

	"quiz-backend/database"
	"quiz-backend/middleware"
	"quiz-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	database.Connect()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Content-Type,Authorization",
	}))

	routes.SetupAuthRoutes(app)
	routes.SetupRoutes(app)

	userApi := app.Group("/api", middleware.AuthRequired)
	userApi.Post("/results", routes.SubmitResult)
	userApi.Get("/results/mine", routes.GetMyResults)
	userApi.Get("/results/stats", routes.GetDashboardStats)

	adminApi := app.Group("/api/admin", middleware.AuthRequired, middleware.AdminRequired)
	adminApi.Get("/questions", routes.GetQuestions)
	adminApi.Post("/questions", routes.CreateQuestion)
	adminApi.Put("/questions/reorder", routes.ReorderQuestions)
	adminApi.Put("/questions/:id", routes.UpdateQuestion)
	adminApi.Delete("/questions/:id", routes.DeleteQuestion)

	log.Fatal(app.Listen(":5000"))
}
