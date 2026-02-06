const API = '/api';

// Check Key Status on Load
async function checkKey() {
    try {
        const res = await fetch(`${API}/key/status`);
        const data = await res.json();
        const statusEl = document.getElementById('keyStatus');
        if (data.hasKey) {
            statusEl.textContent = "✅ API Key is loaded";
            statusEl.style.color = "green";
        } else {
            statusEl.textContent = "⚠️ No API Key set";
            statusEl.style.color = "orange";
        }
    } catch (e) {
        console.error(e);
    }
}

async function updateKey() {
    const key = document.getElementById('apiKey').value;
    if (!key) return alert("Please enter a key");

    const res = await fetch(`${API}/key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
    });
    
    if (res.ok) {
        alert("Key updated!");
        document.getElementById('apiKey').value = "";
        checkKey();
    }
}

async function startTimer() {
    const duration = document.getElementById('duration').value;
    const task = document.getElementById('taskName').value;
    const publicStatus = document.getElementById('publicStatus').checked;

    await fetch(`${API}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, task, publicStatus })
    });
    
    pollStatus();
}

async function stopTimer() {
    await fetch(`${API}/stop`, { method: 'POST' });
}

async function pollStatus() {
    try {
        const res = await fetch(`${API}/status`);
        const data = await res.json();
        
        document.getElementById('timerDisplay').textContent = data.timeRemaining;
        
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const taskInfo = document.getElementById('currentTaskDisplay');

        if (data.active) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            taskInfo.textContent = `Focusing on: ${data.task}`;
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            taskInfo.textContent = "Idle";
        }
    } catch (e) {
        console.error("Polling error", e);
    }
}

// Initial Load
checkKey();
// Poll every second
setInterval(pollStatus, 1000);