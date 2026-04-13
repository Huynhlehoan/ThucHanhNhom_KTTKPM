-- Dùng INSERT IGNORE để không lỗi khi restart (duplicate key)
INSERT IGNORE INTO users (id, username, password) VALUES ('user-001', 'admin', '123456');
INSERT IGNORE INTO users (id, username, password) VALUES ('user123', 'test_user', '123');
