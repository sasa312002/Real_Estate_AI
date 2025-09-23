import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { propertyAPI } from '../services/api'
import ResponseCard from '../components/ResponseCard'
import { Home, MapPin, Bed, Bath, Ruler, Calendar, DollarSign } from 'lucide-react'

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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Property Analysis
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.username}! Analyze properties with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Query Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Property Details
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Natural Language Query
              </label>
              <textarea
                id="query"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the property you want to analyze..."
                value={formData.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Colombo"
                  value={formData.features.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="asking_price" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Asking Price *
                </label>
                <input
                  type="number"
                  id="asking_price"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 200000"
                  value={formData.features.asking_price}
                  onChange={(e) => handleInputChange('asking_price', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-2">
                  <Bed className="inline w-4 h-4 mr-1" />
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="beds"
                  min="0"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 3"
                  value={formData.features.beds}
                  onChange={(e) => handleInputChange('beds', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="baths" className="block text-sm font-medium text-gray-700 mb-2">
                  <Bath className="inline w-4 h-4 mr-1" />
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="baths"
                  min="0"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 2"
                  value={formData.features.baths}
                  onChange={(e) => handleInputChange('baths', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="inline w-4 h-4 mr-1" />
                  Area (sq ft)
                </label>
                <input
                  type="number"
                  id="area"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 1200"
                  value={formData.features.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="year_built" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Year Built
                </label>
                <input
                  type="number"
                  id="year_built"
                  min="1800"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 2015"
                  value={formData.features.year_built}
                  onChange={(e) => handleInputChange('year_built', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  id="lat"
                  step="any"
                  min="-90"
                  max="90"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 6.9271"
                  value={formData.features.lat}
                  onChange={(e) => handleInputChange('lat', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="lon" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  id="lon"
                  step="any"
                  min="-180"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 79.8612"
                  value={formData.features.lon}
                  onChange={(e) => handleInputChange('lon', e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Property'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {response && (
            <>
              {/* Verdict Card */}
              <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getVerdictColor(response.deal_verdict)}`}>
                <h3 className="text-lg font-semibold mb-2">Deal Verdict</h3>
                <div className="text-2xl font-bold mb-2">{response.deal_verdict}</div>
                <p className="text-gray-700">{response.why}</p>
                <div className="mt-4 text-sm text-gray-600">
                  Confidence: {(response.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Analysis Results */}
              <ResponseCard response={response} />
            </>
          )}

          {/* Placeholder when no response */}
          {!response && !loading && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Fill out the form and click "Analyze Property" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Query

