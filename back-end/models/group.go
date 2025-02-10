package models

import "gorm.io/gorm"

type Group struct {
	gorm.Model
    Name string `gorm:"unique;not null" json:"name"`
}

type GroupUser struct {
	gorm.Model
    GroupID uint `gorm:"not null" json:"group_id"`
    UserID  uint `gorm:"not null" json:"user_id"`
}
