-- Dummy Users
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User', 'admin@skillportal.com', '$2b$10$2DpimKkS/pzxmWm56Pvh4Os9/ozNYWfAuvjR8krka.Noy0OUZ1fh6', 'admin'),
  ('John Doe', 'john.doe@example.com', '$2b$10$2DpimKkS/pzxmWm56Pvh4Os9/ozNYWfAuvjR8krka.Noy0OUZ1fh6', 'user');
-- Password for both: password123

-- Dummy Skill Categories
INSERT INTO skill_categories (name, description) VALUES
  ('JavaScript', 'JavaScript basics and advanced concepts'),
  ('Python', 'Python programming fundamentals'),
  ('SQL', 'Database and SQL queries'),
  ('React', 'React.js front-end framework'),
  ('Node.js', 'Node.js backend development'),
  ('DevOps', 'CI/CD, Docker, and cloud deployment'),
  ('Data Structures', 'Core data structures for coding interviews'),
  ('Algorithms', 'Algorithmic problem solving and analysis'),
  ('HTML & CSS', 'Web markup and styling'),
  ('TypeScript', 'Typed superset of JavaScript'),
  ('Linux', 'Linux OS and command line basics');

-- Dummy Questions
INSERT INTO questions (skill_category_id, question_text, options, correct_option) VALUES
  (1, 'What is a closure in JavaScript?', '["A function with preserved data","A type of loop","A variable","A class"]', 0),
  (1, 'Which of the following is NOT a JavaScript data type?', '["String","Boolean","Float","Undefined"]', 2),
  (2, 'What is the output of print(2 ** 3) in Python?', '["6","8","9","5"]', 1),
  (2, 'Which keyword is used to define a function in Python?', '["def","function","lambda","fun"]', 0),
  (3, 'Which SQL statement is used to extract data from a database?', '["GET","SELECT","EXTRACT","OPEN"]', 1),
  (3, 'What does the WHERE clause do in SQL?', '["Sorts data","Filters records","Deletes data","Updates data"]', 1); 