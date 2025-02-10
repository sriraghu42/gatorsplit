package middleware

import (
	"context"
	"fmt"
	"go-auth-app/handlers"
	"go-auth-app/database"
	"go-auth-app/models"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v4"
)

// AuthMiddleware checks if the user has a valid JWT token before accessing protected routes.
// func AuthMiddleware(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		fmt.Println("🔍 Incoming request for:", r.URL.Path)

// 		// Get the Authorization header
// 		authHeader := r.Header.Get("Authorization")
// 		if authHeader == "" {
// 			fmt.Println("🚫 Unauthorized: Missing token")
// 			http.Error(w, "Unauthorized: Missing token", http.StatusUnauthorized)
// 			return
// 		}

// 		// Extract token from "Bearer <token>"
// 		tokenParts := strings.Split(authHeader, " ")
// 		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
// 			fmt.Println("🚫 Unauthorized: Invalid token format")
// 			http.Error(w, "Unauthorized: Invalid token format", http.StatusUnauthorized)
// 			return
// 		}

// 		tokenString := tokenParts[1]

// 		// Parse the JWT token
// 		claims := &handlers.Claims{}
// 		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
// 			return handlers.JwtKey, nil
// 		})

// 		// Handle token validation errors
// 		if err != nil || !token.Valid {
// 			fmt.Println("🚫 Unauthorized: Invalid or expired token")
// 			http.Error(w, "Unauthorized: Invalid or expired token", http.StatusUnauthorized)
// 			return
// 		}

// 		var user models.User
// 		if err := database.DB.Where("username = ?", claims.Username).First(&user).Error; err != nil {
// 			fmt.Println("🚫 Unauthorized: User not found")
// 			http.Error(w, "Unauthorized: User not found", http.StatusUnauthorized)
// 			return
// 		}

// 		// ✅ Token is valid → Store user info in context
// 		fmt.Println("✅ Token is valid. User:", claims.Username)
// 		fmt.Println(user.ID)
// 		ctx := context.WithValue(r.Context(), "user", user.ID)
// 		next.ServeHTTP(w, r.WithContext(ctx))
// 	})
// }

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("🔍 Incoming request for:", r.URL.Path)

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			fmt.Println("🚫 Unauthorized: Missing token")
			http.Error(w, "Unauthorized: Missing token", http.StatusUnauthorized)
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			fmt.Println("🚫 Unauthorized: Invalid token format")
			http.Error(w, "Unauthorized: Invalid token format", http.StatusUnauthorized)
			return
		}

		tokenString := tokenParts[1]

		// Parse JWT token
		claims := &handlers.Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return handlers.JwtKey, nil
		})

		if err != nil || !token.Valid {
			fmt.Println("🚫 Unauthorized: Invalid or expired token")
			http.Error(w, "Unauthorized: Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Debug: Print extracted username
		fmt.Println("✅ Token Valid - Extracted Username:", claims.Username)

		// Retrieve user ID from database using the username
		var user models.User
		if err := database.DB.Where("username = ?", claims.Username).First(&user).Error; err != nil {
			fmt.Println("🚫 Unauthorized: User not found in DB")
			http.Error(w, "Unauthorized: User not found", http.StatusUnauthorized)
			return
		}

		// ✅ Store `user_id` in request context
		fmt.Println("✅ Storing user_id in context:", user.ID)
		ctx := context.WithValue(r.Context(), "user_id", user.ID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

