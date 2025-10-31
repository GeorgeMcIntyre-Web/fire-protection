/**
 * Production Health Check Script
 * 
 * Run this script to verify the production environment is ready
 * Usage: npx tsx scripts/production-health-check.ts
 */

import { createClient } from '@supabase/supabase-js';

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
}

const results: HealthCheckResult[] = [];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(status: 'pass' | 'fail' | 'warn', message: string) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? colors.green : status === 'fail' ? colors.red : colors.yellow;
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

async function checkEnvironmentVariables(): Promise<HealthCheckResult> {
  const name = 'Environment Variables';
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length === 0) {
    return {
      name,
      status: 'pass',
      message: 'All required environment variables are set',
    };
  } else {
    return {
      name,
      status: 'fail',
      message: `Missing environment variables: ${missing.join(', ')}`,
      details: { missing },
    };
  }
}

async function checkSupabaseConnection(): Promise<HealthCheckResult> {
  const name = 'Supabase Connection';
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        name,
        status: 'fail',
        message: 'Supabase credentials not configured',
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try a simple query
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      return {
        name,
        status: 'fail',
        message: `Supabase connection failed: ${error.message}`,
        details: error,
      };
    }
    
    return {
      name,
      status: 'pass',
      message: 'Successfully connected to Supabase',
    };
  } catch (error: any) {
    return {
      name,
      status: 'fail',
      message: `Connection error: ${error.message}`,
    };
  }
}

async function checkDatabaseTables(): Promise<HealthCheckResult> {
  const name = 'Database Tables';
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        name,
        status: 'fail',
        message: 'Cannot check tables: Supabase not configured',
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const requiredTables = [
      'profiles',
      'clients',
      'projects',
      'tasks',
      'time_logs',
      'work_documentation',
      'document_categories',
      'document_library',
      'project_documents',
    ];
    
    const tableChecks = await Promise.all(
      requiredTables.map(async (table) => {
        const { error } = await supabase.from(table).select('*').limit(1);
        return { table, exists: !error };
      })
    );
    
    const missingTables = tableChecks.filter(t => !t.exists).map(t => t.table);
    
    if (missingTables.length === 0) {
      return {
        name,
        status: 'pass',
        message: `All ${requiredTables.length} required tables exist`,
      };
    } else {
      return {
        name,
        status: 'fail',
        message: `Missing tables: ${missingTables.join(', ')}`,
        details: { missingTables },
      };
    }
  } catch (error: any) {
    return {
      name,
      status: 'fail',
      message: `Table check failed: ${error.message}`,
    };
  }
}

async function checkDocumentCategories(): Promise<HealthCheckResult> {
  const name = 'Document Categories';
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        name,
        status: 'fail',
        message: 'Cannot check categories: Supabase not configured',
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('document_categories')
      .select('*');
    
    if (error) {
      return {
        name,
        status: 'fail',
        message: `Categories check failed: ${error.message}`,
      };
    }
    
    const expectedCount = 9;
    const actualCount = data?.length || 0;
    
    if (actualCount === expectedCount) {
      return {
        name,
        status: 'pass',
        message: `All ${expectedCount} document categories exist`,
      };
    } else if (actualCount > 0) {
      return {
        name,
        status: 'warn',
        message: `Found ${actualCount} categories, expected ${expectedCount}`,
        details: { actualCount, expectedCount },
      };
    } else {
      return {
        name,
        status: 'fail',
        message: 'No document categories found. Run the SQL migration.',
      };
    }
  } catch (error: any) {
    return {
      name,
      status: 'fail',
      message: `Category check failed: ${error.message}`,
    };
  }
}

async function checkStorageBuckets(): Promise<HealthCheckResult> {
  const name = 'Storage Buckets';
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        name,
        status: 'fail',
        message: 'Cannot check storage: Supabase not configured',
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return {
        name,
        status: 'warn',
        message: `Storage check failed: ${error.message}`,
        details: error,
      };
    }
    
    const requiredBuckets = [
      'company-documents',
      'project-documents',
    ];
    
    const existingBuckets = buckets?.map(b => b.name) || [];
    const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
    
    if (missingBuckets.length === 0) {
      return {
        name,
        status: 'pass',
        message: 'All required storage buckets exist',
      };
    } else {
      return {
        name,
        status: 'warn',
        message: `Missing storage buckets: ${missingBuckets.join(', ')}`,
        details: { missingBuckets },
      };
    }
  } catch (error: any) {
    return {
      name,
      status: 'warn',
      message: `Storage check error: ${error.message}`,
    };
  }
}

