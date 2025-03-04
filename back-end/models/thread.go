package models

import "gorm.io/gorm"

type Thread struct {
	gorm.Model
	Name      string `gorm:"not null" json:"name"`
	GroupID   *uint  `gorm:"index" json:"group_id"` // Nullable (if a private thread)
	CreatedBy uint   `gorm:"not null" json:"created_by"`
}
