/**
 * Floating Action Button (FAB) Component
 * Mobile-first primary action button
 */

import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { hapticButton } from '../lib/haptics';

interface FABAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FABProps {
  actions?: FABAction[];
  mainAction?: () => void;
  mainIcon?: React.ElementType;
  mainLabel?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function FAB({
  actions = [],
  mainAction,
  mainIcon: MainIcon = PlusIcon,
  mainLabel = 'Add',
  position = 'bottom-right',
}: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'right-6 bottom-24',
    'bottom-left': 'left-6 bottom-24',
    'bottom-center': 'left-1/2 transform -translate-x-1/2 bottom-24',
  };

  const handleMainClick = () => {
    hapticButton();
    if (actions.length > 0) {
      setIsOpen(!isOpen);
    } else if (mainAction) {
      mainAction();
    }
  };

  const handleActionClick = (action: FABAction) => {
    hapticButton();
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 md:hidden`}>
      {/* Action Menu */}
      {isOpen && actions.length > 0 && (
        <div className="absolute bottom-full mb-4 right-0 space-y-3 animate-fade-in">
          {actions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-end gap-3 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={() => handleActionClick(action)}
                  className={`h-12 w-12 rounded-full shadow-lg flex items-center justify-center touch-target ${
                    action.color || 'bg-gray-700 dark:bg-gray-600'
                  } text-white hover:scale-110 transition-transform`}
                  aria-label={action.label}
                >
                  <ActionIcon className="h-6 w-6" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={handleMainClick}
        className={`h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all flex items-center justify-center touch-target ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        aria-label={mainLabel}
      >
        {isOpen && actions.length > 0 ? (
          <XMarkIcon className="h-8 w-8" />
        ) : (
          <MainIcon className="h-8 w-8" />
        )}
      </button>

      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Simple FAB with single action
 */
export function SimpleFAB({
  onClick,
  icon: Icon = PlusIcon,
  label = 'Add',
  color = 'bg-blue-600 hover:bg-blue-700',
}: {
  onClick: () => void;
  icon?: React.ElementType;
  label?: string;
  color?: string;
}) {
  const handleClick = () => {
    hapticButton();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed right-6 bottom-24 z-50 h-14 w-14 rounded-full ${color} text-white shadow-lg hover:scale-110 transition-all flex items-center justify-center touch-target md:hidden`}
      aria-label={label}
    >
      <Icon className="h-8 w-8" />
    </button>
  );
}
