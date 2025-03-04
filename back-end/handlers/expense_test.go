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
)

// ✅ Setup mock database before running tests
func TestMain(m *testing.M) {
	database.SetupMockDB() // Ensures all tests use SQLite mock DB
	m.Run()
}

// ✅ Test CreateExpense (POST /expenses)
func TestCreateExpense(t *testing.T) {
	database.SetupMockDB() // Ensure clean state before each test

	// Insert test data (group and users)
	group := models.Group{Name: "Trip Friends"}
	database.DB.Create(&group)

	user1 := models.User{Username: "Alice", Email: "alice@example.com"}
	user2 := models.User{Username: "Bob", Email: "bob@example.com"}
	database.DB.Create(&user1)
	database.DB.Create(&user2)

	// Test request payload
	reqBody := map[string]interface{}{
		"title":      "Dinner Bill",
		"amount":     100.0,
		"paid_by":    user1.ID,
		"group_id":   group.ID,
		"split_with": []uint{user1.ID, user2.ID},
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/expenses", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	resp := httptest.NewRecorder()
	handlers.CreateExpense(resp, req)

	if resp.Code != http.StatusCreated {
		t.Errorf("Expected 201 Created, got %d", resp.Code)
	}

	// ✅ Compare JSON response properly
	var actualResponse map[string]string
	json.Unmarshal(resp.Body.Bytes(), &actualResponse)

	expectedResponse := map[string]string{"message": "Expense added successfully"}

	if actualResponse["message"] != expectedResponse["message"] {
		t.Errorf("Expected response %v, got %v", expectedResponse, actualResponse)
	}
}

// ✅ Test CreatePersonalExpense (POST /personal-expense)
func TestCreatePersonalExpense(t *testing.T) {
	database.SetupMockDB()

	// Insert test users
	user1 := models.User{Username: "Charlie", Email: "charlie@example.com"}
	user2 := models.User{Username: "David", Email: "david@example.com"}
	database.DB.Create(&user1)
	database.DB.Create(&user2)

	reqBody := map[string]interface{}{
		"title":      "Movie Tickets",
		"amount":     50.0,
		"paid_by":    user1.ID,
		"split_with": []uint{user1.ID, user2.ID},
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/personal-expense", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	resp := httptest.NewRecorder()
	handlers.CreatePersonalExpense(resp, req)

	if resp.Code != http.StatusCreated {
		t.Errorf("Expected 201 Created, got %d", resp.Code)
	}

	// ✅ Compare JSON response properly
	var actualResponse map[string]string
	json.Unmarshal(resp.Body.Bytes(), &actualResponse)

	expectedResponse := map[string]string{"message": "Personal expense added successfully"}

	if actualResponse["message"] != expectedResponse["message"] {
		t.Errorf("Expected response %v, got %v", expectedResponse, actualResponse)
	}
}
