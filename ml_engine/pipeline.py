import pandas as pd
import numpy as np
from data_loader import DataLoader
from candidate_gen import CandidateGenerator
from features import compute_job_features, compute_connection_features
from models import RankingModel, prepare_training_labels
from datetime import datetime

def run_job_recommendation_pipeline(train=False):
    db = DataLoader()
    print("Loading data...")
    users = db.get_users()
    jobs = db.get_jobs()
    interactions = db.get_interactions()
    connections = db.get_connections()

    print("Generating candidates...")
    gen = CandidateGenerator(users, jobs, interactions)
    candidates = gen.generate_all_candidates()

    print("Engineering features...")
    features = compute_job_features(candidates, users, jobs, interactions, connections)

    # Cold Start Logic (Part 3)
    # 1. If user has no interaction history, ignore CF (covered by generate_all_candidates returning 0)
    # 2. Increase weight of skill_similarity for new users implicitly by Logistic Regression 
    #    learning high coef for similarity. 
    # 3. Apply temporary recency boost for new jobs (handled in features.py by exp(-lambda * days))

    model = RankingModel(model_type='job')
    
    X = features.drop(['user_id', 'job_id'], axis=1)
    
    if train:
        print("Training model...")
        y = prepare_training_labels(features, interactions, item_col='job_id')
        model.train(X, y)

    print("Scoring...")
    features['score'] = model.predict_probs(X)
    
    # Sort and rank top 20
    recommendations = features.sort_values(['user_id', 'score'], ascending=[True, False])
    recommendations['rank'] = recommendations.groupby('user_id').cumcount() + 1
    top_20 = recommendations[recommendations['rank'] <= 20][['user_id', 'job_id', 'score', 'rank']]
    
    print(f"Saving {len(top_20)} recommendations to database...")
    db.save_recommendations(top_20, 'job_recommendations')

def run_connection_recommendation_pipeline(train=False):
    db = DataLoader()
    users = db.get_users()
    connections = db.get_connections()
    interactions = db.get_interactions()

    print("Engineering connection features...")
    features = compute_connection_features(users, connections, interactions)
    
    if features.empty:
        print("No connection candidates found.")
        return

    model = RankingModel(model_type='connection')
    X = features.drop(['user_id', 'recommended_user_id'], axis=1)

    if train:
        print("Training connection model...")
        # For connections, y=1 if they connected in the past
        connected_pairs = set(zip(connections['requester_id'], connections['target_id']))
        y = features.apply(lambda x: 1 if (x['user_id'], x['recommended_user_id']) in connected_pairs else 0, axis=1)
        model.train(X, y)

    features['score'] = model.predict_probs(X)
    
    # Rank top 15
    recommendations = features.sort_values(['user_id', 'score'], ascending=[True, False])
    recommendations['rank'] = recommendations.groupby('user_id').cumcount() + 1
    top_15 = recommendations[recommendations['rank'] <= 15][['user_id', 'recommended_user_id', 'score', 'rank']]
    
    db.save_recommendations(top_15, 'connection_recommendations')

if __name__ == "__main__":
    # Usually run via cron
    # Retrain models weekly (passed as arg), recompute nightly
    import sys
    retrain = '--train' in sys.argv
    run_job_recommendation_pipeline(train=retrain)
    run_connection_recommendation_pipeline(train=retrain)
