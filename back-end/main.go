package main

import (
	"bytes"
	"fmt"
	"go-auth-app/database"
	"go-auth-app/handlers"
	"go-auth-app/middleware"
	"io"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

// CORS middleware function
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // React Frontend
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests manually
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// LoggingMiddleware logs all incoming requests and outgoing responses
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Log request details
		fmt.Println("📩 Incoming Request:")
		fmt.Printf("🔹 Method: %s\n", r.Method)
		fmt.Printf("🔹 URL: %s\n", r.URL.Path)
		fmt.Printf("🔹 Headers: %v\n", r.Header)

		// Read and log request body (if present)
		var requestBody string
		if r.Body != nil {
			bodyBytes, _ := io.ReadAll(r.Body) // Read body
			requestBody = string(bodyBytes)
			r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes)) // Reset body for next read
		}
		fmt.Printf("🔹 Body: %s\n", requestBody)

		// Capture response by wrapping the ResponseWriter
		responseRecorder := &responseCapture{ResponseWriter: w, body: &bytes.Buffer{}}
		startTime := time.Now()

		// Call the next handler
		next.ServeHTTP(responseRecorder, r)

		// Log response details
		fmt.Println("📤 Outgoing Response:")
		fmt.Printf("🔹 Status Code: %d\n", responseRecorder.status)
		fmt.Printf("🔹 Response Body: %s\n", responseRecorder.body.String())
		fmt.Printf("⏳ Duration: %v\n", time.Since(startTime))
		fmt.Println("-----------------------------------")
	})
}

// Custom Response Writer to capture response body
type responseCapture struct {
	http.ResponseWriter
	body   *bytes.Buffer
	status int
}

func (rw *responseCapture) Write(b []byte) (int, error) {
	rw.body.Write(b) // Capture response body
	return rw.ResponseWriter.Write(b)
}

func (rw *responseCapture) WriteHeader(statusCode int) {
	rw.status = statusCode // Capture response status
	rw.ResponseWriter.WriteHeader(statusCode)
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
	protected.HandleFunc("/profile", handlers.Profile).Methods("GET", "OPTIONS")
	protected.HandleFunc("/users", handlers.GetAllUsers).Methods("GET", "OPTIONS")
	protected.HandleFunc("/groups", handlers.CreateGroup).Methods("POST", "OPTIONS")
	protected.HandleFunc("/users/groups", handlers.GetUserGroups).Methods("GET", "OPTIONS")
	protected.HandleFunc("/groups/{id}/users", handlers.GetGroupUsers).Methods("GET", "OPTIONS")

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
