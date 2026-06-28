INSERT INTO users (name, email, password, age, role)
VALUES ('Admin', 'admin@example.com', '$2b$10$Nbe/LlFb1cl6zJY/DrbEBOvg/mnp3JLhcTgF0vK71x/kzBqAK6czq', 30, 'admin')
ON CONFLICT (email) DO NOTHING;
