package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"go-auth-app/database"
	"go-auth-app/handlers"
	"go-auth-app/models"
	"net/http"
	"net/http/httptest"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// SetupMockDB initializes a mock database for testing
func SetupMockDB() {
	mockDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to mock database")
	}
	fmt.Println("Mock db successfully created")
	// Migrate the schema for required models
	mockDB.AutoMigrate(
		&models.User{},
		&models.Group{},
		&models.GroupUser{},
		&models.Thread{},
		&models.Expense{},
		&models.ExpenseParticipant{},
	)
	// Assign the mock DB to the global database instance
	database.DB = mockDB
}

// TestCreateGroup checks if a group can be created successfully
func TestCreateGroup(t *testing.T) {
	SetupMockDB()

	// Create test request payload
	payload := `{"name": "Test Group", "user_ids": [1, 2, 3]}`
	req, _ := http.NewRequest("POST", "/groups", bytes.NewBuffer([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")

	resp := httptest.NewRecorder()
	handlers.CreateGroup(resp, req)

	if resp.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", resp.Code)
	}
}

// TestGetUserGroups checks if user's groups are retrieved correctly
func TestGetUserGroups(t *testing.T) {
	SetupMockDB()

	// Insert mock data
	database.DB.Create(&models.Group{Name: "Test Group"})
	database.DB.Create(&models.GroupUser{GroupID: 1, UserID: 1})

	req, _ := http.NewRequest("GET", "/users/groups", nil)
	req = MockUserContext(1, req) // ✅ Corrected

	resp := httptest.NewRecorder()
	handlers.GetUserGroups(resp, req)

	if resp.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", resp.Code)
	}

	var response []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&response)

	if len(response) == 0 {
		t.Errorf("Expected at least one group in response, got %v", response)
	}
}

// TestDeleteGroup checks if a group can be deleted
// TestDeleteGroup checks if a group can be deleted
func TestDeleteGroup(t *testing.T) {
	SetupMockDB()

	// Insert mock group
	group := models.Group{Name: "Test Group"}
	database.DB.Create(&group)

	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/groups/%d", group.ID), nil) // ✅ Pass correct group ID
	resp := httptest.NewRecorder()
	handlers.DeleteGroup(resp, req)

	if resp.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", resp.Code)
	}
}

// MockUserContext creates a mock user context for authentication
func MockUserContext(userID uint, req *http.Request) *http.Request {
	ctx := context.WithValue(req.Context(), "user_id", userID)
	return req.WithContext(ctx)
}
