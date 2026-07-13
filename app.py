from flask import Flask, render_template, request
import subprocess
import aria2p
import os
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

if __name__ == '__main__':
    print("Server Started...")
    app.run(debug=True, host="0.0.0.0", port=5333) 