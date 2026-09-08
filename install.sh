#!/bin/bash

# Configuration
REPO_URL="https://github.com/aquafrostbyte/flashdash.git"
DIR_NAME="FlashDash"

echo "=========================================="
echo "    FlashDash Automated Installer        "
echo "=========================================="

# 1. Check for required system tools
MISSING_TOOLS=()

# Check for python3 AND its venv module (Debian separates them)
if ! command -v python3 &> /dev/null || ! python3 -c "import venv" &> /dev/null; then
    MISSING_TOOLS+=("python3")
fi

if ! command -v git &> /dev/null; then
    MISSING_TOOLS+=("git")
fi

if ! command -v aria2c &> /dev/null; then
    MISSING_TOOLS+=("aria2c")
fi

# 2. Auto-Install missing dependencies
if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    echo -e "\n[!] The following required system dependencies are missing:"
    for tool in "${MISSING_TOOLS[@]}"; do
        echo "    - $tool"
    done
    echo -e "\n[+] Attempting to install them automatically (you may be prompted for your sudo password)..."

    # Map commands to correct package names based on the package manager
    PACKAGES_TO_INSTALL=()
    for tool in "${MISSING_TOOLS[@]}"; do
        if [ "$tool" == "python3" ]; then
            if command -v apt &> /dev/null || command -v apt-get &> /dev/null; then
                PACKAGES_TO_INSTALL+=("python3" "python3-venv")
            elif command -v pacman &> /dev/null; then
                PACKAGES_TO_INSTALL+=("python")
            else
                PACKAGES_TO_INSTALL+=("python3")
            fi
        elif [ "$tool" == "aria2c" ]; then
            PACKAGES_TO_INSTALL+=("aria2")
        else
            PACKAGES_TO_INSTALL+=("$tool")
        fi
    done

    # Detect package manager and install
    if command -v apt &> /dev/null; then
        echo "[+] Detected Debian/Ubuntu based system (apt)"
        sudo apt update
        sudo apt install -y "${PACKAGES_TO_INSTALL[@]}"
    elif command -v dnf &> /dev/null; then
        echo "[+] Detected Fedora/RHEL based system (dnf)"
        sudo dnf install -y "${PACKAGES_TO_INSTALL[@]}"
    elif command -v pacman &> /dev/null; then
        echo "[+] Detected Arch based system (pacman)"
        sudo pacman -Sy --noconfirm "${PACKAGES_TO_INSTALL[@]}"
    else
        echo "[!] Error: Unsupported package manager. Please install the missing tools manually."
        exit 1
    fi

    # Verify installation succeeded
    for tool in "${MISSING_TOOLS[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            if [[ "$tool" == "python3" ]] && ! python3 -c "import venv" &> /dev/null; then
                echo "[!] Error: python venv module still missing."
                exit 1
            elif [[ "$tool" != "python3" ]]; then
                echo "[!] Error: Failed to install $tool. Please check your system and try again."
                exit 1
            fi
        fi
    done
    echo "[✓] Missing dependencies installed successfully."
else
    echo "[✓] System check passed (python3, git, and aria2c found)."
fi

# 3. Clone repository if not already present
if [ -d "$DIR_NAME" ]; then
    echo "[+] Directory '$DIR_NAME' already exists. Navigating inside..."
    cd "$DIR_NAME" || exit 1
else
    echo "[+] Cloning repository..."
    git clone "$REPO_URL" "$DIR_NAME"
    cd "$DIR_NAME" || exit 1
fi

# 4. Create Python virtual environment
if [ ! -d "venv" ]; then
    echo "[+] Creating virtual environment..."
    python3 -m venv venv
else
    echo "[✓] Virtual environment already exists."
fi

# 5. Activate venv & install Python dependencies
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

# 6. Start aria2c daemon in background (if not already running)
echo "[+] Checking aria2c RPC daemon status..."
if pgrep -x "aria2c" > /dev/null; then
    echo "[✓] aria2c daemon is already running."
else
    echo "[+] Starting aria2c daemon..."
    aria2c --enable-rpc --rpc-listen-all=false --daemon=true
    echo "[✓] aria2c daemon launched successfully."
fi

# 7. Service Installation Prompt
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
    # 8. Fallback to foreground execution
    echo "[+] Launching FlashDash in the foreground..."
    python3 app.py
fi