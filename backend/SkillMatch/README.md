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

Offline Candidate–Job Ranking
--------------------------------
SkillMatch now stores precomputed candidate–job scores in the `candidate_job_matches` table. The backend never trains models at runtime; instead you run an offline batch (local laptop, Google Colab, or any low-cost container) to recompute rankings and upsert the results nightly or whenever new jobs/candidates arrive. The Spring Boot server only reads this cache when serving recommendations.

Schema snippet:
```
CREATE TABLE candidate_job_matches (
	id SERIAL PRIMARY KEY,
	candidate_id BIGINT NOT NULL REFERENCES users(id),
	job_post_id BIGINT NOT NULL REFERENCES job_post(id),
	score DOUBLE PRECISION NOT NULL,
	computed_at TIMESTAMP NOT NULL,
	UNIQUE(candidate_id, job_post_id)
);
```

Typical offline workflow
1. Export candidate profiles (bio, skills, experience) and active job posts (title, description, requirements) from PostgreSQL. Do this from your personal laptop, Colab, or any scheduling host; no GPU required.
2. Vectorize the concatenated text (title+description+skills) via TF-IDF or a small embedding model and compute cosine similarity between each candidate and job.
3. Keep the top `N` matches per candidate (e.g., top 20) and normalize scores to a [0,1] range if you like.
4. Upsert results: delete or truncate the rows for the candidate, then insert the fresh `(candidate_id, job_post_id, score, computed_at)` tuples using a single batch `INSERT` or upsert query.
5. Schedule this script nightly (cron, Task Scheduler, GitHub Actions) so the cache stays fresh without burdening the backend.

Example Python sketch (runs on Colab or laptop):
```python
import psycopg2
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

conn = psycopg2.connect(...)
jobs = pd.read_sql("SELECT id, title, description FROM job_post", conn)
candidates = pd.read_sql("SELECT id, full_name, profession, location FROM users WHERE role = 'CANDIDATE'", conn)

vectorizer = TfidfVectorizer(stop_words='english', max_features=4000)
job_matrix = vectorizer.fit_transform((jobs.title + ' ' + jobs.description).fillna(''))
candidate_matrix = vectorizer.transform((candidates.full_name + ' ' + candidates.profession).fillna(''))

similarities = cosine_similarity(candidate_matrix, job_matrix)
rows = []
for idx, candidate_id in enumerate(candidates.id):
	top_indices = similarities[idx].argsort()[::-1][:20]
	rows.extend([(
		int(candidate_id),
		int(jobs.iloc[j].id),
		float(similarities[idx, j]),
		datetime.utcnow()
	) for j in top_indices])

with conn.cursor() as cur:
	cur.execute("DELETE FROM candidate_job_matches;")
	cur.executemany(
		"INSERT INTO candidate_job_matches (candidate_id, job_post_id, score, computed_at) VALUES (%s,%s,%s,%s)",
		rows
	)
conn.commit()
```

Serving
- `RecommendationService` now checks the cached matches first and returns them when available.
- Use `GET /api/recommendations/matches?limit=20` to fetch the latest precomputed jobs for the logged-in candidate (score, computedAt, location, required skills, etc.).
