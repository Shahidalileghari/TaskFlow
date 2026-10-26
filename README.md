# TaskFlow — Full-Stack Project

A portfolio-ready task management application demonstrating frontend/backend integration, REST API design, PostgreSQL persistence, authentication, validation, automated testing, and containerized deployment.

> **Stack:** React + TypeScript + Vite · Node.js + Express + TypeScript · PostgreSQL · Zod · JWT · Docker Compose

## Features

- Register and sign in with email and password
- Password hashing with `bcryptjs`
- JWT-protected task endpoints
- Create, list, update, complete, and delete personal tasks
- Request validation with Zod
- PostgreSQL schema with constraints and user/task ownership
- Centralized API error handling
- Backend unit/integration-style tests with Vitest and Supertest
- Frontend component and interaction tests with Vitest and Testing Library
- Docker Compose for a repeatable local stack
- Health endpoint and environment-based configuration

## Architecture

```text
Browser (React + TypeScript)
          |
          | HTTP / JSON + Bearer token
          v
Express REST API (TypeScript)
          |
          | parameterized SQL
          v
      PostgreSQL
```

The API is the trust boundary: user identity comes from the verified token, and every task query is scoped to that authenticated user. The client never supplies the owner ID for task operations.

## Repository structure

```text
full-stack-project/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   ├── config.ts
│   │   │   ├── db.ts
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   └── schemas/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── src/
│       │   ├── api.ts
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── styles.css
│       ├── tests/
│       ├── Dockerfile
│       ├── nginx.conf
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
├── database/
│   └── init.sql
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   ├── security-checklist.md
│   └── deployment.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
└── LICENSE
```

## Requirements

- Node.js 20+
- npm 10+
- Docker Desktop (recommended), or a local PostgreSQL 16+ server

## Quick start with Docker

1. Copy `.env.example` to `.env`.
2. Replace the development secrets in `.env` with your own long random values.
3. Run:

```bash
docker compose up --build
```

4. Open `http://localhost:8080`.
5. API health check: `http://localhost:4000/health`.

Docker Compose creates the PostgreSQL database, initializes the schema, starts the API, and serves the frontend through Nginx. The database volume persists data between restarts.

To stop:

```bash
docker compose down
```

To remove the local database volume as well (destructive):

```bash
docker compose down -v
```

## Run without Docker

### 1. Prepare PostgreSQL

Create a database and apply the schema:

```bash
createdb taskflow
psql -d taskflow -f database/init.sql
```

### 2. Configure the API

```bash
cd apps/api
npm install
```

Set `DATABASE_URL`, `JWT_SECRET`, and `PORT` in your environment. Example:

```text
DATABASE_URL=postgres://postgres:your-password@localhost:5432/taskflow
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
PORT=4000
NODE_ENV=development
```

Then:

```bash
npm run dev
```

### 3. Configure the frontend

In another terminal:

```bash
cd apps/web
npm install
```

Set `VITE_API_BASE_URL=http://localhost:4000/api` if needed, then:

```bash
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Tests and builds

From each app directory:

```bash
npm test
npm run build
```

API tests use a test database configured by `TEST_DATABASE_URL` and should be run against a disposable database. The API test suite includes a small set of tests for validation and route behavior; add more integration tests before relying on this application in production.

## API overview

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/tasks` | Yes | List current user's tasks |
| POST | `/api/tasks` | Yes | Create task |
| PATCH | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

All request bodies are validated. Authenticated requests use `Authorization: Bearer <token>`.

## Security notes

This is a learning and portfolio starter, not a certified production service. Before public production deployment, review `docs/security-checklist.md`. In particular: use HTTPS, manage secrets with the hosting platform, configure rate limiting and security headers, consider refresh-token/session strategy, add account verification and password reset flows, configure CORS precisely, and run dependency/security scans.

## Roadmap

- [ ] Refresh tokens or secure cookie-based sessions
- [ ] Email verification and password reset
- [ ] Rate limiting and account lockout strategy
- [ ] Pagination, search, and task filters
- [ ] Audit events and structured logging
- [ ] CI workflow for lint, tests, and builds
- [ ] E2E browser tests
- [ ] Production deployment with managed PostgreSQL

## GitHub repository description

**Full-stack task management application built with React, TypeScript, Express, PostgreSQL, JWT authentication, Zod validation, automated tests, and Docker deployment.**

## License

MIT. See `LICENSE`.
