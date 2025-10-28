import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import {
  getDocumentCategories,
  uploadAndCreateDocument,
  parseDocumentCode,
  getCategoryFromCode,
  type DocumentCategory
} from '../lib/documents'

interface DocumentUploadProps {
  onUploadComplete?: () => void
  defaultCategoryId?: number | null
  projectId?: string | null
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  defaultCategoryId,
  projectId: _projectId // prefix with _ to indicate intentionally unused
}) => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [_uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map())
  const [uploadComplete, setUploadComplete] = useState<Map<string, boolean>>(new Map())

  // Form fields
  const [categoryId, setCategoryId] = useState<number | null>(defaultCategoryId || null)
  const [documentName, setDocumentName] = useState('')
  const [documentCode, setDocumentCode] = useState('')
  const [description, setDescription] = useState('')
  const [version, setVersion] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (defaultCategoryId) {
      setCategoryId(defaultCategoryId)
    }
  }, [defaultCategoryId])

  const fetchCategories = async () => {
    try {
      const cats = await getDocumentCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])

      // Auto-parse first file
      if (files.length > 0 && files[0]) {
        const parsed = parseDocumentCode(files[0].name)
        if (parsed.code) {
          setDocumentCode(parsed.code)
          setDocumentName(parsed.name)
          setVersion(parsed.version || '')
          const suggestedCategory = getCategoryFromCode(parsed.code)
          if (suggestedCategory) {
            setCategoryId(suggestedCategory)
          }
        } else {
          setDocumentName(files[0].name)
        }
      }
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !user) return

    setUploading(true)
    const progress = new Map<string, number>()
    const complete = new Map<string, boolean>()

    for (const file of selectedFiles) {
      try {
        progress.set(file.name, 50)
        setUploadProgress(new Map(progress))

        await uploadAndCreateDocument(
          file,
          {
            name: documentName || file.name,
            document_code: documentCode || undefined,
            category_id: categoryId,
            description: description || undefined,
            version: version || undefined,
            tags: tags ? tags.split(',').map(t => t.trim()) : undefined
          },
          user.id
        )

        progress.set(file.name, 100)
        complete.set(file.name, true)
        setUploadProgress(new Map(progress))
        setUploadComplete(new Map(complete))
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        alert(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)

    // Reset form after a delay
    setTimeout(() => {
      setSelectedFiles([])
      setDocumentName('')
      setDocumentCode('')
      setDescription('')
      setVersion('')
      setTags('')
      setUploadProgress(new Map())
      setUploadComplete(new Map())

      if (onUploadComplete) {
        onUploadComplete()
      }
    }, 2000)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Upload Documents</h3>

      {/* File Upload Area */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-white font-medium mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-400">
              PDF, DOC, DOCX, XLS, XLSX, TXT (max 50MB)
            </p>
          </label>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">
              Selected Files ({selectedFiles.length})
            </h4>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-900 rounded-lg p-3 border border-gray-700"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {uploadComplete.get(file.name) && (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  )}
                </div>
                {!uploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-2 text-gray-400 hover:text-red-400"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Document Information Form */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Document Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Auto-filled from filename"
                  className="input-field"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document Code
                </label>
                <input
                  type="text"
                  value={documentCode}
                  onChange={(e) => setDocumentCode(e.target.value)}
                  placeholder="e.g. CFM-OPS-FRM-004"
                  className="input-field"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className="input-field"
                  disabled={uploading}
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. Rev 14"
                  className="input-field"
                  disabled={uploading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document..."
                  rows={3}
                  className="input-field"
                  disabled={uploading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="fire-safety, compliance, maintenance"
                  className="input-field"
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSelectedFiles([])}
              disabled={uploading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !categoryId}
              className="btn-primary disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
