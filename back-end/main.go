package main

import (
	"fmt"
	"go-auth-app/database"
	"go-auth-app/handlers"
	"go-auth-app/middleware"
	"net/http"

	"github.com/gorilla/mux"
)

// CORS middleware function
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // React Frontend
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Connect to the database
	database.ConnectDatabase()

	// Create a new router
	r := mux.NewRouter()
	r.Use(enableCORS)

	// Public Routes (No authentication needed)
	r.HandleFunc("/register", handlers.Register).Methods("POST", "OPTIONS")
	r.HandleFunc("/login", handlers.Login).Methods("POST", "OPTIONS")

	// Protected Routes (Require authentication)
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	// User Profile
	protected.HandleFunc("/profile", handlers.Profile).Methods("GET", "OPTIONS")

	// User and Group Management
	protected.HandleFunc("/users", handlers.GetAllUsers).Methods("GET", "OPTIONS")
	protected.HandleFunc("/groups", handlers.CreateGroup).Methods("POST", "OPTIONS")
	protected.HandleFunc("/users/groups", handlers.GetUserGroups).Methods("GET", "OPTIONS")
	protected.HandleFunc("/groups/{id}/users", handlers.GetGroupUsers).Methods("GET", "OPTIONS")
	protected.HandleFunc("/groups/{group_id}/expenses", handlers.GetGroupExpensesWithDetails).Methods("GET", "OPTIONS")
	protected.HandleFunc("/groups/{group_id}/balances", handlers.GetGroupBalances).Methods("GET", "OPTIONS")
	protected.HandleFunc("/groups/{group_id}", handlers.DeleteGroup).Methods("DELETE", "OPTIONS")

	// Thread Management
	protected.HandleFunc("/threads", handlers.CreateThread).Methods("POST", "OPTIONS")
	protected.HandleFunc("/groups/{group_id}/threads", handlers.GetThreadsByGroup).Methods("GET", "OPTIONS")
	protected.HandleFunc("/threads/{thread_id}/expenses", handlers.GetThreadExpensesWithDetails).Methods("GET", "OPTIONS")
	protected.HandleFunc("/threads/{thread_id}/balances", handlers.GetThreadBalances).Methods("GET", "OPTIONS")
	protected.HandleFunc("/threads/{thread_id}", handlers.DeleteThread).Methods("DELETE", "OPTIONS")

	// Expense Management
	protected.HandleFunc("/expenses", handlers.CreateExpense).Methods("POST", "OPTIONS")
	protected.HandleFunc("/personal-expense", handlers.CreatePersonalExpense).Methods("POST", "OPTIONS")
	protected.HandleFunc("/dashboard/balances/{user_id}", handlers.GetDashboardBalances).Methods("GET", "OPTIONS")
	protected.HandleFunc("/expenses/{expense_id}/settle", handlers.SettleExpense).Methods("POST", "OPTIONS")
	protected.HandleFunc("/expenses/{expense_id}", handlers.DeleteExpense).Methods("DELETE", "OPTIONS")
	// Print all registered routes
	fmt.Println("Registered Routes:")
	r.Walk(func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
		path, err := route.GetPathTemplate()
		if err == nil {
			fmt.Println(path)
		}
		return nil
	})

	// Start the server
	fmt.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", r)
}
