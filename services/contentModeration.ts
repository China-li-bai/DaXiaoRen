export type ContentCheckResult = {
  passed: boolean;
  reason?: string;
  severity: 'error' | 'warning' | 'none';
};

const POLITICAL_KEYWORDS = [
  'president', 'minister', 'government', 'ccp', 'party', 'politician',
];

const SENSITIVE_ZH_KEYWORDS = [
  '习', '李', '政府', '党', '国家', '主席', '总理', '领导', '官员',
];

const REAL_NAME_PATTERNS = [
  /^[A-Z][a-z]+ [A-Z][a-z]+$/,
  /^[A-Z][a-z]+[A-Z][a-z]+$/,
  /^[\u4e00-\u9fa5]{2,4}$/,
];

export function checkContentCompliance(
  input: string,
  language: 'en' | 'zh'
): ContentCheckResult {
  const lowerInput = input.toLowerCase();
  
  for (const keyword of POLITICAL_KEYWORDS) {
    if (lowerInput.includes(keyword)) {
      return {
        passed: false,
        reason: 'Political content detected',
        severity: 'error',
      };
    }
  }
  
  if (language === 'zh') {
    for (const keyword of SENSITIVE_ZH_KEYWORDS) {
      if (input.includes(keyword)) {
        return {
          passed: false,
          reason: 'Sensitive keyword detected',
          severity: 'error',
        };
      }
    }
  }
  
  for (const pattern of REAL_NAME_PATTERNS) {
    if (pattern.test(input.trim())) {
      return {
        passed: true,
        reason: 'Possible real name detected - please use a fictional name',
        severity: 'warning',
      };
    }
  }
  
  if (input.length > 50) {
    return {
      passed: true,
      reason: 'Input is quite long - please keep it concise',
      severity: 'warning',
    };
  }
  
  return {
    passed: true,
    severity: 'none',
  };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}
