const axios = require('axios');

class TeamsService {
    constructor() {
        this.apiKey = null;
        this.userId = null;
    }

    setKey(key) {
        this.apiKey = key;
        // Reset userId so it fetches again with new key
        this.userId = null; 
    }

    hasKey() {
        return !!this.apiKey;
    }

    async getHeaders() {
        if (!this.apiKey) throw new Error("API Key not set");
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async getUserId() {
        if (this.userId) return this.userId;
        
        try {
            const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
                headers: await this.getHeaders()
            });
            this.userId = response.data.id;
            return this.userId;
        } catch (error) {
            console.error("Error fetching User ID:", error.response?.data || error.message);
            throw error;
        }
    }

    async setStatusMessage(message, expireDateTime) {
        if (!this.apiKey) return; // Fail silently if no key (for testing)
        
        try {
            const uid = await this.getUserId();
            const endpoint = `https://graph.microsoft.com/v1.0/users/${uid}/presence/setStatusMessage`;
            
            // If message is empty, we are clearing the status
            const payload = {
                statusMessage: {
                    message: {
                        content: message,
                        contentType: "text"
                    },
                    // If clearing (empty message), we don't send expiry
                    ...(message && expireDateTime ? { 
                        expiryDateTime: {
                            dateTime: expireDateTime,
                            timeZone: "UTC"
                        }
                    } : {})
                }
            };

            await axios.post(endpoint, payload, { headers: await this.getHeaders() });
            console.log(`Teams Status Updated: ${message}`);
        } catch (error) {
            console.error("Error setting status:", error.response?.data || error.message);
        }
    }

    async createEvent(subject, startISO, endISO) {
        if (!this.apiKey) return;

        try {
            const payload = {
                subject: subject,
                start: { dateTime: startISO, timeZone: "UTC" },
                end: { dateTime: endISO, timeZone: "UTC" }
            };

            await axios.post('https://graph.microsoft.com/beta/me/events', payload, {
                headers: await this.getHeaders()
            });
            console.log(`Calendar Event Created: ${subject}`);
        } catch (error) {
            console.error("Error creating event:", error.response?.data || error.message);
        }
    }
}

module.exports = new TeamsService();