SkillMatch Backend

Overview
Backend API for a job matching platform built with Spring Boot 3, Java 17, PostgreSQL, JWT, and Spring Security.

Profiles
- default: local dev, reads env vars (DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, EMAIL_*).
- test: in-memory H2 for unit/integration tests.
- prod: hardened defaults, file logging, env-driven config.

Environment variables
- DB_URL, DB_USERNAME, DB_PASSWORD
- JWT_SECRET
- SITE_BASE_URL
- EMAIL_USERNAME, EMAIL_PASSWORD, MAIL_HOST, MAIL_PORT
- CORS_ALLOWED_ORIGINS (comma-separated, e.g., https://app.example.com)
- PORT (optional)

Run locally
1) Set env vars (PowerShell):
	$env:DB_URL="jdbc:postgresql://localhost:5432/skillmatch"; $env:DB_USERNAME="postgres"; $env:DB_PASSWORD="postgres"; $env:JWT_SECRET="change-me-long-secret"
2) Start: mvnw spring-boot:run

Deploy (non-Docker)
1) Build: mvnw -DskipTests package
2) Provision PostgreSQL and set env vars above on the server.
3) Start with prod profile:
	java -jar target/SkillMatch-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

Notes
- CORS origins are controlled via app.cors.allowed-origins in prod.
- Actuator exposes health/info/metrics; restrict network access appropriately.
