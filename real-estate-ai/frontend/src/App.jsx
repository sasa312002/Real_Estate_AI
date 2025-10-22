import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import SidebarLayout from './components/SidebarLayout'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Query from './pages/Query'
import History from './pages/History'
import Plans from './pages/Plans'
import AnalyzeLocation from './pages/AnalyzeLocation'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { HistoryProvider } from './contexts/HistoryContext'
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
      {/* Homepage - No Sidebar (Clean Design) */}
      <Route 
        path="/" 
        element={
          <SidebarLayout showSidebar={false}>
            <HomePage />
          </SidebarLayout>
        }
      />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : (
            <SidebarLayout showSidebar={false}>
              <Login />
            </SidebarLayout>
          )
        } 
      />
      <Route 
        path="/signup" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : (
            <SidebarLayout showSidebar={false}>
              <Signup />
            </SidebarLayout>
          )
        } 
      />
      
      {/* Protected Routes - With Sidebar */}
      <Route 
        path="/query" 
        element={
          isAuthenticated ? (
            <SidebarLayout showSidebar={true}>
              <div className="h-full">
                <Query />
              </div>
            </SidebarLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/history" 
        element={
          isAuthenticated ? (
            <SidebarLayout showSidebar={true}>
              <div className="h-full">
                <History />
              </div>
            </SidebarLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route
        path="/analyze-location"
        element={
          isAuthenticated ? (
            // Additional role check is handled inside the page which will redirect to /plans if unauthorized
            <SidebarLayout showSidebar={true}>
              <div className="h-full">
                <AnalyzeLocation />
              </div>
            </SidebarLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/plans"
        element={
          isAuthenticated ? (
            <SidebarLayout showSidebar={true}>
              <div className="h-full">
                <Plans />
              </div>
            </SidebarLayout>
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HistoryProvider>
          <AppContent />
        </HistoryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

