/**
 * Offline Fallback Page
 * Shown when the user is offline and tries to access an uncached page
 */

import { Link } from 'react-router-dom';
import {
  WifiIcon,
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <WifiIcon className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          It looks like you've lost your internet connection. Don't worry, you can still
          access your cached data and continue working.
        </p>

        {/* Available Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            What you can do offline:
          </h2>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700 dark:text-gray-300">
                View your dashboard and recent projects
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700 dark:text-gray-300">
                Access cached documents
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700 dark:text-gray-300">
                Log time entries (will sync when online)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700 dark:text-gray-300">
                Mark tasks as complete (will sync when online)
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link
            to="/dashboard"
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <HomeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Dashboard
            </span>
          </Link>

          <Link
            to="/projects"
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Projects
            </span>
          </Link>

          <Link
            to="/tasks"
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Tasks
            </span>
          </Link>
        </div>

        {/* Status */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Your changes will automatically sync when you're back online.</p>
        </div>
      </div>
    </div>
  );
}
