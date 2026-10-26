# API Reference

Base URL for local development: `http://localhost:4000`

## Health
`GET /health` → `200 { "status": "ok" }`

## Register
`POST /api/auth/register`

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "a-long-password" }
```

Returns `201` with `{ "token": "...", "user": { "id": "...", "name": "...", "email": "...", "created_at": "..." } }`.

## Login
`POST /api/auth/login`

```json
{ "email": "ada@example.com", "password": "a-long-password" }
```

Returns a token and public user data. Invalid credentials return `401`.

## List tasks
`GET /api/tasks` with `Authorization: Bearer <token>`.

## Create task
`POST /api/tasks` with JSON:

```json
{ "title": "Finish project README", "description": "Document setup and tests" }
```

## Update task
`PATCH /api/tasks/:id` with one or more of:

```json
{ "completed": true }
```

Allowed fields: `title`, `description`, `completed`.

## Delete task
`DELETE /api/tasks/:id` returns `204` when deleted. Tasks belonging to another user are not exposed.
