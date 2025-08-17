// OfferPilot Field Detector (Simplified Version)

class FieldDetector {
    constructor() {
        this.detectedFields = new Map();
    }

    detectFields() {
        this.detectedFields.clear();
        
        const formElements = this.getAllFormElements();
        
        formElements.forEach(element => {
            const fieldInfo = this.analyzeElement(element);
            if (fieldInfo) {
                this.detectedFields.set(element, fieldInfo);
            }
        });

        return Array.from(this.detectedFields.values());
    }

    getAllFormElements() {
        const selectors = [
            'input[type="text"]',
            'input[type="email"]',
            'input[type="tel"]',
            'input[type="url"]',
            'input:not([type])',
            'textarea',
            'select'
        ];

        const elements = [];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (this.isVisibleAndInteractable(el)) {
                    elements.push(el);
                }
            });
        });

        return elements;
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

    analyzeElement(element) {
        const text = [
            element.id || '',
            element.name || '',
            element.placeholder || '',
            element.className || ''
        ].join(' ').toLowerCase();

        let fieldType = 'unknown';
        let score = 0;

        // Simple field type detection
        if (element.type === 'email' || text.includes('email')) {
            fieldType = 'email';
            score = 10;
        } else if (element.type === 'tel' || text.includes('phone') || text.includes('tel')) {
            fieldType = 'phone';
            score = 10;
        } else if (text.includes('name') && text.includes('first')) {
            fieldType = 'firstName';
            score = 9;
        } else if (text.includes('name') && text.includes('last')) {
            fieldType = 'lastName';
            score = 9;
        } else if (text.includes('name')) {
            fieldType = 'fullName';
            score = 8;
        } else if (text.includes('address')) {
            fieldType = 'address';
            score = 7;
        } else if (text.includes('city')) {
            fieldType = 'city';
            score = 7;
        } else if (text.includes('skill')) {
            fieldType = 'skills';
            score = 8;
        }

        if (score > 5) {
            return {
                fieldType,
                element,
                score,
                confidence: score / 10
            };
        }

        return null;
    }

    getDetectionSummary() {
        const fields = this.detectFields();
        return {
            totalFields: fields.length,
            fieldTypes: {},
            highConfidenceFields: fields.filter(f => f.confidence >= 0.8).length
        };
    }
}

// Global instance
window.OfferPilotFieldDetector = new FieldDetector();