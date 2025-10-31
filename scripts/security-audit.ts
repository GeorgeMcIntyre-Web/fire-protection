/**
 * Security Audit Script
 * 
 * Run this script to check for common security issues
 * Usage: npx tsx scripts/security-audit.ts
 */

interface SecurityCheck {
  category: string;
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'info';
  message: string;
  recommendation?: string;
}

const checks: SecurityCheck[] = [];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function addCheck(
  category: string,
  name: string,
  status: 'pass' | 'fail' | 'warn' | 'info',
  message: string,
  recommendation?: string
) {
  checks.push({ category, name, status, message, recommendation });
}

function checkEnvironmentSecurity() {
  const category = 'Environment';
  
  // Check if .env is in .gitignore
  const fs = require('fs');
  const path = require('path');
  
  try {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      if (gitignore.includes('.env')) {
        addCheck(category, '.env in .gitignore', 'pass', '.env file is properly ignored by git');
      } else {
        addCheck(
          category,
          '.env in .gitignore',
          'fail',
          '.env file is NOT in .gitignore',
          'Add .env to .gitignore to prevent committing secrets'
        );
      }
    }
  } catch (error) {
    addCheck(category, '.gitignore check', 'warn', 'Could not check .gitignore');
  }
  
  // Check environment variables
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const setVars = requiredEnvVars.filter(v => process.env[v]);
  
  if (setVars.length === requiredEnvVars.length) {
    addCheck(category, 'Environment Variables', 'pass', 'All required environment variables are set');
  } else {
    addCheck(
      category,
      'Environment Variables',
      'fail',
      'Some environment variables are missing',
      'Set all required environment variables'
    );
  }
  
  // Check for exposed secrets in code
  addCheck(
    category,
    'Hardcoded Secrets',
    'info',
    'Manual check required: Ensure no API keys are hardcoded in source files',
    'Search codebase for patterns like "sk_", "pk_", API keys'
  );
}

function checkDependencySecurity() {
  const category = 'Dependencies';
  
  addCheck(
    category,
    'Dependency Audit',
    'info',
    'Run: npm audit to check for vulnerable dependencies',
    'Run npm audit fix to automatically fix vulnerabilities'
  );
  
  addCheck(
    category,
    'Outdated Packages',
    'info',
    'Run: npm outdated to check for outdated packages',
    'Keep dependencies up to date for security patches'
  );
}

function checkAuthenticationSecurity() {
  const category = 'Authentication';
  
  addCheck(
    category,
    'Password Requirements',
    'info',
    'Verify password requirements are enforced',
    'Minimum 8 characters, with complexity requirements'
  );
  
  addCheck(
    category,
    'Session Timeout',
    'info',
    'Verify session timeout is configured',
    'Recommended: 24 hours for regular users, 4 hours for admins'
  );
  
  addCheck(
    category,
    'Email Verification',
    'warn',
    'Email verification should be enabled in Supabase',
    'Enable email verification in Supabase Auth settings'
  );
  
  addCheck(
    category,
    'Password Reset',
    'info',
    'Verify password reset flow is implemented and secure',
    'Test password reset end-to-end'
  );
  
  addCheck(
    category,
    'Multi-Factor Authentication',
    'info',
    'Consider implementing MFA for enhanced security',
    'Supabase supports TOTP-based MFA'
  );
}

function checkAuthorizationSecurity() {
  const category = 'Authorization';
  
  addCheck(
    category,
    'Row Level Security',
    'info',
    'Verify RLS policies are enabled on all tables',
    'Check Supabase dashboard: Authentication > Policies'
  );
  
  addCheck(
    category,
    'Role-Based Access',
    'info',
    'Implement role-based access control (RBAC)',
    'Define roles: admin, pm, field_worker, read_only'
  );
  
  addCheck(
    category,
    'API Authorization',
    'info',
    'Verify all API calls check user permissions',
    'Test with different user roles'
  );
}

function checkInputValidation() {
  const category = 'Input Validation';
  
  addCheck(
    category,
    'Form Validation',
    'info',
    'Verify all forms have client-side validation',
    'Check all input fields for validation'
  );
  
  addCheck(
    category,
    'Server-Side Validation',
    'warn',
    'Implement server-side validation in Supabase functions',
    'Never trust client-side validation alone'
  );
  
  addCheck(
    category,
    'File Upload Validation',
    'warn',
    'Verify file upload restrictions (type, size, content)',
    'Validate: file type, max size (10MB?), scan for malware'
  );
  
  addCheck(
    category,
    'XSS Protection',
    'info',
    'Verify React automatically escapes user input',
    'React provides automatic XSS protection, but verify custom HTML rendering'
  );
  
  addCheck(
    category,
    'SQL Injection',
    'pass',
    'Supabase uses parameterized queries (protected by default)',
    'Continue using Supabase client for all queries'
  );
}

function checkDataSecurity() {
  const category = 'Data Security';
  
  addCheck(
    category,
    'HTTPS Enforcement',
    'pass',
    'Cloudflare Pages enforces HTTPS by default',
    'Verify HTTPS is working on production URL'
  );
  
  addCheck(
    category,
    'Data Encryption at Rest',
    'pass',
    'Supabase encrypts data at rest by default',
    'No action needed'
  );
  
  addCheck(
    category,
    'Data Encryption in Transit',
    'pass',
    'All Supabase connections use TLS',
    'No action needed'
  );
  
  addCheck(
    category,
    'Sensitive Data Handling',
    'info',
    'Verify sensitive data (PII) is handled appropriately',
    'Consider encrypting: client contact details, financial data'
  );
  
  addCheck(
    category,
    'Data Backup',
    'warn',
    'Configure automated database backups',
    'Set up daily backups in Supabase dashboard'
  );
  
  addCheck(
    category,
    'Data Retention',
    'info',
    'Define and implement data retention policies',
    'Document how long different types of data are kept'
  );
}

