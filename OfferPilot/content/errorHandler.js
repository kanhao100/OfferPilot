// OfferPilot Error Handler (Simplified Version)

class OfferPilotErrorHandler {
    constructor() {
        this.notifications = new Map();
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.warn('OfferPilot Error:', event.message);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.warn('OfferPilot Promise Rejection:', event.reason);
        });
    }

    showSuccessNotification(message, duration = 3000) {
        return this.showNotification({
            type: 'success',
            message,
            duration
        });
    }

    showErrorNotification(message, duration = 5000) {
        return this.showNotification({
            type: 'error',
            message,
            duration
        });
    }

    showNotification(options) {
        const { type = 'info', message, duration = 5000 } = options;
        
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Simple notification implementation
        if (typeof message === 'string' && message.trim()) {
            // Could be extended to show actual UI notifications
            return Date.now();
        }
        
        return null;
    }
}

// Global instance
window.OfferPilotErrorHandler = new OfferPilotErrorHandler();