package models

// Config 存储系统配置的键值对
type Config struct {
	Key   string `gorm:"primaryKey;size:128" json:"key"`
	Value string `gorm:"type:text" json:"value"`
}

// TableName 指定表名为 configs
func (Config) TableName() string {
	return "configs"
}
