package handlers

import (
	"encoding/json"
	"go-auth-app/database"
	"go-auth-app/models"
	"net/http"

	"github.com/gorilla/mux"
)

// CreatePersonalExpense - Creates an expense between users (not in a group or thread)
func CreatePersonalExpense(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title     string  `json:"title"`
		Amount    float64 `json:"amount"`
		PaidBy    uint    `json:"paid_by"`
		SplitWith []uint  `json:"split_with"` // Includes payer as well
	}

	// Decode JSON request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Amount <= 0 || len(req.SplitWith) == 0 {
		http.Error(w, "Invalid amount or participants", http.StatusBadRequest)
		return
	}

	// Ensure the payer is in the `split_with` list
	found := false
	for _, userID := range req.SplitWith {
		if userID == req.PaidBy {
			found = true
			break
		}
	}
	if !found {
		http.Error(w, "PaidBy user must be included in split_with list", http.StatusBadRequest)
		return
	}

	// Create the expense record
	expense := models.Expense{
		Title:  req.Title,
		Amount: req.Amount,
		PaidBy: req.PaidBy,
	}
	if err := database.DB.Create(&expense).Error; err != nil {
		http.Error(w, "Error creating expense", http.StatusInternalServerError)
		return
	}

	// Calculate the equal split amount
	splitCount := float64(len(req.SplitWith))
	splitAmount := req.Amount / splitCount

	// Add each participant (including payer) to `expense_participants`
	var participants []models.ExpenseParticipant
	for _, userID := range req.SplitWith {
		participants = append(participants, models.ExpenseParticipant{
			ExpenseID:  expense.ID,
			UserID:     userID,
			AmountOwed: splitAmount,
		})
	}

	// Insert participants into expense_participants table
	if err := database.DB.Create(&participants).Error; err != nil {
		http.Error(w, "Error assigning participants to expense", http.StatusInternalServerError)
		return
	}

	// Success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Personal expense added successfully"})
}

// CreateExpense - Adds an expense under a group/thread
func CreateExpense(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title     string  `json:"title"`
		Amount    float64 `json:"amount"`
		PaidBy    uint    `json:"paid_by"`
		GroupID   *uint   `json:"group_id"`
		ThreadID  *uint   `json:"thread_id"`
		SplitWith []uint  `json:"split_with"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	expense := models.Expense{
		Title:    req.Title,
		Amount:   req.Amount,
		PaidBy:   req.PaidBy,
		GroupID:  req.GroupID,
		ThreadID: req.ThreadID,
	}
	if err := database.DB.Create(&expense).Error; err != nil {
		http.Error(w, "Error creating expense", http.StatusInternalServerError)
		return
	}

	// Split the expense among participants
	splitAmount := req.Amount / float64(len(req.SplitWith))
	var participants []models.ExpenseParticipant
	for _, userID := range req.SplitWith {
		participants = append(participants, models.ExpenseParticipant{
			ExpenseID:  expense.ID,
			UserID:     userID,
			AmountOwed: splitAmount,
		})
	}
	database.DB.Create(&participants)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Expense added successfully"})
}

// SettleExpense - Marks an expense as settled
func SettleExpense(w http.ResponseWriter, r *http.Request) {
	expenseID := mux.Vars(r)["expense_id"]

	if err := database.DB.Delete(&models.ExpenseParticipant{}, "expense_id = ?", expenseID).Error; err != nil {
		http.Error(w, "Error settling expense", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Expense settled successfully"})
}

// DeleteExpense - Deletes a specific expense
func DeleteExpense(w http.ResponseWriter, r *http.Request) {
	expenseID := mux.Vars(r)["expense_id"]

	// Delete related records first
	database.DB.Exec("DELETE FROM expense_participants WHERE expense_id = ?", expenseID)

	// Delete the expense itself
	if err := database.DB.Exec("DELETE FROM expenses WHERE id = ?", expenseID).Error; err != nil {
		http.Error(w, "Error deleting expense", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Expense deleted successfully"})
}
