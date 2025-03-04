package handlers_test

import (
	"bytes"
	"encoding/json"
	"go-auth-app/database"
	"go-auth-app/handlers"
	"go-auth-app/models"
	"net/http"
	"net/http/httptest"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestRegister(t *testing.T) {
	database.SetupMockDB() // Use mock DB

	reqBody := map[string]string{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "password123",
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	handlers.Register(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected 201 Created, got %d", rr.Code)
	}
}

func TestLogin(t *testing.T) {
	database.SetupMockDB()

	// Create a test user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := models.User{
		Username: "testuser",
		Email:    "test@example.com",
		Password: string(hashedPassword),
	}
	database.DB.Create(&user)

	reqBody := map[string]string{
		"username": "testuser",
		"password": "password123",
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	handlers.Login(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rr.Code)
	}
}
