from flask import Flask, request, jsonify
import pandas as pd
import os
import gc

# MEMORY OPTIMIZATION: Limit parallelism
os.environ["MALLOC_ARENA_MAX"] = "2"

from recommender import recommender, get_job_recommendations, get_candidate_recommendations, get_connection_recommendations

app = Flask(__name__)

# Standard alias for WSGI servers
application = app 

@app.route('/')
def basic_health():
    """Health check endpoint as requested"""
    return "Service is running", 200

@app.route('/health')
def health_check():
    """Detailed health check"""
    return jsonify({
        "status": "healthy",
        "service": "SkillMatch ML Engine",
        "model": "all-MiniLM-L6-v2",
        "quantization": "8-bit"
    }), 200

@app.route('/embeddings', methods=['POST'])
def get_embeddings():
    """Return embeddings as JSON"""
    try:
        data = request.json
        if not data or 'texts' not in data:
            return jsonify({"error": "Missing 'texts' in request body"}), 400
            
        texts = data.get('texts', [])
        if not isinstance(texts, list):
            texts = [texts]
            
        embeddings = recommender._get_batch_embeddings(texts)
        return jsonify({
            "embeddings": embeddings.tolist(),
            "model": "all-MiniLM-L6-v2"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommend/jobs', methods=['POST'])
def recommend_jobs():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Missing request body"}), 400
            
        # Successor: support both string 'user_profile' and dict 'user_data'
        user_input = data.get('user_data') or data.get('user_profile', '')
        jobs_data = data.get('jobs', [])
        
        if not jobs_data:
            return jsonify([])
            
        jobs_df = pd.DataFrame(jobs_data)
        recommendations = get_job_recommendations(user_input, jobs_df)
        
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommend/candidates', methods=['POST'])
def recommend_candidates():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Missing request body"}), 400
            
        job_description = data.get('job_description', '')
        candidates_data = data.get('candidates', [])
        
        if not candidates_data:
            return jsonify([])
            
        candidates_df = pd.DataFrame(candidates_data)
        recommendations = get_candidate_recommendations(job_description, candidates_df)
        
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/track/interaction', methods=['POST'])
def track_interaction():
    """LEVEL 4: Feedback Loop endpoint"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Missing request body"}), 400
        # Expected: { "user_id": 1, "job_id": 5, "type": "CLICK", "features": [0.8, 0.5, ...] }
        success = recommender.record_interaction(data)
        return jsonify({"status": "success" if success else "failed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/config/weights', methods=['GET', 'POST'])
def handle_weights():
    """LEVEL 5: Personalization / Manual weight overrides"""
    try:
        if request.method == 'POST':
            new_weights = request.json
            if not new_weights:
                return jsonify({"error": "Missing request body"}), 400
            recommender.global_weights.update(new_weights)
            recommender.save_model()
            return jsonify({"status": "success", "weights": recommender.global_weights})
        return jsonify(recommender.global_weights)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommend/similar-users', methods=['POST'])
def recommend_similar_users():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Missing request body"}), 400
        user_profile = data.get('user_profile', '')
        others_data = data.get('others', [])
        
        if not others_data:
            return jsonify([])
            
        others_df = pd.DataFrame(others_data)
        recommendations = get_connection_recommendations(user_profile, others_df)
        
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
