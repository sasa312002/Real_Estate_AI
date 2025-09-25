import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { propertyAPI } from '../services/api'
import ResponseCard from '../components/ResponseCard'
import LocationPicker from '../components/LocationPicker'
import { Home, MapPin, Bed, Bath, Ruler, Calendar } from 'lucide-react'

function Query() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState(null)
  
  const [formData, setFormData] = useState({
    query: '',
    features: {
      city: '',
      lat: '',
      lon: '',
      beds: '',
      baths: '',
      area: '',
      year_built: '',
      asking_price: ''
    }
  })
  
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleInputChange = (field, value) => {
    if (field === 'query') {
      setFormData(prev => ({ ...prev, query: value }))
    } else {
      setFormData(prev => ({
        ...prev,
        features: { ...prev.features, [field]: value }
      }))
    }
  }

  const handleLocationChange = (lat, lng) => {
    setSelectedLocation([lat, lng])
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        lat: lat.toString(),
        lon: lng.toString()
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse(null)

    try {
      // Convert numeric fields
      const features = { ...formData.features }
      const numericFields = ['lat', 'lon', 'beds', 'baths', 'area', 'year_built', 'asking_price']
      
      numericFields.forEach(field => {
        if (features[field] !== '') {
          features[field] = parseFloat(features[field])
        } else {
          features[field] = null
        }
      })

      const result = await propertyAPI.query({
        query: formData.query,
        features
      })

      setResponse(result.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze property')
    } finally {
      setLoading(false)
    }
  }

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'Good Deal':
        return 'text-success-600 bg-success-50 border-success-200'
      case 'Overpriced':
        return 'text-danger-600 bg-danger-50 border-danger-200'
      default:
        return 'text-warning-600 bg-warning-50 border-warning-200'
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Property Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user?.username}! Analyze properties with AI-powered insights.
        </p>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">

      <div className="space-y-8">
        {/* Query Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Home className="w-6 h-6 mr-2 text-blue-600" />
            Property Analysis Form
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="query" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                📝 Property Description (Optional)
              </label>
              <textarea
                id="query"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Describe any additional details about the property you want to analyze..."
                value={formData.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <MapPin className="inline w-5 h-5 mr-2 text-blue-600" />
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., Colombo, Kandy, Galle..."
                  value={formData.features.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="asking_price" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-md bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 mr-2">LKR</span>
                  Asking Price *
                </label>
                <input
                  type="number"
                  id="asking_price"
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 20,000,000"
                  value={formData.features.asking_price}
                  onChange={(e) => handleInputChange('asking_price', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="beds" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Bed className="inline w-5 h-5 mr-2 text-blue-600" />
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="beds"
                  min="0"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 3"
                  value={formData.features.beds}
                  onChange={(e) => handleInputChange('beds', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="baths" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Bath className="inline w-5 h-5 mr-2 text-blue-600" />
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="baths"
                  min="0"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 2"
                  value={formData.features.baths}
                  onChange={(e) => handleInputChange('baths', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Ruler className="inline w-5 h-5 mr-2 text-blue-600" />
                  Area (sq ft)
                </label>
                <input
                  type="number"
                  id="area"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 1,200"
                  value={formData.features.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="year_built" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Calendar className="inline w-5 h-5 mr-2 text-blue-600" />
                  Year Built
                </label>
                <input
                  type="number"
                  id="year_built"
                  min="1800"
                  max="2030"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 2015"
                  value={formData.features.year_built}
                  onChange={(e) => handleInputChange('year_built', e.target.value)}
                />
              </div>

            </div>

            {/* Location Picker Map */}
            <div className="col-span-full">
              <LocationPicker
                selectedLocation={selectedLocation}
                onLocationChange={handleLocationChange}
                city={formData.features.city}
                className="w-full"
              />
            </div>

            {/* Manual Coordinates (hidden but accessible for debugging) */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="hidden"
                value={formData.features.lat}
                onChange={(e) => handleInputChange('lat', e.target.value)}
              />
              <input
                type="hidden"
                value={formData.features.lon}
                onChange={(e) => handleInputChange('lon', e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.features.city || !formData.features.asking_price}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Property...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Analyze Property with AI</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {(response || loading) && (
          <div className="space-y-6">
            {response && (
              <>
                {/* Verdict Card */}
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 ${getVerdictColor(response.deal_verdict)} border border-gray-200 dark:border-gray-700`}>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Deal Verdict</h3>
                  <div className="text-3xl font-bold mb-3">{response.deal_verdict}</div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{response.why}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Confidence: <span className="font-semibold">{(response.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs text-gray-500">AI Analysis Complete</span>
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                <ResponseCard response={response} />
              </>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analyzing Property...</h3>
                <p className="text-gray-600 dark:text-gray-400">Our AI is processing your property data</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default Query

