/**
 * Sync Queue System for Offline Operations
 * Manages the queue of operations to be synced when online
 */

import { getDB, saveItem, getItem, getAllItems } from './indexeddb';
import { supabase } from './supabase';

export interface SyncQueueItem {
  id?: number;
  entity: 'projects' | 'tasks' | 'timeEntries' | 'documents' | 'clients';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Add an operation to the sync queue
 */
export async function addToSyncQueue(
  entity: SyncQueueItem['entity'],
  entityId: string,
  operation: SyncQueueItem['operation'],
  data: any
): Promise<void> {
  const db = await getDB();
  
  const queueItem: SyncQueueItem = {
    entity,
    entityId,
    operation,
    data,
    timestamp: Date.now(),
    retries: 0,
  };

  await db.add('syncQueue', queueItem);
}

/**
 * Get all pending sync items
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return getAllItems('syncQueue');
}

/**
 * Get sync queue count
 */
export async function getSyncQueueCount(): Promise<number> {
  const items = await getSyncQueue();
  return items.length;
}

/**
 * Process a single sync item
 */
async function processSyncItem(item: SyncQueueItem): Promise<boolean> {
  try {
    const { entity, entityId, operation, data } = item;

    // Map entity names to Supabase table names
    const tableMap: Record<string, string> = {
      projects: 'projects',
      tasks: 'tasks',
      timeEntries: 'time_entries',
      documents: 'documents',
      clients: 'clients',
    };

    const tableName = tableMap[entity];
    if (!tableName) {
      throw new Error(`Unknown entity type: ${entity}`);
    }

    switch (operation) {
      case 'create':
        const { error: createError } = await supabase
          .from(tableName)
          .insert(data);
        if (createError) throw createError;
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', entityId);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', entityId);
        if (deleteError) throw deleteError;
        break;
    }

    // Mark the item as synced in IndexedDB
    await markItemSynced(entity, entityId);

    return true;
  } catch (error) {
    console.error('Sync error:', error);
    return false;
  }
}

/**
 * Mark an item as synced in IndexedDB
 */
async function markItemSynced(
  entity: SyncQueueItem['entity'],
  entityId: string
): Promise<void> {
  const item = await getItem(entity, entityId);
  if (item) {
    await saveItem(entity, { ...item, synced: true });
  }
}

/**
 * Process the entire sync queue
 */
export async function processSyncQueue(): Promise<{
  processed: number;
  failed: number;
  remaining: number;
}> {
  const db = await getDB();
  const queue = await getSyncQueue();
  
  let processed = 0;
  let failed = 0;

  for (const item of queue) {
    const success = await processSyncItem(item);

    if (success) {
      // Remove from queue
      if (item.id) {
        await db.delete('syncQueue', item.id);
      }
      processed++;
    } else {
      // Increment retry count
      if (item.id) {
        const updatedItem = {
          ...item,
          retries: item.retries + 1,
          error: 'Sync failed',
        };

        if (updatedItem.retries >= MAX_RETRIES) {
          // Move to failed queue or log
          console.error('Max retries reached for sync item:', item);
          await db.delete('syncQueue', item.id);
        } else {
          await db.put('syncQueue', updatedItem);
        }
      }
      failed++;
    }

    // Add delay between retries
    if (item.retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  const remaining = await getSyncQueueCount();

  return { processed, failed, remaining };
}

/**
 * Clear the sync queue (use with caution)
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('syncQueue');
}

/**
 * Retry failed sync items
 */
export async function retryFailedSync(): Promise<void> {
  await processSyncQueue();
}

/**
 * Check if there are pending sync operations
 */
export async function hasPendingSync(): Promise<boolean> {
  const count = await getSyncQueueCount();
  return count > 0;
}

/**
 * Auto-sync when online
 */
let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoSync(intervalMs: number = 30000): void {
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  syncInterval = setInterval(async () => {
    if (navigator.onLine) {
      try {
        await processSyncQueue();
      } catch (error) {
        console.error('Auto-sync error:', error);
      }
    }
  }, intervalMs);
}

export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

/**
 * Sync on connection restored
 */
export function setupConnectionListener(): void {
  window.addEventListener('online', async () => {
    console.log('Connection restored, syncing...');
    try {
      const result = await processSyncQueue();
      console.log('Sync completed:', result);
    } catch (error) {
      console.error('Sync on reconnection failed:', error);
    }
  });
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  pending: number;
  lastSync: string | null;
  isOnline: boolean;
}> {
  const pending = await getSyncQueueCount();
  const db = await getDB();
  const metadata = await db.get('metadata', 'lastSyncTime');
  
  return {
    pending,
    lastSync: metadata?.value || null,
    isOnline: navigator.onLine,
  };
}

/**
 * Update last sync time
 */
export async function updateLastSyncTime(): Promise<void> {
  const db = await getDB();
  await db.put('metadata', {
    key: 'lastSyncTime',
    value: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}
