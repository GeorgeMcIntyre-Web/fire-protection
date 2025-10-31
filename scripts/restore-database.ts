/**
 * Database Restore Script
 * 
 * Restores database from backup files created by backup-database.ts
 * Supports full restoration and selective table restoration.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface RestoreConfig {
  supabaseUrl: string;
  supabaseKey: string;
  backupPath: string;
  tables?: string[]; // If specified, only restore these tables
  clearBeforeRestore?: boolean;
  dryRun?: boolean;
}

interface RestoreResult {
  success: boolean;
  tablesRestored: string[];
  recordsRestored: Record<string, number>;
  errors: Array<{ table: string; error: string }>;
}

class DatabaseRestore {
  private supabase: any;
  private config: RestoreConfig;

  constructor(config: RestoreConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  private async loadBackup(): Promise<any> {
    const backupFile = path.join(this.config.backupPath, 'backup.json');
    
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    console.log(`Loading backup from: ${backupFile}`);
    const backupData = fs.readFileSync(backupFile, 'utf-8');
    return JSON.parse(backupData);
  }

  private async loadMetadata(): Promise<any> {
    const metadataFile = path.join(this.config.backupPath, 'metadata.json');
    
    if (!fs.existsSync(metadataFile)) {
      console.warn('Metadata file not found');
      return null;
    }

    const metadata = fs.readFileSync(metadataFile, 'utf-8');
    return JSON.parse(metadata);
  }

  private async clearTable(tableName: string): Promise<void> {
    console.log(`Clearing table: ${tableName}`);
    
    if (this.config.dryRun) {
      console.log(`[DRY RUN] Would clear table ${tableName}`);
      return;
    }

    // Delete all records from table
    const { error } = await this.supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.warn(`Warning: Could not clear table ${tableName}:`, error.message);
    } else {
      console.log(`✓ Cleared table ${tableName}`);
    }
  }

  private async restoreTable(tableName: string, data: any[]): Promise<number> {
    console.log(`Restoring table: ${tableName} (${data.length} records)`);

    if (this.config.dryRun) {
      console.log(`[DRY RUN] Would restore ${data.length} records to ${tableName}`);
      return data.length;
    }

    if (data.length === 0) {
      console.log(`No data to restore for table ${tableName}`);
      return 0;
    }

    // Clear table if requested
    if (this.config.clearBeforeRestore) {
      await this.clearTable(tableName);
    }

    // Insert in batches to avoid timeout
    const batchSize = 100;
    let restored = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, Math.min(i + batchSize, data.length));
      
      try {
        const { error } = await this.supabase
          .from(tableName)
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          console.error(`Error restoring batch ${i / batchSize + 1}:`, error);
          throw error;
        }

        restored += batch.length;
        
        const progress = ((i + batch.length) / data.length * 100).toFixed(1);
        console.log(`  Progress: ${progress}% (${i + batch.length}/${data.length})`);
      } catch (error) {
        console.error(`Failed to restore batch starting at record ${i}:`, error);
        throw error;
      }
    }

    console.log(`✓ Restored ${restored} records to ${tableName}`);
    return restored;
  }

  private async verifyRestore(tableName: string, expectedCount: number): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`Error verifying table ${tableName}:`, error);
      return false;
    }

    const verified = count === expectedCount;
    const status = verified ? '✓' : '✗';
    
    console.log(`${status} Verification: ${tableName} - Expected: ${expectedCount}, Actual: ${count}`);
    
    return verified;
  }

  async restore(): Promise<RestoreResult> {
    console.log('Starting database restore...');
    console.log('================================');

    const result: RestoreResult = {
      success: true,
      tablesRestored: [],
      recordsRestored: {},
      errors: [],
    };

    try {
      // Load backup
      const backup = await this.loadBackup();
      const metadata = await this.loadMetadata();

      if (metadata) {
        console.log(`Backup created: ${metadata.timestamp}`);
        console.log(`Backup version: ${metadata.version}`);
        console.log(`Backup size: ${(metadata.size / 1024 / 1024).toFixed(2)} MB`);
        console.log('');
      }

      // Determine which tables to restore
      const tablesToRestore = this.config.tables || Object.keys(backup.data);

      console.log(`Restoring ${tablesToRestore.length} tables:`);
      tablesToRestore.forEach(t => console.log(`  - ${t}`));
      console.log('');

      // Restore each table
      for (const tableName of tablesToRestore) {
        if (!backup.data[tableName]) {
          console.warn(`⚠️  Table ${tableName} not found in backup`);
          result.errors.push({
            table: tableName,
            error: 'Table not found in backup',
          });
          continue;
        }

        const tableData = backup.data[tableName];

        if (tableData.error) {
          console.error(`✗ Cannot restore ${tableName}: ${tableData.error}`);
          result.errors.push({
            table: tableName,
            error: tableData.error,
          });
          continue;
        }

        try {
          const restored = await this.restoreTable(tableName, tableData);
          result.tablesRestored.push(tableName);
          result.recordsRestored[tableName] = restored;

          // Verify restoration
          if (!this.config.dryRun) {
            await this.verifyRestore(tableName, restored);
          }
        } catch (error: any) {
          console.error(`✗ Failed to restore table ${tableName}:`, error);
          result.errors.push({
            table: tableName,
            error: error.message || String(error),
          });
          result.success = false;
        }

        console.log('');
      }

      console.log('================================');
      console.log('Restore Summary:');
      console.log(`  Tables restored: ${result.tablesRestored.length}`);
      console.log(`  Total records: ${Object.values(result.recordsRestored).reduce((a, b) => a + b, 0)}`);
      
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.length}`);
        result.errors.forEach(e => {
          console.log(`    - ${e.table}: ${e.error}`);
        });
      }

      console.log('');
      
      if (result.success && result.errors.length === 0) {
        console.log('✓ Restore completed successfully!');
      } else {
        console.log('⚠️  Restore completed with errors');
      }

    } catch (error: any) {
      console.error('✗ Restore failed:', error);
      result.success = false;
      result.errors.push({
        table: 'general',
        error: error.message || String(error),
      });
    }

    return result;
  }

  async listAvailableBackups(backupsDir: string): Promise<Array<{ path: string; date: string; size: number }>> {
    const backups: Array<{ path: string; date: string; size: number }> = [];

    if (!fs.existsSync(backupsDir)) {
      return backups;
    }

    const files = fs.readdirSync(backupsDir);

    for (const file of files) {
      const fullPath = path.join(backupsDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && file.startsWith('backup-')) {
        const metadataPath = path.join(fullPath, 'metadata.json');
        
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          backups.push({
            path: fullPath,
            date: metadata.timestamp,
            size: metadata.size,
          });
        }
      }
    }

    return backups.sort((a, b) => b.date.localeCompare(a.date));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const backupPath = args[0] || process.env.BACKUP_PATH;
  const dryRun = args.includes('--dry-run');
  const clearBefore = args.includes('--clear');
  const tablesArg = args.find(arg => arg.startsWith('--tables='));
  const tables = tablesArg ? tablesArg.split('=')[1].split(',') : undefined;

  if (!backupPath) {
    console.error('Usage: node restore-database.ts <backup-path> [--dry-run] [--clear] [--tables=table1,table2]');
    console.error('');
    console.error('Available backups:');
    
    const backupsDir = process.env.BACKUP_DIR || './backups';
    const restore = new DatabaseRestore({
      supabaseUrl: '',
      supabaseKey: '',
      backupPath: '',
    });
    
    const backups = await restore.listAvailableBackups(backupsDir);
    backups.forEach((backup, index) => {
      console.log(`  ${index + 1}. ${path.basename(backup.path)}`);
      console.log(`     Date: ${backup.date}`);
      console.log(`     Size: ${(backup.size / 1024 / 1024).toFixed(2)} MB`);
      console.log('');
    });
    
    process.exit(1);
  }

  const config: RestoreConfig = {
    supabaseUrl: process.env.VITE_SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
    backupPath,
    tables,
    clearBeforeRestore: clearBefore,
    dryRun,
  };

  // Validate configuration
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('Error: Missing Supabase credentials');
    console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables');
    process.exit(1);
  }

  if (!fs.existsSync(backupPath)) {
    console.error(`Error: Backup path not found: ${backupPath}`);
    process.exit(1);
  }

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
    console.log('');
  }

  if (clearBefore && !dryRun) {
    console.log('⚠️  WARNING: This will clear existing data before restoring!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('');
  }

  const restore = new DatabaseRestore(config);

  try {
    const result = await restore.restore();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('\n✗ Restore failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { DatabaseRestore, RestoreConfig, RestoreResult };
