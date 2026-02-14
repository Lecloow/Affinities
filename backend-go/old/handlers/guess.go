package handlers

import (
	"backend/old/db"
	utils2 "backend/old/utils"
	"context"
	"time"

	"github.com/gin-gonic/gin"
)

func GuessHandler(c *gin.Context) {
	var req utils2.GuessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	currentUser := c.MustGet("user_id").(string)

	if currentUser != req.UserID {
		c.JSON(403, gin.H{"error": "Unauthorized"})
		return
	}

	var revealTime time.Time
	var matchID string
	var h1, h2, h3 bool

	err := db.DB.QueryRow(context.Background(),
		`SELECT reveal_time, match_id, hint1_revealed, hint2_revealed, hint3_revealed
		 FROM hints WHERE user_id=$1 AND day=$2`,
		req.UserID, req.Day,
	).Scan(&revealTime, &matchID, &h1, &h2, &h3)

	if err != nil {
		c.JSON(404, gin.H{"error": "Hints not found"})
		return
	}

	isCorrect := req.GuessedUserID == matchID

	points := 0
	if isCorrect {
		revealed := 0
		if h1 {
			revealed++
		}
		if h2 {
			revealed++
		}
		if h3 {
			revealed++
		}

		points = utils2.CalculatePoints(revealed)
	}

	if isCorrect {
		_, err = db.DB.Exec(context.Background(),
			`INSERT INTO scores(user_id,total_points)
			 VALUES($1,$2)
			 ON CONFLICT(user_id)
			 DO UPDATE SET total_points=scores.total_points+$2`,
			req.UserID, points,
		)
	}

	_, err = db.DB.Exec(context.Background(),
		`INSERT INTO guesses(user_id,day,hint_number,guessed_user_id,hints_revealed,points_earned,is_correct)
		 VALUES($1,$2,$3,$4,$5,$6,$7)`,
		req.UserID, req.Day, req.HintNumber,
		req.GuessedUserID, 1, points, isCorrect,
	)

	c.JSON(200, gin.H{
		"is_correct":    isCorrect,
		"points_earned": points,
	})
}
