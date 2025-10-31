import React, { useState } from 'react'
import { 
  XMarkIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export interface OnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

interface OnboardingStep {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tips: string[]
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Fire Protection PM',
    description: 'Your all-in-one project management solution for fire protection professionals. Let\'s get you started!',
    icon: CheckCircleIcon,
    tips: [
      'Manage projects, tasks, and documents in one place',
      'Track time and monitor budgets in real-time',
      'Collaborate with your team seamlessly',
      'Access everything from any device'
    ]
  },
  {
    title: 'Organize Your Projects',
    description: 'Create projects to organize your work. Each project can have tasks, documents, and time tracking.',
    icon: FolderIcon,
    tips: [
      'Click "Projects" in the navigation to get started',
      'Add clients to projects for better organization',
      'Set budgets and track costs in real-time',
      'Mark projects as active, on-hold, or completed'
    ]
  },
  {
    title: 'Manage Tasks Efficiently',
    description: 'Break down projects into actionable tasks. Assign priorities, set due dates, and track progress.',
    icon: ClipboardDocumentListIcon,
    tips: [
      'Create tasks from the Tasks page',
      'Link tasks to specific projects',
      'Set priorities: Low, Medium, High, or Urgent',
      'Track task completion rates on your dashboard'
    ]
  },
  {
    title: 'Store Your Documents',
    description: 'Upload and organize project documents, templates, and work documentation all in one place.',
    icon: DocumentTextIcon,
    tips: [
      'Upload documents directly from the Documents page',
      'Use templates to speed up your workflow',
      'Organize with categories and tags',
      'Access documents from any project'
    ]
  },
  {
    title: 'Track Your Time',
    description: 'Log time spent on projects and tasks. Generate reports for billing and productivity analysis.',
    icon: ClockIcon,
    tips: [
      'Start timer from Time Tracking page',
      'Link time entries to projects and tasks',
      'View time reports on your dashboard',
      'Export data for invoicing'
    ]
  }
]

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = steps.length
  const step = steps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === totalSteps - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <div>
              <h2 id="onboarding-title" className="text-xl font-bold text-white">
                Getting Started
              </h2>
              <p className="text-sm text-gray-400">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
            aria-label="Close onboarding"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              role="progressbar"
              aria-valuenow={currentStep + 1}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Icon className="h-8 w-8 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-300">
                {step.description}
              </p>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Quick Tips
            </h4>
            <ul className="space-y-2">
              {step.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-300 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/30">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous step"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-blue-600 w-8' 
                    : index < currentStep 
                      ? 'bg-blue-600/50' 
                      : 'bg-gray-600'
                }`}
                aria-label={`Go to step ${index + 1}`}
                aria-current={index === currentStep ? 'step' : undefined}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-all shadow-lg hover:shadow-xl"
              aria-label={isLastStep ? 'Finish onboarding' : 'Next step'}
            >
              {isLastStep ? 'Get Started' : 'Next'}
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
