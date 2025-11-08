/**
 * Design Canvas - Main 3D Design Component
 * 
 * Provides 3D visualization for sprinkler placement
 */

import React, { useEffect, useRef, useState } from 'react'
import { FireDesignEngine } from '../../lib/babylon/FireDesignEngine'
import { ToolPalette } from './ToolPalette'
import { CalculationPanel } from './CalculationPanel'

export interface DesignCanvasProps {
  jobId: string
  floorArea: number
  hazardClass: string
  initialDesign?: any
  onSave?: (designData: any) => void
  onSprinklerCountChange?: (count: number) => void
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  jobId,
  floorArea,
  hazardClass,
  initialDesign,
  onSave,
  onSprinklerCountChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<FireDesignEngine | null>(null)

  const [sprinklerCount, setSprinklerCount] = useState(0)
  const [calculations, setCalculations] = useState<any>(null)
  const [activeTool, setActiveTool] = useState<'select' | 'place'>('select')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!canvasRef.current) return

    setIsLoading(true)

    try {
      // Initialize Babylon.js engine
      engineRef.current = new FireDesignEngine(canvasRef.current)

      // Setup event listeners
      engineRef.current.on('sprinklerAdded', () => {
        const count = engineRef.current?.exportDesign().count || 0
        setSprinklerCount(count)
        onSprinklerCountChange?.(count)
      })

      engineRef.current.on('sprinklerRemoved', () => {
        const count = engineRef.current?.exportDesign().count || 0
        setSprinklerCount(count)
        onSprinklerCountChange?.(count)
      })

      engineRef.current.on('sprinklerCountChanged', (count: number) => {
        setSprinklerCount(count)
        onSprinklerCountChange?.(count)
      })

      // Load initial design if provided
      if (initialDesign) {
        engineRef.current.loadDesign(initialDesign)
        const count = initialDesign.count || 0
        setSprinklerCount(count)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error initializing design engine:', error)
      setIsLoading(false)
    }

    return () => {
      engineRef.current?.dispose()
    }
  }, [jobId])

  // Recalculate when sprinklers change
  useEffect(() => {
    if (sprinklerCount > 0 && floorArea > 0) {
      // Import calculation functions
      import('../../lib/water-supply-estimator').then((module) => {
        const { estimateDesignParameters, planSprinklerWater } = module

        try {
          const params = estimateDesignParameters({
            floor_area_m2: floorArea,
            sprinkler_count: sprinklerCount,
            commodity_class: hazardClass as any,
            storage_method: 'palletized',
            storage_height_m: 6,
            ceiling_height_m: 8
          })

          const water = planSprinklerWater({
            designArea_m2: params.design_area_m2,
            density_mm_min: params.design_density_mm_min,
            duration_min: 90
          })

          setCalculations({ params, water })
        } catch (error) {
          console.error('Error calculating parameters:', error)
        }
      })
    } else {
      setCalculations(null)
    }
  }, [sprinklerCount, floorArea, hazardClass])

  const handleToolChange = (tool: 'select' | 'place') => {
    setActiveTool(tool)
    engineRef.current?.setTool(tool)
  }

  const handleAutoPlace = () => {
    if (engineRef.current && floorArea > 0) {
      engineRef.current.autoPlaceSprinklers(floorArea, hazardClass)
    }
  }

  const handleClear = () => {
    engineRef.current?.clearAllSprinklers()
  }

  const handleSaveDesign = () => {
    if (engineRef.current) {
      const designData = engineRef.current.exportDesign()
      onSave?.(designData)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading 3D design engine...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="design-canvas-container bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <ToolPalette
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onAutoPlace={handleAutoPlace}
          onClear={handleClear}
          onSave={handleSaveDesign}
          sprinklerCount={sprinklerCount}
        />
      </div>

      {/* Canvas Area */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="design-canvas w-full"
          style={{ height: '600px', display: 'block' }}
        />
        
        {/* Instructions Overlay */}
        {sprinklerCount === 0 && (
          <div className="absolute top-4 left-4 bg-white/90 p-4 rounded-lg shadow-lg max-w-sm">
            <h4 className="font-semibold text-gray-900 mb-2">Getting Started</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Select <strong>Place</strong> tool to add sprinklers</li>
              <li>• Click on the floor to place sprinklers</li>
              <li>• Use <strong>Auto-Place</strong> for quick layout</li>
              <li>• Select tool to move/delete sprinklers</li>
            </ul>
          </div>
        )}
      </div>

      {/* Calculations Panel */}
      {calculations && (
        <div className="border-t border-gray-200">
          <CalculationPanel
            sprinklerCount={sprinklerCount}
            calculations={calculations}
            floorArea={floorArea}
            hazardClass={hazardClass}
          />
        </div>
      )}
    </div>
  )
}

