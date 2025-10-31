// @ts-nocheck
/**
 * IndexedDB Storage Layer for Offline Data Management
 * Provides structured storage for projects, tasks, documents, and time entries
 */

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

// Database schema definition
interface FireProtectionDB extends DBSchema {
  projects: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      status: string;
      client_id?: string;
      created_at: string;
      updated_at: string;
      synced: boolean;
    };
    indexes: { 'by-updated': string; 'by-synced': boolean };
  };
  tasks: {
    key: string;
    value: {
      id: string;
      title: string;
      description?: string;
      status: string;
      priority?: string;
      project_id?: string;
      assigned_to?: string;
      due_date?: string;
      completed_at?: string;
      created_at: string;
      updated_at: string;
      synced: boolean;
    };
    indexes: { 'by-project': string; 'by-status': string; 'by-synced': boolean };
  };
  timeEntries: {
    key: string;
    value: {
      id: string;
      task_id?: string;
      project_id?: string;
      user_id: string;
      hours: number;
      description?: string;
      date: string;
      created_at: string;
      updated_at: string;
      synced: boolean;
    };
    indexes: { 'by-date': string; 'by-project': string; 'by-synced': boolean };
  };
  documents: {
    key: string;
    value: {
      id: string;
      name: string;
      type: string;
      size: number;
      project_id?: string;
      url?: string;
      blob?: Blob;
      created_at: string;
      updated_at: string;
      synced: boolean;
    };
    indexes: { 'by-project': string; 'by-synced': boolean };
  };
  clients: {
    key: string;
    value: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      created_at: string;
      updated_at: string;
      synced: boolean;
    };
    indexes: { 'by-name': string; 'by-synced': boolean };
  };
  syncQueue: {
    key: number;
    value: {
      id?: number;
      entity: 'projects' | 'tasks' | 'timeEntries' | 'documents' | 'clients';
      entityId: string;
      operation: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
      retries: number;
      error?: string;
    };
    indexes: { 'by-timestamp': number; 'by-entity': string };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: any;
      updated_at: string;
    };
  };
}

const DB_NAME = 'fire-protection-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FireProtectionDB> | null = null;

/**
 * Initialize and return the IndexedDB instance
 */
export async function getDB(): Promise<IDBPDatabase<FireProtectionDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<FireProtectionDB>(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, _transaction) {
      // Create object stores and indexes

      // Projects store
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('by-updated', 'updated_at');
        projectStore.createIndex('by-synced', 'synced');
      }

      // Tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-project', 'project_id');
        taskStore.createIndex('by-status', 'status');
        taskStore.createIndex('by-synced', 'synced');
      }

      // Time entries store
      if (!db.objectStoreNames.contains('timeEntries')) {
        const timeStore = db.createObjectStore('timeEntries', { keyPath: 'id' });
        timeStore.createIndex('by-date', 'date');
        timeStore.createIndex('by-project', 'project_id');
        timeStore.createIndex('by-synced', 'synced');
      }

      // Documents store
      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id' });
        docStore.createIndex('by-project', 'project_id');
        docStore.createIndex('by-synced', 'synced');
      }

      // Clients store
      if (!db.objectStoreNames.contains('clients')) {
        const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
        clientStore.createIndex('by-name', 'name');
        clientStore.createIndex('by-synced', 'synced');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        syncStore.createIndex('by-timestamp', 'timestamp');
        syncStore.createIndex('by-entity', 'entity');
      }

      // Metadata store for app-level data
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

/**
 * Generic CRUD operations for all stores
 */

// Create or update an item
export async function saveItem<T extends keyof FireProtectionDB>(
  storeName: T,
  item: FireProtectionDB[T]['value']
): Promise<void> {
  const db = await getDB();
  // @ts-ignore - Dynamic store access
  await db.put(storeName, item);
}

