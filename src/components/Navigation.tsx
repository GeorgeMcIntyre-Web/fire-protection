import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  HomeIcon, 
  FolderIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  DocumentDuplicateIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon },
  { name: 'Clients', href: '/clients', icon: BuildingOfficeIcon },
  { name: 'Time Tracking', href: '/time-tracking', icon: ClockIcon },
  { name: 'Work Docs', href: '/work-docs', icon: DocumentTextIcon },
]

export const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/fireguard-icon.svg" 
                alt="FireGuard Pro" 
                className="h-10 w-10"
              />
              <span className="ml-3 text-xl font-bold text-white whitespace-nowrap">
                FireGuard Pro
              </span>
            </div>
            <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-3 lg:ml-4 flex-shrink-0">
            <div className="relative group">
              <button
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                aria-label="Help"
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-gray-600">
                <div className="py-2">
                  <a
                    href="https://github.com/yourusername/fire-protection-pm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    Documentation
                  </a>
                  <Link
                    to="/terms"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    to="/privacy"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center bg-gray-700 rounded-lg px-3 py-1.5">
              <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-300 whitespace-nowrap">{user?.email}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 hover:bg-gray-700 rounded-lg whitespace-nowrap"
            >
              Sign out
            </button>
          </div>

          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-800">
          <div className="pt-2 pb-3 space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700 px-4">
            <div className="flex items-center">
              <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
              <div className="text-sm font-medium text-gray-300">{user?.email}</div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => {
                  signOut()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
