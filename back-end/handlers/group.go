package handlers

import (
	"encoding/json"
	"fmt"
	"go-auth-app/database"
	"go-auth-app/models"
	"net/http"

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

	// Return JSON response
	json.NewEncoder(w).Encode(users)
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

	json.NewEncoder(w).Encode(groups)
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
