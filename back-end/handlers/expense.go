package handlers

import (
	"encoding/json"
	"go-auth-app/database"
	"go-auth-app/models"
	"net/http"

	"github.com/gorilla/mux"
)

// CreatePersonalExpense - Creates an expense between users (not in a group or thread) with Splitwise-like functionality
func CreatePersonalExpense(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title     string           `json:"title"`
		Amount    float64          `json:"amount"`
		PaidBy    uint             `json:"paid_by"`
		SplitWith map[uint]float64 `json:"split_with"` // UserID -> Amount Owed
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate amount
	if req.Amount <= 0 {
		http.Error(w, "Amount should be greater than zero", http.StatusBadRequest)
		return
	}

	// Validate split distribution
	totalSplit := 0.0
	for _, amount := range req.SplitWith {
		totalSplit += amount
	}

	if totalSplit != req.Amount {
		http.Error(w, "Split amounts do not sum up to total expense amount", http.StatusBadRequest)
		return
	}

	// Create expense entry
	expense := models.Expense{
		Title:  req.Title,
		Amount: req.Amount,
		PaidBy: req.PaidBy,
	}
	if err := database.DB.Create(&expense).Error; err != nil {
		http.Error(w, "Error creating expense", http.StatusInternalServerError)
		return
	}

	// Create expense participant entries
	participants := []models.ExpenseParticipant{}
	for userID, amount := range req.SplitWith {
		participants = append(participants, models.ExpenseParticipant{
			ExpenseID:  expense.ID,
			UserID:     userID,
			AmountOwed: amount,
		})
	}

	database.DB.Create(&participants)

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