// Get an item by ID
export async function getItem<T extends keyof FireProtectionDB>(
  storeName: T,
  id: FireProtectionDB[T]['key']
): Promise<FireProtectionDB[T]['value'] | undefined> {
  const db = await getDB();
  // @ts-ignore - Dynamic store access
  return db.get(storeName, id);
}

// Get all items from a store
export async function getAllItems<T extends keyof FireProtectionDB>(
  storeName: T
): Promise<FireProtectionDB[T]['value'][]> {
  const db = await getDB();
  // @ts-ignore - Dynamic store access
  return db.getAll(storeName);
}

// Delete an item
export async function deleteItem<T extends keyof FireProtectionDB>(
  storeName: T,
  id: FireProtectionDB[T]['key']
): Promise<void> {
  const db = await getDB();
  // @ts-ignore - Dynamic store access
  await db.delete(storeName, id);
}

// Get items by index
export async function getItemsByIndex<T extends keyof FireProtectionDB>(
  storeName: T,
  indexName: string,
  query: IDBValidKey | IDBKeyRange
): Promise<FireProtectionDB[T]['value'][]> {
  const db = await getDB();
  // @ts-ignore - Dynamic store access
  return db.getAllFromIndex(storeName, indexName, query);
}

/**
 * Specialized query functions
 */

// Get unsynced items from any store
export async function getUnsyncedItems<T extends keyof FireProtectionDB>(
  storeName: T
): Promise<FireProtectionDB[T]['value'][]> {
  const db = await getDB();
  try {
    // @ts-ignore - Dynamic store access
    return db.getAllFromIndex(storeName, 'by-synced', false);
  } catch (error) {
    // Fallback if index doesn't exist
    // @ts-ignore - Dynamic store access
    const allItems = await db.getAll(storeName);
    return allItems.filter((item: any) => !item.synced);
  }
}

// Get tasks by project
export async function getTasksByProject(projectId: string) {
  return getItemsByIndex('tasks', 'by-project', projectId);
}

// Get time entries by project
export async function getTimeEntriesByProject(projectId: string) {
  return getItemsByIndex('timeEntries', 'by-project', projectId);
}

// Get documents by project
export async function getDocumentsByProject(projectId: string) {
  return getItemsByIndex('documents', 'by-project', projectId);
}

/**
 * Metadata operations
 */

export async function setMetadata(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('metadata', {
    key,
    value,
    updated_at: new Date().toISOString(),
  });
}

export async function getMetadata(key: string): Promise<any> {
  const db = await getDB();
  const record = await db.get('metadata', key);
  return record?.value;
}

/**
 * Bulk operations
 */

export async function bulkSave<T extends keyof FireProtectionDB>(
  storeName: T,
  items: FireProtectionDB[T]['value'][]
): Promise<void> {
  const db = await getDB();
  // @ts-ignore - Dynamic store access
  const tx = db.transaction(storeName, 'readwrite');
  await Promise.all([
    ...items.map(item => tx.store.put(item)),
    tx.done,
  ]);
}

export async function clearStore<T extends keyof FireProtectionDB>(
  storeName: T
): Promise<void> {
  const db = await getDB();
  // @ts-ignore - Dynamic store access
  await db.clear(storeName);
}

/**
 * Database utilities
 */

export async function getDatabaseSize(): Promise<number> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return 0;
  }
  
  const estimate = await navigator.storage.estimate();
  return estimate.usage || 0;
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const storeNames = db.objectStoreNames;
  
  for (let i = 0; i < storeNames.length; i++) {
    // @ts-ignore - Dynamic store access
    await db.clear(storeNames[i]);
  }
}

// Export for debugging
export async function exportData(): Promise<any> {
  const db = await getDB();
  const data: any = {};
  
  const storeNames = db.objectStoreNames;
  for (let i = 0; i < storeNames.length; i++) {
    const storeName = storeNames[i];
    // @ts-ignore - Dynamic store access
    data[storeName] = await db.getAll(storeName);
  }
  
  return data;
}

// Check if database is available
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}
