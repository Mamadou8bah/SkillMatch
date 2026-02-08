from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.linear_model import LogisticRegression
import torch
import pandas as pd
import numpy as np
import re
import os
import joblib
import json
import sqlite3
from datetime import datetime

# MEMORY OPTIMIZATION: Limit torch threads
torch.set_num_threads(1)

# Path Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'reranker_model.pkl')
DB_PATH = os.path.join(BASE_DIR, 'interactions.db')

# Initialize sentence transformer (Shared across instances)
# MEMORY OPTIMIZATION: Use device='cpu' explicitly
model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')

class AIRecommender:
    def __init__(self):
        # LEVEL 3: Re-ranker (ML model)
        self.load_model()
        self._init_db()
        
        # PERFORMANCE: Embedding Caches
        self.job_embeddings_cache = {} # job_id -> embedding
        self.candidate_embeddings_cache = {} # candidate_id -> embedding
        
        # LEVEL 5: Personalization / Global preference weights (starting defaults)
        self.global_weights = {
            "semantic": 0.45,
            "skills": 0.25,
            "exp": 0.15,
            "loc": 0.10,
            "recency": 0.05
        }

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

    def _get_cached_embeddings(self, df, text_col, cache):
        """Helper to only encode what is not already in cache"""
        ids = df['id'].tolist()
        texts = df[text_col].fillna('').tolist()
        
        # MEMORY OPTIMIZATION: Clear cache if it gets too large (> 1000 items)
        if len(cache) > 1000:
            print("Cache limit reached, clearing...")
            cache.clear()
            
        final_embeddings = [None] * len(ids)
        to_encode_indices = []
        to_encode_texts = []
        
        for i, jid in enumerate(ids):
            if jid in cache:
                final_embeddings[i] = cache[jid]
            else:
                to_encode_indices.append(i)
                to_encode_texts.append(texts[i])
                
        if to_encode_texts:
            print(f"Encoding {len(to_encode_texts)} new items...")
            new_embs = model.encode(to_encode_texts)
            for idx, emb in zip(to_encode_indices, new_embs):
                final_embeddings[idx] = emb
                cache[ids[idx]] = emb
                
        return np.array(final_embeddings)

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
        user_embedding = model.encode([user_bio])
        
        # PERFORMANCE: Use cached job embeddings
        job_embeddings = self._get_cached_embeddings(jobs_df, 'description', self.job_embeddings_cache)
        
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
            
            # Embeddings (Level 1) - Use Cache
            u_id = u.get('id')
            j_id = j.get('id')
            
            if u_id in self.candidate_embeddings_cache:
                u_emb = np.array([self.candidate_embeddings_cache[u_id]])
            else:
                u_emb = model.encode([u.get('bio', '')])
                if u_id: self.candidate_embeddings_cache[u_id] = u_emb[0]
                
            if j_id in self.job_embeddings_cache:
                j_emb = np.array([self.job_embeddings_cache[j_id]])
            else:
                j_emb = model.encode([j.get('description', '')])
                if j_id: self.job_embeddings_cache[j_id] = j_emb[0]

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
    job_embedding = model.encode([job_description])
    
    # PERFORMANCE: Use cached candidate embeddings
    candidate_embeddings = recommender._get_cached_embeddings(
        candidates_df, 'profile', recommender.candidate_embeddings_cache
    )
    
    semantic_scores = cosine_similarity(job_embedding, candidate_embeddings)[0]
    
    results = []
    for i, (idx, row) in enumerate(candidates_df.iterrows()):
        results.append({"id": int(row['id']), "score": float(semantic_scores[i])})
    return sorted(results, key=lambda x: x['score'], reverse=True)[:20]

def get_connection_recommendations(user_data, others_df):
    """LEVEL 2-ish for Connections with Caching"""
    if others_df.empty: return []
    
    # PERFORMANCE: Cache the source user as well
    if isinstance(user_data, dict) and 'id' in user_data:
        user_id = user_data['id']
        if user_id in recommender.candidate_embeddings_cache:
            user_embedding = np.array([recommender.candidate_embeddings_cache[user_id]])
        else:
            profile_text = user_data.get('bio', '') or user_data.get('user_profile', '')
            user_embedding = model.encode([profile_text])
            recommender.candidate_embeddings_cache[user_id] = user_embedding[0]
    else:
        profile_text = user_data if isinstance(user_data, str) else user_data.get('bio', '')
        user_embedding = model.encode([profile_text])

    # PERFORMANCE: Use cached embeddings for others
    # profiles are shared between connections and candidates
    other_embeddings = recommender._get_cached_embeddings(
        others_df, 'profile', recommender.candidate_embeddings_cache
    )
    
    cosine_sim = cosine_similarity(user_embedding, other_embeddings)[0]
    recommendations = [{"id": int(others_df.iloc[i]['id']), "score": float(cosine_sim[i])} 
                      for i in range(len(others_df)) if cosine_sim[i] > 0.2]
    return sorted(recommendations, key=lambda x: x['score'], reverse=True)[:25]
