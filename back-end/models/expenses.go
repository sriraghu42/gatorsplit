package models

import "gorm.io/gorm"

type Expense struct {
	gorm.Model
	Title    string  `gorm:"not null" json:"title"`
	Amount   float64 `gorm:"not null" json:"amount"`
	PaidBy   uint    `gorm:"not null" json:"paid_by"`
	GroupID  *uint   `gorm:"index" json:"group_id"`  // Nullable
	ThreadID *uint   `gorm:"index" json:"thread_id"` // Nullable
}

// ExpenseParticipants model (Tracks how an expense is split)
type ExpenseParticipant struct {
	ExpenseID  uint    `gorm:"not null;index" json:"expense_id"`
	UserID     uint    `gorm:"not null;index" json:"user_id"`
	AmountOwed float64 `gorm:"not null" json:"amount_owed"`
}
