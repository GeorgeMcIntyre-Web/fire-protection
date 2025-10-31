/**
 * Mobile Bottom Navigation Component
 * Provides mobile-first navigation at the bottom of the screen
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  ClockIcon as ClockIconSolid,
  UserGroupIcon as UserGroupIconSolid,
} from '@heroicons/react/24/solid';
import { hapticSelection } from '../lib/haptics';

interface NavItem {
  to: string;
  icon: React.ElementType;
  activeIcon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
    label: 'Home',
  },
  {
    to: '/projects',
    icon: ClipboardDocumentListIcon,
    activeIcon: ClipboardDocumentListIconSolid,
    label: 'Projects',
  },
  {
    to: '/tasks',
    icon: DocumentTextIcon,
    activeIcon: DocumentTextIconSolid,
    label: 'Tasks',
  },
  {
    to: '/time-tracking',
    icon: ClockIcon,
    activeIcon: ClockIconSolid,
    label: 'Time',
  },
  {
    to: '/clients',
    icon: UserGroupIcon,
    activeIcon: UserGroupIconSolid,
    label: 'Clients',
  },
];

export function MobileBottomNav() {
  const handleClick = () => {
    hapticSelection();
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 md:hidden" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleClick}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-colors touch-target ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => {
                const Icon = isActive ? item.activeIcon : item.icon;
                return (
                  <>
                    <Icon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
