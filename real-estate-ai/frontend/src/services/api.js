import axios from 'axios'

// Create axios instance
export const api = axios.create({
  baseURL: '/api', // This will be proxied to the backend
  timeout: 10000,
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  me: () => api.get('/auth/me'),
}

export const propertyAPI = {
  query: (propertyData) => api.post('/property/query', propertyData),
  history: (limit = 10) => api.get(`/property/history?limit=${limit}`),
}

export const feedbackAPI = {
  submit: (feedbackData) => api.post('/feedback/', feedbackData),
  getResponseFeedback: (responseId) => api.get(`/feedback/response/${responseId}`),
}

