import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface NotificationPreferences {
  email_enabled: boolean
  task_deadline_email: boolean
  budget_alert_email: boolean
  project_update_email: boolean
  system_alert_email: boolean
  in_app_enabled: boolean
  task_deadline_in_app: boolean
  budget_alert_in_app: boolean
  project_update_in_app: boolean
  system_alert_in_app: boolean
  daily_digest: boolean
  weekly_digest: boolean
  digest_day: string
  digest_time: string
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  quiet_hours_timezone: string
}

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setPreferences(data)
      } else {
        // Create default preferences
        const defaultPrefs: Partial<NotificationPreferences> = {
          email_enabled: true,
          task_deadline_email: true,
          budget_alert_email: true,
          project_update_email: true,
          system_alert_email: true,
          in_app_enabled: true,
          task_deadline_in_app: true,
          budget_alert_in_app: true,
          project_update_in_app: true,
          system_alert_in_app: true,
          daily_digest: false,
          weekly_digest: true,
          digest_day: 'monday',
          digest_time: '09:00:00',
          quiet_hours_enabled: false,
          quiet_hours_start: '22:00:00',
          quiet_hours_end: '08:00:00',
          quiet_hours_timezone: 'Africa/Johannesburg',
        }

        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id, ...defaultPrefs })
          .select()
          .single()

        if (createError) throw createError

        setPreferences(newPrefs)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const savePreferences = async () => {
    if (!preferences) return

    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', user.id)

      if (error) throw error

      setSaveMessage({ type: 'success', text: 'Preferences saved successfully!' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      setSaveMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return
    setPreferences({ ...preferences, [key]: value })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Failed to load preferences. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Preferences</h1>
        <p className="text-gray-600">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            saveMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
              <p className="text-sm text-gray-600 mt-1">
                Receive notifications via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_enabled}
                onChange={(e) => updatePreference('email_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="space-y-4">
            {[
              { key: 'task_deadline_email', label: 'Task Deadline Reminders', desc: 'Alerts when tasks are due soon' },
              { key: 'budget_alert_email', label: 'Budget Alerts', desc: 'Notifications when projects exceed budget' },
              { key: 'project_update_email', label: 'Project Updates', desc: 'Changes and updates to your projects' },
              { key: 'system_alert_email', label: 'System Alerts', desc: 'Important system notifications' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                  onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                  disabled={!preferences.email_enabled}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">In-App Notifications</h2>
              <p className="text-sm text-gray-600 mt-1">
                Show notifications in the application
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.in_app_enabled}
                onChange={(e) => updatePreference('in_app_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="space-y-4">
            {[
              { key: 'task_deadline_in_app', label: 'Task Deadline Reminders' },
              { key: 'budget_alert_in_app', label: 'Budget Alerts' },
              { key: 'project_update_in_app', label: 'Project Updates' },
              { key: 'system_alert_in_app', label: 'System Alerts' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <p className="font-medium text-gray-900">{item.label}</p>
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                  onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                  disabled={!preferences.in_app_enabled}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Digest Emails */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Digest Emails</h2>
          <p className="text-sm text-gray-600 mb-6">
            Receive summary emails instead of individual notifications
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Daily Digest</p>
                <p className="text-sm text-gray-600">Receive a daily summary email</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.daily_digest}
                onChange={(e) => updatePreference('daily_digest', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Weekly Digest</p>
                <p className="text-sm text-gray-600">Receive a weekly summary email</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.weekly_digest}
                onChange={(e) => updatePreference('weekly_digest', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded-border-gray-300 focus:ring-blue-500"
              />
            </div>

            {preferences.weekly_digest && (
              <div className="pl-6 border-l-2 border-gray-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digest Day
                  </label>
                  <select
                    value={preferences.digest_day}
                    onChange={(e) => updatePreference('digest_day', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digest Time
                  </label>
                  <input
                    type="time"
                    value={preferences.digest_time}
                    onChange={(e) => updatePreference('digest_time', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quiet Hours</h2>
              <p className="text-sm text-gray-600 mt-1">
                Pause non-urgent notifications during specific hours
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.quiet_hours_enabled}
                onChange={(e) => updatePreference('quiet_hours_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {preferences.quiet_hours_enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={preferences.quiet_hours_timezone}
                  onChange={(e) => updatePreference('quiet_hours_timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Africa/Johannesburg">South Africa (SAST)</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="America/New_York">New York (EST)</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Urgent notifications will still be delivered during quiet hours.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={fetchPreferences}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={savePreferences}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
