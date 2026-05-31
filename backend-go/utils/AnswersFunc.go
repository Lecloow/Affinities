package utils

import (
	"strconv"
	"strings"
	"unicode"
)

func GetAnswerValue(rawQuestion, rawAnswer string) (int, bool) {
	cfg, ok := GetQuestion(rawQuestion)
	if !ok {
		return 0, false
	}
	val, ok := cfg.Answers[Normalize(rawAnswer)]
	return val, ok
}

func Normalize(s string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return ' '
		}
		return r
	}, strings.TrimSpace(s))
}

func GetQuestion(raw string) (QuestionConfig, bool) {
	q, ok := Questions[Normalize(raw)]
	return q, ok
}

func SplitName(full string) (firstName, lastName string) {
	parts := strings.Fields(full)
	for _, p := range parts {
		if p == strings.ToUpper(p) {
			lastName = p
		} else {
			firstName += p + " "
		}
	}
	firstName = strings.TrimSpace(firstName)
	return
}

func QuestionIndex(col string) int {
	n, err := strconv.Atoi(strings.TrimPrefix(col, "q"))
	if err != nil {
		return 0
	}
	return n
}
