const teamsService = require('./teamsService');

class TimerManager {
    constructor() {
        this.active = false;
        this.intervalId = null;
        this.endTime = null;
        this.taskName = "";
        this.durationMinutes = 0;
        this.isPublic = false;
    }

    start(durationMinutes, taskName, isPublic) {
        if (this.active) this.stop();

        this.active = true;
        this.taskName = taskName || "Pomodoro";
        this.durationMinutes = durationMinutes;
        this.isPublic = isPublic;

        const now = new Date();
        // Convert minutes to milliseconds
        this.endTime = new Date(now.getTime() + durationMinutes * 60000); 
        
        const startISO = now.toISOString();
        const endISO = this.endTime.toISOString();

        // 1. Create Calendar Event
        teamsService.createEvent(`🍅Pomodoro: ${this.taskName}`, startISO, endISO);

        // 2. Set Initial Status
        this.updateTeamsStatus();

        // 3. Start Loop
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);

        console.log(`Timer started for ${durationMinutes} minutes.`);
    }

    stop() {
        if (!this.active) return;

        clearInterval(this.intervalId);
        this.active = false;
        this.intervalId = null;
        this.endTime = null;

        // Clear Teams Status
        teamsService.setStatusMessage("", "");
        console.log("Timer stopped.");
    }

    async tick() {
        if (!this.active) return;

        const now = new Date();
        const remainingMs = this.endTime - now;

        if (remainingMs <= 0) {
            this.stop();
            return;
        }

        // Update Teams status every minute (approx)
        const secondsLeft = Math.floor(remainingMs / 1000);
        if (secondsLeft % 60 === 0) {
            await this.updateTeamsStatus();
        }
    }

    async updateTeamsStatus() {
        if (!this.active) return;

        const now = new Date();
        const remainingMs = this.endTime - now;
        const minutesLeft = Math.ceil(remainingMs / 60000);

        let statusMsg = "";
        
        // Logic for --public flag
        if (this.isPublic) {
             statusMsg = `Busy working on ${this.taskName}. ${minutesLeft} minutes remaining...🍅`;
        } else {
             statusMsg = `Busy in a Pomodoro session for the next ${minutesLeft} minutes...🍅`;
        }

        if (minutesLeft < 1) {
            statusMsg = "Less than a minute left in a Pomodoro session...🍅";
        }

        await teamsService.setStatusMessage(statusMsg, this.endTime.toISOString());
    }

    getStatus() {
        if (!this.active) {
            return { active: false, timeRemaining: "00:00", task: "" };
        }

        const now = new Date();
        const remainingMs = Math.max(0, this.endTime - now);
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);

        // Format to MM:SS
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return {
            active: true,
            timeRemaining: timeString,
            task: this.taskName
        };
    }
}

module.exports = new TimerManager();