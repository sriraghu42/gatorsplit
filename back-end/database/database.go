package database

import (
	"fmt"
	"go-auth-app/models"

	"gorm.io/driver/postgres" // Import PostgreSQL driver
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	var err error

	// Define PostgreSQL connection string (DSN: Data Source Name)
	dsn := "host=localhost user='update' password='update' dbname=backend_go port=5432 sslmode=disable TimeZone=UTC"

	// Open PostgreSQL connection
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to PostgreSQL database!")
	}

	fmt.Println("PostgreSQL database connection established.")

	// AutoMigrate will create/update tables based on the struct definition
	DB.AutoMigrate(&models.User{}, &models.Group{}, &models.GroupUser{})
}
