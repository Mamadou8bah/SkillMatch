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
HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = os.getenv("HF_API_TOKEN") 

# OpenAI Configuration (Alternative)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"

def call_openai_api(texts):
    """Helper for OpenAI embeddings"""
    if not OPENAI_API_KEY:
        return None
    try:
        response = requests.post(
            "https://api.openai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={"input": texts, "model": OPENAI_EMBEDDING_MODEL}
        )
        if response.status_code == 200:
            return np.array([item["embedding"] for item in response.json()["data"]])
    except:
        pass
    return None

def call_hf_api(texts):
    """Helper to call Hugging Face Inference API for embeddings"""
    # Prefer OpenAI if key is present for reliability
    if OPENAI_API_KEY:
        return call_openai_api(texts)
        
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
    
    try:
        response = requests.post(HF_API_URL, headers=headers, json={"inputs": texts}, timeout=10)
        
        if response.status_code == 200:
            return np.array(response.json())
        elif response.status_code == 503:
            print("HF Model is loading, waiting 5s...")
            time.sleep(5)
            response = requests.post(HF_API_URL, headers=headers, json={"inputs": texts}, timeout=15)
            if response.status_code == 200:
                return np.array(response.json())
    except Exception as e:
        print(f"HF API Timeout/Error: {e}")
            
    print(f"Embedding API Error: {response.status_code if 'response' in locals() else 'Unknown'}")
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
            "semantic": 0.35,
            "skills": 0.25,
            "exp": 0.15,
            "loc": 0.05,
            "recency": 0.20 # Increased from 0.05 for "very big boost"
        }

    def _get_embedding(self, text):
        """Get embedding from cache or compute it"""
        # Determine dimension (384 for MiniLM, 1536 for OpenAI small)
        dim = 1536 if OPENAI_API_KEY else 384
        
        if not text or not isinstance(text, str):
            return np.zeros(dim)
            
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
        
        return np.zeros(dim)

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
            # BATCHING: Process in smaller chunks to avoid API timeouts and payload limits
            chunk_size = 20
            all_computed = []
            
            for i in range(0, len(to_compute), chunk_size):
                chunk = to_compute[i : i + chunk_size]
                computed_chunk = call_hf_api(chunk)
                if computed_chunk is not None:
                    # Handle cases where API might return a list instead of array
                    if isinstance(computed_chunk, list):
                        computed_chunk = np.array(computed_chunk)
                    all_computed.append(computed_chunk)
                else:
                    # Fill with zeros if a chunk fails
                    dim = 1536 if OPENAI_API_KEY else 384
                    all_computed.append(np.zeros((len(chunk), dim)))
            
            if all_computed:
                computed_embs = np.vstack(all_computed)
                
                if len(embedding_cache) + len(to_compute) > 1000:
                    embedding_cache.clear()
                    gc.collect()
                    
                for i, emb in enumerate(computed_embs):
                    if i < len(indices_to_compute):
                        original_idx = indices_to_compute[i]
                        text = to_compute[i]
                        embedding_cache[text] = emb
                        results[original_idx] = emb
            else:
                # Fallback to zeros if API fails
                dim = 1536 if OPENAI_API_KEY else 384
                for i in indices_to_compute:
                    results[i] = np.zeros(dim)
                embedding_cache.clear()
                gc.collect()
                
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

    def get_interaction_count(self, user_id):
        """Get total interaction count for a specific user"""
        if not user_id: return 0
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.execute("SELECT COUNT(*) FROM interactions WHERE user_id = ?", (str(user_id),))
                return cursor.fetchone()[0]
        except:
            return 0

    def get_job_popularity(self, job_id):
        """Get popularity of a job based on total interactions"""
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.execute("SELECT COUNT(*) FROM interactions WHERE job_id = ?", (str(job_id),))
                return cursor.fetchone()[0]
        except:
            return 0

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
        """LEVEL 1-5 Implementation with Cold Start Strategy"""
        if jobs_df.empty: return []

        user_id = user_data.get('id') or user_data.get('userId')
        interaction_count = self.get_interaction_count(user_id)
        is_cold_start = interaction_count < 5

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

        # Calculate popularity for all jobs for normalization
        job_popularities = {row['id']: self.get_job_popularity(row['id']) for _, row in jobs_df.iterrows()}
        max_pop = max(job_popularities.values()) if job_popularities.values() else 1
        if max_pop == 0: max_pop = 1

        candidates = []
        for i, (idx, row) in enumerate(jobs_df.iterrows()):
            job_id = row['id']
            skill_sim = float(self.calculate_skill_overlap(user_skills, row.get('skills', [])))
            
            # Recency calculation
            posted_at = row.get('postedAt', '1d')
            recency_score = float(self.calculate_recency_score(posted_at))
            
            # Popularity
            norm_pop = job_popularities[job_id] / max_pop

            features = {
                "semantic": float(semantic_scores[i]),
                "skills": skill_sim,
                "exp": float(self.calculate_experience_match(user_exp, row.get('required_experience', 2))),
                "loc": float(self.calculate_location_score(user_loc, row.get('location', ''))),
                "recency": recency_score
            }
            
            if is_cold_start:
                # 2. Cold Start Ranking Formula
                # Significant weight to recency (0.4) as per user request
                base_score = (0.45 * skill_sim) + (0.4 * recency_score) + (0.15 * norm_pop)
            else:
                # Hybrid score calculated using current weights (Level 5)
                base_score = sum(features[k] * self.global_weights[k] for k in features)

            # 🔥 "Very Big Boost" for New Jobs:
            days_old = 14 # default
            posted_str = str(posted_at).lower()
            if 'h' in posted_str or 'm' in posted_str:
                days_old = 0
            elif 'd' in posted_str:
                try: days_old = int(re.findall(r'\d+', posted_str)[0])
                except: pass
            
            # Massive multiplier for fresh content (Instagram/LinkedIn style)
            if days_old == 0:
                base_score *= 1.5 # 50% boost for today's jobs
            elif days_old < 3:
                base_score *= 1.3 # 30% boost for recent jobs (within 72h)
            elif days_old < 7:
                base_score *= 1.1 # 10% boost for past week jobs

            candidates.append({
                "id": job_id,
                "base_score": base_score,
                "feature_vector": [features[k] for k in ["semantic", "skills", "exp", "loc", "recency"]]
            })

        # Sort by hybrid score
        candidates = sorted(candidates, key=lambda x: x['base_score'], reverse=True)
        
        # 3. Model Layer (Level 3 Re-ranking)
        # Skip re-ranking for cold start as behavioral data is missing
        if not is_cold_start and self.is_trained:
            top_slice = candidates[:50]
            X = np.array([c['feature_vector'] for c in top_slice])
            probs = self.reranker.predict_proba(X)[:, 1]
            for i, c in enumerate(top_slice):
                c['score'] = float(probs[i])
            results = sorted(top_slice, key=lambda x: x['score'], reverse=True)
        else:
            # For cold start or untrained model, use base_score
            for c in candidates:
                c['score'] = c['base_score']
            results = candidates

        # 4. Exploration Boost (Diversity)
        # 70% highest match + 30% diverse/trending (random slice of high but not top)
        if is_cold_start and len(results) > 10:
            top_70_pct = int(20 * 0.7)
            top_matches = results[:top_70_pct]
            
            # Select diverse jobs from the rest (trending or just different)
            diverse_pool = results[top_70_pct:50] 
            np.random.shuffle(diverse_pool)
            diverse_matches = diverse_pool[:(20 - top_70_pct)]
            
            final_slice = top_matches + diverse_matches
        else:
            final_slice = results[:20]

        return [
            {"id": c['id'], "score": c['score'], "features": c['feature_vector']} 
            for c in final_slice
        ]

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
    """LEVEL 2-ish for Connections with Caching and Cold Start Strategy"""
    if others_df.empty: return []
    
    # Get source user data
    if isinstance(user_data, dict):
        profile_text = user_data.get('bio', '') or user_data.get('user_profile', '')
        user_skills = user_data.get('skills', [])
        user_industry = user_data.get('profession', '') or user_data.get('industry', '')
        user_id = user_data.get('id') or user_data.get('userId')
    else:
        profile_text = user_data if isinstance(user_data, str) else ""
        user_skills = []
        user_industry = ""
        user_id = None
        
    interaction_count = recommender.get_interaction_count(user_id)
    is_cold_start = interaction_count < 5

    # PERFORMANCE: Use global embedding cache for semantic similarity
    # We still use semantic similarity as part of the "pool" even in cold start
    user_embedding = recommender._get_embedding(profile_text).reshape(1, -1)
    other_texts = others_df['profile'].fillna('').tolist()
    other_embeddings = recommender._get_batch_embeddings(other_texts)
    
    cosine_sim = cosine_similarity(user_embedding, other_embeddings)[0]
    
    recommendations = []
    
    for i in range(len(others_df)):
        row = others_df.iloc[i]
        
        # Calculate Skill Similarity
        other_skills = row.get('skills', [])
        skill_sim = float(recommender.calculate_skill_overlap(user_skills, other_skills))
        
        # Calculate Industry Match
        other_industry = row.get('profession', '') or row.get('industry', '')
        industry_flag = 1.0 if (user_industry and other_industry and str(user_industry).lower() == str(other_industry).lower()) else 0.0

        if is_cold_start:
            # 🧠 Cold Start Connection Formula (Matched to Promp Requirements):
            # score = 0.6 * skills + 0.25 * industry_match + 0.15 * mutual_sim
            mutual_sim = 0.5 # Default simulated mutual commonality
            score = (0.6 * skill_sim) + (0.25 * industry_flag) + (0.15 * mutual_sim)
        else:
            # Fallback to semantic or hybrid if not cold start
            score = float(cosine_sim[i])
            
        if score > 0.1: # Threshold to keep results relevant
            recommendations.append({"id": int(row['id']), "score": score})

    return sorted(recommendations, key=lambda x: x['score'], reverse=True)[:25]
