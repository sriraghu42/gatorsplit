package handlers

import (
	"encoding/json"
	"go-auth-app/database"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetDashboardBalances(w http.ResponseWriter, r *http.Request) {
	userIDStr := mux.Vars(r)["user_id"]
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	// Struct for overall balance totals
	var balanceTotals struct {
		TotalOwed  float64
		TotalDue   float64
		NetBalance float64
	}

	// Query for overall balances
	result := database.DB.Raw(`
		WITH UserOwes AS (
			SELECT ep.user_id AS user_id, SUM(ep.amount_owed) AS amount_owed
			FROM expense_participants ep
			JOIN expenses e ON ep.expense_id = e.id
			WHERE e.paid_by = ?
			GROUP BY ep.user_id
		),
		UserIsOwed AS (
			SELECT e.paid_by AS user_id, SUM(ep.amount_owed) AS amount_due
			FROM expense_participants ep
			JOIN expenses e ON ep.expense_id = e.id
			WHERE ep.user_id = ?
			GROUP BY e.paid_by
		)
		SELECT 
			COALESCE(SUM(owes.amount_owed), 0) AS total_owed,
			COALESCE(SUM(owed.amount_due), 0) AS total_due,
			COALESCE(SUM(owed.amount_due), 0) - COALESCE(SUM(owes.amount_owed), 0) AS net_balance
		FROM UserOwes owes
		LEFT JOIN UserIsOwed owed ON owes.user_id = owed.user_id
	`, userID, userID).Scan(&balanceTotals)

	if result.Error != nil {
		http.Error(w, "Failed to retrieve overall balances from database", http.StatusInternalServerError)
		return
	}

	// Struct for per-user balances
	var userBalances []struct {
		UserID     uint    `json:"user_id"`
		Username   string  `json:"username"`
		AmountOwed float64 `json:"amount_owed"`
		AmountDue  float64 `json:"amount_due"`
		NetBalance float64 `json:"net_balance"`
	}

	// Query for individual user balances
	result = database.DB.Raw(`
		WITH UserOwes AS (
			SELECT ep.user_id AS user_id, SUM(ep.amount_owed) AS amount_owed
			FROM expense_participants ep
			JOIN expenses e ON ep.expense_id = e.id
			WHERE e.paid_by = ?
			GROUP BY ep.user_id
		),
		UserIsOwed AS (
			SELECT e.paid_by AS user_id, SUM(ep.amount_owed) AS amount_due
			FROM expense_participants ep
			JOIN expenses e ON ep.expense_id = e.id
			WHERE ep.user_id = ?
			GROUP BY e.paid_by
		)
		SELECT 
			u.id AS user_id,
			u.username AS username,
			COALESCE(owes.amount_owed, 0) AS amount_owed,
			COALESCE(owed.amount_due, 0) AS amount_due,
			COALESCE(owed.amount_due, 0) - COALESCE(owes.amount_owed, 0) AS net_balance
		FROM users u
		LEFT JOIN UserOwes owes ON u.id = owes.user_id
		LEFT JOIN UserIsOwed owed ON u.id = owed.user_id
	`, userID, userID).Scan(&userBalances)

	if result.Error != nil {
		http.Error(w, "Failed to retrieve user balances from database", http.StatusInternalServerError)
		return
	}

	// Construct final response
	response := struct {
		TotalOwed  float64     `json:"total_owed"`
		TotalDue   float64     `json:"total_due"`
		NetBalance float64     `json:"net_balance"`
		Users      interface{} `json:"users"` // Allow empty array override
	}{
		TotalOwed:  balanceTotals.TotalOwed,
		TotalDue:   balanceTotals.TotalDue,
		NetBalance: balanceTotals.NetBalance,
		Users:      userBalances,
	}

	// Return [] instead of null when no user balances
	if len(userBalances) == 0 {
		response.Users = []struct{}{}
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
