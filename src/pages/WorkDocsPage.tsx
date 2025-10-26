import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DocumentLibrary } from '../components/DocumentLibrary'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  PhotoIcon,
  DocumentTextIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline'

interface WorkDoc {
  id: string
  task_id: string | null
  project_id: string | null
  user_id: string
  photo_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  tasks?: {
    name: string
  }
  projects?: {
    name: string
  }
  profiles?: {
    full_name: string | null
    email: string
  }
}

interface Project {
  id: string
  name: string
}

interface Task {
  id: string
  name: string
  project_id: string
}

export const WorkDocsPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'work' | 'company'>('work')
  const [workDocs, setWorkDocs] = useState<WorkDoc[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState<WorkDoc | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    project_id: '',
    task_id: '',
    notes: '',
    photo: null as File | null
  })

  useEffect(() => {
    fetchWorkDocs()
    fetchProjects()
    fetchTasks()
  }, [])

  const fetchWorkDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('work_documentation')
        .select(`
          *,
          tasks (
            name
          ),
          projects (
            name
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkDocs(data || [])
    } catch (error) {
      console.error('Error fetching work docs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name')

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, name, project_id')
        .order('name')

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `work-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('work-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('work-photos')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUploading(true)
    try {
      let photoUrl = null
      if (formData.photo) {
        photoUrl = await uploadPhoto(formData.photo)
        if (!photoUrl) {
          alert('Failed to upload photo. Please try again.')
          setUploading(false)
          return
        }
      }

      const docData = {
        project_id: formData.project_id || null,
        task_id: formData.task_id || null,
        user_id: user.id,
        photo_url: photoUrl,
        notes: formData.notes || null
      }

      if (editingDoc) {
        const { error } = await supabase
          .from('work_documentation')
          .update(docData)
          .eq('id', editingDoc.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('work_documentation')
          .insert(docData)

        if (error) throw error
      }

      setShowModal(false)
      setEditingDoc(null)
      setFormData({ project_id: '', task_id: '', notes: '', photo: null })
      fetchWorkDocs()
    } catch (error) {
      console.error('Error saving work doc:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (doc: WorkDoc) => {
    setEditingDoc(doc)
    setFormData({
      project_id: doc.project_id || '',
      task_id: doc.task_id || '',
      notes: doc.notes || '',
      photo: null
    })
    setShowModal(true)
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this work documentation?')) return

    try {
      const { error } = await supabase
        .from('work_documentation')
        .delete()
        .eq('id', docId)

      if (error) throw error
      fetchWorkDocs()
    } catch (error) {
      console.error('Error deleting work doc:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString()
  }

  const filteredTasks = formData.project_id 
    ? tasks.filter(task => task.project_id === formData.project_id)
    : tasks

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Work Documentation</h1>
          <p className="mt-1 text-sm text-gray-400">
            Document your work and access company documents
          </p>
        </div>
        {activeTab === 'work' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Documentation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg p-1 inline-flex border border-gray-700">
        <button
          onClick={() => setActiveTab('work')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'work'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center">
            <PhotoIcon className="h-4 w-4 mr-2" />
            Work Documentation
          </div>
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center">
            <BuildingLibraryIcon className="h-4 w-4 mr-2" />
            Company Documents
          </div>
        </button>
      </div>

      {/* Render appropriate content based on active tab */}
      {activeTab === 'company' ? (
        <DocumentLibrary />
      ) : (
        <>
          {/* Work Documentation List */}
      <div className="bg-white shadow rounded-lg">
        {workDocs.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documentation</h3>
            <p className="mt-1 text-sm text-gray-500">Start documenting your work with photos and notes.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Documentation
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {workDocs.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(doc.created_at)} at {formatTime(doc.created_at)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {doc.profiles?.full_name || doc.profiles?.email}
                      </div>
                    </div>

                    {(doc.projects?.name || doc.tasks?.name) && (
                      <div className="mb-3">
                        {doc.projects?.name && (
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <FolderIcon className="h-4 w-4 mr-1" />
                            Project: {doc.projects.name}
                          </div>
                        )}
                        {doc.tasks?.name && (
                          <div className="flex items-center text-sm text-gray-600">
                            <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                            Task: {doc.tasks.name}
                          </div>
                        )}
                      </div>
                    )}

                    {doc.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-900">{doc.notes}</p>
                      </div>
                    )}

                    {doc.photo_url && (
                      <div className="mb-3">
                        <img
                          src={doc.photo_url}
                          alt="Work documentation"
                          className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDoc ? 'Edit Documentation' : 'Add Work Documentation'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project (Optional)
                  </label>
                  <select
                    className="input-field mt-1"
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value, task_id: '' })}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Task (Optional)
                  </label>
                  <select
                    className="input-field mt-1"
                    value={formData.task_id}
                    onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                    disabled={!formData.project_id}
                  >
                    <option value="">Select a task</option>
                    {filteredTasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Photo
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setFormData({ ...formData, photo: file })
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      {formData.photo && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {formData.photo.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    className="input-field mt-1"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Describe the work completed..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingDoc(null)
                      setFormData({ project_id: '', task_id: '', notes: '', photo: null })
                    }}
                    className="btn-secondary"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? 'Saving...' : (editingDoc ? 'Update' : 'Save')} Documentation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
    )}
    </div>
  )
}