async function checkDocuments(): Promise<HealthCheckResult> {
  const name = 'Company Documents';
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        name,
        status: 'fail',
        message: 'Cannot check documents: Supabase not configured',
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error, count } = await supabase
      .from('document_library')
      .select('*', { count: 'exact' });
    
    if (error) {
      return {
        name,
        status: 'fail',
        message: `Documents check failed: ${error.message}`,
      };
    }
    
    const documentCount = count || 0;
    
    if (documentCount >= 50) {
      return {
        name,
        status: 'pass',
        message: `${documentCount} documents uploaded`,
      };
    } else if (documentCount > 0) {
      return {
        name,
        status: 'warn',
        message: `Only ${documentCount} documents uploaded. Expected 50+.`,
        details: { documentCount },
      };
    } else {
      return {
        name,
        status: 'fail',
        message: 'No documents uploaded. Run: npm run upload-docs',
      };
    }
  } catch (error: any) {
    return {
      name,
      status: 'fail',
      message: `Document check failed: ${error.message}`,
    };
  }
}

async function checkApplicationVersion(): Promise<HealthCheckResult> {
  const name = 'Application Version';
  
  try {
    // Try to fetch from the deployed app
    const appUrl = 'https://fire-protection-tracker.pages.dev';
    const response = await fetch(appUrl);
    
    if (response.ok) {
      return {
        name,
        status: 'pass',
        message: 'Application is accessible',
      };
    } else {
      return {
        name,
        status: 'warn',
        message: `Application returned status ${response.status}`,
      };
    }
  } catch (error: any) {
    return {
      name,
      status: 'warn',
      message: 'Cannot reach production application',
    };
  }
}

async function runHealthChecks() {
  console.log(`\n${colors.bold}${colors.blue}🏥 Production Health Check${colors.reset}\n`);
  console.log('Running comprehensive health checks...\n');
  
  const checks = [
    checkEnvironmentVariables,
    checkSupabaseConnection,
    checkDatabaseTables,
    checkDocumentCategories,
    checkStorageBuckets,
    checkDocuments,
    checkApplicationVersion,
  ];
  
  for (const check of checks) {
    const result = await check();
    results.push(result);
    log(result.status, `${result.name}: ${result.message}`);
  }
  
  // Summary
  console.log(`\n${colors.bold}${colors.blue}📊 Summary${colors.reset}\n`);
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warned = results.filter(r => r.status === 'warn').length;
  
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${warned}${colors.reset}`);
  
  const total = results.length;
  const score = Math.round((passed / total) * 100);
  
  console.log(`\n${colors.bold}Health Score: ${score}%${colors.reset}`);
  
  if (score === 100) {
    console.log(`\n${colors.green}${colors.bold}✨ All checks passed! Production ready! ✨${colors.reset}\n`);
  } else if (score >= 80) {
    console.log(`\n${colors.yellow}${colors.bold}⚠️  Almost ready, but some issues need attention${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ Critical issues found. Not ready for production.${colors.reset}\n`);
  }
  
  // Show failed checks with details
  const failedChecks = results.filter(r => r.status === 'fail');
  if (failedChecks.length > 0) {
    console.log(`${colors.bold}${colors.red}Failed Checks:${colors.reset}`);
    failedChecks.forEach(check => {
      console.log(`  - ${check.name}: ${check.message}`);
      if (check.details) {
        console.log(`    Details: ${JSON.stringify(check.details, null, 2)}`);
      }
    });
    console.log();
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run the health checks
runHealthChecks().catch((error) => {
  console.error(`${colors.red}Fatal error during health check:${colors.reset}`, error);
  process.exit(1);
});

