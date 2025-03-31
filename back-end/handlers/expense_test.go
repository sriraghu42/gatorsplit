package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"go-auth-app/database"
	"go-auth-app/handlers"
	"go-auth-app/models"

	"github.com/gorilla/mux"
)

func TestDeleteExpense(t *testing.T) {
	database.SetupMockDB()

	// Create an expense record.
	expense := models.Expense{
		Title:  "Test Expense",
		Amount: 50,
		PaidBy: 1,
	}
	if err := database.DB.Create(&expense).Error; err != nil {
		t.Fatalf("Failed to create expense: %v", err)
	}

	// Create an associated expense participant.
	expParticipant := models.ExpenseParticipant{
		ExpenseID:  expense.ID,
		UserID:     1,
		AmountOwed: 25,
	}
	database.DB.Create(&expParticipant)

	// Prepare DELETE request for the expense.
	req, _ := http.NewRequest("DELETE", "/expenses/"+strconv.Itoa(int(expense.ID)), nil)
	req = mux.SetURLVars(req, map[string]string{"expense_id": strconv.Itoa(int(expense.ID))})
	rr := httptest.NewRecorder()
	handlers.DeleteExpense(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", rr.Code)
	}

	var resp map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "Expense deleted successfully" {
		t.Errorf("Unexpected response message: %v", resp)
	}

	// Verify that the expense is deleted.
	var exp models.Expense
	if err := database.DB.First(&exp, expense.ID).Error; err == nil {
		t.Errorf("Expense was not deleted")
	}
	// Verify that expense participants are deleted.
	var count int64
	database.DB.Model(&models.ExpenseParticipant{}).Where("expense_id = ?", expense.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expense participants were not deleted, count: %d", count)
	}
}
