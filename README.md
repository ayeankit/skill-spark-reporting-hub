# Skill Spark Reporting Hub

A full-stack platform for skill assessment, quiz management, and performance reporting.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- Docker (for database, optional but recommended)

### 1. Clone the Repository
```sh
git clone <YOUR_GIT_URL>
cd skill-spark-reporting-hub-main
```

### 2. Install Dependencies
```sh
# For backend
cd backend
npm install
# For frontend
cd ../
npm install
```

### 3. Environment Variables
- Copy `.env.example` to `.env` in both root and backend folders, and fill in required values (API URLs, DB connection, JWT secret, etc).

### 4. Database Setup
- You can use Docker Compose to spin up a local Postgres DB:
  ```sh
  docker-compose up -d
  ```
- Or set up your own Postgres instance and run the SQL files in `backend/models/` to seed tables.

### 5. Run the App
- **Backend:**
  ```sh
  cd backend
  npm start
  ```
- **Frontend:**
  ```sh
  npm run dev
  ```
- Visit [http://localhost:5173](http://localhost:5173) (or your configured port).

---

## 📚 API Documentation

### Auth
- `POST /api/auth/login` — User login
- `POST /api/auth/register` — User registration

### Users
- `GET /api/users` — List all users (admin)
- `GET /api/users/:id` — Get user by ID

### Skill Categories
- `GET /api/skill-categories` — List all categories (admin)
- `GET /api/skill-categories/user` — List categories for user
- `POST /api/skill-categories` — Create category (admin)

### Questions
- `GET /api/questions` — List all questions (admin)
- `GET /api/questions/user?skill_category_id=...` — List questions for a category (user)
- `POST /api/questions` — Create question (admin)

### Quiz
- `POST /api/quiz/attempt` — Submit quiz attempt
- `GET /api/quiz/attempts` — Get user's quiz attempts

### Reports
- `GET /api/reports/user-performance` — User-wise performance (admin)
- `GET /api/reports/skill-gap` — Skill gap report (admin)
- `GET /api/reports/time-performance?period=week|month` — Time-based performance (admin)

> All endpoints require JWT authentication except `/auth/*`.

---

## 🗄️ Database Schema Design

### Tables

#### users
| Field         | Type         | Description         |
|-------------- |------------- |--------------------|
| id            | SERIAL PK    | User ID            |
| name          | VARCHAR      | User's name        |
| email         | VARCHAR      | User's email       |
| password_hash | VARCHAR      | Hashed password    |
| role          | VARCHAR      | 'admin' or 'user'  |
| created_at    | TIMESTAMP    | Registration date  |

#### skill_categories
| Field         | Type         | Description         |
|-------------- |------------- |--------------------|
| id            | SERIAL PK    | Category ID        |
| name          | VARCHAR      | Category name      |
| description   | TEXT         | Description        |
| created_at    | TIMESTAMP    | Created date       |

#### questions
| Field         | Type         | Description         |
|-------------- |------------- |--------------------|
| id            | SERIAL PK    | Question ID        |
| skill_category_id | INT FK    | Category reference |
| question_text | TEXT         | The question       |
| options       | JSON/ARRAY   | List of options    |
| correct_option| INT          | Index of correct   |
| created_at    | TIMESTAMP    | Created date       |

#### quiz_attempts
| Field         | Type         | Description         |
|-------------- |------------- |--------------------|
| id            | SERIAL PK    | Attempt ID         |
| user_id       | INT FK       | User reference     |
| skill_category_id | INT FK    | Category reference |
| score         | INT          | Score (correct)    |
| total_questions | INT        | Total questions    |
| completed_at  | TIMESTAMP    | When completed     |

#### quiz_answers
| Field         | Type         | Description         |
|-------------- |------------- |--------------------|
| id            | SERIAL PK    | Answer ID          |
| attempt_id    | INT FK       | Quiz attempt ref   |
| question_id   | INT FK       | Question ref       |
| selected_option | INT        | Chosen option idx  |

### Relationships
- `users` 1—* `quiz_attempts` (user can have many attempts)
- `skill_categories` 1—* `questions`
- `quiz_attempts` 1—* `quiz_answers`
- `questions` 1—* `quiz_answers`

---

## 📄 License
MIT
