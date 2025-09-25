import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Query from './pages/Query'
import History from './pages/History'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/query" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <Query />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/history" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <History />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Layout component for authenticated pages
function AuthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

