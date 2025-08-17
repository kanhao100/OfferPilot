// OfferPilot Website Adapters (Simplified Version)

class OfferPilotAdapters {
    constructor() {
        this.adapters = {
            // International platforms
            linkedin: new LinkedInAdapter(),
            indeed: new IndeedAdapter(),
            
            // Chinese recruitment platforms
            boss: new BossAdapter(),
            lagou: new LagouAdapter(),
            liepin: new LiepinAdapter(),
            
            // Tech giants - BAT + TMD
            tencent: new TencentAdapter(),
            alibaba: new AlibabaAdapter(),
            bytedance: new ByteDanceAdapter(),
            jd: new JDAdapter(),
            meituan: new MeituanAdapter(),
            kuaishou: new KuaishouAdapter(),
            netease: new NeteaseAdapter(),
            baidu: new BaiduAdapter(),
            
            // Gaming and social platforms
            mihoyo: new MihoyoAdapter(),
            xiaohongshu: new XiaohongshuAdapter(),
            bilibili: new BilibiliAdapter(),
            
            // Manufacturing and hardware
            byd: new BYDAdapter(),
            oppo: new OPPOAdapter(),
            ant: new AntAdapter(),
            
            // HR systems and enterprise platforms
            moka: new MokaAdapter(),
            feishu: new FeishuAdapter(),
            beisen: new BeisenAdapter(),
            yonyou: new YonyouAdapter(),
            
            // Generic fallback
            generic: new GenericAdapter()
        };
    }

    getAdapter(adapterName) {
        return this.adapters[adapterName] || this.adapters.generic;
    }

    // Auto-detect adapter based on current URL
    getAdapterForCurrentSite() {
        const detectedAdapter = BaseAdapter.detectAdapterByDomain(window.location.href);
        return this.getAdapter(detectedAdapter);
    }

    // Get available adapter names
    getAvailableAdapters() {
        return Object.keys(this.adapters);
    }

    // Check if specific adapter is available
    hasAdapter(adapterName) {
        return adapterName in this.adapters;
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
            // Personal information
            firstName: resumeData.personal?.firstName,
            lastName: resumeData.personal?.lastName,
            fullName: resumeData.personal?.fullName || `${resumeData.personal?.firstName || ''} ${resumeData.personal?.lastName || ''}`.trim(),
            email: resumeData.personal?.email,
            phone: resumeData.personal?.phone,
            address: resumeData.personal?.address,
            city: resumeData.personal?.city,
            country: resumeData.personal?.country,
            zipCode: resumeData.personal?.zipCode,
            dateOfBirth: resumeData.personal?.dateOfBirth,
            
            // Education information
            'education.school': resumeData.education?.[0]?.school,
            'education.major': resumeData.education?.[0]?.major,
            'education.degree': resumeData.education?.[0]?.degree,
            'education.startDate': resumeData.education?.[0]?.startDate,
            'education.endDate': resumeData.education?.[0]?.endDate,
            'education.gpa': resumeData.education?.[0]?.gpa,
            
            // Work experience
            'experience.company': resumeData.experience?.[0]?.company,
            'experience.position': resumeData.experience?.[0]?.position,
            'experience.startDate': resumeData.experience?.[0]?.startDate,
            'experience.endDate': resumeData.experience?.[0]?.endDate,
            'experience.description': resumeData.experience?.[0]?.description,
            
            // Skills and others
            skills: Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : resumeData.skills,
            summary: resumeData.summary,
            objective: resumeData.objective,
            
            // Social links
            linkedin: resumeData.social?.linkedin,
            github: resumeData.social?.github,
            website: resumeData.social?.website
        };

