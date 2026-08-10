#!/bin/bash
# THis script got tested on Arch Linux as well as Debian 15. IF it dosent work please write mn! Also iam not responsible for any damage, it should inflict any but still. This script also needs root premissions to work :C
# Exit immediately if a command exits with a non-zero status
set -e

# Define variables these can be changed if u want but i wouldnt recommend it
SERVICE_NAME="FlashDash"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
PROJECT_DIR=$(pwd)
VENV_DIR="${PROJECT_DIR}/.venv"
USER=$(whoami)

echo "Setting up systemd service for ${SERVICE_NAME} (Publicly accessible)..."

# Create the service file content and write it to the destination
sudo tee ${SERVICE_FILE} > /dev/null <<EOF
[Unit]
Description=Gunicorn instance to serve FlashDash Flask app openly
After=network.target

[Service]
User=${USER}
WorkingDirectory=${PROJECT_DIR}
Environment="PATH=${VENV_DIR}/bin"
# Bound to 0.0.0.0 to allow external traffic
ExecStart=${VENV_DIR}/bin/gunicorn --workers 3 --bind 0.0.0.0:5333 app:app

[Install]
WantedBy=multi-user.target
EOF

echo "Service file created at ${SERVICE_FILE}"

# Reload systemd to recognize the new service
echo "Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable the service so it starts on boot
echo "Enabling ${SERVICE_NAME} service..."
sudo systemctl enable ${SERVICE_NAME}

# Restart the service to apply changes if it was already running
echo "Starting/Restarting ${SERVICE_NAME}..."
sudo systemctl restart ${SERVICE_NAME}

echo "Done! Your app is now live and accessible externally on port 5333."