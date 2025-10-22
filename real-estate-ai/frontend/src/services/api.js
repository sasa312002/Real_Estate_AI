import axios from 'axios'

// Create axios instance
export const api = axios.create({
  baseURL: '/api', // This will be proxied to the backend
  timeout: 120000, // 120 seconds (2 minutes) for AI analysis
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we're not already on the login/signup page
    // and if the 401 is for an authenticated endpoint (has a token)
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token')
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup'
      
      // Only redirect if user had a token (was logged in) and is not on auth page
      if (token && !isAuthPage) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      } else if (!isAuthPage) {
        // If no token, just remove any stale token
        localStorage.removeItem('token')
      }
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  me: () => api.get('/auth/me'),
  plans: () => api.get('/auth/plans'),
  upgrade: (plan) => api.post('/auth/upgrade', { plan }),
}

export const propertyAPI = {
  query: (propertyData) => api.post('/property/query', propertyData),
  history: (limit = 10) => api.get(`/property/history?limit=${limit}`),
  details: (queryId) => api.get(`/property/details/${queryId}`),
  deleteHistory: (queryId) => api.delete(`/property/history/${queryId}`),
  suggestTags: (text) => api.get(`/property/suggest_tags`, { params: { q: text } }),
  analyzeLocation: ({ lat, lon, city = null, district = null }) =>
    api.post('/property/analyze_location', { lat, lon, city, district })
}

export const feedbackAPI = {
  submit: (feedbackData) => api.post('/feedback/', feedbackData),
  getResponseFeedback: (responseId) => api.get(`/feedback/response/${responseId}`),
}

export const paymentsAPI = {
  createCheckout: (plan) => api.post('/payments/create-checkout', { plan }),
  verifySession: (sessionId) => api.post('/payments/verify-session', { session_id: sessionId }),
}

