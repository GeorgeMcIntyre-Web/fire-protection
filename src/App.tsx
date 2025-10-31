import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { TasksPage } from './pages/TasksPage'
import { ClientsPage } from './pages/ClientsPage'
import { TimeTrackingPage } from './pages/TimeTrackingPage'
import { WorkDocsPage } from './pages/WorkDocsPage'
import { ReportsPage } from './pages/ReportsPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { OfflinePage } from './pages/OfflinePage'
import { Layout } from './components/Layout'
import { OfflineProvider } from './contexts/OfflineContext'
import { OfflineIndicator } from './components/OfflineIndicator'
import { InstallPrompt } from './components/InstallPrompt'

function App() {
  return (
    <OfflineProvider>
      <OfflineIndicator />
      <InstallPrompt />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/offline" element={<OfflinePage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="time-tracking" element={<TimeTrackingPage />} />
          <Route path="work-docs" element={<WorkDocsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </OfflineProvider>
  )
}

export default App
