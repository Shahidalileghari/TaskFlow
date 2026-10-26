# Architecture

## Responsibilities
- **Web client:** renders the user interface, provides immediate form constraints, and calls the REST API.
- **API:** validates untrusted inputs, verifies tokens, applies authorization, and executes parameterized SQL.
- **PostgreSQL:** enforces uniqueness, required values, foreign-key ownership relationships, and persistence.

## Identity and ownership
The API signs a JWT whose `sub` claim identifies the user. Middleware verifies the token and sets `req.userId`. Task queries use that server-derived value; clients cannot choose another user's owner ID.

## Error behavior
- `400`: malformed or invalid input
- `401`: missing/invalid/expired token or invalid credentials
- `404`: unknown route or task not owned by the current user
- `409`: duplicate registration email
- `500`: unexpected server error

## Deliberate starter limitations
This project uses a short-lived bearer token held in `sessionStorage` for demonstration. It reduces persistence after a tab/session closes but remains readable by JavaScript and is vulnerable if the app has an XSS flaw. For production, evaluate secure, HttpOnly cookies, CSRF protections where applicable, refresh-token rotation, rate limiting, and a carefully configured origin policy.
