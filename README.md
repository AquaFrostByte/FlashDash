# FlashDash
First of all, I don't condone piracy, and this program should not be used for piracy!
Where you get the download resources from is not my problem, and I won't add any resources on where to get the download repositories from!

## What is FlashDash?
Flash Dash is a way to easily download and manage those downloads on a remote server!
So a download manager just for your server? Something like Aria?
Well, yes, kind of...
But also it can do much more. First:

* FlashDash has a real UI and isn't CLI-only.
* It uses Aria2c as a backend, so you can use different protocols (HTTP, FTP).
* You can split downloads.
* Pausing and resuming of all downloads or single downloads is possible.
* Filtering through downloadable files is way easier.
* It is way more beginner-friendly.

To show where I come from:
At the start, I used Wget, which is fine but not a real solution.
Then I switched to Aria, which is better, but not user-friendly, and I have to copy all the files to their right destinations after the download, which doesn't make it really automatic!

Now I want something where I can select my destination, paste my link, and it downloads.

The backend will be Flask again like always, first because it's easier to manage files via the OS library, but also because it's just what I am comfy with, and I don't want big bugs in software that has file access!

It's mainly used or expected to be hosted on Linux. In my case, Debian 13. It should work with other distros too, but I won't promise anything.

A lot of the material that I had before is made by me already for another project.
This includes the background that is hard to see. I can recommend using it because it's pretty light on resources and looks good, at least I think that :3

## Screenshots and Media

<img width="797" height="813" alt="image" src="https://github.com/user-attachments/assets/1ebb8d9e-0e65-44a4-911e-4a51b207b6b3" />
<img width="797" height="813" alt="image" src="https://github.com/user-attachments/assets/422fa7a2-2587-428e-8638-496c2fb29309" />

Demo Video

https://github.com/user-attachments/assets/e2e175fc-5c71-4cd5-98d0-c6ce6f8408a9

# Installation Guide

## 1. Prerequisites

Also u need Python ofc ;3

Install `aria2` using your system's package manager:

```bash
# Ubuntu / Debian
sudo apt update && sudo apt install aria2
```

Start the `aria2` RPC daemon in the background:

```bash
aria2c --enable-rpc --rpc-listen-all=true -D
```

---

## 2. Project Setup

### Step 1: Clone the Repository
Clone the repository and enter the project directory:

```bash
git clone https://github.com/AquaFrostByte/FlashDash.git
cd FlashDash
```

### Step 2: Configure Environment Variables
Create a `.env` file in the project root:

```bash
nano .env
```

Add the following environment variables (be sure to secure your server by setting a strong password):

```env
ARIA2_RPC_SECRET=YourSecurePassword
ARIA2_RPC_HOST=http://localhost
ARIA2_RPC_PORT=6800
```

> **Note:** You only need to update `ARIA2_RPC_SECRET` by default. If your `aria2` server runs on a separate machine from Flash Dash, update `ARIA2_RPC_HOST` and `ARIA2_RPC_PORT` to match your server configuration.

### Step 3: Set Up the Python Virtual Environment
Create, activate, and install dependencies into a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Step 4: Run the Setup Script
Make `setup.sh` executable and run it:

```bash
chmod +x setup.sh
./setup.sh
```

## Settings

Changing the default download Dir has to be saved!
For the rest a reload is enought.
