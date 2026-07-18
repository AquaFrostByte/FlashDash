from flask import Flask, render_template, request, jsonify
import subprocess
import aria2p
import os
import json
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

api = aria2p.API(
    aria2p.Client(
        host=os.getenv("ARIA2_RPC_HOST", "http://localhost"),
        port=int(os.getenv("ARIA2_RPC_PORT", 6800)),
        secret=os.getenv("ARIA2_RPC_SECRET"),
    )
)

CONFIG_FILE = 'config.json'
# DONT TOUCH THIS JUST PRAY THAT IT WORKS : AI SOLUTION WAS TRASH SO DONT TOUCH IT IF IT WORSISH NOW!!!
def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"Uhmm Json is broken 3: ")
        
    return {"default_download_path":""}

def save_config(config):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=4)

def download(download_link):
    download = api.add_uris([download_link])
    return f"Added {download.name}"


@app.route('/', methods=["GET", "POST"])
def index():
    output = ""
    if request.method == "POST":
        link = request.form.get("download_link", "").strip()
        if link:
            output = download(link)
    return render_template('index.html', output=output)

@app.route('/settings', methods=["GET", "POST"])
def settings():
    output = ""
    if request.method == "POST":
        link = request.form.get("download_link", "").strip()
        if link:
            output = download(link)
    return render_template('settings.html', output=output)

@app.route('/api/downloads')
def get_downloads():
    if not api:
        return jsonify({"error": "aria2c daemon is offline"}), 503

    downloads_data = []
    try:
        downloads = api.get_downloads()
        
        for d in downloads:

            file_name = d.name

            if not file_name or file_name == "Retrieving metadata...":
                if d.files and len(d.files) > 0:
                    first_file_path = d.files[0].path
                    if first_file_path:
                        file_name = os.path.basename(first_file_path)
            
            if not file_name:
                file_name = f"Download (GID: {d.gid[:6]})"
            downloads_data.append({
                "gid": d.gid,
                "name": file_name, 
                "status": d.status,
                "progress": round(d.progress, 2),
                "download_speed": d.download_speed_string(),
                "eta": d.eta_string(),
                "total_length": d.total_length_string(),
                "completed_length": d.completed_length_string(),

                "error_code": d.error_code,
                "error_message": d.error_message if d.status == "error" else ""
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(downloads_data)

@app.route('/api/add-download', methods=['POST'])
def add_download():
    if not api:
        return jsonify({"error": "aria2c daeom is offline"}), 503

    data = request.get_json() or {}
    download_link = data.get('download_link')
    download_path = data.get('download_path')

    if not download_link:
        return jsonify({"error": "Download link is required"}), 400

    options = {}
    if download_path:
        options['dir'] = os.path.abspath(download_path)
    else:
        config = load_config()
        default_path = config.get('default_download_path')
        if default_path:
            options['dir'] = os.path.abspath(default_path)

    try:
        download = api.add_uris([download_link], options=options)
        return jsonify({"success": True, "gid": download.gid})

    except Exception as e:
        return jsonify({"error": f"Faild to add {str(e)}"}), 500

@app.route('/api/purge', methods=["POST"])
def purge_downloads():
    if not api:
        return jsonify({"error": "aria2c daemon is offline"}), 503
    try:
        api.purge()
        return jsonify({"success": True, "message": "I killed them All!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['GET','POST'])
def handle_settings():
    if request.method == 'GET':
        config = load_config()
        return jsonify(config)
    elif request.method == 'POST':
        data = request.get_json()
        if not data or 'default_download_path' not in data:
            return jsonify({"error":"No download dir??? like bro"})

        config = load_config() 
        config['default_download_path'] = data['default_download_path']
        save_config(config)
        return jsonify({"success":True,"message":"Settings saved :3!"})

if __name__ == '__main__':
    print("Server Started...")
    app.run(debug=True, host="0.0.0.0", port=5333) 