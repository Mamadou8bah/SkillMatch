import pandas as pd
import numpy as np
from datetime import datetime, timezone

def map_profession_to_industry(profession):
    if profession is None or (isinstance(profession, float) and np.isnan(profession)) or not str(profession).strip():
        return "Other"
    
    prof = str(profession).lower()
    
    if any(kw in prof for kw in ['engineer', 'developer', 'tech', 'software', 'it', 'data', 'cloud', 'system']):
        return "Technology"
    if any(kw in prof for kw in ['nurse', 'doctor', 'physician', 'health', 'medical', 'clinic', 'hospital']):
        return "Healthcare"
    if any(kw in prof for kw in ['manager', 'admin', 'hr', 'human resources', 'business', 'operation', 'ceo', 'cto']):
        return "Business/Management"
    if any(kw in prof for kw in ['teacher', 'professor', 'educat', 'school', 'university', 'research', 'student']):
        return "Education"
    if any(kw in prof for kw in ['market', 'sales', 'advertis', 'brand', 'content']):
        return "Marketing/Sales"
    if any(kw in prof for kw in ['design', 'art', 'creat', 'ux', 'ui', 'graphic']):
        return "Creative/Design"
    if any(kw in prof for kw in ['finance', 'bank', 'account', 'invest', 'audit']):
        return "Finance"
    
    return "Other"

def compute_job_features(candidates_df, users_df, jobs_df, interactions_df, connections_df):
    """
    Features for (user, job) pairs:
    - skill_similarity (already in candidates_df or recompute)
    - cf_score (already in candidates_df)
    - popularity_score = (clicks + 2 * likes) / max(1, days_since_posted)
    - recency_score = exp(-lambda * days_since_posted)
    - social_score = number_of_user_connections_who_interacted_with_job
    - user_activity_score = log(1 + interactions_last_30_days)
    """
    now = datetime.now(timezone.utc)
    
    # 1. Job popularity and recency setup
    jobs_df['created_at'] = pd.to_datetime(jobs_df['created_at'], utc=True)
    jobs_df['days_since_posted'] = (now - jobs_df['created_at']).dt.days.clip(lower=1)
    
    interact_counts = interactions_df.groupby(['job_post_id', 'type']).size().unstack(fill_value=0)
    # Assume 'SAVE' acts as 'LIKE' for this formula
    clicks = interact_counts.get('CLICK', pd.Series(0, index=jobs_df['id']))
    saves = interact_counts.get('SAVE', pd.Series(0, index=jobs_df['id']))
    
    job_pop = ((clicks + 2 * saves) / jobs_df.set_index('id')['days_since_posted']).fillna(0)
    job_recency = np.exp(-0.1 * jobs_df.set_index('id')['days_since_posted'])
    
    # 2. User activity
    interactions_df['timestamp'] = pd.to_datetime(interactions_df['timestamp'], utc=True)
    last_30_days = (now - interactions_df['timestamp']).dt.days <= 30
    user_activity = np.log1p(interactions_df[last_30_days].groupby('user_id').size())
    
    # 3. Social score
    # Map of user_id -> set of connection_ids
    user_conns = {}
    for _, row in connections_df.iterrows():
        if row['accepted']:
            user_conns.setdefault(row['requester_id'], set()).add(row['target_id'])
            user_conns.setdefault(row['target_id'], set()).add(row['requester_id'])
            
    # Map of job_id -> set of users who interacted
    job_interaction_users = interactions_df.groupby('job_post_id')['user_id'].apply(set).to_dict()

    feature_list = []
    for _, row in candidates_df.iterrows():
        uid = int(row['user_id'])
        jid = int(row['job_id'])
        
        # Social score
        conns = user_conns.get(uid, set())
        interactors = job_interaction_users.get(jid, set())
        social_score = len(conns.intersection(interactors))
        
        feature_list.append({
            'user_id': uid,
            'job_id': jid,
            'skill_similarity': row.get('skill_similarity', 0),
            'cf_score': row.get('cf_score', 0),
            'interaction_sim_score': row.get('interaction_sim_score', 0),
            'popularity_score': job_pop.get(jid, 0),
            'recency_score': job_recency.get(jid, 0),
            'social_score': social_score,
            'user_activity_score': user_activity.get(uid, 0)
        })
        
    return pd.DataFrame(feature_list)

def compute_connection_features(users_df, connections_df, interactions_df):
    """
    Features for user pairs:
    - skill_similarity
    - mutual_connections_count
    - activity_score
    - popularity_score
    - same_industry_flag
    """
    # 1. Map of user_id -> set of connection_ids
    user_conns = {}
    for _, row in connections_df.iterrows():
        if row['accepted']:
            user_conns.setdefault(row['requester_id'], set()).add(row['target_id'])
            user_conns.setdefault(row['target_id'], set()).add(row['requester_id'])
    
    # 2. Popularity: sqrt(number of connections)
    popularity = {uid: np.sqrt(len(conns)) for uid, conns in user_conns.items()}
    
    # 3. Activity score
    now = datetime.now(timezone.utc)
    interactions_df['timestamp'] = pd.to_datetime(interactions_df['timestamp'], utc=True)
    recent = (now - interactions_df['timestamp']).dt.days <= 30
    activity = np.log1p(interactions_df[recent].groupby('user_id').size()).to_dict()

    # 4. Industry mapping
    users_df['mapped_industry'] = users_df['industry'].apply(map_profession_to_industry)

    # 5. Skill similarity setup (TF-IDF)
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    
    vectorizer = TfidfVectorizer()
    skills_matrix = vectorizer.fit_transform(users_df['skills'].fillna('').astype(str))
    
    # Candidate generation for connections: Users not already connected
    connection_features = []
    user_ids = users_df['id'].tolist()
    
    # For performance in batch, we might limit candidates (e.g., same industry or mutual connections)
    for i, uid_a in enumerate(user_ids):
        conns_a = user_conns.get(uid_a, set())
        for j, uid_b in enumerate(user_ids):
            if uid_a == uid_b or uid_b in conns_a:
                continue
            
            # Mutual connections
            conns_b = user_conns.get(uid_b, set())
            mutual_count = len(conns_a.intersection(conns_b))
            
            # Filter: only consider if they have mutual connections or same industry to keep it offline-tractable
            industry_a = users_df.iloc[i]['mapped_industry']
            industry_b = users_df.iloc[j]['mapped_industry']
            same_industry = 1 if industry_a == industry_b and industry_a != "Other" else 0
            
            if mutual_count > 0 or same_industry:
                # Skill similarity
                sim = cosine_similarity(skills_matrix[i], skills_matrix[j])[0][0]
                
                connection_features.append({
                    'user_id': uid_a,
                    'recommended_user_id': uid_b,
                    'skill_similarity': sim,
                    'mutual_connections_count': mutual_count,
                    'activity_score': activity.get(uid_b, 0),
                    'popularity_score': popularity.get(uid_b, 0),
                    'same_industry_flag': same_industry
                })
                
    return pd.DataFrame(connection_features)
