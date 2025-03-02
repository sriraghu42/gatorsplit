package database_test

import (
	"go-auth-app/database"
	"go-auth-app/models"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// SetupMockDB initializes an in-memory SQLite database for testing
func SetupMockDB() {
	mockDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to initialize mock database")
	}

	// Migrate schema for all models
	mockDB.AutoMigrate(
		&models.User{},
		&models.Group{},
		&models.GroupUser{},
		&models.Thread{},
		&models.Expense{},
		&models.ExpenseParticipant{},
	)

	// Assign mock DB to global database instance
	database.DB = mockDB
}

func TestDatabaseConnection(t *testing.T) {
	SetupMockDB()
	if database.DB == nil {
		t.Fatal("Mock database was not initialized")
	}
}
