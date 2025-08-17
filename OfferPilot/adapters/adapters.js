// OfferPilot Website Adapters (Simplified Version)

class OfferPilotAdapters {
    constructor() {
        this.adapters = {
            linkedin: new LinkedInAdapter(),
            indeed: new IndeedAdapter(),
            boss: new BossAdapter(),
            generic: new GenericAdapter()
        };
    }

    getAdapter(adapterName) {
        return this.adapters[adapterName] || this.adapters.generic;
    }
}

// Base adapter class
class BaseAdapter {
    constructor(name) {
        this.name = name;
    }

    async fillForm(resumeData, detectedFields) {
        // Default implementation
        let filledCount = 0;
        const filledFields = [];

        for (const field of detectedFields || []) {
            try {
                const value = this.getValueForFieldType(field.fieldType, resumeData);
                if (value && this.fillElement(field.element, value)) {
                    filledCount++;
                    filledFields.push({ fieldType: field.fieldType, value });
                }
            } catch (error) {
                console.warn(`Failed to fill field:`, error);
            }
        }

        return {
            success: true,
            filledCount,
            filledFields,
            adapter: this.name
        };
    }

    fillElement(element, value) {
        try {
            element.focus();
            element.value = value;
            
            ['input', 'change', 'blur'].forEach(eventType => {
                const event = new Event(eventType, { bubbles: true });
                element.dispatchEvent(event);
            });
            
            return true;
        } catch (error) {
            console.warn('Element fill error:', error);
            return false;
        }
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
            skills: Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : resumeData.skills
        };

        return mappings[fieldType] || null;
    }
}

// LinkedIn adapter
class LinkedInAdapter extends BaseAdapter {
    constructor() {
        super('linkedin');
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using LinkedIn adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

// Indeed adapter
class IndeedAdapter extends BaseAdapter {
    constructor() {
        super('indeed');
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Indeed adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

// Boss adapter
class BossAdapter extends BaseAdapter {
    constructor() {
        super('boss');
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Boss adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

// Generic adapter
class GenericAdapter extends BaseAdapter {
    constructor() {
        super('generic');
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using generic adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

// Global instance
window.OfferPilotAdapters = new OfferPilotAdapters();