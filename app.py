from flask import Flask, render_template, request, jsonify
import subprocess
import aria2p
import os
import json
import requests
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
                config = json.load(f)
                if 'repositories' not in config:
                    config['repositories'] = []
                return config
        except json.JSONDecodeError:
            print(f"Uhmm Json is broken 3: ")
        
    return {"default_download_path": "", "repositories": []}

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

@app.route('/repo', methods=["GET", "POST"])
def repo():
    return render_template('repo.html')

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
    split_value = data.get('split')

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

    if split_value in [8, 16]:
        options['split'] = str(split_value)
        options['max-connection-per-server'] = str(split_value)

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

@app.route('/api/pause', methods=["POST"])
def pause():
    if not api:
        return jsonify({"error": "aria2c daemon is offline"}), 503
    try:
        api.pause_all()
        return jsonify({"success": True, "message": "STOP! all possed :3!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/pause-single', methods=["POST"])
def pause_single():
    if not api:
        return jsonify({"error": "aria2c daemon is offline"}), 503
        
    data = request.get_json() or {}
    gid = data.get('gid')
    
    if not gid:
        return jsonify({"error": "GID is required"}), 400
        
    try:
        download = api.get_download(gid)
        download.pause()
        return jsonify({"success": True, "message": f"Paused download {gid}!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/resume', methods=["POST"])
def resume():
    if not api:
        return jsonify({"error": "aria2c daemon is offline"}), 503
    try:
        api.resume_all()
        return jsonify({"success": True, "message": "Everything Resumed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/resume-single', methods=["POST"])
def resume_single():
    if not api:
        return jsonify({"error": "aria2c daemon is offline"}), 503
        
    data = request.get_json() or {}
    gid = data.get('gid')
    
    if not gid:
        return jsonify({"error": "GID is required"}), 400
        
    try:
        download = api.get_download(gid)
        download.resume()
        return jsonify({"success": True, "message": f"Resumed download {gid}!"})
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

@app.route('/api/repos', methods=['GET', 'POST', 'DELETE'])
def handle_repos():
    config = load_config()
    
    if request.method == 'GET':
        return jsonify(config.get('repositories', []))
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        repo_url = data.get('url', '').strip()
        
        if not repo_url:
            return jsonify({"error": "URL is required"}), 400
            
        if repo_url not in config['repositories']:
            config['repositories'].append(repo_url)
            save_config(config)
            
        return jsonify({"success": True, "repositories": config['repositories']})
        
    elif request.method == 'DELETE':
        data = request.get_json() or {}
        repo_url = data.get('url')
        
        if repo_url in config['repositories']:
            config['repositories'].remove(repo_url)
            save_config(config)
            
        return jsonify({"success": True, "repositories": config['repositories']})
        
@app.route('/api/check-frame', methods=['GET'])
def check_frame():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400
        
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        
        response = requests.head(url, headers=headers, allow_redirects=True, timeout=5)
        
        if response.status_code == 405:
            response = requests.get(url, headers=headers, stream=True, timeout=5)
            
        res_headers = response.headers
        x_frame_options = res_headers.get('X-Frame-Options', '').upper()
        csp = res_headers.get('Content-Security-Policy', '').lower()
        
        can_frame = True

        if 'DENY' in x_frame_options or 'SAMEORIGIN' in x_frame_options:
            can_frame = False

        if 'frame-ancestors' in csp:
            can_frame = False
            
        return jsonify({"can_frame": can_frame})
        
    except requests.exceptions.RequestException:
        return jsonify({"can_frame": False})

if __name__ == '__main__':
    print("Server Started...")
    app.run(debug=True, host="0.0.0.0", port=5333) 