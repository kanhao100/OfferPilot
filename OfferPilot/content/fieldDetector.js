// OfferPilot Field Detector (Simplified Version)

class FieldDetector {
    constructor() {
        this.detectedFields = new Map();
        this.lastDetectionTime = 0;
        this.detectionCooldown = 1000; // 1秒冷却时间
        this.fieldMappings = this.initializeFieldMappings();
        this.websitePatterns = this.initializeWebsitePatterns();
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

    initializeFieldMappings() {
        return {
            // 个人基本信息
            firstName: {
                keywords: ['first.?name', 'fname', 'given.?name', '名', 'firstname', 'name.?first', 'prename'],
                patterns: [/firstName/i, /first_name/i, /name_first/i, /姓名.*名/],
                types: ['text'],
                priority: 10,
                categories: ['personal']
            },
            lastName: {
                keywords: ['last.?name', 'lname', 'family.?name', 'surname', '姓', 'lastname', 'name.?last'],
                patterns: [/lastName/i, /last_name/i, /name_last/i, /姓名.*姓/],
                types: ['text'],
                priority: 10,
                categories: ['personal']
            },
            fullName: {
                keywords: ['full.?name', 'name', '姓名', 'complete.?name', 'real.?name', '真实姓名'],
                patterns: [/fullName/i, /full_name/i, /realName/i, /真实姓名/],
                types: ['text'],
                priority: 9,
                categories: ['personal']
            },
            email: {
                keywords: ['email', 'e.?mail', '邮箱', '电子邮件', 'mail', 'email.?address'],
                patterns: [/email/i, /mail/i, /邮箱/],
                types: ['email', 'text'],
                priority: 10,
                categories: ['personal']
            },
            phone: {
                keywords: ['phone', 'tel', 'mobile', '电话', '手机', 'telephone', 'contact', '联系方式'],
                patterns: [/phone/i, /tel/i, /mobile/i, /电话/, /手机/],
                types: ['tel', 'text'],
                priority: 10,
                categories: ['personal']
            },
            
            // 地址信息
            address: {
                keywords: ['address', '地址', 'street', 'location', '住址', '详细地址'],
                patterns: [/address/i, /street/i, /地址/],
                types: ['text', 'textarea'],
                priority: 8,
                categories: ['personal']
            },
            city: {
                keywords: ['city', '城市', 'town', 'locality', '所在城市'],
                patterns: [/city/i, /town/i, /城市/],
                types: ['text', 'select-one'],
                priority: 8,
                categories: ['personal']
            },
            province: {
                keywords: ['state', 'province', '省', '州', 'region', '省份'],
                patterns: [/state/i, /province/i, /省/],
                types: ['text', 'select-one'],
                priority: 7,
                categories: ['personal']
            },
            zipCode: {
                keywords: ['zip', 'postal', '邮编', 'postcode', 'zip.?code', '邮政编码'],
                patterns: [/zip/i, /postal/i, /邮编/],
                types: ['text'],
                priority: 6,
                categories: ['personal']
            },
            
            // 教育经历
            education: {
                keywords: ['education', 'school', 'university', 'college', '教育', '学校', '大学', '院校'],
                patterns: [/education/i, /school/i, /university/i, /college/i, /教育/, /学校/],
                types: ['text', 'textarea', 'select-one'],
                priority: 9,
                categories: ['education']
            },
            degree: {
                keywords: ['degree', 'qualification', '学位', 'diploma', '学历'],
                patterns: [/degree/i, /qualification/i, /学位/, /学历/],
                types: ['text', 'select-one'],
                priority: 8,
                categories: ['education']
            },
            major: {
                keywords: ['major', 'field', 'study', '专业', 'specialization', '学科'],
                patterns: [/major/i, /field/i, /专业/, /学科/],
                types: ['text', 'select-one'],
                priority: 8,
                categories: ['education']
            },
            graduationDate: {
                keywords: ['graduation', 'graduate', '毕业时间', '毕业日期', 'grad.?date'],
                patterns: [/graduation/i, /graduate/i, /毕业/],
                types: ['date', 'text'],
                priority: 7,
                categories: ['education']
            },
            
            // 工作经验
            currentCompany: {
                keywords: ['company', 'employer', 'organization', '公司', '雇主', '单位', '现任公司'],
                patterns: [/company/i, /employer/i, /公司/, /单位/],
                types: ['text'],
                priority: 9,
                categories: ['experience']
            },
            currentPosition: {
                keywords: ['position', 'job.?title', 'title', 'role', '职位', '岗位', '职务'],
                patterns: [/position/i, /title/i, /role/i, /职位/, /岗位/],
                types: ['text'],
                priority: 9,
                categories: ['experience']
            },
            workExperience: {
                keywords: ['experience', 'work.?experience', '工作经验', 'employment', '工作经历'],
                patterns: [/experience/i, /work/i, /employment/i, /工作经验/, /工作经历/],
                types: ['textarea'],
                priority: 9,
                categories: ['experience']
            },
            salary: {
                keywords: ['salary', 'wage', 'pay', '薪资', '工资', '薪水', '期望薪资'],
                patterns: [/salary/i, /wage/i, /pay/i, /薪资/, /工资/],
                types: ['text', 'number'],
                priority: 7,
                categories: ['experience']
            },
            
            // 项目经历
            projectName: {
                keywords: ['project', 'project.?name', '项目名称', '项目', 'project.?title'],
                patterns: [/project.*name/i, /project.*title/i, /项目名称/, /项目标题/],
                types: ['text'],
                priority: 8,
                categories: ['project']
            },
            projectDescription: {
                keywords: ['project.?desc', 'project.?detail', '项目描述', '项目详情'],
                patterns: [/project.*desc/i, /project.*detail/i, /项目描述/, /项目详情/],
                types: ['textarea'],
                priority: 8,
                categories: ['project']
            },
            projectRole: {
                keywords: ['project.?role', '项目角色', '担任角色', 'role.?in.?project'],
                patterns: [/project.*role/i, /role.*project/i, /项目角色/],
                types: ['text'],
                priority: 7,
                categories: ['project']
            },
            
            // 技能和其他
            skills: {
                keywords: ['skill', 'skills', '技能', 'competencies', 'abilities', '专业技能'],
                patterns: [/skill/i, /competenc/i, /abilit/i, /技能/, /专长/],
                types: ['textarea', 'text'],
                priority: 9,
                categories: ['skills']
            },
            languages: {
                keywords: ['language', 'languages', '语言', '外语', 'foreign.?language'],
                patterns: [/language/i, /语言/, /外语/],
                types: ['text', 'textarea'],
                priority: 7,
                categories: ['skills']
            },
            certifications: {
                keywords: ['certification', 'certificate', '证书', '资格证', 'license'],
                patterns: [/certif/i, /license/i, /证书/, /资格/],
                types: ['text', 'textarea'],
                priority: 7,
                categories: ['skills']
            },
            
            // 社交媒体和联系方式
            linkedin: {
                keywords: ['linkedin', 'linked.?in', 'li', 'linkedin.?url'],
                patterns: [/linkedin/i, /li.*profile/i],
                types: ['url', 'text'],
                priority: 8,
                categories: ['social']
            },
            github: {
                keywords: ['github', 'git.?hub', 'github.?url'],
                patterns: [/github/i, /git.*hub/i],
                types: ['url', 'text'],
                priority: 7,
                categories: ['social']
            },
            website: {
                keywords: ['website', 'web.?site', 'homepage', 'portfolio', '个人网站', 'personal.?site'],
                patterns: [/website/i, /homepage/i, /portfolio/i, /个人网站/],
                types: ['url', 'text'],
                priority: 6,
                categories: ['social']
            },
            
            // 其他信息
            summary: {
                keywords: ['summary', 'objective', 'about', 'bio', '简介', '自我介绍', 'profile', '个人简介'],
                patterns: [/summary/i, /objective/i, /about/i, /bio/i, /简介/, /自我介绍/],
                types: ['textarea'],
                priority: 8,
                categories: ['other']
            },
            coverLetter: {
                keywords: ['cover.?letter', 'letter', '求职信', 'motivation', '动机信'],
                patterns: [/cover.*letter/i, /求职信/, /动机/],
                types: ['textarea'],
                priority: 6,
                categories: ['other']
            },
            expectedSalary: {
                keywords: ['expected.?salary', 'salary.?expectation', '期望薪资', '薪资期望'],
                patterns: [/expected.*salary/i, /salary.*expect/i, /期望薪资/],
                types: ['text', 'number'],
                priority: 7,
                categories: ['other']
            },
            
            // 文件上传
            resume: {
                keywords: ['resume', 'cv', '简历', 'curriculum'],
                patterns: [/resume/i, /cv/i, /简历/],
                types: ['file'],
                priority: 5,
                categories: ['file']
            }
        };
    }

    initializeWebsitePatterns() {
        return {
            // 大厂招聘网站特殊匹配规则
            tencent: {
                domain: ['tencent.com', 'qq.com'],
                patterns: {
                    name: ['input[name*="name"]', '.form-item input[placeholder*="姓名"]'],
                    email: ['input[name*="email"]', '.form-item input[type="email"]'],
                    phone: ['input[name*="phone"]', '.form-item input[placeholder*="手机"]']
                }
            },
            alibaba: {
                domain: ['alibaba.com', 'alibabagroup.com', 'taobao.com'],
                patterns: {
                    name: ['input[name*="realName"]', 'input[placeholder*="真实姓名"]'],
                    email: ['input[name*="email"]', 'input[type="email"]'],
                    phone: ['input[name*="mobile"]', 'input[placeholder*="手机号"]']
                }
            },
            bytedance: {
                domain: ['bytedance.com', 'toutiao.com'],
                patterns: {
                    name: ['input[name*="name"]', 'input[placeholder*="姓名"]'],
                    email: ['input[name*="email"]', 'input[type="email"]'],
                    phone: ['input[name*="phone"]', 'input[placeholder*="电话"]']
                }
            },
            jd: {
                domain: ['jd.com', 'jdwl.com'],
                patterns: {
                    name: ['input[name*="userName"]', 'input[placeholder*="姓名"]'],
                    email: ['input[name*="email"]', 'input[type="email"]'],
                    phone: ['input[name*="mobile"]', 'input[placeholder*="手机"]']
                }
            },
            meituan: {
                domain: ['meituan.com', 'dianping.com'],
                patterns: {
                    name: ['input[name*="name"]', 'input[placeholder*="姓名"]'],
                    email: ['input[name*="email"]', 'input[type="email"]'],
                    phone: ['input[name*="phone"]', 'input[placeholder*="手机"]']
                }
            }
        };
    }

    analyzeElement(element) {
        const analysisData = {
            element: element,
            id: element.id || '',
            name: element.name || '',
            placeholder: element.placeholder || '',
            label: this.getElementLabel(element),
            className: element.className || '',
            type: element.type || 'text',
            tagName: element.tagName.toLowerCase(),
            ariaLabel: element.getAttribute('aria-label') || '',
            dataAttributes: this.getDataAttributes(element)
        };

        // 组合所有可能的文本信息用于匹配
        const textToAnalyze = [
            analysisData.id,
            analysisData.name,
            analysisData.placeholder,
            analysisData.label,
            analysisData.className,
            analysisData.ariaLabel,
            analysisData.dataAttributes
        ].join(' ').toLowerCase();

        // 多层级匹配策略
        let bestMatch = null;
        let bestScore = 0;

        for (const [fieldType, mapping] of Object.entries(this.fieldMappings)) {
            const score = this.calculateAdvancedMatchScore(textToAnalyze, analysisData, mapping);
            if (score > bestScore && score > 5) { // 提高最低阈值
                bestScore = score;
                bestMatch = {
                    fieldType,
                    element,
                    score,
                    confidence: Math.min(score / 15, 1), // 调整置信度计算
                    category: mapping.categories[0],
                    matchReason: this.getMatchReason(textToAnalyze, analysisData, mapping)
                };
            }
        }

        return bestMatch;
    }

    calculateAdvancedMatchScore(text, analysisData, mapping) {
        let score = 0;

        // 1. 精确关键词匹配（最高权重）
        mapping.keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'i');
            if (regex.test(text)) {
                score += mapping.priority;
                
                // ID和name属性匹配额外加分
                if (regex.test(analysisData.id) || regex.test(analysisData.name)) {
                    score += 5;
                }
                
                // placeholder匹配加分
                if (regex.test(analysisData.placeholder)) {
                    score += 3;
                }
                
                // aria-label匹配加分
                if (regex.test(analysisData.ariaLabel)) {
                    score += 3;
                }
            }
        });

        // 2. 正则表达式模式匹配
        if (mapping.patterns) {
            mapping.patterns.forEach(pattern => {
                if (pattern.test(text)) {
                    score += mapping.priority + 2;
                }
            });
        }

        // 3. 元素类型匹配
        if (mapping.types.includes(analysisData.type) || mapping.types.includes(analysisData.tagName)) {
            score += 3;
        }

        // 4. 特殊规则加分
        score += this.applyAdvancedRules(text, analysisData, mapping);

        // 5. 网站特定模式匹配
        score += this.applyWebsiteSpecificRules(analysisData);

        return score;
    }

    applyAdvancedRules(text, analysisData, mapping) {
        let bonus = 0;

        // 邮箱字段特殊检测
        if (analysisData.type === 'email' && (text.includes('email') || text.includes('邮箱'))) {
            bonus += 8;
        }

        // 电话字段特殊检测
        if ((analysisData.type === 'tel' || /phone|tel|mobile|电话|手机/i.test(text)) && 
            mapping.categories.includes('personal')) {
            bonus += 6;
        }

        // 文件上传字段
        if (analysisData.type === 'file' && /resume|cv|简历/i.test(text)) {
            bonus += 7;
        }

        // 必填字段加分
        if (analysisData.element.required || /required|必填|\*|必须/i.test(text)) {
            bonus += 2;
        }

        // data属性匹配
        if (analysisData.dataAttributes && /name|email|phone|address/i.test(analysisData.dataAttributes)) {
            bonus += 3;
        }

        // 表单结构上下文加分
        const formContext = this.getFormContext(analysisData.element);
        if (formContext && this.isRelevantFormContext(formContext, mapping.categories)) {
            bonus += 2;
        }

        return bonus;
    }

    applyWebsiteSpecificRules(analysisData) {
        const hostname = window.location.hostname;
        let bonus = 0;

        // 检查是否匹配特定网站模式
        for (const [siteName, siteConfig] of Object.entries(this.websitePatterns)) {
            if (siteConfig.domain.some(domain => hostname.includes(domain))) {
                // 应用网站特定的匹配规则
                for (const [fieldType, selectors] of Object.entries(siteConfig.patterns)) {
                    for (const selector of selectors) {
                        if (analysisData.element.matches && analysisData.element.matches(selector)) {
                            bonus += 5;
                            break;
                        }
                    }
                }
            }
        }

        return bonus;
    }

    getDataAttributes(element) {
        const dataAttrs = [];
        for (const attr of element.attributes) {
            if (attr.name.startsWith('data-')) {
                dataAttrs.push(`${attr.name}=${attr.value}`);
            }
        }
        return dataAttrs.join(' ');
    }

    getElementLabel(element) {
        let label = '';

        // 查找直接关联的label元素
        if (element.id) {
            const labelElement = document.querySelector(`label[for="${element.id}"]`);
            if (labelElement) {
                label += labelElement.textContent || '';
            }
        }

        // 查找父级label元素
        const parentLabel = element.closest('label');
        if (parentLabel) {
            label += ' ' + (parentLabel.textContent || '');
        }

        // 查找附近的文本节点或标签
        const nearbyLabels = this.findNearbyLabels(element);
        label += ' ' + nearbyLabels;

        return label.trim();
    }

    findNearbyLabels(element) {
        const labels = [];
        const maxDistance = 3;

        // 向上查找父元素中的文本
        let current = element;
        for (let i = 0; i < maxDistance && current; i++) {
            current = current.parentElement;
            if (current) {
                const text = this.extractRelevantText(current);
                if (text) labels.push(text);
            }
        }

        // 查找前一个兄弟元素
        let sibling = element.previousElementSibling;
        for (let i = 0; i < maxDistance && sibling; i++) {
            const text = this.extractRelevantText(sibling);
            if (text) labels.push(text);
            sibling = sibling.previousElementSibling;
        }

        return labels.join(' ');
    }

    extractRelevantText(element) {
        if (!element) return '';

        const textContent = element.textContent || '';
        const trimmed = textContent.trim();

        // 忽略过长的文本（可能是段落内容）
        if (trimmed.length > 50) return '';
        
        // 忽略只包含特殊字符的文本
        if (/^[*\s\-_=+|<>()[\]{}]*$/.test(trimmed)) return '';

        return trimmed;
    }

    getFormContext(element) {
        const form = element.closest('form');
        if (form) {
            return {
                action: form.action,
                method: form.method,
                className: form.className,
                id: form.id
            };
        }
        return null;
    }

    isRelevantFormContext(formContext, categories) {
        if (!formContext) return false;
        
        const contextText = [
            formContext.action,
            formContext.className,
            formContext.id
        ].join(' ').toLowerCase();

        // 检查表单上下文是否与字段类别相关
        const relevantKeywords = {
            personal: ['profile', 'personal', 'contact', '个人', '联系'],
            education: ['education', 'school', 'study', '教育', '学习'],
            experience: ['experience', 'work', 'job', '工作', '经验'],
            project: ['project', 'portfolio', '项目', '作品'],
            skills: ['skill', 'ability', '技能', '能力']
        };

        return categories.some(category => {
            const keywords = relevantKeywords[category] || [];
            return keywords.some(keyword => contextText.includes(keyword));
        });
    }

    getMatchReason(text, analysisData, mapping) {
        const reasons = [];
        
        // 检查匹配原因
        mapping.keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'i');
            if (regex.test(analysisData.id)) reasons.push(`ID匹配: ${keyword}`);
            if (regex.test(analysisData.name)) reasons.push(`name属性匹配: ${keyword}`);
            if (regex.test(analysisData.placeholder)) reasons.push(`placeholder匹配: ${keyword}`);
        });

        if (mapping.types.includes(analysisData.type)) {
            reasons.push(`类型匹配: ${analysisData.type}`);
        }

        return reasons.join(', ');
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