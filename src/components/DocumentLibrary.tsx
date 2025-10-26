import React, { useState, useEffect } from 'react'
import { 
  FolderIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline'
import { 
  type DocumentCategory, 
  type Document, 
  getDocumentCategories, 
  getDocuments 
} from '../lib/documents'

interface DocumentLibraryProps {
  onSelectDocument?: (document: Document) => void
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ onSelectDocument }) => {
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAllCategories, setShowAllCategories] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchDocuments()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [selectedCategory, searchQuery])

  const fetchCategories = async () => {
    try {
      const categories = await getDocumentCategories()
      setCategories(categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const docs = await getDocuments({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined
      })
      setDocuments(docs)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setShowAllCategories(false)
  }

  const handleDocumentClick = (document: Document) => {
    if (onSelectDocument) {
      onSelectDocument(document)
    } else {
      window.open(document.file_url, '_blank')
    }
  }

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return DocumentTextIcon
    
    if (fileType.includes('pdf')) return DocumentTextIcon
    if (fileType.includes('word') || fileType.includes('document')) return DocumentTextIcon
    if (fileType.includes('excel') || fileType.includes('sheet')) return DocumentTextIcon
    
    return DocumentTextIcon
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Company Document Library</h2>
          <p className="mt-1 text-sm text-gray-400">
            Access your company's standard documents, forms, and procedures
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Categories</h3>
            <button
              onClick={() => {
                setSelectedCategory(null)
                setShowAllCategories(true)
              }}
              className={`text-xs ${showAllCategories ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              Show All
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <FolderOpenIcon className="h-4 w-4 mr-2" />
                All Documents
              </div>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <FolderIcon className="h-4 w-4 mr-2" />
                  {category.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedCategory ? 'No documents in this category' : 'Start by uploading documents'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((document) => {
                const FileIcon = getFileIcon(document.file_type)
                return (
                  <div
                    key={document.id}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer group"
                    onClick={() => handleDocumentClick(document)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <FileIcon className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
                      {document.category && (
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg border border-blue-500/20">
                          {document.category.name}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {document.name}
                    </h3>
                    
                    {document.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {document.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-700">
                      {document.document_code && (
                        <span className="font-mono">{document.document_code}</span>
                      )}
                      {document.version && (
                        <span>Rev {document.version}</span>
                      )}
                    </div>

                    {document.tags && document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {document.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

