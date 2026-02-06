# TeamPomo Web 🍅

**TeamPomo Web** is a containerized Node.js application that helps you manage Pomodoro sessions. It automatically updates your **Microsoft Teams status** and creates **Outlook Calendar events** based on your focus sessions, all controlled via a simple Web UI.

## Features

*   **Web Interface**: Control your timer from a browser instead of the CLI.
*   **Teams Integration**: Automatically sets your status to "Busy" (e.g., "Busy in a Pomodoro session...").
*   **Calendar Events**: Creates an event in Outlook for the duration of your session.
*   **Privacy Control**: Toggle whether to show the specific task name in your public Teams status.
*   **Hot-Swappable API Key**: Update your MS Graph API key directly via the UI without restarting the server.
*   **Persistent Configuration**: Your API key is saved locally so it survives container restarts.

---

## Prerequisites

1.  **Microsoft Graph API Token**: You need a valid Bearer token for the MS Graph API.
2.  **Node.js (v18+)**: If running locally.
3.  **Docker**: If running as a container.

---

## 🚀 Option 1: Running with Docker (Recommended)

Running with Docker ensures the environment is set up correctly. We use a **Volume** to persist your API key, so you don't have to re-enter it every time you restart the container.

### Method A: Docker Compose (Easiest)

1.  Create a file named `docker-compose.yml` in the root directory:
    ```yaml
    version: '3'
    services:
      teampomo:
        build: .
        container_name: teampomo-web
        ports:
          - "5000:5000"
        volumes:
          - ./config:/app/config
        restart: unless-stopped
    ```
2.  Run the app:
    ```bash
    docker-compose up -d
    ```
3.  Open **http://localhost:5000** in your browser.

### Method B: Standard Docker Commands

1.  **Build the image**:
    ```bash
    docker build -t teampomo-web .
    ```

2.  **Run the container**:
    *Note: We mount the local `config/` folder to `/app/config` inside the container.*

    **Mac/Linux:**
    ```bash
    docker run -d -p 5000:5000 \
      -v "$(pwd)/config:/app/config" \
      --name teampomo-web \
      teampomo-web
    ```

    **Windows (PowerShell):**
    ```powershell
    docker run -d -p 5000:5000 `
      -v "${PWD}/config:/app/config" `
      --name teampomo-web `
      teampomo-web
    ```

---

## 💻 Option 2: Running Locally (Node.js)

If you prefer to run the server directly on your machine without Docker.

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Server**:
    ```bash
    npm start
    ```

3.  **Access the App**:
    Open **http://localhost:5000** in your browser.

---

## Usage Guide

1.  **Set API Key**:
    *   On the dashboard, paste your **Microsoft Graph API Key** into the settings box and click **Update Key**.
    *   If successful, you will see a green "✅ API Key is loaded" message.

2.  **Start a Session**:
    *   **Duration**: Enter minutes (default is 25).
    *   **Task Name**: (Optional) What are you working on? (e.g., "Refactoring API").
    *   **Show Task in Teams?**:
        *   **Checked**: Status will read: *"Busy working on Refactoring API..."*
        *   **Unchecked**: Status will read: *"Busy in a Pomodoro session..."*

3.  **Stop a Session**:
    *   Click **Stop**. This will clear your Teams status message immediately.

---

## Project Structure

```text
teampomo-node/
├── config/           # Stores the key.txt (persisted volume)
├── public/           # Frontend assets (HTML, CSS, JS)
├── src/
│   ├── server.js     # Express entry point & API routes
│   ├── teamsService.js # MS Graph API logic
│   └── timerManager.js # Timer logic & state management
├── Dockerfile        # Docker build instructions
└── package.json      # Dependencies
```