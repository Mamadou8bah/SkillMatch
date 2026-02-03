from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
import re

def clean_text(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    return " ".join(text.split())

def get_job_recommendations(user_profile, jobs_df):
    """
    user_profile: string containing skills and experience
    jobs_df: DataFrame with 'id' and 'description' (combined title + skills + desc)
    """
    if jobs_df.empty:
        return []
    
    user_profile = clean_text(user_profile)
    jobs_df['description'] = jobs_df['description'].apply(clean_text)
        
    documents = jobs_df['description'].tolist()
    documents.append(user_profile)
    
    # Using n-grams to capture phrases like "Software Engineer" or "Java Spring"
    tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = tfidf.fit_transform(documents)
    
    # Calculate similarity between the last document (user) and all others (jobs)
    cosine_sim = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])
    
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    top_jobs = []
    for i, score in sim_scores[:20]:
        if score > 0.01:
            top_jobs.append({
                "id": int(jobs_df.iloc[i]['id']),
                "score": float(score)
            })
            
    return top_jobs

def get_candidate_recommendations(job_description, candidates_df):
    """
    job_description: string containing job requirements
    candidates_df: DataFrame with 'id' and 'profile' (combined skills + exp + edu)
    """
    if candidates_df.empty:
        return []

    job_description = clean_text(job_description)
    candidates_df['profile'] = candidates_df['profile'].apply(clean_text)
        
    documents = candidates_df['profile'].tolist()
    documents.append(job_description)
    
    tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = tfidf.fit_transform(documents)
    
    cosine_sim = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])
    
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    top_candidates = []
    for i, score in sim_scores[:20]:
        if score > 0.01:
            top_candidates.append({
                "id": int(candidates_df.iloc[i]['id']),
                "score": float(score)
            })
            
    return top_candidates

def get_connection_recommendations(user_profile, others_df):
    """
    Finds professionals with similar career paths or technical focus.
    """
    if others_df.empty:
        return []

    user_profile = clean_text(user_profile)
    others_df['profile'] = others_df['profile'].apply(clean_text)
    
    documents = others_df['profile'].tolist()
    documents.append(user_profile)
    
    # Higher n-grams for connections to match job titles better
    tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 3))
    tfidf_matrix = tfidf.fit_transform(documents)
    
    cosine_sim = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])
    
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    recommendations = []
    for i, score in sim_scores[:25]:
        if score > 0.05: # Higher threshold for personal connections
            recommendations.append({
                "id": int(others_df.iloc[i]['id']),
                "score": float(score)
            })
            
    return recommendations
