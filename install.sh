#!/bin/bash

# Configuration
REPO_URL="https://github.com/aquafrostbyte/flashdash.git"
DIR_NAME="FlashDash"

echo "=========================================="
echo "    FlashDash Automated Installer        "
echo "=========================================="

# 1. Check for required system tools
MISSING_TOOLS=()

if ! command -v python3 &> /dev/null; then
    MISSING_TOOLS+=("python3")
fi

if ! command -v git &> /dev/null; then
    MISSING_TOOLS+=("git")
fi

if ! command -v aria2c &> /dev/null; then
    MISSING_TOOLS+=("aria2c")
fi

# Exit early if system prerequisites are missing
if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    echo -e "\n[!] Error: The following required system dependencies are missing:"
    for tool in "${MISSING_TOOLS[@]}"; do
        echo "    - $tool"
    done
    echo -e "\nPlease install them via your system's package manager and run this script again.\n"
    exit 1
fi

echo "[✓] System check passed (python3, git, and aria2c found)."

# 2. Clone repository if not already present
if [ -d "$DIR_NAME" ]; then
    echo "[+] Directory '$DIR_NAME' already exists. Navigating inside..."
    cd "$DIR_NAME" || exit 1
else
    echo "[+] Cloning repository..."
    git clone "$REPO_URL" "$DIR_NAME"
    cd "$DIR_NAME" || exit 1
fi

# 3. Create Python virtual environment
if [ ! -d "venv" ]; then
    echo "[+] Creating virtual environment..."
    python3 -m venv venv
else
    echo "[✓] Virtual environment already exists."
fi

# 4. Activate venv & install Python dependencies
echo "[+] Activating virtual environment and installing packages..."
source venv/bin/activate
pip install --upgrade pip --quiet
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "[!] Warning: requirements.txt not found!"
fi

# Ensure gunicorn is installed for the systemd service
pip install gunicorn --quiet

# 5. Start aria2c daemon in background (if not already running)
echo "[+] Checking aria2c RPC daemon status..."
if pgrep -x "aria2c" > /dev/null; then
    echo "[✓] aria2c daemon is already running."
else
    echo "[+] Starting aria2c daemon..."
    aria2c --enable-rpc --rpc-listen-all=false --daemon=true
    echo "[✓] aria2c daemon launched successfully."
fi

# 6. Service Installation Prompt
echo "=========================================="
read -p "Do you want to install FlashDash as a systemd background service? (y/N) " install_service
echo "=========================================="

if [[ "$install_service" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # Exit immediately if a command exits with a non-zero status
    set -e

    SERVICE_NAME="FlashDash"
    SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
    PROJECT_DIR=$(pwd)
    VENV_DIR="${PROJECT_DIR}/venv"
    CURRENT_USER=$(whoami)

    echo "[+] Setting up systemd service for ${SERVICE_NAME} (Publicly accessible)..."
    echo "[!] Note: You will be prompted for your sudo password."

    # Create the service file content and write it to the destination
    sudo tee ${SERVICE_FILE} > /dev/null <<EOF
[Unit]
Description=Gunicorn instance to serve FlashDash Flask app openly
After=network.target

[Service]
User=${CURRENT_USER}
WorkingDirectory=${PROJECT_DIR}
Environment="PATH=${VENV_DIR}/bin"
# Bound to 0.0.0.0 to allow external traffic
ExecStart=${VENV_DIR}/bin/gunicorn --workers 3 --bind 0.0.0.0:5333 app:app

[Install]
WantedBy=multi-user.target
EOF

    echo "[✓] Service file created at ${SERVICE_FILE}"

    # Reload systemd to recognize the new service
    echo "[+] Reloading systemd daemon..."
    sudo systemctl daemon-reload

    # Enable the service so it starts on boot
    echo "[+] Enabling ${SERVICE_NAME} service..."
    sudo systemctl enable ${SERVICE_NAME}

    # Restart the service to apply changes if it was already running
    echo "[+] Starting/Restarting ${SERVICE_NAME}..."
    sudo systemctl restart ${SERVICE_NAME}

    echo "[✓] Done! Your app is now live and accessible externally on port 5333."

else
    # 7. Fallback to foreground execution
    echo "[+] Launching FlashDash in the foreground..."
    python3 app.py
fi
