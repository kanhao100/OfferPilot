// OfferPilot Complex Controls Handler (Simplified Version)

class ComplexControlsHandler {
    constructor() {
        // Simplified complex controls handler
    }

    async handleControl(element, value, options = {}) {
        try {
            // Basic control handling
            if (element.tagName === 'SELECT') {
                return this.fillSelectField(element, value);
            } else if (element.type === 'date') {
                return this.fillDateField(element, value);
            } else {
                return this.fillBasicField(element, value);
            }
        } catch (error) {
            console.warn('Complex control handling error:', error);
            return false;
        }
    }

    fillSelectField(element, value) {
        const options = Array.from(element.options);
        const normalizedValue = value.toString().toLowerCase();
        
        // Try exact match
        let matchedOption = options.find(opt => 
            opt.value.toLowerCase() === normalizedValue ||
            opt.textContent.toLowerCase().trim() === normalizedValue
        );
        
        // Try partial match
        if (!matchedOption) {
            matchedOption = options.find(opt =>
                opt.textContent.toLowerCase().includes(normalizedValue) ||
                normalizedValue.includes(opt.textContent.toLowerCase())
            );
        }
        
        if (matchedOption) {
            element.value = matchedOption.value;
            matchedOption.selected = true;
            
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
            return true;
        }
        
        return false;
    }

    fillDateField(element, value) {
        try {
            // Simple date format conversion
            const dateStr = value.toString();
            const dateFormats = [
                /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
                /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
            ];
            
            for (const format of dateFormats) {
                const match = dateStr.match(format);
                if (match) {
                    let formattedDate;
                    if (format.source.startsWith('(\\d{4})')) {
                        // Already in YYYY-MM-DD format
                        formattedDate = dateStr;
                    } else {
                        // Convert MM/DD/YYYY to YYYY-MM-DD
                        const [, month, day, year] = match;
                        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                    
                    element.value = formattedDate;
                    const event = new Event('change', { bubbles: true });
                    element.dispatchEvent(event);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.warn('Date field fill error:', error);
            return false;
        }
    }

    fillBasicField(element, value) {
        try {
            element.focus();
            element.value = value;
            
            ['input', 'change', 'blur'].forEach(eventType => {
                const event = new Event(eventType, { bubbles: true });
                element.dispatchEvent(event);
            });
            
            return true;
        } catch (error) {
            console.warn('Basic field fill error:', error);
            return false;
        }
    }
}

// Global instance
window.OfferPilotComplexControls = new ComplexControlsHandler();