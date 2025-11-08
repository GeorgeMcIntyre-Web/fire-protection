import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { FireConsultProvider } from './contexts/FireConsultContext'
import App from './App'
import './style.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FireConsultProvider>
          <App />
        </FireConsultProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
