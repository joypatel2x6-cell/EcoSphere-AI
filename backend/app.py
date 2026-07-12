import os
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='../frontend', static_url_path='')

# Expose live ESG stats
@app.route('/api/esg-stats', methods=['GET'])
def get_esg_stats():
    return jsonify({
        "overall_score": 91.2,
        "environmental": {
            "score": 92.0,
            "trend": "+4.2% YoY",
            "scope_1_2": 7840,
            "target": 7500
        },
        "social": {
            "score": 84.0,
            "volunteer_hours": 4280,
            "volunteer_target": 4000
        },
        "governance": {
            "score": 98.0,
            "compliance_index": 98.2,
            "active_flags": 1
        }
    })

# Expose carbon forecast
@app.route('/api/carbon-forecast', methods=['GET'])
def get_carbon_forecast():
    return jsonify({
        "months": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        "historical": [12000, 11800, 11500, 11200, 10800, 10500, 10200],
        "projected_baseline": [10200, 9800, 9400, 9000, 8500, 8000],
        "electrification_reduction": -0.068
    })

# Expose mock logs
@app.route('/api/activity-logs', methods=['GET'])
def get_activity_logs():
    return jsonify([
        {"time": "Just now", "id": "LOG-88401", "type": "Policy Acknowledgment", "user": " Joy Patel", "details": "Approved G3.2 Anti-Bribery", "status": "Success"},
        {"time": "10 mins ago", "id": "LOG-19342", "type": "Carbon Calculation", "user": "System Scheduler", "details": "Q2 logs recalculated", "status": "Success"},
        {"time": "2 hours ago", "id": "LOG-04183", "type": "Export Generated", "user": "Joy Patel", "details": "Environmental.pdf downloaded", "status": "Success"}
    ])

# Serve static web application
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
