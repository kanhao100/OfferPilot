// OfferPilot Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('OfferPilot installed successfully!');
  
  // Initialize default settings
  chrome.storage.local.set({
    'offerpilot_enabled': true,
    'auto_detect': true,
    'current_resume_id': 'default',
    'resumes': {
      'default': {
        id: 'default',
        name: '默认简历',
        personal: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          linkedin: '',
          github: '',
          website: ''
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        languages: [],
        certifications: []
      }
    }
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getResumeData':
      getResumeData(request.resumeId)
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'saveResumeData':
      saveResumeData(request.resumeId, request.data)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'detectWebsite':
      const hostname = new URL(sender.tab.url).hostname;
      const adapter = detectRecruitmentSite(hostname);
      sendResponse({ adapter, hostname });
      break;
  }
});

async function getResumeData(resumeId = 'default') {
  const result = await chrome.storage.local.get(['resumes', 'current_resume_id']);
  const currentId = resumeId || result.current_resume_id || 'default';
  return result.resumes?.[currentId] || result.resumes?.default;
}

async function saveResumeData(resumeId, data) {
  const result = await chrome.storage.local.get('resumes');
  const resumes = result.resumes || {};
  resumes[resumeId] = { ...resumes[resumeId], ...data };
  await chrome.storage.local.set({ resumes });
}

function detectRecruitmentSite(hostname) {
  const adapters = {
    'linkedin.com': 'linkedin',
    'indeed.com': 'indeed',
    'glassdoor.com': 'glassdoor',
    'monster.com': 'monster',
    'ziprecruiter.com': 'ziprecruiter',
    'workday.com': 'workday',
    'myworkdayjobs.com': 'workday',
    'jobs.lever.co': 'lever',
    'greenhouse.io': 'greenhouse',
    'zhaopin.com': 'zhilian',
    'lagou.com': 'lagou',
    'boss.com': 'boss',
    '51job.com': '51job',
    'liepin.com': 'liepin'
  };
  
  for (const [domain, adapter] of Object.entries(adapters)) {
    if (hostname.includes(domain)) {
      return adapter;
    }
  }
  
  return 'generic';
}