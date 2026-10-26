# Deployment Guide

## Local Docker deployment
1. Copy `.env.example` to `.env`.
2. Set a strong `POSTGRES_PASSWORD` and a `JWT_SECRET` of at least 32 characters.
3. Ensure `DATABASE_URL` contains the same database username/password as the PostgreSQL service.
4. Run `docker compose up --build`.
5. Verify the web app on port 8080 and API health on port 4000.

## Public deployment checklist
- Deploy the frontend to a static hosting service or container platform.
- Deploy the API to a Node-capable platform.
- Use managed PostgreSQL with backups and private connectivity where possible.
- Set all environment variables in the hosting dashboard, not in Git.
- Set `VITE_API_BASE_URL` at frontend build time to the public API base URL.
- Set `CORS_ORIGIN` on the API to the exact frontend origin(s).
- Use HTTPS for frontend and API.
- Apply `database/init.sql` once to a new database; use versioned migrations for future schema changes.
- Add rate limiting, monitoring, error tracking, and a tested backup/restore process before real users depend on it.

Note: Vite environment variables prefixed with `VITE_` are embedded into the client bundle and must never contain secrets.
