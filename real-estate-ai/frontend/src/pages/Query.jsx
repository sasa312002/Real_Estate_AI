import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHistory as useHistoryContext } from '../contexts/HistoryContext'
import { propertyAPI, authAPI } from '../services/api'
import ResponseCard from '../components/ResponseCard'
import LocationPicker from '../components/LocationPicker'
import { Home, MapPin, Bed, Bath, Ruler, Calendar, ArrowUpRight, X } from 'lucide-react'

function Query() {
  const { user, refreshUser } = useAuth()
  const { triggerRefresh } = useHistoryContext()
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
      district: '',
      property_type: 'House',
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
  
  // All 25 districts of Sri Lanka
  const sriLankaDistricts = [
    'Colombo',
    'Gampaha',
    'Kalutara',
    'Kandy',
    'Matale',
    'Nuwara Eliya',
    'Galle',
    'Matara',
    'Hambantota',
    'Jaffna',
    'Kilinochchi',
    'Mannar',
    'Vavuniya',
    'Mullaitivu',
    'Batticaloa',
    'Ampara',
    'Trincomalee',
    'Kurunegala',
    'Puttalam',
    'Anuradhapura',
    'Polonnaruwa',
    'Badulla',
    'Monaragala',
    'Ratnapura',
    'Kegalle'
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

  // Form validity: All except description must be filled
  const isFormValid = (
    cityValid &&
    (formData.features.city && formData.features.city.trim() !== '') &&
    formData.features.asking_price !== '' &&
    formData.features.beds !== '' &&
    formData.features.baths !== '' &&
    formData.features.area !== '' &&
    formData.features.year_built !== ''
  )

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

      // Add unique request identifier to prevent caching issues
      const requestId = `${Date.now()}_${Math.random().toString(36).substring(7)}`

      const plan = user?.plan?.toLowerCase()
      const allowedPlans = ['standard', 'premium']

      if (!allowedPlans.includes(plan)) {
        // Free user: only run the price/deal query and mark analyze as restricted
        const qRes = await propertyAPI.query({ 
          query: formData.query, 
          features, 
          tags: formData.tags,
          request_id: requestId 
        })
        const mergedBase = { ...(qRes.data || {}), analyze_location: null, analyze_restricted: true }
        setResponse(mergedBase)
      } else {
        // Allowed user: run analyze and query in parallel but don't let analyze failures block the main query
        const analyzeCall = (features.lat != null && features.lon != null)
          ? propertyAPI.analyzeLocation({ lat: features.lat, lon: features.lon, request_id: requestId })
          : Promise.resolve({ data: null })

        const queryCall = propertyAPI.query({ 
          query: formData.query, 
          features, 
          tags: formData.tags,
          request_id: requestId 
        })

        // Use allSettled so a failing analyze call won't reject the whole operation
        const [anResSettled, qResSettled] = await Promise.allSettled([analyzeCall, queryCall])

        // Ensure we still have the query result; if it failed, surface the error below
        if (qResSettled.status !== 'fulfilled') {
          throw qResSettled.reason
        }

        const qRes = qResSettled.value

        // Defensive refresh of plan if necessary
        let effectivePlan = plan
        if (!allowedPlans.includes(effectivePlan)) {
          try { const fresh = await authAPI.me(); effectivePlan = fresh.data?.plan?.toLowerCase() || effectivePlan } catch {}
        }

        const mergedBase = { ...(qRes.data || {}) }

        // If analyze call succeeded and the user's plan allows it, attach it; otherwise show restricted/empty
        if (allowedPlans.includes(effectivePlan) && anResSettled.status === 'fulfilled') {
          mergedBase.analyze_location = anResSettled.value?.data || null
          mergedBase.analyze_restricted = false
        } else if (allowedPlans.includes(effectivePlan) && anResSettled.status === 'rejected') {
          // Analyze failed but query succeeded - attach null and set a flag so UI can show a gentle message
          mergedBase.analyze_location = null
          mergedBase.analyze_restricted = false
          mergedBase.analyze_error = anResSettled.reason?.response?.data?.detail || String(anResSettled.reason)
        } else {
          mergedBase.analyze_location = null
          mergedBase.analyze_restricted = true
        }

        setResponse(mergedBase)
      }
      
      // Refresh user data to update analyses_remaining count
      await refreshUser()
      
      // Trigger sidebar history refresh
      triggerRefresh()
      
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

  const planLower = user?.plan?.toLowerCase()
  const canAnalyze = ['standard', 'premium'].includes(planLower)

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
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
      {/* Animated Background Blur Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Header */}
      <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Property Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Welcome back, <span className="text-blue-600 dark:text-blue-400 font-semibold">{user?.username}</span>! Analyze properties with AI-powered insights.
            </p>
          </div>
          {user && (
            <div className="flex items-center space-x-3">
              <span className="text-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-semibold shadow-md border border-blue-200/50 dark:border-blue-700/50">
                Plan: <span className="capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user.plan}</span>
              </span>
              <span className={`text-sm px-4 py-2 rounded-full font-semibold shadow-md ${user.analyses_remaining === 0 ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 dark:from-red-900/40 dark:to-pink-900/40 dark:text-red-300 border border-red-200 dark:border-red-700' : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border border-green-200 dark:border-green-700'}`}>
                Remaining: {user.analyses_remaining}
              </span>
              <a
                href="/plans"
                className="group text-sm inline-flex items-center space-x-1 font-bold px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <span>Upgrade</span><ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6">

      <div className="space-y-8">
        {/* Query Form */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 flex items-center">
            <Home className="w-8 h-8 mr-3 text-blue-600 animate-pulse" />
            Property Analysis Form
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  <MapPin className="inline w-5 h-5 mr-2 text-blue-600" />
                  City *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="city"
                    required
                    className={`w-full px-5 py-3.5 border ${cityValid ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500'} dark:bg-gray-700/50 bg-white text-gray-900 dark:text-white rounded-xl focus:outline-none transition-all duration-300 pr-10 shadow-md hover:shadow-lg font-medium`}
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
                    <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl text-sm">
                      {citySuggestions.map(c => (
                        <li
                          key={c}
                          className="px-4 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 text-gray-700 dark:text-gray-200 font-medium transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                          onClick={() => selectCity(c)}
                        >
                          {c}
                        </li>
                      ))}
                      {citySuggestions.length === 0 && (
                        <li className="px-4 py-3 text-gray-400 dark:text-gray-500 font-medium">No matches</li>
                      )}
                    </ul>
                  )}
                  {!cityValid && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold">Enter a valid Sri Lankan city from the suggested list.</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  <MapPin className="inline w-5 h-5 mr-2 text-purple-600" />
                  District
                </label>
                <select
                  id="district"
                  className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium appearance-none cursor-pointer"
                  value={formData.features.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                >
                  <option value="">Select District (Optional)</option>
                  {sriLankaDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional - helps with location-based pricing</p>
              </div>

              <div>
                <label htmlFor="property_type" className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  <Home className="inline w-5 h-5 mr-2 text-blue-600" />
                  Property Type *
                </label>
                <select
                  id="property_type"
                  required
                  className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium appearance-none cursor-pointer"
                  value={formData.features.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                >
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label htmlFor="asking_price" className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 mr-2 shadow-sm">LKR</span>
                  Asking Price *
                </label>
                <input
                  type="number"
                  id="asking_price"
                  required
                  min="0"
                  className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  placeholder="e.g., 20,000,000"
                  value={formData.features.asking_price}
                  onChange={(e) => handleInputChange('asking_price', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="beds" className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  <Bed className="inline w-5 h-5 mr-2 text-blue-600" />
                  Bedrooms *
                </label>
                <input
                  type="number"
                  id="beds"
                  min="0"
                  max="20"
                  required
                  className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  placeholder="e.g., 3"
                  value={formData.features.beds}
                  onChange={(e) => handleInputChange('beds', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="baths" className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  <Bath className="inline w-5 h-5 mr-2 text-blue-600" />
                  Bathrooms *
                </label>
                <input
                  type="number"
                  id="baths"
                  min="0"
                  max="20"
                  required
                  className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  placeholder="e.g., 2"
                  value={formData.features.baths}
                  onChange={(e) => handleInputChange('baths', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  <Ruler className="inline w-5 h-5 mr-2 text-blue-600" />
                  Area (sq ft) *
                </label>
                <input
                  type="number"
                  id="area"
                  min="0"
                  required
                  className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  placeholder="e.g., 1,200"
                  value={formData.features.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="year_built" className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  <Calendar className="inline w-5 h-5 mr-2 text-blue-600" />
                  Year Built *
                </label>
                <input
                  type="number"
                  id="year_built"
                  min="1800"
                  // Only allow current year or past years
                  max={currentYear}
                  required
                  className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
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
              <label htmlFor="query" className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                📝 Property Description (Optional)
              </label>
              <textarea
                id="query"
                rows={3}
                className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                placeholder="Describe any additional details about the property you want to analyze..."
                value={formData.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
              />
              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full cursor-pointer hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800 dark:hover:to-purple-800 border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all duration-300"
                      onClick={() => toggleTag(tag)} title="Remove tag">
                      {tag} ✕
                    </span>
                  ))}
                </div>
              )}
              {/* Suggestions */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute z-30 mt-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl p-4 max-h-60 overflow-auto">
                  <p className="text-xs uppercase tracking-wide bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 font-bold">Suggested Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tagSuggestions.map(s => (
                      <button type="button" key={s.tag} className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300 ${formData.tags.includes(s.tag) ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/40 dark:hover:to-purple-800/40 shadow-sm hover:shadow-md'}`}
                        onClick={() => toggleTag(s.tag)}>
                        {s.tag}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="mt-3 text-xs font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors" onClick={() => setShowTagSuggestions(false)}>Hide suggestions</button>
                </div>
              )}
            </div>

            </div>

            {/* Location Picker Map */}
            <div className="col-span-full">
              <LocationPicker
                selectedLocation={selectedLocation}
                onLocationChange={handleLocationChange}
                city={cityQuery || formData.features.city}
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
              disabled={loading || !isFormValid}
              className="group w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Analyzing Property...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>{canAnalyze ? 'Analyze Property' : 'Analyze Property'}</span>
                </>
              )}
            </button>

            {!canAnalyze && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Location analysis is available for <a href="/plans" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Standard</a> and <a href="/plans" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">Premium</a> plans. Upgrade to view risk, nearby facilities and location score.
                </p>
              </div>
            )}
          </form>

          {error && (
            <div className="mt-6 space-y-4">
              <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-2xl shadow-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-red-700 dark:text-red-300 text-lg mb-1">Error</h4>
                    <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
              {error.toLowerCase().includes('limit') && (
                <div className="p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl text-white shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-xl mb-2">Upgrade Required</h4>
                    <p className="text-sm opacity-95 font-medium">You have used all analyses available in your current plan. Upgrade to Standard or Premium for more analyses.</p>
                  </div>
                  <a href="/plans" className="group inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl hover:scale-105">
                    View Plans <ArrowUpRight className="w-4 h-4 ml-2 group-hover:rotate-45 transition-transform duration-300" />
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
                <div className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border-l-8 ${getVerdictColor(response.deal_verdict)} border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-shadow duration-300`}>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Deal Verdict</h3>
                  <div className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{response.deal_verdict}</div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg font-medium leading-relaxed">{response.why}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-semibold">
                      <span className="text-gray-600 dark:text-gray-400">Confidence: </span>
                      <span className="text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{(response.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full border border-green-200 dark:border-green-700 shadow-sm">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-green-700 dark:text-green-300">AI Analysis Complete</span>
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                <ResponseCard response={response} inputFeatures={formData.features} />
              </>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
                <div className="relative inline-block mb-6">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-blue-600"></div>
                  <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-r-4 border-l-4 border-purple-600" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">Analyzing Property...</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Our AI is processing your property data</p>
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

