/**
 * Calculation Panel - Real-time Design Calculations
 */

import React from 'react'
import { BeakerIcon } from '@heroicons/react/24/outline'

export interface CalculationPanelProps {
  sprinklerCount: number
  calculations: {
    params: any
    water: any
  }
  floorArea: number
  hazardClass: string
}

export const CalculationPanel: React.FC<CalculationPanelProps> = ({
  sprinklerCount,
  calculations,
  floorArea,
  hazardClass
}) => {
  if (!calculations) return null

  const { params, water } = calculations

  return (
    <div className="p-4 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Calculations</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Design Parameters */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <BeakerIcon className="h-5 w-5 text-red-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Design Parameters</h4>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Sprinkler Count:</dt>
              <dd className="font-semibold text-gray-900">{sprinklerCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Design Density:</dt>
              <dd className="font-semibold text-gray-900">
                {params.design_density_mm_min?.toFixed(1)} mm/min
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Design Area:</dt>
              <dd className="font-semibold text-gray-900">
                {params.design_area_m2?.toFixed(1)} m²
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Floor Area:</dt>
              <dd className="font-semibold text-gray-900">{floorArea.toFixed(1)} m²</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Hazard Class:</dt>
              <dd className="font-semibold text-gray-900">{hazardClass}</dd>
            </div>
          </dl>
        </div>

        {/* Water Supply */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <BeakerIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Water Supply</h4>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Flow Required:</dt>
              <dd className="font-semibold text-gray-900">
                {water.flowRequiredLpm?.toFixed(0)} L/min
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Tank Size:</dt>
              <dd className="font-semibold text-gray-900">
                {water.tankSizeM3?.toFixed(1)} m³
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Duration:</dt>
              <dd className="font-semibold text-gray-900">
                {water.durationMinutes} minutes
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Requires Tank:</dt>
              <dd className="font-semibold text-gray-900">
                {water.requiresTank ? 'Yes' : 'No'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Requires Pump:</dt>
              <dd className="font-semibold text-gray-900">
                {water.requiresPump ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

