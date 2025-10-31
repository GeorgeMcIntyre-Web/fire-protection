/**
 * Offline Context Provider
 * Manages offline state and sync operations
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  processSyncQueue,
  getSyncStatus,
  setupConnectionListener,
  startAutoSync,
  stopAutoSync,
} from '../lib/sync-queue';
import { isIndexedDBAvailable, getDB } from '../lib/indexeddb';

interface OfflineContextValue {
  isOnline: boolean;
  isOfflineReady: boolean;
  syncQueueCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncNow: () => Promise<void>;
  refreshSyncStatus: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Initialize offline capabilities
  useEffect(() => {
    const initOffline = async () => {
      if (!isIndexedDBAvailable()) {
        console.warn('IndexedDB is not available');
        return;
      }

      try {
        // Initialize database
        await getDB();
        setIsOfflineReady(true);

        // Setup connection listener
        setupConnectionListener();

        // Start auto-sync (every 30 seconds)
        startAutoSync(30000);

        // Load initial sync status
        await refreshSyncStatus();
      } catch (error) {
        console.error('Failed to initialize offline capabilities:', error);
      }
    };

    initOffline();

    return () => {
      stopAutoSync();
    };
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Attempt to sync when coming online
      await syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Refresh sync status
  const refreshSyncStatus = useCallback(async () => {
    try {
      const status = await getSyncStatus();
      setSyncQueueCount(status.pending);
      setLastSyncTime(status.lastSync);
    } catch (error) {
      console.error('Failed to refresh sync status:', error);
    }
  }, []);

  // Manual sync trigger
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return;
    }

    setIsSyncing(true);
    try {
      const result = await processSyncQueue();
      console.log('Sync completed:', result);
      await refreshSyncStatus();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshSyncStatus]);

  // Periodically refresh sync count
  useEffect(() => {
    const interval = setInterval(refreshSyncStatus, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [refreshSyncStatus]);

  const value: OfflineContextValue = {
    isOnline,
    isOfflineReady,
    syncQueueCount,
    isSyncing,
    lastSyncTime,
    syncNow,
    refreshSyncStatus,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

// Utility hook for offline-aware data operations
export function useOfflineOperation<T>(
  operation: () => Promise<T>,
  fallback?: () => T
) {
  const { isOnline } = useOffline();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isOnline && fallback) {
        const result = fallback();
        setData(result);
      } else {
        const result = await operation();
        setData(result);
      }
    } catch (err) {
      setError(err as Error);
      if (!isOnline && fallback) {
        const result = fallback();
        setData(result);
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, operation, fallback]);

  return { execute, loading, error, data };
}
