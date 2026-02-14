import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
import os

class RankingModel:
    def __init__(self, model_type='job'):
        self.model_type = model_type
        self.model_path = f'models/{model_type}_ranker.joblib'
        self.model = None
        
        if not os.path.exists('models'):
            os.makedirs('models')

    def train(self, X, y):
        # Ensure we have at least 2 classes for training
        if len(np.unique(y)) < 2:
            print(f"Skipping training for {self.model_type}: not enough interaction data (need at least 2 classes, found {len(np.unique(y))})")
            return
            
        self.model = LogisticRegression(class_weight='balanced')
        self.model.fit(X, y)
        joblib.dump(self.model, self.model_path)
        print(f"Model saved to {self.model_path}")

    def load(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            return True
        return False

    def predict_probs(self, X):
        if self.model is None:
            if not self.load():
                # Return neutral probabilities if no model
                return [0.5] * len(X)
        return self.model.predict_proba(X)[:, 1]

def prepare_training_labels(features_df, interactions_df, item_col='job_id'):
    """
    y = 1 if clicked or applied, 0 otherwise
    """
    # Create a set of (user, item) pairs that had engagement
    engaged_types = ['CLICK', 'SAVE', 'APPLICATION']
    engaged_pairs = set(zip(
        interactions_df[interactions_df['type'].isin(engaged_types)]['user_id'],
        interactions_df[interactions_df['type'].isin(engaged_types)]['job_post_id' if item_col=='job_id' else 'target_id']
    ))
    
    y = features_df.apply(lambda x: 1 if (x['user_id'], x[item_col]) in engaged_pairs else 0, axis=1)
    return y
