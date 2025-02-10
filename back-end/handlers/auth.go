package handlers

import (
	"encoding/json"
	"go-auth-app/database"
	"go-auth-app/models"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

// Define JwtKey for signing tokens
var JwtKey = []byte("your_secret_key") // Use environment variables in production

type Credentials struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

// **User Registration**
func Register(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Ensure all required fields are provided
	if creds.Username == "" || creds.Email == "" || creds.Password == "" {
		http.Error(w, "All fields (username, email, password) are required", http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Create new user instance
	user := models.User{
		Username: creds.Username,
		Email:    creds.Email,
		Password: string(hashedPassword),
	}

	// Save user to the database
	result := database.DB.Create(&user)
	if result.Error != nil {
		http.Error(w, "Error creating user", http.StatusBadRequest)
		return
	}

	// Respond with success message
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Account successfully created!"})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	json.NewDecoder(r.Body).Decode(&creds)

	var user models.User
	result := database.DB.Where("username = ? OR email = ?", creds.Username, creds.Email).First(&user)
	if result.Error != nil {
		http.Error(w, "Invalid username/email or password", http.StatusUnauthorized)
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(creds.Password))
	if err != nil {
		http.Error(w, "Invalid username/email or password", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(1 * time.Hour)
	claims := &Claims{
		Username: user.Username,
		Email:    user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(JwtKey)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	// ✅ Ensure we return a valid JSON response with a string token
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

func Profile(w http.ResponseWriter, r *http.Request) {
	// Extract username from context
	username, ok := r.Context().Value("user").(string)
	if !ok {
		http.Error(w, "Unauthorized: No user data found", http.StatusUnauthorized)
		return
	}

	// Return the username in JSON response
	response := map[string]string{"message": "Welcome, " + username + "!"}
	json.NewEncoder(w).Encode(response)
}
