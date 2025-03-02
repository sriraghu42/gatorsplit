package database

import (
	"fmt"
	"go-auth-app/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	var err error

	// Define PostgreSQL connection string (DSN: Data Source Name)
	dsn := "host=localhost user='postgres' password='raghu' dbname=postgres port=5432 sslmode=disable TimeZone=UTC"

	// Open PostgreSQL connection
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to PostgreSQL database!")
	}

	fmt.Println("PostgreSQL database connection established.")

	// AutoMigrate will create/update tables based on the struct definition
	DB.AutoMigrate(
		&models.User{},
		&models.Group{},
		&models.GroupUser{},
		&models.Thread{},
		&models.Expense{},
		&models.ExpenseParticipant{},
	)
}

// SetupMockDB initializes an in-memory SQLite database for testing
func SetupMockDB() {
	mockDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Failed to initialize mock database: %v", err)
	}

	// Migrate all models
	mockDB.AutoMigrate(
		&models.User{},
		&models.Group{},
		&models.GroupUser{},
		&models.Thread{},
		&models.Expense{},
		&models.ExpenseParticipant{},
	)

	// 🔹 Override the global `database.DB` instance
	DB = mockDB
	log.Println("✅ Mock DB initialized")
}
