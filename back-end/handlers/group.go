package handlers

import (
	"encoding/json"
	"fmt"
	"go-auth-app/database"
	"go-auth-app/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// GetAllUsers - Fetch all available users
func GetAllUsers(w http.ResponseWriter, r *http.Request) {

	type userResponse struct {
		ID       uint   `json:"id"`
		Username string `json:"name"`
	}
	var users []userResponse
	result := database.DB.
		Table("users"). // ✅ Explicitly use the correct table name
		Select("id, username").
		Scan(&users)

	// Handle errors
	if result.Error != nil {
		http.Error(w, "Error retrieving users", http.StatusInternalServerError)
		return
	}

	if len(users) == 0 {
		json.NewEncoder(w).Encode([]struct{}{})
	} else {
		json.NewEncoder(w).Encode(users)
	}
}

// CreateGroup - Create a new group and add users to it
func CreateGroup(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name    string `json:"name"`
		UserIDs []uint `json:"user_ids"`
	}

	// Decode JSON request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Ensure group name is provided
	if req.Name == "" {
		http.Error(w, "Group name is required", http.StatusBadRequest)
		return
	}

	fmt.Println("✅ Creating group with name:", req.Name)
	fmt.Println("📌 Users to be added:", req.UserIDs)

	// Create the group
	group := models.Group{Name: req.Name}
	if err := database.DB.Create(&group).Error; err != nil {
		fmt.Println("❌ Error creating group:", err)
		http.Error(w, "Error creating group", http.StatusInternalServerError)
		return
	}

	// Ensure that at least one user is provided
	if len(req.UserIDs) == 0 {
		fmt.Println("⚠️ No users provided. Group created without members.")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Group created successfully (without members)",
		})
		return
	}

	// Insert users into the `group_users` association table
	var groupUsers []models.GroupUser
	for _, userID := range req.UserIDs {
		groupUsers = append(groupUsers, models.GroupUser{GroupID: group.ID, UserID: userID})
	}

	fmt.Println("📌 Adding users to group:", groupUsers)

	if err := database.DB.Create(&groupUsers).Error; err != nil {
		fmt.Println("❌ Error adding users to group:", err)
		http.Error(w, "Error adding users to group", http.StatusInternalServerError)
		return
	}

	fmt.Println("✅ Group created successfully with users:", req.UserIDs)

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Group created successfully",
	})
}

func UpdateGroupMembers(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserIDs []uint `json:"user_ids"`
	}

	groupIDStr := mux.Vars(r)["group_id"]
	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	for _, userID := range req.UserIDs {
		var count int64
		database.DB.Model(&models.GroupUser{}).
			Where("group_id = ? AND user_id = ?", groupID, userID).
			Count(&count)

		if count == 0 {
			newMember := models.GroupUser{
				GroupID: uint(groupID),
				UserID:  userID,
			}
			database.DB.Create(&newMember)
		}
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "New members added successfully"})
}

func GetUserGroups(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(uint)
	if !ok {
		http.Error(w, "Unauthorized: No user data found", http.StatusUnauthorized)
		return
	}

	type GroupResponse struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	}

	var groups []GroupResponse
	database.DB.
		Table("groups").
		Select("groups.id, groups.name"). // 👈 Exclude timestamps here
		Joins("JOIN group_users ON groups.id = group_users.group_id").
		Where("group_users.user_id = ?", userID).
		Scan(&groups)

	if len(groups) == 0 {
		json.NewEncoder(w).Encode([]struct{}{})
	} else {
		json.NewEncoder(w).Encode(groups)
	}
}

// GetGroupUsers - Get all users in a group along with the group name
func GetGroupUsers(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["id"]

	var result struct {
		GroupName string        `json:"group_name"`
		Users     []models.User `json:"users"`
	}

	database.DB.
		Table("groups").
		Select("name").
		Where("id = ?", groupID).
		Scan(&result.GroupName)

	database.DB.
		Table("users").
		Select("users.id, users.username").
		Joins("JOIN group_users ON users.id = group_users.user_id").
		Where("group_users.group_id = ?", groupID).
		Scan(&result.Users)

	json.NewEncoder(w).Encode(result)
}

// GetUserGroupsWithBalances - Retrieves all groups a user belongs to with total balance
func GetUserGroupsWithBalances(w http.ResponseWriter, r *http.Request) {
	userID := mux.Vars(r)["user_id"]

	var groups []struct {
		GroupID      uint    `json:"group_id"`
		GroupName    string  `json:"group_name"`
		TotalBalance float64 `json:"total_balance"`
	}

	database.DB.Raw(`
		SELECT g.id AS group_id, g.name AS group_name, COALESCE(SUM(ep.amount_owed), 0) AS total_balance 
		FROM groups g
		LEFT JOIN expenses e ON g.id = e.group_id
		LEFT JOIN expense_participants ep ON e.id = ep.expense_id AND ep.user_id = ?
		GROUP BY g.id, g.name
	`, userID).Scan(&groups)

	if len(groups) == 0 {
		json.NewEncoder(w).Encode([]struct{}{})
	} else {
		json.NewEncoder(w).Encode(groups)
	}
}

func GetGroupExpensesWithDetails(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["group_id"]

	var expenses []struct {
		ID           uint    `json:"id"`
		Title        string  `json:"title"`
		Amount       float64 `json:"amount"`
		PaidBy       uint    `json:"paid_by"`
		GroupID      *uint   `json:"group_id"`
		ThreadID     *uint   `json:"thread_id"`
		ThreadName   *string `json:"thread_name"`
		Participants []struct {
			UserID     uint    `json:"user_id"`
			Username   string  `json:"username"`
			AmountOwed float64 `json:"amount_owed"`
		} `json:"participants"`
	}

	database.DB.Raw(`
		SELECT e.id, e.title, e.amount, e.paid_by, e.group_id, e.thread_id, t.name AS thread_name
		FROM expenses e
		LEFT JOIN threads t ON e.thread_id = t.id
		WHERE e.group_id = ?
	`, groupID).Scan(&expenses)

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

// GetGroupBalances - Retrieves total balances within a group
func GetGroupBalances(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["group_id"]

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
			WHERE e.group_id = ?
			GROUP BY ep.user_id, u.username
		),
		UserIsOwed AS (
			SELECT e.paid_by AS user_id, u.username AS username, SUM(ep.amount_owed) AS amount_due
			FROM expense_participants ep
			JOIN expenses e ON ep.expense_id = e.id
			JOIN users u ON e.paid_by = u.id
			WHERE e.group_id = ?
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
	`, groupID, groupID).Scan(&balances)

	if len(balances) == 0 {
		json.NewEncoder(w).Encode([]struct{}{})
	} else {
		json.NewEncoder(w).Encode(balances)
	}
}

// DeleteGroup - Deletes a group by ID
func DeleteGroup(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["group_id"]

	// Delete all related records first
	database.DB.Exec("DELETE FROM expense_participants WHERE expense_id IN (SELECT id FROM expenses WHERE group_id = ?)", groupID)
	database.DB.Exec("DELETE FROM expenses WHERE group_id = ?", groupID)
	database.DB.Exec("DELETE FROM threads WHERE group_id = ?", groupID)
	database.DB.Exec("DELETE FROM group_users WHERE group_id = ?", groupID)

	// Finally, delete the group itself
	if err := database.DB.Exec("DELETE FROM groups WHERE id = ?", groupID).Error; err != nil {
		http.Error(w, "Error deleting group", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Group deleted successfully"})
}
