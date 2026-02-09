from flask import Flask, request, jsonify
import pandas as pd
import torch
import os

# MEMORY OPTIMIZATION: Limit torch threads
torch.set_num_threads(1)

from recommender import recommender, get_job_recommendations, get_candidate_recommendations, get_connection_recommendations

app = Flask(__name__)

# Standard alias for WSGI servers
application = app 

@app.route('/')
@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "SkillMatch ML Engine",
        "model": "all-MiniLM-L6-v2"
    }), 200

@app.route('/recommend/jobs', methods=['POST'])
def recommend_jobs():
    data = request.json
    # Successor: support both string 'user_profile' and dict 'user_data'
    user_input = data.get('user_data') or data.get('user_profile', '')
    jobs_data = data.get('jobs', [])
    
    if not jobs_data:
        return jsonify([])
        
    jobs_df = pd.DataFrame(jobs_data)
    recommendations = get_job_recommendations(user_input, jobs_df)
    return jsonify(recommendations)

@app.route('/recommend/candidates', methods=['POST'])
def recommend_candidates():
    data = request.json
    job_description = data.get('job_description', '')
    candidates_data = data.get('candidates', [])
    
    if not candidates_data:
        return jsonify([])
        
    candidates_df = pd.DataFrame(candidates_data)
    recommendations = get_candidate_recommendations(job_description, candidates_df)
    return jsonify(recommendations)

@app.route('/track/interaction', methods=['POST'])
def track_interaction():
    """LEVEL 4: Feedback Loop endpoint"""
    data = request.json
    # Expected: { "user_id": 1, "job_id": 5, "type": "CLICK", "features": [0.8, 0.5, ...] }
    success = recommender.record_interaction(data)
    return jsonify({"status": "success" if success else "failed"})

@app.route('/config/weights', methods=['GET', 'POST'])
def handle_weights():
    """LEVEL 5: Personalization / Manual weight overrides"""
    if request.method == 'POST':
        new_weights = request.json
        recommender.global_weights.update(new_weights)
        recommender.save_model()
        return jsonify({"status": "success", "weights": recommender.global_weights})
    return jsonify(recommender.global_weights)

@app.route('/recommend/similar-users', methods=['POST'])
def recommend_similar_users():
    data = request.json
    user_profile = data.get('user_profile', '')
    others_data = data.get('others', [])
    
    if not others_data:
        return jsonify([])
        
    others_df = pd.DataFrame(others_data)
    recommendations = get_connection_recommendations(user_profile, others_df)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
