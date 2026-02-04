from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
import re

# Initialize model once at module level for reuse
# 'all-MiniLM-L6-v2' is small, fast, and excellent for semantic similarity
model = SentenceTransformer('all-MiniLM-L6-v2')

def clean_text(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    return " ".join(text.split())

def get_job_recommendations(user_profile, jobs_df):
    """
    Uses sentence embeddings for semantic search.
    user_profile: string narrative of user profile
    jobs_df: DataFrame with 'id' and 'description' (narrative)
    """
    if jobs_df.empty:
        return []
    
    # Generate embeddings
    user_embedding = model.encode([user_profile])
    job_embeddings = model.encode(jobs_df['description'].tolist())
    
    # Calculate cosine similarity
    cosine_sim = cosine_similarity(user_embedding, job_embeddings)
    
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    top_jobs = []
    for i, score in sim_scores[:20]:
        if score > 0.1: # Slightly higher threshold for meaningful embeddings
            top_jobs.append({
                "id": int(jobs_df.iloc[i]['id']),
                "score": float(score)
            })
            
    return top_jobs

def get_candidate_recommendations(job_description, candidates_df):
    """
    job_description: string narrative of job
    candidates_df: DataFrame with 'id' and 'profile' (narrative)
    """
    if candidates_df.empty:
        return []

    job_embedding = model.encode([job_description])
    candidate_embeddings = model.encode(candidates_df['profile'].tolist())
    
    cosine_sim = cosine_similarity(job_embedding, candidate_embeddings)
    
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    top_candidates = []
    for i, score in sim_scores[:20]:
        if score > 0.1:
            top_candidates.append({
                "id": int(candidates_df.iloc[i]['id']),
                "score": float(score)
            })
            
    return top_candidates

def get_connection_recommendations(user_profile, others_df):
    """
    Finds professionals with similar semantic profiles.
    """
    if others_df.empty:
        return []

    user_embedding = model.encode([user_profile])
    other_embeddings = model.encode(others_df['profile'].tolist())
    
    cosine_sim = cosine_similarity(user_embedding, other_embeddings)
    
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    recommendations = []
    for i, score in sim_scores[:25]:
        if score > 0.2: # Higher threshold for personal connections
            recommendations.append({
                "id": int(others_df.iloc[i]['id']),
                "score": float(score)
            })
            
    return recommendations
