import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { Eye, EyeOff, Mail, Lock, CheckCircle2, Sparkles, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react'

// Login page with email and password fields, and link to signup
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [shake, setShake] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  // Clear validation errors when user starts typing
  useEffect(() => {
    if (email) {
      setValidationErrors(prev => ({ ...prev, email: '' }))
      setError('') // Clear main error when user starts typing
    }
  }, [email])

  useEffect(() => {
    if (password) {
      setValidationErrors(prev => ({ ...prev, password: '' }))
      setError('') // Clear main error when user starts typing
    }
  }, [password])

  // Validate form inputs
  const validateForm = () => {
    const errors = {}

    // Email validation
    if (!email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    
    setError('')
    setValidationErrors({})

    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setLoading(true)

    try {
      const result = await login(email, password)
      
      if (result.success) {
        navigate('/')
      } else {
        // Set a clear error message for wrong credentials
        const errorMessage = result.error || 'Incorrect email or password. Please try again.'
        setError(errorMessage)
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <Header />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Info Section */}
            <div className="hidden lg:block space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Welcome Back</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Continue Your
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Real Estate Journey</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Sign in to access your AI-powered property analysis dashboard and continue making smart investment decisions.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Your Analysis History</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Access all your previous property analyses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Saved Preferences</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your settings and favorites are waiting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">New AI Features</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Discover enhanced analysis tools</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Users</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">95%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Accuracy</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">24/7</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Support</div>
                </div>
              </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="w-full">
              <div className="text-center lg:hidden mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sign in to your account
                </p>
              </div>

              <form className={`space-y-6 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 ${shake ? 'shake' : ''}`} onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 px-5 py-4 rounded-2xl shadow-lg animate-pulse">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1">Authentication Failed</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 transition-colors ${validationErrors.email ? 'text-red-500' : 'text-blue-500 group-focus-within:text-blue-600'}`} />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm ${
                          validationErrors.email 
                            ? 'border-red-500 focus:ring-red-500 error-input' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 transition-colors ${validationErrors.password ? 'text-red-500' : 'text-blue-500 group-focus-within:text-blue-600'}`} />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className={`w-full pl-12 pr-12 py-3.5 border rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm ${
                          validationErrors.password 
                            ? 'border-red-500 focus:ring-red-500 error-input' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing you in...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <Link
                        to="/signup"
                        className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-200"
                      >
                        Create one now
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

