/**
 * Security Audit Script
 * 
 * Comprehensive security audit tool that checks for common vulnerabilities
 * and security best practices in the codebase.
 * 
 * Usage: npm run security-audit
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditResult {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  file?: string;
  line?: number;
  recommendation?: string;
}

interface AuditSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  passed: boolean;
}

const results: AuditResult[] = [];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function addResult(result: AuditResult): void {
  results.push(result);
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: '\x1b[41m\x1b[37m', // Red background, white text
    high: '\x1b[31m', // Red
    medium: '\x1b[33m', // Yellow
    low: '\x1b[36m', // Cyan
    info: '\x1b[37m', // White
  };
  return colors[severity] || '\x1b[37m';
}

function resetColor(): string {
  return '\x1b[0m';
}

function scanFile(filePath: string, patterns: Array<{ regex: RegExp; message: string; severity: AuditResult['severity']; recommendation?: string }>): void {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    patterns.forEach(({ regex, message, severity, recommendation }) => {
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          addResult({
            category: 'Code Analysis',
            severity,
            message,
            file: filePath,
            line: index + 1,
            recommendation,
          });
        }
      });
    });
  } catch (error) {
    // File not accessible or doesn't exist
  }
}

function scanDirectory(dir: string, fileExtensions: string[], callback: (filePath: string) => void): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          scanDirectory(fullPath, fileExtensions, callback);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (fileExtensions.includes(ext)) {
          callback(fullPath);
        }
      }
    });
  } catch (error) {
    // Directory not accessible
  }
}

// ============================================
// AUDIT CHECKS
// ============================================

function checkEnvironmentVariables(): void {
  console.log('Checking environment variables...');

  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const envFile = path.join(process.cwd(), '.env');
  const envExampleFile = path.join(process.cwd(), 'env.example');

  // Check if .env file exists
  if (!fs.existsSync(envFile)) {
    addResult({
      category: 'Environment',
      severity: 'high',
      message: '.env file not found',
      recommendation: 'Create a .env file with required environment variables',
    });
  } else {
    const envContent = fs.readFileSync(envFile, 'utf-8');

    requiredEnvVars.forEach(varName => {
      if (!envContent.includes(varName)) {
        addResult({
          category: 'Environment',
          severity: 'high',
          message: `Missing required environment variable: ${varName}`,
          recommendation: `Add ${varName} to your .env file`,
        });
      } else if (envContent.includes(`${varName}=your-`) || envContent.includes(`${varName}=`)) {
        // Check if it looks like a placeholder
        const match = envContent.match(new RegExp(`${varName}=(.+)`));
        if (match && (match[1].startsWith('your-') || match[1].trim() === '')) {
          addResult({
            category: 'Environment',
            severity: 'critical',
            message: `Environment variable ${varName} appears to be a placeholder`,
            recommendation: 'Replace with actual value from Supabase dashboard',
          });
        }
      }
    });
  }

  // Check if env.example exists
  if (!fs.existsSync(envExampleFile)) {
    addResult({
      category: 'Environment',
      severity: 'low',
      message: 'env.example file not found',
      recommendation: 'Create an env.example file to document required environment variables',
    });
  }
}

function checkHardcodedSecrets(): void {
  console.log('Scanning for hardcoded secrets...');

  const secretPatterns = [
    {
      regex: /sk_live_[a-zA-Z0-9]{24,}/,
      message: 'Potential Stripe live secret key found',
      severity: 'critical' as const,
      recommendation: 'Remove hardcoded secret key and use environment variables',
    },
    {
      regex: /sk_test_[a-zA-Z0-9]{24,}/,
      message: 'Potential Stripe test secret key found',
      severity: 'high' as const,
      recommendation: 'Remove hardcoded secret key and use environment variables',
    },
    {
      regex: /password\s*=\s*["'][^"']+["']/i,
      message: 'Potential hardcoded password found',
      severity: 'critical' as const,
      recommendation: 'Never hardcode passwords. Use environment variables or secure secret management',
    },
    {
      regex: /api[_-]?key\s*=\s*["'][^"']+["']/i,
      message: 'Potential hardcoded API key found',
      severity: 'high' as const,
      recommendation: 'Move API keys to environment variables',
    },
    {
      regex: /Bearer\s+[a-zA-Z0-9\-._~+\/]+=*/,
      message: 'Potential hardcoded bearer token found',
      severity: 'high' as const,
      recommendation: 'Remove hardcoded tokens',
    },
  ];

  scanDirectory(path.join(process.cwd(), 'src'), ['.ts', '.tsx', '.js', '.jsx'], (filePath) => {
    scanFile(filePath, secretPatterns);
  });
}

