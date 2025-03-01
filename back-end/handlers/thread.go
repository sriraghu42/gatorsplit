package handlers

import (
	"encoding/json"
	"go-auth-app/database"
	"go-auth-app/models"
	"net/http"

	"github.com/gorilla/mux"
)

// CreateThread - Allows a user to create a thread in a group
func CreateThread(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name    string `json:"name"`
		GroupID uint   `json:"group_id"`
		UserID  uint   `json:"created_by"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	thread := models.Thread{Name: req.Name, GroupID: &req.GroupID, CreatedBy: req.UserID}
	if err := database.DB.Create(&thread).Error; err != nil {
		http.Error(w, "Error creating thread", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Thread created successfully"})
}

// GetThreadsByGroup - Retrieves all threads in a specific group
func GetThreadsByGroup(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["group_id"]

	var threads []struct {
		ThreadID   uint   `json:"thread_id"`
		ThreadName string `json:"thread_name"`
	}

	database.DB.Raw(`
		SELECT id AS thread_id, name AS thread_name FROM threads
		WHERE group_id = ?
	`, groupID).Scan(&threads)

	if len(threads) == 0 {
		json.NewEncoder(w).Encode([]struct{}{})
	} else {
		json.NewEncoder(w).Encode(threads)
	}
}

// GetUserThreadsWithBalances - Retrieves all threads a user belongs to with total balance
func GetUserThreadsWithBalances(w http.ResponseWriter, r *http.Request) {
	userID := mux.Vars(r)["user_id"]

	var threads []struct {
		ThreadID     uint    `json:"thread_id"`
		ThreadName   string  `json:"thread_name"`
		TotalBalance float64 `json:"total_balance"`
	}

	database.DB.Raw(`
		SELECT t.id AS thread_id, t.name AS thread_name, COALESCE(SUM(ep.amount_owed), 0) AS total_balance 
		FROM threads t
		LEFT JOIN expenses e ON t.id = e.thread_id
		LEFT JOIN expense_participants ep ON e.id = ep.expense_id AND ep.user_id = ?
		GROUP BY t.id, t.name
	`, userID).Scan(&threads)

	if len(threads) == 0 {
		json.NewEncoder(w).Encode([]struct{}{})
	} else {
		json.NewEncoder(w).Encode(threads)
	}
}

// GetThreadExpensesWithDetails - Retrieves all expenses in a thread with participants
func GetThreadExpensesWithDetails(w http.ResponseWriter, r *http.Request) {
	threadID := mux.Vars(r)["thread_id"]

	var expenses []struct {
		ID           uint    `json:"id"`
		Title        string  `json:"title"`
		Amount       float64 `json:"amount"`
		PaidBy       uint    `json:"paid_by"`
		GroupID      *uint   `json:"group_id"`
		ThreadID     *uint   `json:"thread_id"`
		Participants []struct {
			UserID     uint    `json:"user_id"`
			Username   string  `json:"username"`
			AmountOwed float64 `json:"amount_owed"`
		} `json:"participants"`
	}

	database.DB.Raw(`
		SELECT e.id, e.title, e.amount, e.paid_by, e.group_id, e.thread_id
		FROM expenses e
		WHERE e.thread_id = ?
	`, threadID).Scan(&expenses)

	for i := range expenses {
		var participants []struct {
			UserID     uint    `json:"user_id"`
			Username   string  `json:"username"`
			AmountOwed float64 `json:"amount_owed"`
		}
		database.DB.Raw(`
			SELECT ep.user_id, u.username, ep.amount_owed
			FROM expense_participants ep
			JOIN users u ON ep.user_id = u.id
			WHERE ep.expense_id = ?
		`, expenses[i].ID).Scan(&participants)
		expenses[i].Participants = participants
	}

	if len(expenses) == 0 {
		json.NewEncoder(w).Encode([]struct{}{})
	} else {
		json.NewEncoder(w).Encode(expenses)
	}
}

// GetThreadBalances - Retrieves total balances within a thread
func GetThreadBalances(w http.ResponseWriter, r *http.Request) {
	threadID := mux.Vars(r)["thread_id"]

	var balances []struct {
		UserID     uint    `json:"user_id"`
		Username   string  `json:"username"`
		AmountOwed float64 `json:"amount_owed"`
		AmountDue  float64 `json:"amount_due"`
		NetBalance float64 `json:"net_balance"`
	}

	database.DB.Raw(`
		WITH UserOwes AS (
			SELECT ep.user_id AS user_id, u.username AS username, SUM(ep.amount_owed) AS amount_owed
			FROM expense_participants ep
			JOIN expenses e ON ep.expense_id = e.id
			JOIN users u ON ep.user_id = u.id
			WHERE e.thread_id = ?
			GROUP BY ep.user_id, u.username
		),
		UserIsOwed AS (
			SELECT e.paid_by AS user_id, u.username AS username, SUM(ep.amount_owed) AS amount_due
			FROM expense_participants ep
			JOIN expenses e ON ep.expense_id = e.id
			JOIN users u ON e.paid_by = u.id
			WHERE e.thread_id = ?
			GROUP BY e.paid_by, u.username
		)
		SELECT 
			COALESCE(owes.user_id, owed.user_id) AS user_id,
			COALESCE(owes.username, owed.username) AS username,
			COALESCE(owes.amount_owed, 0) AS amount_owed,
			COALESCE(owed.amount_due, 0) AS amount_due,
			COALESCE(owed.amount_due, 0) - COALESCE(owes.amount_owed, 0) AS net_balance
		FROM UserOwes owes
		FULL OUTER JOIN UserIsOwed owed ON owes.user_id = owed.user_id
	`, threadID, threadID).Scan(&balances)

	if len(balances) == 0 {
		json.NewEncoder(w).Encode([]struct{}{})
	} else {
		json.NewEncoder(w).Encode(balances)
	}
}

// DeleteThread - Deletes a specific thread and its related expenses
func DeleteThread(w http.ResponseWriter, r *http.Request) {
	threadID := mux.Vars(r)["thread_id"]

	// Delete related expense records first
	database.DB.Exec("DELETE FROM expense_participants WHERE expense_id IN (SELECT id FROM expenses WHERE thread_id = ?)", threadID)
	database.DB.Exec("DELETE FROM expenses WHERE thread_id = ?", threadID)

	// Delete the thread itself
	if err := database.DB.Exec("DELETE FROM threads WHERE id = ?", threadID).Error; err != nil {
		http.Error(w, "Error deleting thread", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Thread deleted successfully"})
}
