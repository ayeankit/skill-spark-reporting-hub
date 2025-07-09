-- Insert dummy admin
INSERT INTO users (name, email, password, role) VALUES (
  'Admin User', 'admin@skillportal.com', '$2a$10$wH6QwQwQwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQW', 'admin'
);

-- Insert dummy user
INSERT INTO users (name, email, password, role) VALUES (
  'John Doe', 'john.doe@example.com', '$2a$10$wH6QwQwQwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQW', 'user'
);

-- Password for both: password123 