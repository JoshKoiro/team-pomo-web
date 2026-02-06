const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const teamsService = require('./teamsService');
const timerManager = require('./timerManager');

const app = express();
const PORT = 5000;
const KEY_FILE = path.join(__dirname, '../config/key.txt');

app.use(express.static('public'));
app.use(bodyParser.json());

// Load key on startup if exists
if (fs.existsSync(KEY_FILE)) {
    const key = fs.readFileSync(KEY_FILE, 'utf8').trim();
    if (key) {
        teamsService.setKey(key);
        console.log("API Key loaded from file.");
    }
}

// --- API Endpoints ---

// 1. Update API Key
app.post('/api/key', (req, res) => {
    const { key } = req.body;
    if (!key) return res.status(400).send({ error: "Key is required" });

    // Save to memory
    teamsService.setKey(key);
    
    // Save to disk
    fs.writeFileSync(KEY_FILE, key);
    
    res.send({ message: "API Key updated successfully" });
});

app.get('/api/key/status', (req, res) => {
    res.send({ hasKey: teamsService.hasKey() });
});

// 2. Start Timer
app.post('/api/start', (req, res) => {
    const { duration, task, publicStatus } = req.body;
    
    const minutes = parseInt(duration) || 25;
    
    timerManager.start(minutes, task, publicStatus);
    res.send({ message: "Timer started" });
});

// 3. Stop Timer
app.post('/api/stop', (req, res) => {
    timerManager.stop();
    res.send({ message: "Timer stopped" });
});

// 4. Get Status (for frontend polling)
app.get('/api/status', (req, res) => {
    res.send(timerManager.getStatus());
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});