package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Result struct {
	ID             primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID         string             `json:"userId" bson:"userId"`
	Score          int                `json:"score" bson:"score"`
	TotalQuestions int                `json:"totalQuestions" bson:"totalQuestions"`
	CorrectAnswers int                `json:"correctAnswers" bson:"correctAnswers"`
	WrongAnswers   int                `json:"wrongAnswers" bson:"wrongAnswers"`
	Percentage     float64            `json:"percentage" bson:"percentage"`
	CreatedAt      int64              `json:"createdAt" bson:"createdAt"`
}
