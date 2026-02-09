from sklearn.metrics.pairwise import cosine_similarity
from sklearn.linear_model import LogisticRegression
import pandas as pd
import numpy as np
import re
import os
import joblib
import json
import sqlite3
import gc
import requests
import time
from datetime import datetime

# MEMORY OPTIMIZATION
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Path Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'reranker_model.pkl')
DB_PATH = os.path.join(BASE_DIR, 'interactions.db')

# Hugging Face Inference API configuration
# model: all-MiniLM-L6-v2 (384 dims)
HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = os.getenv("HF_API_TOKEN") # Optional but recommended for higher rate limits

def call_hf_api(texts):
    """Helper to call Hugging Face Inference API for embeddings"""
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
    
    # Hugging Face Inference API expects {"inputs": ["text1", "text2"]}
    response = requests.post(HF_API_URL, headers=headers, json={"inputs": texts})
    
    if response.status_code == 200:
        return np.array(response.json())
    elif response.status_code == 503:
        # Model is loading, wait and retry once
        print("HF Model is loading, waiting 5s...")
        time.sleep(5)
        response = requests.post(HF_API_URL, headers=headers, json={"inputs": texts})
        if response.status_code == 200:
            return np.array(response.json())
            
    print(f"HF API Error: {response.status_code} - {response.text}")
    return None

# GLOBAL EMBEDDING CACHE
# Maps hash(text) or text -> embedding
embedding_cache = {}

