// OfferPilot Content Script

class OfferPilotContentScript {
    constructor() {
        this.isInitialized = false;
        this.fillButton = null;
        this.detectedFields = [];
        
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            this.createFillButton();
            this.setupMessageListeners();
            this.detectFields();
            
            this.isInitialized = true;
            console.log('OfferPilot initialized successfully');
            
        } catch (error) {
            console.error('OfferPilot initialization failed:', error);
        }
    }

    createFillButton() {
        if (document.getElementById('offerpilot-fill-btn')) return;

        const button = document.createElement('div');
        button.id = 'offerpilot-fill-btn';
        button.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 999999;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 12px 16px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                font-size: 14px;
                font-weight: 500;
                user-select: none;
                transition: all 0.3s ease;
            ">
                🚀 智能填充
            </div>
        `;

        button.addEventListener('click', () => {
            this.handleFillButtonClick();
        });

        document.body.appendChild(button);
        this.fillButton = button;
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'fillForm':
                    this.fillForm(request.resumeData)
                        .then(result => sendResponse({ success: true, ...result }))
                        .catch(error => sendResponse({ success: false, error: error.message }));
                    return true;

                case 'getDetectionInfo':
                    sendResponse({
                        success: true,
                        adapter: 'generic',
                        fieldCount: this.detectedFields.length,
                        fieldTypes: {}
                    });
                    break;
            }
        });
    }

    detectFields() {
        const selectors = [
            'input[type="text"]',
            'input[type="email"]',
            'input[type="tel"]',
            'textarea',
            'select'
        ];

        this.detectedFields = [];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (this.isVisibleAndInteractable(el)) {
                    this.detectedFields.push({
                        element: el,
                        type: this.guessFieldType(el)
                    });
                }
            });
        });

        console.log(`Detected ${this.detectedFields.length} fields`);
    }

    isVisibleAndInteractable(element) {
        if (!element || element.offsetParent === null) return false;
        if (element.disabled || element.readOnly) return false;
        if (element.type === 'hidden') return false;
        
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }

    guessFieldType(element) {
        const text = [
            element.id || '',
            element.name || '',
            element.placeholder || '',
            element.className || ''
        ].join(' ').toLowerCase();

        if (element.type === 'email' || text.includes('email')) return 'email';
        if (element.type === 'tel' || text.includes('phone') || text.includes('tel')) return 'phone';
        if (text.includes('name') && text.includes('first')) return 'firstName';
        if (text.includes('name') && text.includes('last')) return 'lastName';
        if (text.includes('name')) return 'fullName';
        if (text.includes('address')) return 'address';
        if (text.includes('city')) return 'city';
        if (text.includes('skill')) return 'skills';
        if (text.includes('experience') || text.includes('work')) return 'experience';
        if (text.includes('education') || text.includes('school')) return 'education';
        if (text.includes('cover') && text.includes('letter')) return 'coverLetter';

        return 'unknown';
    }

    async handleFillButtonClick() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getResumeData'
            });

            if (!response.success) {
                throw new Error(response.error || '无法获取简历数据');
            }

            const result = await this.fillForm(response.data);
            this.showNotification(`成功填充 ${result.filledCount} 个字段`, 'success');

        } catch (error) {
            console.error('Fill form error:', error);
            this.showNotification(`填充失败: ${error.message}`, 'error');
        }
    }

    async fillForm(resumeData) {
        if (!resumeData) {
            throw new Error('无效的简历数据');
        }

        let filledCount = 0;

        for (const field of this.detectedFields) {
            try {
                const value = this.getValueForFieldType(field.type, resumeData);
                if (value && this.fillField(field.element, value)) {
                    filledCount++;
                }
            } catch (error) {
                console.warn(`Failed to fill field:`, error);
            }
        }

        return { filledCount };
    }

    getValueForFieldType(fieldType, resumeData) {
        const mappings = {
            firstName: resumeData.personal?.firstName,
            lastName: resumeData.personal?.lastName,
            fullName: `${resumeData.personal?.firstName || ''} ${resumeData.personal?.lastName || ''}`.trim(),
            email: resumeData.personal?.email,
            phone: resumeData.personal?.phone,
            address: resumeData.personal?.address,
            city: resumeData.personal?.city,
            skills: Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : resumeData.skills,
            experience: this.formatExperience(resumeData.experience),
            education: this.formatEducation(resumeData.education),
            coverLetter: resumeData.coverLetter || ''
        };

        return mappings[fieldType] || null;
    }

    formatExperience(experience) {
        if (!Array.isArray(experience) || experience.length === 0) return '';
        return experience.map(exp => `${exp.title || ''} at ${exp.company || ''}`).join(', ');
    }

    formatEducation(education) {
        if (!Array.isArray(education) || education.length === 0) return '';
        return education.map(edu => `${edu.degree || ''} from ${edu.school || ''}`).join(', ');
    }

    fillField(element, value) {
        try {
            element.focus();
            element.value = value;
            
            ['input', 'change', 'blur'].forEach(eventType => {
                const event = new Event(eventType, { bubbles: true });
                element.dispatchEvent(event);
            });
            
            return true;
        } catch (error) {
            console.warn('Field filling error:', error);
            return false;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 999998;
            background: white;
            border-radius: 8px;
            padding: 16px;
            max-width: 320px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${type === 'error' ? '#ef4444' : '#10b981'};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            font-size: 14px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">OfferPilot</div>
            <div style="color: #64748b;">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new OfferPilotContentScript();
    });
} else {
    new OfferPilotContentScript();
}