function checkSecurityBestPractices(): void {
  console.log('Checking security best practices...');

  const bestPracticePatterns = [
    {
      regex: /eval\(/,
      message: 'Use of eval() detected - potential security risk',
      severity: 'critical' as const,
      recommendation: 'Avoid using eval(). It can execute arbitrary code and is a major security vulnerability',
    },
    {
      regex: /dangerouslySetInnerHTML/,
      message: 'Use of dangerouslySetInnerHTML detected',
      severity: 'high' as const,
      recommendation: 'Ensure content is properly sanitized before using dangerouslySetInnerHTML',
    },
    {
      regex: /innerHTML\s*=/,
      message: 'Direct assignment to innerHTML detected',
      severity: 'high' as const,
      recommendation: 'Use textContent or sanitize HTML before assignment to prevent XSS',
    },
    {
      regex: /localStorage\.setItem.*password/i,
      message: 'Storing password in localStorage',
      severity: 'critical' as const,
      recommendation: 'Never store passwords in localStorage. Use secure session management',
    },
    {
      regex: /console\.(log|error|warn|info)\(/,
      message: 'Console statement found',
      severity: 'low' as const,
      recommendation: 'Remove console statements in production code',
    },
  ];

  scanDirectory(path.join(process.cwd(), 'src'), ['.ts', '.tsx', '.js', '.jsx'], (filePath) => {
    scanFile(filePath, bestPracticePatterns);
  });
}

function checkDependencyVulnerabilities(): void {
  console.log('Checking dependencies...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    addResult({
      category: 'Dependencies',
      severity: 'high',
      message: 'package.json not found',
      recommendation: 'Ensure package.json exists',
    });
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Check for package-lock.json
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');
  if (!fs.existsSync(packageLockPath)) {
    addResult({
      category: 'Dependencies',
      severity: 'medium',
      message: 'package-lock.json not found',
      recommendation: 'Run npm install to generate package-lock.json for reproducible builds',
    });
  }

  // Check for outdated packages (simplified check)
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  Object.entries(allDeps).forEach(([name, version]) => {
    // Check for wildcard versions
    if (typeof version === 'string' && (version.includes('*') || version.includes('x'))) {
      addResult({
        category: 'Dependencies',
        severity: 'medium',
        message: `Package ${name} uses wildcard version`,
        recommendation: 'Use specific version numbers for better security and reproducibility',
      });
    }
  });

  addResult({
    category: 'Dependencies',
    severity: 'info',
    message: 'Run "npm audit" to check for known vulnerabilities',
    recommendation: 'Regularly run npm audit and update vulnerable packages',
  });
}

function checkAuthImplementation(): void {
  console.log('Checking authentication implementation...');

  const authContextPath = path.join(process.cwd(), 'src/contexts/AuthContext.tsx');
  
  if (!fs.existsSync(authContextPath)) {
    addResult({
      category: 'Authentication',
      severity: 'critical',
      message: 'AuthContext not found',
      recommendation: 'Implement authentication system',
    });
    return;
  }

  const authContent = fs.readFileSync(authContextPath, 'utf-8');

  // Check for password validation
  if (!authContent.includes('validatePassword') && !authContent.includes('password validation')) {
    addResult({
      category: 'Authentication',
      severity: 'high',
      message: 'Password validation not implemented',
      recommendation: 'Implement password strength validation',
    });
  }

  // Check for rate limiting
  if (!authContent.includes('rateLimit') && !authContent.includes('rate limit')) {
    addResult({
      category: 'Authentication',
      severity: 'high',
      message: 'Rate limiting not implemented for authentication',
      recommendation: 'Implement rate limiting to prevent brute force attacks',
    });
  }

  // Check for session management
  if (!authContent.includes('session') && !authContent.includes('Session')) {
    addResult({
      category: 'Authentication',
      severity: 'medium',
      message: 'Session management may not be implemented',
      recommendation: 'Implement proper session management with timeouts',
    });
  }
}

function checkRLSPolicies(): void {
  console.log('Checking RLS policies...');

  const rlsFiles = [
    'supabase-rls-policies-enhanced.sql',
    'supabase-complete-setup.sql',
    'supabase-setup.sql',
  ];

  let foundRLS = false;

  rlsFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      foundRLS = true;
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check if RLS is enabled
      if (!content.includes('ENABLE ROW LEVEL SECURITY')) {
        addResult({
          category: 'Database Security',
          severity: 'critical',
          message: `RLS not enabled in ${file}`,
          file,
          recommendation: 'Enable Row Level Security for all tables',
        });
      }

      // Check for policies
      if (!content.includes('CREATE POLICY')) {
        addResult({
          category: 'Database Security',
          severity: 'critical',
          message: `No RLS policies found in ${file}`,
          file,
          recommendation: 'Create RLS policies for all tables',
        });
      }
    }
  });

  if (!foundRLS) {
    addResult({
      category: 'Database Security',
      severity: 'critical',
      message: 'No RLS policy files found',
      recommendation: 'Create Supabase RLS policies to secure database access',
    });
  }
}

