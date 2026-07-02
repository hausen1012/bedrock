package models

// Setting 存储系统配置的键值对
type Setting struct {
	Key   string `gorm:"primaryKey;size:128" json:"key"`
	Value string `gorm:"type:text" json:"value"`
}
