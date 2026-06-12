package utils

import (
	"time"
)

func CalculatePoints(hints int) int {
	switch hints {
	case 1:
		return 100
	case 2:
		return 75
	case 3:
		return 50
	default:
		return 0
	}
}

const EventDuration = 2 // The numbers of day

var eventStartDate, _ = time.Parse("2006-01-02", "2026-05-28") // 2006-01-02 is just the format (YYYY-MM_DD)
// Be sure that you put the time in the correct format, otherwise it will crash (I guess ...)

// For every reveal time, do not care about the year, month and day
// The important part is the hour, minutes , and seconds
// The format is time.Date(year, month, day, hour, minute, second, nanosecond, location)
// Be sure to keep it in UTC, because the server will probably be in UTC, just check it before (It's not cool to discover it the day of the event, I swear)
var MatchRevealTime = time.Date(2000, 1, 1, 14, 0, 0, 0, time.UTC)

