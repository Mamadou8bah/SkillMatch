from flask import Flask, request, jsonify
import pandas as pd
from recommender import get_job_recommendations, get_candidate_recommendations, get_connection_recommendations

app = Flask(__name__)

@app.route('/recommend/jobs', methods=['POST'])
def recommend_jobs():
    data = request.json
    user_profile = data.get('user_profile', '')
    jobs_data = data.get('jobs', [])
    
    if not jobs_data:
        return jsonify([])
        
    jobs_df = pd.DataFrame(jobs_data)
    recommendations = get_job_recommendations(user_profile, jobs_df)
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
