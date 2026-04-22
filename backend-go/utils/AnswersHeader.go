package utils

type formResponse struct {
	Name   string
	Email  string
	Level  string
	Letter string
}

var FormResponse = formResponse{
	Name:   "Name",
	Email:  "Email",
	Level:  "Dans quelle unité es-tu ?",
	Letter: "Dans quelle classe es-tu ?",
}
