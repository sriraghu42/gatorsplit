package handlers_test

import (
	"bytes"
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

func TestSettleGroupExpense(t *testing.T) {
	// Initialize mock database
	database.SetupMockDB()

	// Create a group to associate the expense with
	group := models.Group{
		Name: "Test Group",
	}
	if err := database.DB.Create(&group).Error; err != nil {
		t.Fatalf("Failed to create group: %v", err)
	}

	// Prepare the request payload
	reqBody := map[string]interface{}{
		"title":        "Dinner Split",
		"amount":       120.50,
		"paid_by":      2,
		"settled_with": 3,
		"group_id":     group.ID,
	}
	bodyBytes, _ := json.Marshal(reqBody)

	// Build HTTP POST request
	req, err := http.NewRequest("POST", "/settle", bytes.NewReader(bodyBytes))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Record the response
	rr := httptest.NewRecorder()
	handlers.SettleGroupExpense(rr, req)

	// Check for HTTP 201 Created
	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status code %d, got %d", http.StatusCreated, rr.Code)
	}

	// Decode and verify response message
	var resp map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "Settlement recorded successfully" {
		t.Errorf("Unexpected response message: %v", resp)
	}

	// Verify the expense was created correctly
	var exp models.Expense
	if err := database.DB.Where("title = ? AND paid_by = ?", "Dinner Split", uint(2)).First(&exp).Error; err != nil {
		t.Fatalf("Expected expense record not found: %v", err)
	}
	if exp.Amount != 120.50 {
		t.Errorf("Expected expense amount 120.50, got %v", exp.Amount)
	}
	if exp.GroupID == nil || *exp.GroupID != group.ID {
		t.Errorf("Expected GroupID %d, got %v", group.ID, exp.GroupID)
	}

	// Verify the participant record
	var part models.ExpenseParticipant
	if err := database.DB.
		Where("expense_id = ? AND user_id = ?", exp.ID, uint(3)).
		First(&part).Error; err != nil {
		t.Fatalf("Expected participant record not found: %v", err)
	}
	if part.AmountOwed != 120.50 {
		t.Errorf("Expected AmountOwed 120.50, got %v", part.AmountOwed)
	}
}
