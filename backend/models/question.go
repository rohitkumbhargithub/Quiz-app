package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Answer struct {
	Text    string `json:"text" bson:"text"`
	Correct bool   `json:"correct" bson:"correct"`
}

type Question struct {
	ID       primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Question string             `json:"question" bson:"question"`
	Answers  []Answer           `json:"answers" bson:"answers"`
	Position int                `json:"position" bson:"position"`
}