class AIRecommender:
    def __init__(self):
        # LEVEL 3: Re-ranker (ML model)
        self.load_model()
        self._init_db()
        
        # LEVEL 5: Personalization / Global preference weights (starting defaults)
        self.global_weights = {
            "semantic": 0.45,
            "skills": 0.25,
            "exp": 0.15,
            "loc": 0.10,
            "recency": 0.05
        }

    def _get_embedding(self, text):
        """Get embedding from cache or compute it"""
        if not text or not isinstance(text, str):
            return np.zeros(384) # all-MiniLM-L6-v2 has 384 dimensions
            
        text = text.strip()
        if text in embedding_cache:
            return embedding_cache[text]
            
        # Cache management: limit size to 1000 items
        if len(embedding_cache) > 1000:
            embedding_cache.clear()
            gc.collect()
            
        computed_embs = call_hf_api([text])
        if computed_embs is not None:
            emb = computed_embs[0]
            embedding_cache[text] = emb
            return emb
        
        return np.zeros(384)

    def _get_batch_embeddings(self, texts):
        """Get batch of embeddings efficiently"""
        if not texts:
            return np.array([])
            
        results = []
        to_compute = []
        indices_to_compute = []
        
        for i, text in enumerate(texts):
            text = text.strip() if isinstance(text, str) else ""
            if text in embedding_cache:
                results.append(embedding_cache[text])
            else:
                results.append(None)
                to_compute.append(text)
                indices_to_compute.append(i)
                
        if to_compute:
            computed_embs = call_hf_api(to_compute)
            
            # Update cache and results
            if computed_embs is not None:
                if len(embedding_cache) + len(to_compute) > 1000:
                    embedding_cache.clear()
                    gc.collect()
                    
                for i, emb in enumerate(computed_embs):
                    original_idx = indices_to_compute[i]
                    text = to_compute[i]
                    embedding_cache[text] = emb
                    results[original_idx] = emb
            else:
                # Fallback to zeros if API fails
                for i in indices_to_compute:
                    results[i] = np.zeros(384)
                embedding_cache.clear()
                gc.collect()
                
            for i, emb in enumerate(computed_embs):
                results[indices_to_compute[i]] = emb
                embedding_cache[to_compute[i]] = emb
                
        return np.array(results)

    def _init_db(self):
        """Initialize SQLite DB for Level 4 persistence"""
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS interactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    job_id TEXT,
                    type TEXT,
                    features TEXT,
                    label INTEGER,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                state = joblib.load(MODEL_PATH)
                if isinstance(state, dict):
                    self.reranker = state.get('model')
                    self.global_weights = state.get('weights', self.global_weights)
                else:
                    self.reranker = state
                self.is_trained = True
                print(f"Loaded model and learned weights: {self.global_weights}")
            except:
                self.reranker = LogisticRegression()
                self.is_trained = False
        else:
            self.reranker = LogisticRegression()
            self.is_trained = False

    def save_model(self):
        state = {
            'model': self.reranker,
            'weights': self.global_weights
        }
        joblib.dump(state, MODEL_PATH)
        print(f"Model and weights saved to {MODEL_PATH}")

    def calculate_skill_overlap(self, user_skills, job_skills):
        if not user_skills or not job_skills: return 0.0
        # Correctly handle various input formats (strings, lists, objects)
        u = set([str(s).lower().strip() for s in user_skills if s])
        j = set([str(s).lower().strip() for s in job_skills if s])
        if not j: return 0.0
        return len(u.intersection(j)) / len(j)

    def calculate_experience_match(self, user_exp, job_req_exp):
        try:
            u_exp = float(user_exp) if user_exp else 0
            j_exp = float(job_req_exp) if job_req_exp else 0
            if j_exp <= 0: return 1.0
            return min(1.0, u_exp / j_exp)
        except:
            return 0.5

    def calculate_recency_score(self, posted_at):
        """PRODUCTION: Exponential decay weighting (30-day halflife style)"""
        if not posted_at: return 0.5
        posted_str = str(posted_at).lower()
        days = 0
        if 'h' in posted_str:
            days = 0
        elif 'd' in posted_str:
            try:
                days = int(re.findall(r'\d+', posted_str)[0])
            except:
                days = 7
        else:
            days = 14
            
        return float(np.exp(-days / 30))

    def calculate_location_score(self, user_loc, target_loc):
        """PRODUCTION: Nuanced matching (City, Country, Region)"""
        if not user_loc or not target_loc: return 0.5
        u = str(user_loc).lower().strip()
        t = str(target_loc).lower().strip()
        
        if u == t: return 1.0 # Exact match
        if u in t or t in u: return 0.8 # Substring match (e.g. "Lagos, Nigeria" vs "Lagos")
        
        # Split and check for commonalities (e.g. same country)
        u_parts = set(re.split(r'[,\s]+', u))
        t_parts = set(re.split(r'[,\s]+', t))
        if u_parts.intersection(t_parts): return 0.6 # Shared word (e.g. "Nigeria")
        
        return 0.3 # Different regions

    def get_job_recommendations(self, user_data, jobs_df):
        """LEVEL 1-5 Implementation"""
        if jobs_df.empty: return []

        # 1. Retrieval Layer (Level 1 Semantic Search)
        user_bio = user_data.get('bio', '') or user_data.get('user_profile', '')
        user_embedding = self._get_embedding(user_bio).reshape(1, -1)
        
        # PERFORMANCE: Use global embedding cache
        job_texts = jobs_df['description'].fillna('').tolist()
        job_embeddings = self._get_batch_embeddings(job_texts)
        
        semantic_scores = cosine_similarity(user_embedding, job_embeddings)[0]

        # 2. Ranking Layer (Level 2 Hybrid Scoring)
        user_skills = user_data.get('skills', [])
        user_exp = user_data.get('experience_years', 3)
        user_loc = user_data.get('location', '')

        candidates = []
        for i, (idx, row) in enumerate(jobs_df.iterrows()):
            features = {
                "semantic": float(semantic_scores[i]),
                "skills": float(self.calculate_skill_overlap(user_skills, row.get('skills', []))),
                "exp": float(self.calculate_experience_match(user_exp, row.get('required_experience', 2))),
                "loc": float(self.calculate_location_score(user_loc, row.get('location', ''))),
                "recency": float(self.calculate_recency_score(row.get('postedAt', '1d')))
            }
            
            # Hybrid score calculated using current weights
            base_score = sum(features[k] * self.global_weights[k] for k in features)
            
            candidates.append({
                "id": row['id'],
                "base_score": base_score,
                "feature_vector": [features[k] for k in ["semantic", "skills", "exp", "loc", "recency"]]
            })

        # Sort by hybrid score and take top 50 for re-ranking
        candidates = sorted(candidates, key=lambda x: x['base_score'], reverse=True)
        top_slice = candidates[:50]

        # 3. Model Layer (Level 3 Re-ranking)
        if self.is_trained:
            X = np.array([c['feature_vector'] for c in top_slice])
            # Probability of "1" (User applies/saves)
            probs = self.reranker.predict_proba(X)[:, 1]
            for i, c in enumerate(top_slice):
                c['score'] = float(probs[i])
        else:
            for c in top_slice:
                c['score'] = c['base_score']

        # 4. Final results
        return sorted([
            {"id": c['id'], "score": c['score'], "features": c['feature_vector']} 
            for c in top_slice
        ], key=lambda x: x['score'], reverse=True)[:20]

    def record_interaction(self, data):
        """LEVEL 4: Feedback loop with persistence in SQLite"""
        # data format: {user_id, job_id, type, user_data?, job_data?, features?}
        user_id = data.get('user_id')
        job_id = data.get('job_id')
        type_ = data.get('type')
        
        # Determine features
        features = data.get('features')
        if not features and 'user_data' in data and 'job_data' in data:
            # Re-calculate features from context
            u = data['user_data']
            j = data['job_data']
            
            # Embeddings (Level 1) - Use Cache via _get_embedding
            u_bio = u.get('bio', '') or u.get('user_profile', '')
            j_desc = j.get('description', '') or j.get('job_description', '')
            
            u_emb = self._get_embedding(u_bio).reshape(1, -1)
            j_emb = self._get_embedding(j_desc).reshape(1, -1)

            sem = float(cosine_similarity(u_emb, j_emb)[0][0])
            
            features = [
                sem,
                float(self.calculate_skill_overlap(u.get('skills', []), j.get('skills', []))),
                float(self.calculate_experience_match(u.get('experience_years', 0), j.get('required_experience', 2))),
                float(self.calculate_location_score(u.get('location', ''), j.get('location', ''))),
                float(self.calculate_recency_score(j.get('postedAt', '1d')))
            ]

        if not features: return False
        
        success_map = {"APPLY": 1, "SAVE": 1, "CLICK": 1, "VIEW": 0}
        label = success_map.get(type_, 0)

        # Persistent storage (SQLite)
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute('''
                INSERT INTO interactions (user_id, job_id, type, features, label)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, job_id, type_, json.dumps(features), label))
            conn.commit()
        
        if self.should_retrain():
            self._train_reranker()
            
        return True

    def should_retrain(self):
        """Higher threshold for production robustness via database count"""
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.execute('SELECT COUNT(*) FROM interactions')
                count = cursor.fetchone()[0]
                # Retrain every 50 interactions
                return count >= 50 and count % 50 == 0
        except Exception as e:
            print(f"Error checking retrain status: {e}")
            return False

    def _train_reranker(self):
        """LEVEL 3 & 5: Training on SQLite interaction data"""
        X = []
        y = []
        
        print("Commencing real-world re-training from DB...")
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.execute('SELECT features, label FROM interactions')
                for row in cursor:
                    features = json.loads(row[0])
                    label = row[1]
                    X.append(features)
                    y.append(label)

            # ROBUSTNESS: Ensure at least 2 classes and enough samples
            unique_classes = set(y)
            if len(unique_classes) < 2:
                print(f"Insufficient class diversity (found {unique_classes}). Need both positive/negative signals. Skipping.")
                return
            
            if len(y) < 20: 
                print("Not enough samples for a meaningful model. Skipping.")
                return

            self.reranker.fit(np.array(X), np.array(y))
            self.is_trained = True
            
            # LEVEL 5: Extract learned weights to update global_weights
            # This makes the "retrieval step" (Stage 2) smarter over time
            if hasattr(self.reranker, 'coef_'):
                feature_keys = ["semantic", "skills", "exp", "loc", "recency"]
                raw_weights = self.reranker.coef_[0]
                # Softmax style normalization to keep weights positive and summing to 1.0
                exp_weights = np.exp(raw_weights)
                norm_weights = exp_weights / np.sum(exp_weights)
                
                for i, key in enumerate(feature_keys):
                    self.global_weights[key] = float(norm_weights[i])
                
                print(f"Updated global_weights from learned patterns: {self.global_weights}")

            self.save_model()
            print("Re-ranker training complete.")
        except Exception as e:
            print(f"Error during re-training: {e}")

# Global instance
recommender = AIRecommender()

# Support functions for app.py
def get_job_recommendations(user_profile, jobs_df):
    data = {"bio": user_profile} if isinstance(user_profile, str) else user_profile
    return recommender.get_job_recommendations(data, jobs_df)

def get_candidate_recommendations(job_description, candidates_df):
    # Reverse logic for employers looking at candidates
    if candidates_df.empty: return []
    job_embedding = recommender._get_embedding(job_description).reshape(1, -1)
    
    # PERFORMANCE: Use global embedding cache
    candidate_texts = candidates_df['profile'].fillna('').tolist()
    candidate_embeddings = recommender._get_batch_embeddings(candidate_texts)
    
    semantic_scores = cosine_similarity(job_embedding, candidate_embeddings)[0]
    
    results = []
    for i, (idx, row) in enumerate(candidates_df.iterrows()):
        results.append({"id": int(row['id']), "score": float(semantic_scores[i])})
    return sorted(results, key=lambda x: x['score'], reverse=True)[:20]

def get_connection_recommendations(user_data, others_df):
    """LEVEL 2-ish for Connections with Caching"""
    if others_df.empty: return []
    
    # Get source user embedding
    if isinstance(user_data, dict):
        profile_text = user_data.get('bio', '') or user_data.get('user_profile', '')
    else:
        profile_text = user_data if isinstance(user_data, str) else ""
        
    user_embedding = recommender._get_embedding(profile_text).reshape(1, -1)

    # PERFORMANCE: Use global embedding cache for others
    other_texts = others_df['profile'].fillna('').tolist()
    other_embeddings = recommender._get_batch_embeddings(other_texts)
    
    cosine_sim = cosine_similarity(user_embedding, other_embeddings)[0]
    recommendations = [{"id": int(others_df.iloc[i]['id']), "score": float(cosine_sim[i])} 
                      for i in range(len(others_df)) if cosine_sim[i] > 0.2]
    return sorted(recommendations, key=lambda x: x['score'], reverse=True)[:25]
