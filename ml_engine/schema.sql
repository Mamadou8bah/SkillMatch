-- SQL Schema for Recommendation System

-- Stores precomputed job recommendations for users
CREATE TABLE IF NOT EXISTS job_recommendations (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    score FLOAT NOT NULL,
    rank INT NOT NULL,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores precomputed connection recommendations (user -> user)
CREATE TABLE IF NOT EXISTS connection_recommendations (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recommended_user_id BIGINT NOT NULL,
    score FLOAT NOT NULL,
    rank INT NOT NULL,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs for training labels (recommendation feedback loop)
CREATE TABLE IF NOT EXISTS recommendation_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- 'JOB' or 'CONNECTION'
    event_type VARCHAR(20) NOT NULL, -- 'SHOWN', 'CLICKED', 'APPLIED', 'CONNECTED'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for fast retrieval by Spring Boot
CREATE INDEX IF NOT EXISTS idx_job_rec_user ON job_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_conn_rec_user ON connection_recommendations(user_id);
