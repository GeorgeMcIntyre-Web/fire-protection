/**
 * Offline Indicator Component
 * Shows online/offline status and sync progress
 */

import { useOffline } from '../contexts/OfflineContext';
import {
  WifiIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export function OfflineIndicator() {
  const { isOnline, syncQueueCount, isSyncing, syncNow } = useOffline();

  // Don't show if online and no pending syncs
  if (isOnline && syncQueueCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-all ${
        isOnline
          ? 'bg-blue-600 text-white'
          : 'bg-yellow-600 text-white'
      }`}
    >
      {/* Status Icon */}
      {!isOnline && (
        <>
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>Offline Mode</span>
        </>
      )}

      {isOnline && isSyncing && (
        <>
          <CloudArrowUpIcon className="h-5 w-5 animate-pulse" />
          <span>Syncing...</span>
        </>
      )}

      {isOnline && !isSyncing && syncQueueCount > 0 && (
        <>
          <CloudArrowUpIcon className="h-5 w-5" />
          <span>{syncQueueCount} pending</span>
          <button
            onClick={syncNow}
            className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
          >
            Sync Now
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Compact Offline Badge for Navigation
 */
export function OfflineBadge() {
  const { isOnline, syncQueueCount } = useOffline();

  if (isOnline && syncQueueCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {!isOnline && (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs">
          <WifiIcon className="h-3 w-3" />
          <span>Offline</span>
        </div>
      )}
      {isOnline && syncQueueCount > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
          <CloudArrowUpIcon className="h-3 w-3" />
          <span>{syncQueueCount}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Sync Status Component for Settings/Dashboard
 */
export function SyncStatus() {
  const { isOnline, syncQueueCount, isSyncing, lastSyncTime, syncNow } = useOffline();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Sync Status</h3>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiIcon className={`h-5 w-5 ${isOnline ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">Connection</span>
          </div>
          <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Pending Syncs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudArrowUpIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Pending Syncs</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {syncQueueCount}
          </span>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium">Last Sync</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {lastSyncTime
              ? new Date(lastSyncTime).toLocaleString()
              : 'Never'}
          </span>
        </div>

        {/* Sync Button */}
        <button
          onClick={syncNow}
          disabled={!isOnline || isSyncing || syncQueueCount === 0}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSyncing ? (
            <>
              <CloudArrowUpIcon className="h-5 w-5 animate-pulse" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="h-5 w-5" />
              <span>Sync Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
