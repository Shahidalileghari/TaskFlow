# Security Checklist

Before public production deployment, review and implement:

- [ ] HTTPS/TLS at the edge and secure database connections
- [ ] Strong secrets provided by a secret manager; rotate exposed credentials
- [ ] Strict `CORS_ORIGIN` allowlist; avoid permissive defaults in production
- [ ] Rate limiting for login, registration, and API routes
- [ ] Email verification, password reset, and account lifecycle handling
- [ ] Session/token revocation strategy and refresh-token rotation if used
- [ ] Prefer HttpOnly, Secure, SameSite cookies if compatible with the chosen CSRF model
- [ ] CSRF protections if cookies are used for authentication
- [ ] Security headers and content security policy suitable for the frontend
- [ ] Request-size limits, validation, and safe error responses
- [ ] Dependency scanning, lockfiles, automated tests, and code review
- [ ] Database least-privilege role; backups and tested restores
- [ ] Audit logging and monitoring without logging passwords, tokens, or secrets
- [ ] Privacy policy, data retention, and deletion process appropriate to your users
- [ ] Threat model and authorization tests, including cross-user resource access

The starter uses parameterized SQL and bcrypt password hashing, but it is not a substitute for a complete production security review.