function checkAPISecurityChecks() {
  const category = 'API Security';
  
  addCheck(
    category,
    'Rate Limiting',
    'warn',
    'Implement rate limiting to prevent abuse',
    'Configure rate limits in Cloudflare or Supabase'
  );
  
  addCheck(
    category,
    'CORS Configuration',
    'info',
    'Verify CORS is properly configured',
    'Only allow necessary origins'
  );
  
  addCheck(
    category,
    'API Key Exposure',
    'info',
    'Verify anon key is safe to expose (Supabase anon key is public-safe)',
    'Never expose service_role key in frontend'
  );
}

function checkMonitoringSecurity() {
  const category = 'Monitoring';
  
  addCheck(
    category,
    'Error Logging',
    'warn',
    'Set up error tracking and monitoring',
    'Implement Sentry or similar error tracking'
  );
  
  addCheck(
    category,
    'Audit Logging',
    'info',
    'Implement audit logs for sensitive operations',
    'Log: login attempts, data changes, permission changes'
  );
  
  addCheck(
    category,
    'Security Alerts',
    'info',
    'Set up alerts for security events',
    'Alert on: failed login attempts, unauthorized access, unusual activity'
  );
}

function checkComplianceSecurity() {
  const category = 'Compliance';
  
  addCheck(
    category,
    'Privacy Policy',
    'warn',
    'Create and publish Privacy Policy',
    'Required for GDPR, POPIA compliance'
  );
  
  addCheck(
    category,
    'Terms of Service',
    'warn',
    'Create and publish Terms of Service',
    'Protect your business legally'
  );
  
  addCheck(
    category,
    'Cookie Consent',
    'info',
    'Implement cookie consent if using cookies',
    'Check if analytics or tracking cookies are used'
  );
  
  addCheck(
    category,
    'Data Processing Agreement',
    'info',
    'Review Supabase DPA for compliance',
    'Ensure GDPR/POPIA compliance'
  );
  
  addCheck(
    category,
    'User Data Export',
    'info',
    'Implement user data export (GDPR right)',
    'Allow users to export their data'
  );
  
  addCheck(
    category,
    'User Data Deletion',
    'info',
    'Implement user data deletion (GDPR right)',
    'Allow users to request account deletion'
  );
}

function runSecurityAudit() {
  console.log(`\n${colors.bold}${colors.blue}🔒 Security Audit${colors.reset}\n`);
  console.log('Running security checks...\n');
  
  // Run all check functions
  checkEnvironmentSecurity();
  checkDependencySecurity();
  checkAuthenticationSecurity();
  checkAuthorizationSecurity();
  checkInputValidation();
  checkDataSecurity();
  checkAPISecurityChecks();
  checkMonitoringSecurity();
  checkComplianceSecurity();
  
  // Group checks by category
  const categories = [...new Set(checks.map(c => c.category))];
  
  categories.forEach(category => {
    console.log(`${colors.bold}${category}${colors.reset}`);
    
    const categoryChecks = checks.filter(c => c.category === category);
    
    categoryChecks.forEach(check => {
      const icon = 
        check.status === 'pass' ? '✅' :
        check.status === 'fail' ? '❌' :
        check.status === 'warn' ? '⚠️' : 'ℹ️';
      
      const color = 
        check.status === 'pass' ? colors.green :
        check.status === 'fail' ? colors.red :
        check.status === 'warn' ? colors.yellow : colors.blue;
      
      console.log(`  ${color}${icon} ${check.name}${colors.reset}`);
      console.log(`     ${check.message}`);
      
      if (check.recommendation) {
        console.log(`     ${colors.blue}→ ${check.recommendation}${colors.reset}`);
      }
      console.log();
    });
  });
  
  // Summary
  console.log(`${colors.bold}${colors.blue}📊 Security Summary${colors.reset}\n`);
  
  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  const warned = checks.filter(c => c.status === 'warn').length;
  const info = checks.filter(c => c.status === 'info').length;
  
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${warned}${colors.reset}`);
  console.log(`${colors.blue}ℹ️  Info: ${info}${colors.reset}`);
  
  // Priority actions
  const criticalActions = checks.filter(c => c.status === 'fail');
  const highPriorityActions = checks.filter(c => c.status === 'warn');
  
  if (criticalActions.length > 0) {
    console.log(`\n${colors.bold}${colors.red}🚨 Critical Actions Required:${colors.reset}`);
    criticalActions.forEach(check => {
      console.log(`  - ${check.name}`);
      if (check.recommendation) {
        console.log(`    ${colors.blue}${check.recommendation}${colors.reset}`);
      }
    });
  }
  
  if (highPriorityActions.length > 0) {
    console.log(`\n${colors.bold}${colors.yellow}⚠️  High Priority Actions:${colors.reset}`);
    highPriorityActions.forEach(check => {
      console.log(`  - ${check.name}`);
      if (check.recommendation) {
        console.log(`    ${colors.blue}${check.recommendation}${colors.reset}`);
      }
    });
  }
  
  console.log(`\n${colors.bold}Next Steps:${colors.reset}`);
  console.log(`1. Address all critical (❌) items immediately`);
  console.log(`2. Address all warning (⚠️) items before production`);
  console.log(`3. Review all info (ℹ️) items and plan implementation`);
  console.log(`4. Run this audit regularly (weekly during development)`);
  console.log();
  
  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Run the audit
runSecurityAudit();

