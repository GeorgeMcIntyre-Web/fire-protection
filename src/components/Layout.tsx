import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { MobileBottomNav } from './MobileBottomNav'

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-20 md:pb-6">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  )
}
