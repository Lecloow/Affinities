package utils

import (
	"testing"
	"time"
	"backend/models"
)

func TestGenerateSecureToken(t *testing.T) {
	token := GenerateSecureToken()
	if len(token) == 0 {
		t.Error("GenerateSecureToken returned an empty string")
	}
}

func TestGetCurrentDay(t *testing.T) {
	// This test assumes the event started today
	day := GetCurrentDay()
	if day != 1 {
		t.Errorf("Expected day 1, got %d", day)
	}
}

func TestGetRevealTime(t *testing.T) {
	revealTime := time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC)
	day := 2

	expected := time.Date(2023, 1, 2, 12, 0, 0, 0, time.UTC)
	result := GetRevealTime(revealTime, day)

	if !result.Equal(expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

func TestRandomHintType(t *testing.T) {
	// Test with different hint numbers
	for i := 1; i <= 5; i++ {
		hintType := RandomHintType(i)
		if hintType == "" {
			t.Errorf("RandomHintType returned empty string for hint number %d", i)
		}
	}
}

func TestGenerateHintContent(t *testing.T) {
	user := models.User{
		FirstName: "John",
		LastName:  "Doe",
		Class:     "A",
	}

	tests := []struct {
		hintType string
		expected string
	}{
		{"letterInFirstName", "1"}, // "John" has 1 vowel
		{"letterInLastName", "1"}, // "Doe" has 1 vowel
		{"numberOfVowel", "1"},    // "Doe" has 1 vowel
		{"firstLetterOfFirstName", "J"},
		{"firstLetterOfLastName", "D"},
		{"class", "A"},
		{"firstName", "John"},
		{"invalid", ""},
	}

	for _, test := range tests {
		result := GenerateHintContent(user, test.hintType)
		if result != test.expected {
			t.Errorf("GenerateHintContent(%s) = %s; expected %s", test.hintType, result, test.expected)
		}
	}
}

func TestGenerateRevealCode(t *testing.T) {
	code, err := GenerateRevealCode()
	if err != nil {
		t.Errorf("GenerateRevealCode returned error: %v", err)
	}
	if len(code) != 6 {
		t.Errorf("Expected code length 6, got %d", len(code))
	}
}

func TestGeneratePassword(t *testing.T) {
	password, err := GeneratePassword(8)
	if err != nil {
		t.Errorf("GeneratePassword returned error: %v", err)
	}
	if len(password) != 8 {
		t.Errorf("Expected password length 8, got %d", len(password))
	}
}

func TestMatchScore(t *testing.T) {
	a := []int16{1, 2, 3, 4, 5}
	b := []int16{1, 2, 3, 4, 5}
	c := []int16{5, 4, 3, 2, 1}

	// Test identical arrays
	score := MatchScore(a, b)
	if score != 1.0 {
		t.Errorf("Expected score 1.0, got %f", score)
	}

	// Test completely different arrays
	score = MatchScore(a, c)
	if score != 0.0 {
		t.Errorf("Expected score 0.0, got %f", score)
	}

	// Test arrays of different lengths
	score = MatchScore(a, []int16{1, 2, 3})
	if score != 0.0 {
		t.Errorf("Expected score 0.0, got %f", score)
	}
}

func TestIsUniqueViolation(t *testing.T) {
	// This is a simplified test - in a real scenario you'd need to mock the pgconn.PgError
	// For now, we'll just test that it doesn't panic
	err := IsUniqueViolation(nil)
	if err {
		t.Error("Expected false for nil error")
	}
}

func TestHashPassword(t *testing.T) {
	password := "testpassword"
	hash, err := HashPassword(password)
	if err != nil {
		t.Errorf("HashPassword returned error: %v", err)
	}
	if len(hash) == 0 {
		t.Error("HashPassword returned empty string")
	}
}
