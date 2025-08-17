// OfferPilot Popup Script
class OfferPilotPopup {
    constructor() {
        this.currentResumeId = 'default';
        this.resumes = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.detectCurrentWebsite();
        this.updateUI();
    }

    async loadData() {
        try {
            const result = await chrome.storage.local.get(['resumes', 'current_resume_id']);
            this.resumes = result.resumes || {};
            this.currentResumeId = result.current_resume_id || 'default';
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('fillFormBtn').addEventListener('click', () => {
            this.fillCurrentForm();
        });

        document.getElementById('editResumeBtn').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        document.getElementById('optionsBtn').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://github.com/kanhao100/OfferPilot' });
        });
    }

    async detectCurrentWebsite() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                const url = new URL(tab.url);
                document.getElementById('currentWebsite').textContent = url.hostname;
                
                chrome.tabs.sendMessage(tab.id, { action: 'getDetectionInfo' }, (response) => {
                    if (response && response.success) {
                        document.getElementById('currentAdapter').textContent = response.adapter || '通用';
                        document.getElementById('detectedFields').textContent = response.fieldCount || 0;
                    }
                });
            }
        } catch (error) {
            console.error('Failed to detect website:', error);
            document.getElementById('currentWebsite').textContent = '检测失败';
        }
    }

    updateUI() {
        const selector = document.getElementById('resumeSelector');
        selector.innerHTML = '';
        
        Object.values(this.resumes).forEach(resume => {
            const option = document.createElement('option');
            option.value = resume.id;
            option.textContent = resume.name;
            option.selected = resume.id === this.currentResumeId;
            selector.appendChild(option);
        });
    }

    async fillCurrentForm() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('无法获取当前标签页');
            }

            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'fillForm',
                resumeData: this.resumes[this.currentResumeId]
            });

            if (response && response.success) {
                const filledCount = response.filledCount || 0;
                this.showNotification(`成功填充 ${filledCount} 个字段`);
            } else {
                throw new Error(response?.error || '填充失败');
            }
        } catch (error) {
            console.error('Form filling failed:', error);
            this.showNotification(`填充失败: ${error.message}`, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification implementation
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    new OfferPilotPopup();
});