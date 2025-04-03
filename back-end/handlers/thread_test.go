package handlers_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"go-auth-app/database"
	"go-auth-app/handlers"
	"go-auth-app/models"

	"github.com/gorilla/mux"
)

func TestCreateThread(t *testing.T) {
	database.SetupMockDB()

	// Create a group record (needed for thread) and a user.
	group := models.Group{Name: "Test Group"}
	database.DB.Create(&group)
	// Provide a unique email for the user to satisfy the UNIQUE constraint.
	user := models.User{Username: "testuser", Email: "testuser@example.com"}
	database.DB.Create(&user)

	payload := fmt.Sprintf(`{"name": "Test Thread", "group_id": %d, "created_by": %d}`, group.ID, user.ID)
	req, _ := http.NewRequest("POST", "/threads", bytes.NewBuffer([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handlers.CreateThread(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status code 201, got %d", rr.Code)
	}

	var resp map[string]string
	json.NewDecoder(rr.Body).Decode(&resp)
	if msg, ok := resp["message"]; !ok || msg != "Thread created successfully" {
		t.Errorf("Unexpected response message: %v", resp)
	}

	// Verify that the thread was created in the database.
	var thread models.Thread
	if err := database.DB.Where("name = ?", "Test Thread").First(&thread).Error; err != nil {
		t.Errorf("Thread not found in DB: %v", err)
	}
}

func TestGetThreadsByGroup(t *testing.T) {
	database.SetupMockDB()

	// Create a group and two threads.
	group := models.Group{Name: "Test Group"}
	database.DB.Create(&group)
	thread1 := models.Thread{Name: "Thread 1", GroupID: &group.ID}
	thread2 := models.Thread{Name: "Thread 2", GroupID: &group.ID}
	database.DB.Create(&thread1)
	database.DB.Create(&thread2)

	req, _ := http.NewRequest("GET", "/threads/group/"+strconv.Itoa(int(group.ID)), nil)
	req = mux.SetURLVars(req, map[string]string{"group_id": fmt.Sprintf("%d", group.ID)})
	rr := httptest.NewRecorder()
	handlers.GetThreadsByGroup(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", rr.Code)
	}

	var threads []struct {
		ThreadID   uint   `json:"thread_id"`
		ThreadName string `json:"thread_name"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&threads); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if len(threads) != 2 {
		t.Errorf("Expected 2 threads, got %d", len(threads))
	}
}

func TestGetUserThreadsWithBalances(t *testing.T) {
	database.SetupMockDB()

	// Create a user.
	// Provide a unique email.
	user := models.User{Username: "testuser", Email: "user@example.com"}
	database.DB.Create(&user)

	// Create a thread and an expense within that thread.
	thread := models.Thread{Name: "Test Thread"}
	database.DB.Create(&thread)
	expense := models.Expense{
		Title:    "Expense in Thread",
		Amount:   100,
		PaidBy:   user.ID,
		ThreadID: &thread.ID,
	}
	database.DB.Create(&expense)
	// Create an expense participant for the user.
	expParticipant := models.ExpenseParticipant{
		ExpenseID:  expense.ID,
		UserID:     user.ID,
		AmountOwed: 100,
	}
	database.DB.Create(&expParticipant)

	req, _ := http.NewRequest("GET", "/threads/user/"+strconv.Itoa(int(user.ID))+"/balances", nil)
	req = mux.SetURLVars(req, map[string]string{"user_id": fmt.Sprintf("%d", user.ID)})
	rr := httptest.NewRecorder()
	handlers.GetUserThreadsWithBalances(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", rr.Code)
	}

	var threads []struct {
		ThreadID     uint    `json:"thread_id"`
		ThreadName   string  `json:"thread_name"`
		TotalBalance float64 `json:"total_balance"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&threads); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if len(threads) != 1 {
		t.Errorf("Expected 1 thread, got %d", len(threads))
	} else {
		if threads[0].TotalBalance != 100 {
			t.Errorf("Expected total balance 100, got %f", threads[0].TotalBalance)
		}
	}
}

func TestGetThreadBalances(t *testing.T) {
	// Initialize the in‑memory SQLite DB.
	database.SetupMockDB()

	// Create two users with unique emails.
	user1 := models.User{Username: "user1", Email: "user1@example.com"}
	user2 := models.User{Username: "user2", Email: "user2@example.com"}
	if err := database.DB.Create(&user1).Error; err != nil {
		t.Fatalf("Failed to create user1: %v", err)
	}
	if err := database.DB.Create(&user2).Error; err != nil {
		t.Fatalf("Failed to create user2: %v", err)
	}

	// Create a thread.
	thread := models.Thread{Name: "Test Thread"}
	if err := database.DB.Create(&thread).Error; err != nil {
		t.Fatalf("Failed to create thread: %v", err)
	}

	// Create an expense in the thread with user1 as the payer.
	expense := models.Expense{
		Title:    "Test Expense",
		Amount:   100,
		PaidBy:   user1.ID,
		ThreadID: &thread.ID,
	}
	if err := database.DB.Create(&expense).Error; err != nil {
		t.Fatalf("Failed to create expense: %v", err)
	}
	// Create expense participants: both user1 and user2 owe 50 each.
	participant1 := models.ExpenseParticipant{
		ExpenseID:  expense.ID,
		UserID:     user1.ID,
		AmountOwed: 50,
	}
	participant2 := models.ExpenseParticipant{
		ExpenseID:  expense.ID,
		UserID:     user2.ID,
		AmountOwed: 50,
	}
	if err := database.DB.Create(&participant1).Error; err != nil {
		t.Fatalf("Failed to create participant1: %v", err)
	}
	if err := database.DB.Create(&participant2).Error; err != nil {
		t.Fatalf("Failed to create participant2: %v", err)
	}

	// Prepare GET request to retrieve thread balances.
	req, _ := http.NewRequest("GET", "/threads/"+strconv.Itoa(int(thread.ID))+"/balances", nil)
	req = mux.SetURLVars(req, map[string]string{"thread_id": fmt.Sprintf("%d", thread.ID)})
	rr := httptest.NewRecorder()
	handlers.GetThreadBalances(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", rr.Code)
	}

	// Decode response.
	var balances []struct {
		UserID     uint    `json:"user_id"`
		Username   string  `json:"username"`
		AmountOwed float64 `json:"amount_owed"`
		AmountDue  float64 `json:"amount_due"`
		NetBalance float64 `json:"net_balance"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&balances); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Expect two records.
	if len(balances) != 2 {
		t.Errorf("Expected 2 balance records, got %d", len(balances))
	}

	// Validate balances.
	for _, b := range balances {
		if b.UserID == user1.ID {
			// For user1: they owe 50, are owed 100, net balance = 100 - 50 = 50.
			if b.AmountOwed != 50 || b.AmountDue != 100 || b.NetBalance != 50 {
				t.Errorf("Unexpected balance for user1: %+v", b)
			}
		} else if b.UserID == user2.ID {
			// For user2: they owe 50, are owed 0, net balance = 0 - 50 = -50.
			if b.AmountOwed != 50 || b.AmountDue != 0 || b.NetBalance != -50 {
				t.Errorf("Unexpected balance for user2: %+v", b)
			}
		} else {
			t.Errorf("Unexpected user id in balances: %d", b.UserID)
		}
	}
}

func TestDeleteThread(t *testing.T) {
	database.SetupMockDB()

	// Create a thread.
	thread := models.Thread{Name: "Test Thread"}
	database.DB.Create(&thread)

	// Create an expense under the thread.
	expense := models.Expense{
		Title:    "Test Expense",
		Amount:   100,
		PaidBy:   1,
		ThreadID: &thread.ID,
	}
	database.DB.Create(&expense)
	// Create an expense participant.
	participant := models.ExpenseParticipant{
		ExpenseID:  expense.ID,
		UserID:     1,
		AmountOwed: 100,
	}
	database.DB.Create(&participant)

	// Prepare DELETE request for the thread.
	req, _ := http.NewRequest("DELETE", "/threads/"+strconv.Itoa(int(thread.ID)), nil)
	req = mux.SetURLVars(req, map[string]string{"thread_id": fmt.Sprintf("%d", thread.ID)})
	rr := httptest.NewRecorder()
	handlers.DeleteThread(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", rr.Code)
	}

	var resp map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "Thread deleted successfully" {
		t.Errorf("Unexpected response message: %v", resp)
	}

	// Verify that the thread is deleted.
	var th models.Thread
	if err := database.DB.First(&th, thread.ID).Error; err == nil {
		t.Errorf("Thread was not deleted")
	}
	// Verify that expenses under the thread are deleted.
	var count int64
	database.DB.Model(&models.Expense{}).Where("thread_id = ?", thread.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expected 0 expenses for deleted thread, got %d", count)
	}
	// Verify that expense participants are deleted.
	database.DB.Model(&models.ExpenseParticipant{}).Where("expense_id = ?", expense.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expected 0 expense participants for deleted thread, got %d", count)
	}
}