function checkInputValidation(): void {
  console.log('Checking input validation...');

  const validationPath = path.join(process.cwd(), 'src/lib/validation.ts');
  
  if (!fs.existsSync(validationPath)) {
    addResult({
      category: 'Input Validation',
      severity: 'critical',
      message: 'Validation utilities not found',
      recommendation: 'Create comprehensive input validation utilities',
    });
    return;
  }

  const validationContent = fs.readFileSync(validationPath, 'utf-8');

  const requiredValidators = [
    { name: 'validateEmail', message: 'Email validation' },
    { name: 'validatePassword', message: 'Password validation' },
    { name: 'sanitizeHtml', message: 'HTML sanitization' },
    { name: 'validateFile', message: 'File validation' },
  ];

  requiredValidators.forEach(({ name, message }) => {
    if (!validationContent.includes(name)) {
      addResult({
        category: 'Input Validation',
        severity: 'high',
        message: `${message} not implemented`,
        file: validationPath,
        recommendation: `Implement ${name} function`,
      });
    }
  });
}

function checkRBAC(): void {
  console.log('Checking RBAC implementation...');

  const rbacPath = path.join(process.cwd(), 'src/lib/rbac.ts');
  
  if (!fs.existsSync(rbacPath)) {
    addResult({
      category: 'Authorization',
      severity: 'high',
      message: 'RBAC system not found',
      recommendation: 'Implement role-based access control',
    });
    return;
  }

  const rbacContent = fs.readFileSync(rbacPath, 'utf-8');

  // Check for role definitions
  if (!rbacContent.includes('admin') || !rbacContent.includes('manager') || !rbacContent.includes('technician')) {
    addResult({
      category: 'Authorization',
      severity: 'medium',
      message: 'Not all roles are defined',
      file: rbacPath,
      recommendation: 'Define all required roles: admin, manager, technician, readonly',
    });
  }

  // Check for permission checking
  if (!rbacContent.includes('hasPermission')) {
    addResult({
      category: 'Authorization',
      severity: 'high',
      message: 'Permission checking function not found',
      file: rbacPath,
      recommendation: 'Implement hasPermission function',
    });
  }
}

function checkSecurityDocumentation(): void {
  console.log('Checking security documentation...');

  const docs = [
    { file: 'SECURITY.md', severity: 'medium' as const, description: 'Security policy' },
    { file: 'AUTHENTICATION_GUIDE.md', severity: 'low' as const, description: 'Authentication guide' },
    { file: 'RLS_POLICIES.md', severity: 'low' as const, description: 'RLS policies documentation' },
  ];

  docs.forEach(({ file, severity, description }) => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      addResult({
        category: 'Documentation',
        severity,
        message: `${description} not found`,
        recommendation: `Create ${file} to document ${description}`,
      });
    }
  });
}

// ============================================
// REPORT GENERATION
// ============================================

function generateSummary(): AuditSummary {
  const summary: AuditSummary = {
    total: results.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    passed: true,
  };

  results.forEach(result => {
    summary[result.severity]++;
  });

  // Fail if there are critical or high severity issues
  summary.passed = summary.critical === 0 && summary.high === 0;

  return summary;
}

function printReport(): void {
  console.log('\n' + '='.repeat(80));
  console.log('SECURITY AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  if (results.length === 0) {
    console.log('✅ No security issues found!\n');
    return;
  }

  // Group results by severity
  const groupedResults: Record<string, AuditResult[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    info: [],
  };

  results.forEach(result => {
    groupedResults[result.severity].push(result);
  });

  // Print results by severity
  Object.entries(groupedResults).forEach(([severity, items]) => {
    if (items.length === 0) return;

    const color = getSeverityColor(severity);
    console.log(`${color}${severity.toUpperCase()} (${items.length})${resetColor()}\n`);

    items.forEach((item, index) => {
      console.log(`${index + 1}. [${item.category}] ${item.message}`);
      if (item.file) {
        console.log(`   File: ${item.file}${item.line ? `:${item.line}` : ''}`);
      }
      if (item.recommendation) {
        console.log(`   💡 ${item.recommendation}`);
      }
      console.log();
    });
  });
}

function printSummary(summary: AuditSummary): void {
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80) + '\n');

  console.log(`Total Issues: ${summary.total}`);
  console.log(`${getSeverityColor('critical')}Critical: ${summary.critical}${resetColor()}`);
  console.log(`${getSeverityColor('high')}High: ${summary.high}${resetColor()}`);
  console.log(`${getSeverityColor('medium')}Medium: ${summary.medium}${resetColor()}`);
  console.log(`${getSeverityColor('low')}Low: ${summary.low}${resetColor()}`);
  console.log(`${getSeverityColor('info')}Info: ${summary.info}${resetColor()}\n`);

  if (summary.passed) {
    console.log('✅ Security audit PASSED\n');
  } else {
    console.log('❌ Security audit FAILED\n');
    console.log('Please address all critical and high severity issues before deployment.\n');
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

function main(): void {
  console.log('\nStarting security audit...\n');

  checkEnvironmentVariables();
  checkHardcodedSecrets();
  checkSecurityBestPractices();
  checkDependencyVulnerabilities();
  checkAuthImplementation();
  checkRLSPolicies();
  checkInputValidation();
  checkRBAC();
  checkSecurityDocumentation();

  printReport();
  const summary = generateSummary();
  printSummary(summary);

  // Exit with error code if audit failed
  process.exit(summary.passed ? 0 : 1);
}

// Run audit
main();
