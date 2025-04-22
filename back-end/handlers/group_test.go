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

func TestGetGroupBalances(t *testing.T) {
	// Initialize in‑memory SQLite DB.
	database.SetupMockDB()

	// Create two users: Alice and Bob.
	alice := models.User{
		Username: "alice",
		Email:    "alice@example.com",
		Password: "secret",
	}
	if err := database.DB.Create(&alice).Error; err != nil {
		t.Fatalf("Failed to create Alice: %v", err)
	}
	bob := models.User{
		Username: "bob",
		Email:    "bob@example.com",
		Password: "secret",
	}
	if err := database.DB.Create(&bob).Error; err != nil {
		t.Fatalf("Failed to create Bob: %v", err)
	}

	// Create a group.
	group := models.Group{Name: "Test Group"}
	if err := database.DB.Create(&group).Error; err != nil {
		t.Fatalf("Failed to create group: %v", err)
	}

	// Expense 1: Alice pays $100, Bob owes $100.
	exp1 := models.Expense{
		Title:   "Dinner",
		Amount:  100,
		PaidBy:  alice.ID,
		GroupID: &group.ID,
	}
	if err := database.DB.Create(&exp1).Error; err != nil {
		t.Fatalf("Failed to create expense1: %v", err)
	}
	part1 := models.ExpenseParticipant{
		ExpenseID:  exp1.ID,
		UserID:     bob.ID,
		AmountOwed: 100,
	}
	if err := database.DB.Create(&part1).Error; err != nil {
		t.Fatalf("Failed to create participant1: %v", err)
	}

	// Expense 2: Bob pays $40, Alice owes $40.
	exp2 := models.Expense{
		Title:   "Taxi",
		Amount:  40,
		PaidBy:  bob.ID,
		GroupID: &group.ID,
	}
	if err := database.DB.Create(&exp2).Error; err != nil {
		t.Fatalf("Failed to create expense2: %v", err)
	}
	part2 := models.ExpenseParticipant{
		ExpenseID:  exp2.ID,
		UserID:     alice.ID,
		AmountOwed: 40,
	}
	if err := database.DB.Create(&part2).Error; err != nil {
		t.Fatalf("Failed to create participant2: %v", err)
	}

	// Build GET request for balances.
	req, err := http.NewRequest("GET", "/groups/"+strconv.Itoa(int(group.ID))+"/balances", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req = mux.SetURLVars(req, map[string]string{"group_id": fmt.Sprintf("%d", group.ID)})

	rr := httptest.NewRecorder()
	handlers.GetGroupBalances(rr, req)

	// Assert status code.
	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rr.Code)
	}

	// Decode JSON response.
	var resp []struct {
		UserID     uint    `json:"user_id"`
		Username   string  `json:"username"`
		AmountOwed float64 `json:"amount_owed"`
		AmountDue  float64 `json:"amount_due"`
		NetBalance float64 `json:"net_balance"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Expect exactly two users in the result.
	if len(resp) != 2 {
		t.Fatalf("Expected 2 balances, got %d", len(resp))
	}

	// Map results by user_id for easier assertions.
	results := make(map[uint]struct {
		username       string
		owed, due, net float64
	})
	for _, b := range resp {
		results[b.UserID] = struct {
			username       string
			owed, due, net float64
		}{
			username: b.Username,
			owed:     b.AmountOwed,
			due:      b.AmountDue,
			net:      b.NetBalance,
		}
	}

	// Alice: owed 40, due 100, net 60
	if r, ok := results[alice.ID]; !ok {
		t.Errorf("Alice missing from balances")
	} else {
		if r.owed != 40 {
			t.Errorf("Alice amount_owed: expected 40, got %v", r.owed)
		}
		if r.due != 100 {
			t.Errorf("Alice amount_due: expected 100, got %v", r.due)
		}
		if r.net != 60 {
			t.Errorf("Alice net_balance: expected 60, got %v", r.net)
		}
	}

	// Bob: owed 100, due 40, net -60
	if r, ok := results[bob.ID]; !ok {
		t.Errorf("Bob missing from balances")
	} else {
		if r.owed != 100 {
			t.Errorf("Bob amount_owed: expected 100, got %v", r.owed)
		}
		if r.due != 40 {
			t.Errorf("Bob amount_due: expected 40, got %v", r.due)
		}
		if r.net != -60 {
			t.Errorf("Bob net_balance: expected -60, got %v", r.net)
		}
	}
}
func TestGetGroupExpensesWithDetails(t *testing.T) {
	// Initialize in‑memory SQLite DB.
	database.SetupMockDB()

	// Create users: one payer and one participant, each with unique email.
	payer := models.User{
		Username: "payer",
		Email:    "payer@example.com",
		Password: "secret",
	}
	if err := database.DB.Create(&payer).Error; err != nil {
		t.Fatalf("Failed to create payer user: %v", err)
	}

	participant := models.User{
		Username: "participant",
		Email:    "participant@example.com",
		Password: "secret",
	}
	if err := database.DB.Create(&participant).Error; err != nil {
		t.Fatalf("Failed to create participant user: %v", err)
	}

	// Create a group
	group := models.Group{Name: "Test Group"}
	if err := database.DB.Create(&group).Error; err != nil {
		t.Fatalf("Failed to create group: %v", err)
	}

	// Create a thread on that group
	thread := models.Thread{Name: "Test Thread", GroupID: &group.ID}
	if err := database.DB.Create(&thread).Error; err != nil {
		t.Fatalf("Failed to create thread: %v", err)
	}

	// Create an expense linked to the group & thread
	exp := models.Expense{
		Title:    "Test Expense",
		Amount:   200,
		PaidBy:   payer.ID,
		GroupID:  &group.ID,
		ThreadID: &thread.ID,
	}
	if err := database.DB.Create(&exp).Error; err != nil {
		t.Fatalf("Failed to create expense: %v", err)
	}

	// Create the expense participant record
	expPart := models.ExpenseParticipant{
		ExpenseID:  exp.ID,
		UserID:     participant.ID,
		AmountOwed: 100,
	}
	if err := database.DB.Create(&expPart).Error; err != nil {
		t.Fatalf("Failed to create expense participant: %v", err)
	}

	// Build GET request for the handler
	req, err := http.NewRequest("GET", "/groups/"+strconv.Itoa(int(group.ID))+"/expenses", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req = mux.SetURLVars(req, map[string]string{"group_id": fmt.Sprintf("%d", group.ID)})

	// Execute
	rr := httptest.NewRecorder()
	handlers.GetGroupExpensesWithDetails(rr, req)

	// Assert status code
	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rr.Code)
	}

	// Decode JSON response
	var resp []struct {
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
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// We should get exactly one expense
	if len(resp) != 1 {
		t.Fatalf("Expected 1 expense, got %d", len(resp))
	}
	got := resp[0]

	// Verify fields
	if got.ID != exp.ID {
		t.Errorf("Expected id %d, got %d", exp.ID, got.ID)
	}
	if got.Title != exp.Title {
		t.Errorf("Expected title %q, got %q", exp.Title, got.Title)
	}
	if got.Amount != exp.Amount {
		t.Errorf("Expected amount %v, got %v", exp.Amount, got.Amount)
	}
	if got.PaidBy != exp.PaidBy {
		t.Errorf("Expected paid_by %d, got %d", exp.PaidBy, got.PaidBy)
	}
	if got.GroupID == nil || *got.GroupID != group.ID {
		t.Errorf("Expected group_id %d, got %v", group.ID, got.GroupID)
	}
	if got.ThreadID == nil || *got.ThreadID != thread.ID {
		t.Errorf("Expected thread_id %d, got %v", thread.ID, got.ThreadID)
	}
	if got.ThreadName == nil || *got.ThreadName != thread.Name {
		t.Errorf("Expected thread_name %q, got %v", thread.Name, got.ThreadName)
	}

	// Verify participants
	if len(got.Participants) != 1 {
		t.Fatalf("Expected 1 participant, got %d", len(got.Participants))
	}
	p := got.Participants[0]
	if p.UserID != expPart.UserID {
		t.Errorf("Expected participant user_id %d, got %d", expPart.UserID, p.UserID)
	}
	if p.Username != participant.Username {
		t.Errorf("Expected username %q, got %q", participant.Username, p.Username)
	}
	if p.AmountOwed != expPart.AmountOwed {
		t.Errorf("Expected amount_owed %v, got %v", expPart.AmountOwed, p.AmountOwed)
	}
}

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
