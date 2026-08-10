# FlashDash

First of all i dont condone piracy and this program shound not be used for piracy!!
Where u get the download resources from is not my problem and i want add any resources where to get the downlaod repositris from!

## What is flash dash? 

Flash dash is a way to easly download and manage thos downloads on a remote server!
So a download manager just for ur Server? Something like aria? 
Well yes kinda...
But also it can do much more first
- FlashDash has an real UI and isnt CLI only
- It uses Aria2c as a backend so u can use diffrent Protocoles. (HTTP, FTP)
- U can slplit downloads
- Pausing and Resuming of all downloads or signle downloads is possible
- Filtering throw downloadable files is way easyer
- Way more beginner friendly

To show of where i come from.
At the start i used Wget which is fine but not a real solution.
Then i switch to aria which is better but not user friendly and i have to coppy all the files to there right destinations after the downlaod which dosent make it really automatic!

Now i want something where i can select my destination past my link and it downlaods.

The backend will be flask again like always first because its easyer to manage files via the OS libart but allso becasue its just whit what i am commfy with and i dont want bigg bugs in a software that has file acces!

Its manly used or expected to be hosted on Linux. In my case Debian 13. It should work with other distros 2 but i wont promiss anything.

Alot of material that was i had before is made by me already for a nother project.
this includes the background that is hard to see. I can recommend using because its pretty light on recourses and looks good atleast i think that :3

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
