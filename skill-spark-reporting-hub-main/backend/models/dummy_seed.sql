-- Dummy Users
INSERT INTO users (name, email, password, role)
VALUES
  ('Alice Admin', 'alice.admin@example.com', '$2a$10$7QJ8Qw1Qw1Qw1Qw1Qw1QwOQJ8Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'admin'),
  ('Bob User', 'bob.user@example.com', '$2a$10$7QJ8Qw1Qw1Qw1Qw1Qw1QwOQJ8Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'user');

-- Dummy Skill Categories
INSERT INTO skill_categories (name, description)
VALUES
  ('JavaScript', 'JavaScript programming language'),
  ('Python', 'Python programming language'),
  ('SQL', 'Structured Query Language');

-- Dummy Questions
INSERT INTO questions (skill_category_id, question_text, options, correct_option)
VALUES
  (1, 'What is the output of 2 + 2 in JavaScript?', '["3", "4", "22", "undefined"]', 1),
  (2, 'Which keyword is used to define a function in Python?', '["def", "function", "lambda", "fun"]', 0),
  (3, 'Which SQL statement is used to extract data from a database?', '["GET", "SELECT", "EXTRACT", "OPEN"]', 1); 