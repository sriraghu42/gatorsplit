package models

import "gorm.io/gorm"

type Group struct {
	gorm.Model
	Name string `gorm:"unique;not null" json:"name"`
}

type GroupUser struct {
	GroupID uint   `gorm:"not null;index" json:"group_id"`
	UserID  uint   `gorm:"not null;index" json:"user_id"`
	Role    string `gorm:"type:varchar(10);default:'member'" json:"role"`
}
