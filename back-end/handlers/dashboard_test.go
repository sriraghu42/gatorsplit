package handlers_test

import (
	"encoding/json"
	"go-auth-app/database"
	"go-auth-app/handlers"
	"go-auth-app/models"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
)

func TestGetDashboardBalances(t *testing.T) {
	database.SetupMockDB()

	// Create test users
	user1 := models.User{Username: "User1", Email: "user1@example.com"}
	user2 := models.User{Username: "User2", Email: "user2@example.com"}
	database.DB.Create(&user1)
	database.DB.Create(&user2)

	// Create test expense
	expense := models.Expense{
		Title:  "Test Expense",
		Amount: 100,
		PaidBy: user1.ID,
	}
	database.DB.Create(&expense)

	// Create expense participants
	expenseParticipants := []models.ExpenseParticipant{
		{ExpenseID: expense.ID, UserID: user1.ID, AmountOwed: 50},
		{ExpenseID: expense.ID, UserID: user2.ID, AmountOwed: 50},
	}
	database.DB.Create(&expenseParticipants)

	req, _ := http.NewRequest("GET", "/api/dashboard/balances/{user_id}", nil)
	req = mux.SetURLVars(req, map[string]string{"user_id": "1"})

	rr := httptest.NewRecorder()
	handlers.GetDashboardBalances(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rr.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(rr.Body.Bytes(), &response)

	if _, exists := response["total_owed"]; !exists {
		t.Errorf("Expected total_owed field in response")
	}
}
