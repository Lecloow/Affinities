package handlers

import (
	"backend/models"
	"sort"

	"github.com/gin-gonic/gin"
)

func (h *UserHandler) CreatMatches(c *gin.Context) {
	ctx := c.Request.Context()
}

//TODO:

type ScoredPair struct {
	I, J  int
	Score int
}

func greedyMatch(users []UserWithAnswers, exclude map[[2]int]bool) map[int]int {
	n := len(users)

	var pairs []ScoredPair
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			if exclude[[2]int{i, j}] {
				continue
			}
			pairs = append(pairs, ScoredPair{
				I:     i,
				J:     j,
				Score: compatibilityScore(users[i].Answers, users[j].Answers),
			})
		}
	}

	sort.Slice(pairs, func(a, b int) bool {
		return pairs[a].Score > pairs[b].Score
	})

	matches := map[int]int{}
	used := map[int]bool{}

	for _, pair := range pairs {
		if !used[pair.I] && !used[pair.J] {
			matches[pair.I] = pair.J
			matches[pair.J] = pair.I
			used[pair.I] = true
			used[pair.J] = true
		}
	}

	return matches
}

type UserWithAnswers struct {
	ID        models.UserID
	FirstName string
	LastName  string
	Level     string
	Answers   map[string]int
}

type Match struct {
	UserID models.UserID
	Day1   *models.UserID
	Day2   *models.UserID
}

func compatibilityScore(a, b map[string]int) int {
	score := 0
	for q, valA := range a {
		if valB, ok := b[q]; ok && valA == valB {
			score++
		}
	}
	return score
}
