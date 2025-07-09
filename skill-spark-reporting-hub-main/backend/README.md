# Skill Spark Reporting Hub Backend

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file (see `.env.example` for template).
3. Start MySQL and create the database:
   ```sql
   CREATE DATABASE skillspark;
   ```
4. Run the SQL schema:
   ```bash
   mysql -u root -p skillspark < models/init.sql
   ```
5. Start the backend:
   ```bash
   npm run dev
   ```

## Docker Compose (Recommended)

1. Build and start all services:
   ```bash
   docker-compose up --build
   ```
2. The backend will be available at `http://localhost:5000` and MySQL at `localhost:3306`.
3. To initialize the DB schema:
   ```bash
   docker exec -i <backend_container_name> mysql -u root -pyourpassword skillspark < /usr/src/app/models/init.sql
   ```

## Environment Variables
- See `docker-compose.yml` and `backend/config.js` for required variables.

## Deployment (Railway)
- Deploy the backend folder as a Node.js service.
- Add a MySQL plugin on Railway and set environment variables accordingly.
- Run the schema SQL on the Railway MySQL instance.
- Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, and `JWT_SECRET` in Railway dashboard.

---

**APIs:**
- Auth: `/api/auth/login`, `/api/auth/register`
- Users: `/api/users` (admin)
- Skill Categories: `/api/skill-categories` (admin)
- Questions: `/api/questions` (admin)
- Quiz: `/api/quiz/attempt`, `/api/quiz/attempts`, `/api/quiz/attempt/:id/answers`
- Reports: `/api/reports/user-performance`, `/api/reports/skill-gap`, `/api/reports/time-performance` 