        return mappings[fieldType] || null;
    }

    // Helper method to detect adapter by domain
    static detectAdapterByDomain(url) {
        const domain = new URL(url).hostname.toLowerCase();
        
        // Tech giants
        if (domain.includes('tencent.com') || domain.includes('qq.com')) return 'tencent';
        if (domain.includes('alibaba.com') || domain.includes('taobao.com')) return 'alibaba';
        if (domain.includes('bytedance.com') || domain.includes('toutiao.com')) return 'bytedance';
        if (domain.includes('jd.com')) return 'jd';
        if (domain.includes('meituan.com')) return 'meituan';
        if (domain.includes('kuaishou.com')) return 'kuaishou';
        if (domain.includes('163.com') || domain.includes('netease.com')) return 'netease';
        if (domain.includes('baidu.com')) return 'baidu';
        
        // Gaming and social
        if (domain.includes('mihoyo.com')) return 'mihoyo';
        if (domain.includes('xiaohongshu.com')) return 'xiaohongshu';
        if (domain.includes('bilibili.com')) return 'bilibili';
        
        // Manufacturing
        if (domain.includes('byd.com')) return 'byd';
        if (domain.includes('oppo.com')) return 'oppo';
        if (domain.includes('antgroup.com')) return 'ant';
        
        // HR systems
        if (domain.includes('mokahr.com')) return 'moka';
        if (domain.includes('feishu.cn') || domain.includes('larksuite.com')) return 'feishu';
        if (domain.includes('beisen.com')) return 'beisen';
        if (domain.includes('yonyou.com')) return 'yonyou';
        
        // International platforms
        if (domain.includes('linkedin.com')) return 'linkedin';
        if (domain.includes('indeed.com')) return 'indeed';
        
        // Chinese recruitment platforms
        if (domain.includes('zhipin.com') || domain.includes('boss.com')) return 'boss';
        if (domain.includes('lagou.com')) return 'lagou';
        if (domain.includes('liepin.com')) return 'liepin';
        
        return 'generic';
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

// Chinese recruitment platforms
class LagouAdapter extends BaseAdapter {
    constructor() {
        super('lagou');
        this.platformSelectors = {
            nameField: 'input[name*="name"], input[placeholder*="姓名"]',
            phoneField: 'input[name*="phone"], input[placeholder*="手机"]',
            emailField: 'input[name*="email"], input[placeholder*="邮箱"]'
        };
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Lagou adapter');
        await this.handleLagouSpecificFields(resumeData);
        return await super.fillForm(resumeData, detectedFields);
    }

    async handleLagouSpecificFields(resumeData) {
        // Handle Lagou-specific form fields
        this.fillBySelector(this.platformSelectors.nameField, resumeData.personal?.fullName);
        this.fillBySelector(this.platformSelectors.phoneField, resumeData.personal?.phone);
        this.fillBySelector(this.platformSelectors.emailField, resumeData.personal?.email);
    }

    fillBySelector(selector, value) {
        const element = document.querySelector(selector);
        if (element && value) {
            this.fillElement(element, value);
        }
    }
}

class LiepinAdapter extends BaseAdapter {
    constructor() {
        super('liepin');
        this.platformSelectors = {
            resumeUpload: 'input[type="file"][accept*=".pdf,.doc"]',
            workExperience: 'textarea[name*="experience"]'
        };
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Liepin adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

// Tech Giants - BAT + TMD
class TencentAdapter extends BaseAdapter {
    constructor() {
        super('tencent');
        this.companyDomains = ['careers.tencent.com', 'join.qq.com', 'hr.tencent.com'];
        this.platformSelectors = {
            personalInfo: '.personal-info-section',
            education: '.education-section',
            workExp: '.work-experience-section'
        };
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Tencent adapter for Tencent careers portal');
        await this.handleTencentSpecificSections(resumeData);
        return await super.fillForm(resumeData, detectedFields);
    }

    async handleTencentSpecificSections(resumeData) {
        // Handle Tencent's multi-section form layout
        await this.fillPersonalInfoSection(resumeData.personal);
        await this.fillEducationSection(resumeData.education);
        await this.fillWorkExperienceSection(resumeData.experience);
    }

    async fillPersonalInfoSection(personalData) {
        const section = document.querySelector(this.platformSelectors.personalInfo);
        if (section && personalData) {
            this.fillSectionFields(section, personalData);
        }
    }

    async fillEducationSection(educationData) {
        const section = document.querySelector(this.platformSelectors.education);
        if (section && educationData) {
            this.fillSectionFields(section, educationData);
        }
    }

    async fillWorkExperienceSection(experienceData) {
        const section = document.querySelector(this.platformSelectors.workExp);
        if (section && experienceData) {
            this.fillSectionFields(section, experienceData);
        }
    }

    fillSectionFields(section, data) {
        const inputs = section.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const fieldType = this.detectFieldTypeFromElement(input);
            const value = this.getValueForFieldType(fieldType, { [fieldType.split('.')[0]]: data });
            if (value) {
                this.fillElement(input, value);
            }
        });
    }

    detectFieldTypeFromElement(element) {
        const name = element.name || element.id || element.className;
        const placeholder = element.placeholder || '';
        
        // Tencent-specific field mapping
        if (name.includes('name') || placeholder.includes('姓名')) return 'personal.fullName';
        if (name.includes('phone') || placeholder.includes('手机')) return 'personal.phone';
        if (name.includes('email') || placeholder.includes('邮箱')) return 'personal.email';
        if (name.includes('school') || placeholder.includes('学校')) return 'education.school';
        if (name.includes('major') || placeholder.includes('专业')) return 'education.major';
        
        return 'generic';
    }
}

class AlibabaAdapter extends BaseAdapter {
    constructor() {
        super('alibaba');
        this.companyDomains = ['careers.alibaba.com', 'job.alibaba.com', 'talent.alibaba.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Alibaba adapter for Alibaba Group careers');
        await this.handleAlibabaFlow(resumeData);
        return await super.fillForm(resumeData, detectedFields);
    }

    async handleAlibabaFlow(resumeData) {
        // Handle Alibaba's step-by-step application flow
        await this.waitForPageLoad();
        await this.fillCurrentStep(resumeData);
    }

    async waitForPageLoad() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    async fillCurrentStep(resumeData) {
        const stepIndicator = document.querySelector('.step-indicator, .progress-bar');
        if (stepIndicator) {
            const currentStep = this.getCurrentStep(stepIndicator);
            switch (currentStep) {
                case 1:
                    await this.fillBasicInfo(resumeData.personal);
                    break;
                case 2:
                    await this.fillEducationInfo(resumeData.education);
                    break;
                case 3:
                    await this.fillExperienceInfo(resumeData.experience);
                    break;
            }
        }
    }

    getCurrentStep(stepElement) {
        const activeStep = stepElement.querySelector('.active, .current');
        return activeStep ? parseInt(activeStep.textContent) || 1 : 1;
    }

    async fillBasicInfo(personalData) {
        if (personalData) {
            this.fillByPattern('input[name*="name"]', personalData.fullName);
            this.fillByPattern('input[name*="phone"]', personalData.phone);
            this.fillByPattern('input[name*="email"]', personalData.email);
        }
    }

    async fillEducationInfo(educationData) {
        if (educationData && Array.isArray(educationData)) {
            educationData.forEach((edu, index) => {
                this.fillByPattern(`input[name*="school"][data-index="${index}"]`, edu.school);
                this.fillByPattern(`input[name*="major"][data-index="${index}"]`, edu.major);
                this.fillByPattern(`input[name*="degree"][data-index="${index}"]`, edu.degree);
            });
        }
    }

    async fillExperienceInfo(experienceData) {
        if (experienceData && Array.isArray(experienceData)) {
            experienceData.forEach((exp, index) => {
                this.fillByPattern(`input[name*="company"][data-index="${index}"]`, exp.company);
                this.fillByPattern(`input[name*="position"][data-index="${index}"]`, exp.position);
                this.fillByPattern(`textarea[name*="description"][data-index="${index}"]`, exp.description);
            });
        }
    }

    fillByPattern(selector, value) {
        const element = document.querySelector(selector);
        if (element && value) {
            this.fillElement(element, value);
        }
    }
}

class ByteDanceAdapter extends BaseAdapter {
    constructor() {
        super('bytedance');
        this.companyDomains = ['jobs.bytedance.com', 'job.toutiao.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using ByteDance adapter for ByteDance careers');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class JDAdapter extends BaseAdapter {
    constructor() {
        super('jd');
        this.companyDomains = ['zhaopin.jd.com', 'job.jd.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using JD adapter for JD careers');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class MeituanAdapter extends BaseAdapter {
    constructor() {
        super('meituan');
        this.companyDomains = ['zhaopin.meituan.com', 'careers.meituan.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Meituan adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class KuaishouAdapter extends BaseAdapter {
    constructor() {
        super('kuaishou');
        this.companyDomains = ['zhaopin.kuaishou.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Kuaishou adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class NeteaseAdapter extends BaseAdapter {
    constructor() {
        super('netease');
        this.companyDomains = ['hr.163.com', 'game.163.com/job'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using NetEase adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class BaiduAdapter extends BaseAdapter {
    constructor() {
        super('baidu');
        this.companyDomains = ['talent.baidu.com', 'zhaopin.baidu.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Baidu adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

// Gaming and Social Platforms
class MihoyoAdapter extends BaseAdapter {
    constructor() {
        super('mihoyo');
        this.companyDomains = ['jobs.mihoyo.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Mihoyo adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class XiaohongshuAdapter extends BaseAdapter {
    constructor() {
        super('xiaohongshu');
        this.companyDomains = ['job.xiaohongshu.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Xiaohongshu adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class BilibiliAdapter extends BaseAdapter {
    constructor() {
        super('bilibili');
        this.companyDomains = ['jobs.bilibili.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Bilibili adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

// Manufacturing and Hardware Companies
class BYDAdapter extends BaseAdapter {
    constructor() {
        super('byd');
        this.companyDomains = ['careers.byd.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using BYD adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class OPPOAdapter extends BaseAdapter {
    constructor() {
        super('oppo');
        this.companyDomains = ['career.oppo.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using OPPO adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class AntAdapter extends BaseAdapter {
    constructor() {
        super('ant');
        this.companyDomains = ['careers.antgroup.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Ant Group adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

// HR Systems and Enterprise Platforms
class MokaAdapter extends BaseAdapter {
    constructor() {
        super('moka');
        this.companyDomains = ['mokahr.com'];
        this.platformSelectors = {
            formContainer: '.moka-form-container',
            stepContainer: '.step-container'
        };
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Moka HR system adapter');
        await this.handleMokaSystemLayout(resumeData);
        return await super.fillForm(resumeData, detectedFields);
    }

    async handleMokaSystemLayout(resumeData) {
        const mokaContainer = document.querySelector(this.platformSelectors.formContainer);
        if (mokaContainer) {
            await this.fillMokaFields(mokaContainer, resumeData);
        }
    }

    async fillMokaFields(container, resumeData) {
        const fieldGroups = container.querySelectorAll('.field-group, .form-group');
        fieldGroups.forEach(group => {
            const inputs = group.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                const fieldType = this.detectMokaFieldType(input);
                const value = this.getValueForFieldType(fieldType, resumeData);
                if (value) {
                    this.fillElement(input, value);
                }
            });
        });
    }

    detectMokaFieldType(element) {
        const labelText = this.getAssociatedLabel(element);
        const name = element.name || element.id;
        
        if (labelText.includes('姓名') || name.includes('name')) return 'fullName';
        if (labelText.includes('手机') || name.includes('phone')) return 'phone';
        if (labelText.includes('邮箱') || name.includes('email')) return 'email';
        
        return 'generic';
    }

    getAssociatedLabel(element) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label.textContent || '';
        
        const parentLabel = element.closest('label');
        if (parentLabel) return parentLabel.textContent || '';
        
        return '';
    }
}

class FeishuAdapter extends BaseAdapter {
    constructor() {
        super('feishu');
        this.companyDomains = ['feishu.cn', 'larksuite.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Feishu recruitment system adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class BeisenAdapter extends BaseAdapter {
    constructor() {
        super('beisen');
        this.companyDomains = ['beisen.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Beisen HR system adapter');
        return await super.fillForm(resumeData, detectedFields);
    }
}

class YonyouAdapter extends BaseAdapter {
    constructor() {
        super('yonyou');
        this.companyDomains = ['yonyou.com'];
    }

    async fillForm(resumeData, detectedFields) {
        console.log('Using Yonyou enterprise system adapter');
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