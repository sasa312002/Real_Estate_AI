import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [token])

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    }
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      return null
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
  const { access_token, plan, analyses_limit, analyses_remaining } = response.data
      
      setToken(access_token)
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Get user info
  const userResponse = await api.get('/auth/me')
  // Merge plan info just in case /auth/me lags behind (should already include)
  setUser({ ...userResponse.data, plan: userResponse.data.plan || plan, analyses_limit: userResponse.data.analyses_limit || analyses_limit, analyses_remaining: userResponse.data.analyses_remaining ?? analyses_remaining })
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const signup = async (email, username, password) => {
    try {
      const response = await api.post('/auth/signup', { email, username, password })
  const { access_token, plan, analyses_limit, analyses_remaining } = response.data
      
      setToken(access_token)
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Get user info
  const userResponse = await api.get('/auth/me')
  setUser({ ...userResponse.data, plan: userResponse.data.plan || plan, analyses_limit: userResponse.data.analyses_limit || analyses_limit, analyses_remaining: userResponse.data.analyses_remaining ?? analyses_remaining })
      
      return { success: true }
    } catch (error) {
      console.error('Signup failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Signup failed' 
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

