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
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var balances []struct {
		FriendID   uint    `json:"friend_id"`
		FriendName string  `json:"friend_name"`
		AmountOwed float64 `json:"amount_owed"`
		AmountDue  float64 `json:"amount_due"`
		NetBalance float64 `json:"net_balance"`
	}

	database.DB.Raw(`
		WITH UserOwes AS (
			SELECT ep.user_id AS friend_id, u.username AS friend_name, SUM(ep.amount_owed) AS amount_owed
			FROM expense_participants ep
			JOIN expenses e ON ep.expense_id = e.id
			JOIN users u ON ep.user_id = u.id
			WHERE e.paid_by = ?
			GROUP BY ep.user_id, u.username
		),
		UserIsOwed AS (
			SELECT e.paid_by AS friend_id, u.username AS friend_name, SUM(ep.amount_owed) AS amount_due
			FROM expense_participants ep
			JOIN expenses e ON ep.expense_id = e.id
			JOIN users u ON e.paid_by = u.id
			WHERE ep.user_id = ?
			GROUP BY e.paid_by, u.username
		)
		SELECT 
			COALESCE(owes.friend_id, owed.friend_id) AS friend_id,
			COALESCE(owes.friend_name, owed.friend_name) AS friend_name,
			COALESCE(owes.amount_owed, 0) AS amount_owed,
			COALESCE(owed.amount_due, 0) AS amount_due,
			COALESCE(owed.amount_due, 0) - COALESCE(owes.amount_owed, 0) AS net_balance
		FROM UserOwes owes
		FULL OUTER JOIN UserIsOwed owed ON owes.friend_id = owed.friend_id
	`, userID, userID).Scan(&balances)

	if len(balances) == 0 {
		json.NewEncoder(w).Encode([]struct{}{})
	} else {
		json.NewEncoder(w).Encode(balances)
	}
}
