/**
 * Tool Palette - Design Tools for 3D Canvas
 */

import React from 'react'
import {
  CursorArrowRaysIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

export interface ToolPaletteProps {
  activeTool: 'select' | 'place'
  onToolChange: (tool: 'select' | 'place') => void
  onAutoPlace: () => void
  onClear: () => void
  onSave: () => void
  sprinklerCount: number
}

export const ToolPalette: React.FC<ToolPaletteProps> = ({
  activeTool,
  onToolChange,
  onAutoPlace,
  onClear,
  onSave,
  sprinklerCount
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* Left: Tools */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onToolChange('select')}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTool === 'select'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CursorArrowRaysIcon className="h-5 w-5 mr-2" />
          Select
        </button>

        <button
          onClick={() => onToolChange('place')}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTool === 'place'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Place
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        <button
          onClick={onAutoPlace}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          Auto-Place
        </button>

        <button
          onClick={onClear}
          disabled={sprinklerCount === 0}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          Clear All
        </button>
      </div>

      {/* Right: Info & Save */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{sprinklerCount}</span> sprinklers
        </div>

        <button
          onClick={onSave}
          disabled={sprinklerCount === 0}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Save Design
        </button>
      </div>
    </div>
  )
}

