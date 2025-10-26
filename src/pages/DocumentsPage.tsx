import React, { useState } from 'react'
import { DocumentLibrary } from '../components/DocumentLibrary'
import { DocumentUpload } from '../components/DocumentUpload'
import {
  PlusIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline'

export const DocumentsPage: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadComplete = () => {
    // Refresh the document library
    setRefreshKey(prev => prev + 1)
    setShowUpload(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Library</h1>
          <p className="mt-1 text-sm text-gray-400">
            Company documents, forms, templates, and procedures
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn-primary flex items-center gap-2"
        >
          {showUpload ? (
            <>
              <FolderOpenIcon className="h-5 w-5" />
              View Library
            </>
          ) : (
            <>
              <PlusIcon className="h-5 w-5" />
              Upload Documents
            </>
          )}
        </button>
      </div>

      {showUpload ? (
        <DocumentUpload onUploadComplete={handleUploadComplete} />
      ) : (
        <DocumentLibrary key={refreshKey} />
      )}
    </div>
  )
}
