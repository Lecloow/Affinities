package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"backend/services"

	"github.com/gin-gonic/gin"
)

// This is a lightweight handler-level test that doesn't require a real DB.
// It verifies input validation behavior for the /login endpoint.
func TestLogin_Returns400WhenPasswordMissing(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	userService := &services.UserService{} // DB is nil: ok because we won't reach it in this test
	h := &UserHandler{Service: userService}

	router.POST("/login", h.Login)

	req := httptest.NewRequest(http.MethodPost, "/login", strings.NewReader(`{}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d. body=%s", http.StatusBadRequest, w.Code, w.Body.String())
	}

	body := w.Body.String()
	if !strings.Contains(body, "Password required") {
		t.Fatalf("expected error message to contain 'Password required', got body=%s", body)
	}
}
