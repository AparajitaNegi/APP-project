from flask import Flask, send_from_directory, jsonify, request
import os
import time
import tempfile
import requests
import sys

HACKATHON_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Hackathon', 'Hackathon'))
if HACKATHON_DIR not in sys.path:
    sys.path.append(HACKATHON_DIR)

try:
    from predictor import predict_file as get_prediction
except ImportError:
    print("Warning: Could not import 'get_prediction' from 'predictor.py'. The /scan endpoint will not work.")
    def get_prediction(file_path):
        return {'error': 'Prediction model not available.'}

app = Flask(__name__, static_folder='.', static_url_path='')


@app.route('/')
def home():
    return send_from_directory('.', 'index.html')


def get_live_f1_data():
    """
    Fetches the current F1 driver standings from the Ergast API.
    """
    try:
        # Using the Ergast API for current driver standings. It's reliable year-round.
        url = 'https://ergast.com/api/f1/current/driverStandings.json'
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        standings_list = data.get('MRData', {}).get('StandingsTable', {}).get('StandingsLists', [])
        if not standings_list:
            print("Warning: Could not parse standings from Ergast API.")
            return []

        driver_standings = standings_list[0].get('DriverStandings', [])

        leaderboard = []
        for standing in driver_standings:
            driver = standing.get('Driver', {})
            constructor = standing.get('Constructors', [{}])[0]
            leaderboard.append({
                "position": standing.get('position'),
                "driver": f"{driver.get('givenName')} {driver.get('familyName')}",
                "team": constructor.get('name'),
                "points": standing.get('points'),
                "wins": standing.get('wins'),
            })

        return leaderboard

    except requests.exceptions.RequestException as e:
        print(f"Error fetching F1 standings from Ergast API: {e}")
        return []


@app.route('/leaderboard')
def get_leaderboard():
    data = get_live_f1_data()
    return jsonify(data)


@app.route('/scan', methods=['POST'])
def scan_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        result = get_prediction(tmp_path)
        if 'error' in result:
            return jsonify(result), 500

        is_malicious = result.get('prediction') == 'Malicious'
        return jsonify({"isMalicious": is_malicious, "confidence": result.get('confidence')})
    finally:
        os.remove(tmp_path)


if __name__ == '__main__':
    app.run(debug=True, port=5001)
