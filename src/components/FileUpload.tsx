/**
 * Reusable File Upload Component
 * 
 * Handles file uploads to Supabase Storage with progress tracking
 */

import React, { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowUpTrayIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export interface FileUploadProps {
  bucket: string
  path: string
  accept?: string
  maxSize?: number // MB
  multiple?: boolean
  onUploadComplete?: (filePath: string, fileUrl: string, file: File) => void
  onError?: (error: Error) => void
  label?: string
  className?: string
}

export function FileUpload({
  bucket,
  path,
  accept = '*',
  maxSize = 10,
  multiple = false,
  onUploadComplete,
  onError,
  label = 'Upload File',
  className = ''
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ path: string; url: string; name: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)

    // Validate all files
    for (const file of filesArray) {
      if (file.size > maxSize * 1024 * 1024) {
        const error = new Error(`File "${file.name}" is too large. Max size: ${maxSize}MB`)
        onError?.(error)
        alert(error.message)
        return
      }
    }

    // Upload files
    for (const file of filesArray) {
      await uploadFile(file)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setProgress(0)

      // Generate unique filename
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${path}/${timestamp}_${safeName}`

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      const fileUrl = urlData.publicUrl

      // Add to uploaded files list
      setUploadedFiles(prev => [...prev, { path: filePath, url: fileUrl, name: file.name }])

      onUploadComplete?.(filePath, fileUrl, file)
    } catch (error) {
      console.error('Upload failed:', error)
      onError?.(error as Error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={`file-upload ${className}`}>
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          multiple={multiple}
          className="hidden"
          id={`file-upload-${bucket}-${path}`}
        />
        
        <label
          htmlFor={`file-upload-${bucket}-${path}`}
          className={`
            inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
            ${uploading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
            }
            transition-colors
          `}
        >
          <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
          {uploading ? `Uploading... ${progress}%` : label}
        </label>

        {uploading && (
          <div className="flex-1 max-w-xs">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                >
                  View
                </a>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="ml-2 text-gray-400 hover:text-red-600"
                type="button"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Info */}
      <p className="mt-2 text-xs text-gray-500">
        Max file size: {maxSize}MB | Accepted: {accept === '*' ? 'All files' : accept}
      </p>
    </div>
  )
}

