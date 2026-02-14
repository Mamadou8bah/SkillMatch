import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse.linalg import svds
from scipy.sparse import csr_matrix

class CandidateGenerator:
    def __init__(self, users_df, jobs_df, interactions_df):
        self.users = users_df
        self.jobs = jobs_df
        self.interactions = interactions_df

    def get_content_based_candidates(self, top_n=100):
        """Skill similarity using TF-IDF + Cosine Similarity"""
        # Prepare text: user skills vs job required skills
        user_skills = self.users['skills'].fillna('').astype(str)
        job_skills = self.jobs['skills_required'].fillna('').astype(str)
        
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(pd.concat([user_skills, job_skills]))
        
        user_vectors = tfidf_matrix[:len(self.users)]
        job_vectors = tfidf_matrix[len(self.users):]
        
        similarity = cosine_similarity(user_vectors, job_vectors)
        
        candidates = []
        for i, user_id in enumerate(self.users['id']):
            # Get top N jobs for this user
            top_indices = similarity[i].argsort()[-top_n:][::-1]
            for idx in top_indices:
                candidates.append({
                    'user_id': user_id,
                    'job_id': self.jobs.iloc[idx]['id'],
                    'skill_similarity': similarity[i][idx]
                })
        return pd.DataFrame(candidates)

    def get_collaborative_candidates(self, top_n=100):
        """Collaborative filtering using SVD"""
        if self.interactions.empty:
            return pd.DataFrame(columns=['user_id', 'job_id', 'cf_score'])

        # Create interaction matrix
        # Weighting: APPLICATION=5, SAVE=3, CLICK=1
        weights = {'APPLICATION': 5, 'SAVE': 3, 'CLICK': 1, 'VIEW': 1}
        self.interactions['weight'] = self.interactions['type'].map(weights).fillna(1)
        
        # Group by user and job to get total interaction strength
        interact_matrix_df = self.interactions.groupby(['user_id', 'job_post_id'])['weight'].sum().reset_index()
        
        # Pivot
        pivot_table = interact_matrix_df.pivot(index='user_id', columns='job_post_id', values='weight').fillna(0)
        matrix = pivot_table.values
        user_ids = pivot_table.index.tolist()
        job_ids = pivot_table.columns.tolist()

        # SVD
        # k = min(matrix.shape) - 1 if min(matrix.shape) < 50 else 50
        k = min(matrix.shape[0], matrix.shape[1], 20) # Lower k for small datasets
        if k < 1: return pd.DataFrame(columns=['user_id', 'job_id', 'cf_score'])
        
        U, sigma, Vt = svds(matrix, k=k)
        sigma = np.diag(sigma)
        predicted_ratings = np.dot(np.dot(U, sigma), Vt)
        
        preds_df = pd.DataFrame(predicted_ratings, columns=job_ids, index=user_ids)
        
        candidates = []
        for user_id in user_ids:
            user_preds = preds_df.loc[user_id].sort_values(ascending=False).head(top_n)
            for job_id, score in user_preds.items():
                candidates.append({
                    'user_id': user_id,
                    'job_id': job_id,
                    'cf_score': score
                })
        return pd.DataFrame(candidates)

    def generate_all_candidates(self):
        cb_cands = self.get_content_based_candidates()
        cf_cands = self.get_collaborative_candidates()
        
        # Merge candidates
        all_cands = pd.merge(cb_cands, cf_cands, on=['user_id', 'job_id'], how='outer').fillna(0)
        return all_cands
