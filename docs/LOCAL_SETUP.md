# Local Setup

## 1. Install Dependencies

```bash
npm install
```

## 2. Create `.env`

```bash
cp .env.example .env
```

Set at least:

```env
DATABASE_URL=postgresql://ees_user:ees_password@localhost:5432/ees_backend
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_DEFAULT_EMAIL=admin@example.com
ADMIN_DEFAULT_PASSWORD=Admin@123456
UPLOAD_DRIVER=local
```

## 3. PostgreSQL with Homebrew

Install:

```bash
brew install postgresql@16
brew services start postgresql@16
```

Create user and database:

```bash
createuser ees_user
createdb ees_backend -O ees_user
psql postgres
```

Inside `psql`:

```sql
ALTER USER ees_user WITH PASSWORD 'ees_password';
GRANT ALL PRIVILEGES ON DATABASE ees_backend TO ees_user;
```

Use:

```env
DATABASE_URL=postgresql://ees_user:ees_password@localhost:5432/ees_backend
```

## 4. PostgreSQL with Docker

If Docker Desktop is installed and running:

```bash
docker run --name ees-postgres \
  -e POSTGRES_USER=ees_user \
  -e POSTGRES_PASSWORD=ees_password \
  -e POSTGRES_DB=ees_backend \
  -p 5432:5432 \
  -d postgres:16
```

Use:

```env
DATABASE_URL=postgresql://ees_user:ees_password@localhost:5432/ees_backend
```

## 5. Prisma Generate and Migrate

```bash
npx prisma generate
npx prisma migrate dev
```

If creating the database from scratch and you want a reset:

```bash
npx prisma migrate reset
```

## 6. Seed

```bash
npm run seed
```

Seed creates:

- categories
- collections
- published products
- product images
- product SEO metadata
- default SUPER_ADMIN
- sample coupon `WELCOME10`

## 7. Start Dev Server

```bash
npm run start:dev
```

API base:

```text
http://localhost:8080/api
```

## 8. Health Check

```bash
curl http://localhost:8080/api/health
```

Expected:

```json
{
  "success": true,
  "message": "Backend is running",
  "data": { "status": "ok", "database": "connected" }
}
```

## 9. Admin Login

```bash
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}'
```

## Troubleshooting

### Missing `DATABASE_URL`

`env.validation.ts` requires `DATABASE_URL`. Make sure `.env` exists in the project root and contains a non-empty value.

### `.env` Exists But Nest Cannot Read It

`ConfigModule` loads only `.env` from the project root. Confirm you are running commands from the repo root:

```bash
pwd
```

### Prisma P1010 User Denied Access

Create the database user and grant privileges:

```sql
CREATE USER ees_user WITH PASSWORD 'ees_password';
CREATE DATABASE ees_backend OWNER ees_user;
GRANT ALL PRIVILEGES ON DATABASE ees_backend TO ees_user;
```

### `psql` Invalid URI Query Parameter `schema`

`psql` may reject URLs with `?schema=public`. Use a simple connection URL for CLI commands:

```bash
psql postgresql://ees_user:ees_password@localhost:5432/ees_backend
```

### Docker Daemon Not Running

Start Docker Desktop before running Docker commands:

```bash
docker ps
```

If this fails, Docker Desktop is not running or not installed.

### Unable to Find Docker App

Install Docker Desktop from Docker's official site, or use local Homebrew PostgreSQL instead.

### Port 5432 Already in Use

Another PostgreSQL instance is running. Either stop it or map Docker to a different port:

```bash
-p 5433:5432
```

Then update `DATABASE_URL`:

```env
DATABASE_URL=postgresql://ees_user:ees_password@localhost:5433/ees_backend
```

### Database Not Connected

Run:

```bash
npx prisma validate
npx prisma migrate dev
curl http://localhost:8080/api/health
```

### Seed Failing

Check:

- `DATABASE_URL` is correct.
- Migrations have run.
- PostgreSQL user can write to the database.
- `ADMIN_DEFAULT_EMAIL` is a valid email-like string.

### JWT/Admin Login Failing

Run seed again if the admin user was not created:

```bash
npm run seed
```

Confirm the login email/password match `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD`.
