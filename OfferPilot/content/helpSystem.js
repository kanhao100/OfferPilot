// OfferPilot Help System (Simplified Version)

class OfferPilotHelpSystem {
    constructor() {
        this.isActive = false;
    }

    showHelp(topic) {
        console.log(`Help requested for topic: ${topic}`);
        
        const helpMessages = {
            'button': '点击智能填充按钮可以自动填充表单字段',
            'resume': '您可以在设置中管理多个简历模板',
            'fields': 'OfferPilot会自动识别页面中的表单字段'
        };
        
        const message = helpMessages[topic] || '查看GitHub页面获取更多帮助信息';
        
        if (window.OfferPilotErrorHandler) {
            window.OfferPilotErrorHandler.showSuccessNotification(message, 4000);
        }
    }

    showWelcomeTutorial() {
        if (this.shouldShowWelcomeTutorial()) {
            console.log('Welcome to OfferPilot! Check the GitHub repository for detailed usage instructions.');
        }
    }

    shouldShowWelcomeTutorial() {
        // Check if this is a job application page
        const indicators = [
            'input[type="email"]',
            'input[placeholder*="email" i]',
            'input[placeholder*="name" i]',
            'textarea[placeholder*="cover" i]'
        ];

        return indicators.some(selector => document.querySelector(selector));
    }
}

// Global instance
window.OfferPilotHelpSystem = new OfferPilotHelpSystem();

// Show contextual help on page load
if (document.readyState === 'complete') {
    window.OfferPilotHelpSystem.showWelcomeTutorial();
} else {
    window.addEventListener('load', () => {
        window.OfferPilotHelpSystem.showWelcomeTutorial();
    });
}