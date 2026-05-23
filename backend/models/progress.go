package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Progress struct {
	ID             primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID         string             `json:"userId" bson:"userId"`
	QuestionNumber int                `json:"questionNumber" bson:"questionNumber"`
	Score          int                `json:"score" bson:"score"`
	CorrectCount   int                `json:"correctCount" bson:"correctCount"`
	WrongCount     int                `json:"wrongCount" bson:"wrongCount"`
}
