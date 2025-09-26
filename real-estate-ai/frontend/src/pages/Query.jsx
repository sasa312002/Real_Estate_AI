import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { propertyAPI } from '../services/api'
import ResponseCard from '../components/ResponseCard'
import LocationPicker from '../components/LocationPicker'
import { Home, MapPin, Bed, Bath, Ruler, Calendar, ArrowUpRight, X } from 'lucide-react'

function Query() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState(null)
  // Dynamically determine current year for validation of Year Built field
  const currentYear = new Date().getFullYear()
  
  const [formData, setFormData] = useState({
    query: '',
    tags: [],
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
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const debounceRef = useRef(null)
  
  const [selectedLocation, setSelectedLocation] = useState(null)
  const sriLankaCities = [
    'Colombo','Dehiwala','Mount Lavinia','Moratuwa','Kesbewa','Maharagama','Kotte','Kaduwela','Homagama','Pannipitiya','Padukka','Battaramulla','Ragama','Ja-Ela','Negombo','Katunayake','Seeduwa','Wattala','Kelaniya','Kiribathgoda','Pitipana',
    'Kandy','Gampola','Nawalapitiya','Katugastota','Peradeniya','Matale','Dambulla','Nuwara Eliya','Hatton','Talawakele','Bandarawela','Haputale',
    'Galle','Matara','Weligama','Hambantota','Tangalle','Ambalangoda','Hikkaduwa','Hakmana','Tissamaharama',
    'Jaffna','Mannar','Kilinochchi','Vavuniya','Point Pedro','Chavakachcheri','Mulaitivu',
    'Trincomalee','Batticaloa','Kalmunai','Ampara','Kattankudy','Eravur','Valachchenai','Kalkudah','Sainthamaruthu',
    'Kurunegala','Kuliyapitiya','Narammala','Pannala','Puttalam','Chilaw','Wennappuwa','Anamaduwa','Maho',
    'Anuradhapura','Polonnaruwa','Hingurakgoda','Medirigiriya',
    'Badulla','Monaragala','Bibile','Welimada',
    'Ratnapura','Balangoda','Kegalle','Mawanella'
  ]
  const [cityQuery, setCityQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  const updateCitySuggestions = (value) => {
    const v = value.trim().toLowerCase()
    if (!v) { setCitySuggestions([]); return }
    const filtered = sriLankaCities.filter(c => c.toLowerCase().includes(v)).slice(0,8)
    setCitySuggestions(filtered)
  }

  const handleCityInput = (value) => {
    setCityQuery(value)
    updateCitySuggestions(value)
    handleInputChange('city', value)
    setShowCityDropdown(true)
  }

  const selectCity = (city) => {
    handleInputChange('city', city)
    setCityQuery(city)
    setCitySuggestions([])
    setShowCityDropdown(false)
  }

  const cityValid = !formData.features.city || sriLankaCities.map(c=>c.toLowerCase()).includes(formData.features.city.toLowerCase())

  const handleInputChange = (field, value) => {
    if (field === 'query') {
      setFormData(prev => ({ ...prev, query: value }))
      // Debounce suggestions fetch
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        if (!value || value.trim().length < 4) {
          setTagSuggestions([]); setShowTagSuggestions(false); return
        }
        try {
          const res = await propertyAPI.suggestTags(value)
          setTagSuggestions(res.data.tags || [])
          setShowTagSuggestions(true)
        } catch (_) {
          setTagSuggestions([])
        }
      }, 400)
    } else {
      setFormData(prev => ({
        ...prev,
        features: { ...prev.features, [field]: value }
      }))
    }
  }

  const toggleTag = (tag) => {
    setFormData(prev => {
      const exists = prev.tags.includes(tag)
      return { ...prev, tags: exists ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }
    })
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
        features,
        tags: formData.tags
      })

      setResponse(result.data)
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail
      if (status === 402) {
        setError(detail || 'You have reached your analysis limit. Upgrade your plan to continue.')
      } else {
        setError(detail || 'Failed to analyze property')
      }
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Property Analysis
          </h1>
          {user && (
            <div className="flex items-center space-x-3">
              <span className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                Plan: <span className="capitalize">{user.plan}</span>
              </span>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${user.analyses_remaining === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                Remaining: {user.analyses_remaining}
              </span>
              <a
                href="/plans"
                className="text-sm inline-flex items-center space-x-1 font-semibold text-blue-600 hover:text-purple-600 dark:text-blue-400 dark:hover:text-purple-400"
              >
                <span>Upgrade</span><ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
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
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <MapPin className="inline w-5 h-5 mr-2 text-blue-600" />
                  City *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="city"
                    required
                    className={`w-full px-4 py-3 border ${cityValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500 dark:border-red-500'} dark:bg-gray-700 bg-white text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-10`}
                    placeholder="Start typing a Sri Lankan city..."
                    value={cityQuery || formData.features.city}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onFocus={() => { if(citySuggestions.length>0) setShowCityDropdown(true) }}
                    autoComplete="off"
                  />
                  {cityQuery && (
                    <button
                      type="button"
                      className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:text-gray-600"
                      onClick={() => { setCityQuery(''); selectCity(''); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {showCityDropdown && citySuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-sm">
                      {citySuggestions.map(c => (
                        <li
                          key={c}
                          className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-200"
                          onClick={() => selectCity(c)}
                        >
                          {c}
                        </li>
                      ))}
                      {citySuggestions.length === 0 && (
                        <li className="px-3 py-2 text-gray-400 dark:text-gray-500">No matches</li>
                      )}
                    </ul>
                  )}
                  {!cityValid && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">Enter a valid Sri Lankan city from the suggested list.</p>
                  )}
                </div>
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
                  // Only allow current year or past years
                  max={currentYear}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 2015"
                  value={formData.features.year_built}
                  onChange={(e) => {
                    let val = e.target.value
                    if (val === '') { return handleInputChange('year_built', '') }
                    const numeric = parseInt(val, 10)
                    if (!isNaN(numeric)) {
                      if (numeric > currentYear) {
                        return handleInputChange('year_built', currentYear.toString())
                      }
                    }
                    handleInputChange('year_built', val)
                  }}
                />
              </div>
              <div className="relative">
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
              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                      onClick={() => toggleTag(tag)} title="Remove tag">
                      {tag} ✕
                    </span>
                  ))}
                </div>
              )}
              {/* Suggestions */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-h-60 overflow-auto">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 font-semibold">Suggested Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tagSuggestions.map(s => (
                      <button type="button" key={s.tag} className={`px-2 py-1 rounded-full text-xs border transition-colors ${formData.tags.includes(s.tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800/40'}`}
                        onClick={() => toggleTag(s.tag)}>
                        {s.tag}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="mt-3 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setShowTagSuggestions(false)}>Hide suggestions</button>
                </div>
              )}
            </div>


              <div className="relative">
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
              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                      onClick={() => toggleTag(tag)} title="Remove tag">
                      {tag} ✕
                    </span>
                  ))}
                </div>
              )}
              {/* Suggestions */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-h-60 overflow-auto">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 font-semibold">Suggested Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tagSuggestions.map(s => (
                      <button type="button" key={s.tag} className={`px-2 py-1 rounded-full text-xs border transition-colors ${formData.tags.includes(s.tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800/40'}`}
                        onClick={() => toggleTag(s.tag)}>
                        {s.tag}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="mt-3 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setShowTagSuggestions(false)}>Hide suggestions</button>
                </div>
              )}
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

            {/* Manual Coordinates*/}
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
              disabled={loading || !formData.features.city || !formData.features.asking_price || !cityValid}
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
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
              {error.toLowerCase().includes('limit') && (
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">Upgrade Required</h4>
                    <p className="text-sm opacity-90">You have used all analyses available in your current plan. Upgrade to Standard or Premium for more analyses.</p>
                  </div>
                  <a href="/plans" className="inline-flex items-center justify-center px-5 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-sm tracking-wide transition-colors border border-white/20">
                    View Plans <ArrowUpRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              )}
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

