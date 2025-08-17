// OfferPilot Options Page Script

class OfferPilotOptions {
    constructor() {
        this.resumeData = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.updateUI();
    }

    async loadData() {
        try {
            const result = await chrome.storage.local.get(['resumes', 'current_resume_id']);
            const currentId = result.current_resume_id || 'default';
            this.resumeData = result.resumes?.[currentId] || this.createDefaultResume();
        } catch (error) {
            console.error('Failed to load data:', error);
            this.resumeData = this.createDefaultResume();
        }
    }

    createDefaultResume() {
        return {
            id: 'default',
            name: '默认简历',
            personal: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: ''
            },
            skills: []
        };
    }

    setupEventListeners() {
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveData();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetData();
        });
    }

    updateUI() {
        // Update form fields with current data
        document.getElementById('firstName').value = this.resumeData.personal?.firstName || '';
        document.getElementById('lastName').value = this.resumeData.personal?.lastName || '';
        document.getElementById('email').value = this.resumeData.personal?.email || '';
        document.getElementById('phone').value = this.resumeData.personal?.phone || '';
        document.getElementById('address').value = this.resumeData.personal?.address || '';
        document.getElementById('city').value = this.resumeData.personal?.city || '';
        
        const skills = Array.isArray(this.resumeData.skills) ? 
            this.resumeData.skills.join(', ') : 
            (this.resumeData.skills || '');
        document.getElementById('skills').value = skills;
    }

    async saveData() {
        try {
            // Collect form data
            this.resumeData.personal = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                city: document.getElementById('city').value.trim()
            };

            // Process skills
            const skillsText = document.getElementById('skills').value.trim();
            this.resumeData.skills = skillsText ? 
                skillsText.split(',').map(s => s.trim()).filter(s => s) : 
                [];

            this.resumeData.modified = Date.now();

            // Save to storage
            const result = await chrome.storage.local.get('resumes');
            const resumes = result.resumes || {};
            resumes[this.resumeData.id] = this.resumeData;
            
            await chrome.storage.local.set({ resumes });
            
            this.showNotification('设置已保存！', 'success');
            
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showNotification('保存失败，请重试', 'error');
        }
    }

    resetData() {
        if (confirm('确定要重置所有设置吗？这将清除您保存的简历信息。')) {
            this.resumeData = this.createDefaultResume();
            this.updateUI();
            this.showNotification('设置已重置', 'info');
        }
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize options page
document.addEventListener('DOMContentLoaded', () => {
    new OfferPilotOptions();
});

// Add slide animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);