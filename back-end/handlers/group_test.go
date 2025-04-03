package handlers_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"go-auth-app/database"
	"go-auth-app/handlers"
	"go-auth-app/models"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gorilla/mux"
)

func TestUpdateGroupMembers(t *testing.T) {
	// Initialize in‑memory SQLite DB.
	database.SetupMockDB()

	// Create a group record.
	group := models.Group{Name: "Test Group"}
	if err := database.DB.Create(&group).Error; err != nil {
		t.Fatalf("Failed to create group: %v", err)
	}

	// Insert an initial member (user 1) for the group.
	initialMember := models.GroupUser{GroupID: group.ID, UserID: 1}
	if err := database.DB.Create(&initialMember).Error; err != nil {
		t.Fatalf("Failed to insert initial member: %v", err)
	}

	// Payload: try to add an existing member (1) and new ones (2, 3)
	payload := `{"user_ids": [1, 2, 3]}`
	req, err := http.NewRequest("PUT", "/groups/"+strconv.Itoa(int(group.ID))+"/members", bytes.NewBuffer([]byte(payload)))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	// Set URL variable "group_id" for mux.
	req = mux.SetURLVars(req, map[string]string{"group_id": fmt.Sprintf("%d", group.ID)})

	rr := httptest.NewRecorder()
	handlers.UpdateGroupMembers(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", rr.Code)
	}

	var resp map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "New members added successfully" {
		t.Errorf("Unexpected response message: %v", resp)
	}

	// Verify that group now has members 1, 2, and 3 (without duplicates).
	var members []models.GroupUser
	if err := database.DB.Where("group_id = ?", group.ID).Find(&members).Error; err != nil {
		t.Fatalf("Error querying group users: %v", err)
	}
	if len(members) != 3 {
		t.Errorf("Expected 3 group members, got %d", len(members))
	}
}

func TestDeleteGroup(t *testing.T) {
	database.SetupMockDB()

	// Create a group record.
	group := models.Group{Name: "Test Group"}
	if err := database.DB.Create(&group).Error; err != nil {
		t.Fatalf("Failed to create group: %v", err)
	}

	// Create associated records:
	// 1. Group user.
	groupUser := models.GroupUser{GroupID: group.ID, UserID: 1}
	database.DB.Create(&groupUser)
	// 2. Expense.
	expense := models.Expense{
		Title:   "Test Expense",
		Amount:  100,
		PaidBy:  1,
		GroupID: &group.ID,
	}
	database.DB.Create(&expense)
	// 3. Expense participant.
	expParticipant := models.ExpenseParticipant{
		ExpenseID:  expense.ID,
		UserID:     1,
		AmountOwed: 50,
	}
	database.DB.Create(&expParticipant)
	// 4. Thread.
	thread := models.Thread{
		Name:    "Test Thread",
		GroupID: &group.ID,
	}
	database.DB.Create(&thread)

	// Prepare DELETE request.
	req, _ := http.NewRequest("DELETE", "/groups/"+strconv.Itoa(int(group.ID)), nil)
	req = mux.SetURLVars(req, map[string]string{"group_id": fmt.Sprintf("%d", group.ID)})

	rr := httptest.NewRecorder()
	handlers.DeleteGroup(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", rr.Code)
	}

	var resp map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "Group deleted successfully" {
		t.Errorf("Unexpected response message: %v", resp)
	}

	// Verify that the group and its associated records are deleted.
	var g models.Group
	if err := database.DB.First(&g, group.ID).Error; err == nil {
		t.Errorf("Group was not deleted")
	}

	var count int64
	database.DB.Model(&models.GroupUser{}).Where("group_id = ?", group.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expected 0 group_users for deleted group, got %d", count)
	}
	database.DB.Model(&models.Expense{}).Where("group_id = ?", group.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expected 0 expenses for deleted group, got %d", count)
	}
	database.DB.Model(&models.Thread{}).Where("group_id = ?", group.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expected 0 threads for deleted group, got %d", count)
	}
	database.DB.Model(&models.ExpenseParticipant{}).Count(&count)
	if count != 0 {
		t.Errorf("Expected 0 expense participants after deletion, got %d", count)
	}
}
