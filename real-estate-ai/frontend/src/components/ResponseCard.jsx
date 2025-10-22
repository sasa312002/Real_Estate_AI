import React, { useState } from 'react'
import { feedbackAPI } from '../services/api'
import { ThumbsUp, ThumbsDown, ExternalLink, FileText } from 'lucide-react'
import MapPreview from './MapPreview'
import AnalyzeLocationView from './AnalyzeLocationView'

function ResponseCard({ response }) {
  const [feedback, setFeedback] = useState(null)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const handleFeedback = async (isPositive) => {
    if (submittingFeedback) return
    
    setSubmittingFeedback(true)
    try {
      const result = await feedbackAPI.submit({
        response_id: response.response_id,
        is_positive: isPositive
      })
      setFeedback(result.data)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const formatCurrency = (amount) => {
    const currency = response?.currency || 'LKR'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const normalizeProv = (item) => {
    if (item == null) return { title: 'Source', snippet: '', link: '' }
    if (typeof item === 'string') return { title: item, snippet: '', link: '' }
    const title = item.title || item.name || item.doc_id || item.id || item.source || 'Source'
    const snippet = item.snippet || item.summary || item.text || item.description || ''
    const link = item.link || item.url || item.href || ''
    return { title, snippet, link }
  }

  const extractCoordsFromLink = (url) => {
    if (!url) return null
    try {
      // Google Maps patterns: @lat,lon, or q=lat,lon
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (atMatch) return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) }
      const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (qMatch) return { lat: parseFloat(qMatch[1]), lon: parseFloat(qMatch[2]) }
      // OpenStreetMap pattern: /#map=zoom/lat/lon
      const osmMatch = url.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/)
      if (osmMatch) return { lat: parseFloat(osmMatch[1]), lon: parseFloat(osmMatch[2]) }
    } catch {}
    return null
  }

  const coords = (() => {
    // Prefer explicit coordinates if present on response
    if (response?.features?.lat && response?.features?.lon) {
      const lat = parseFloat(response.features.lat)
      const lon = parseFloat(response.features.lon)
      if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }
    }
    // Fallback: search provenance links for coords
    if (Array.isArray(response?.provenance)) {
      for (const raw of response.provenance) {
        const p = normalizeProv(raw)
        const c = extractCoordsFromLink(p.link)
        if (c) return c
      }
    }
    return null
  })()

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
      
      {/* Price Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Estimated Market Value</h4>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(response.estimated_price)}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Location Score</h4>
          <div className="text-2xl font-bold text-green-700">
            {formatPercentage(response.location_score)}
          </div>
        </div>
      </div>

      {/* Key Price Metrics */}
      {(() => {
        const area = response?.features?.area ? Number(response.features.area) : null
        const askingPrice = response?.features?.asking_price ? Number(response.features.asking_price) : null
        const estPrice = typeof response?.estimated_price === 'number' ? response.estimated_price : null
        const estPpsf = response?.price_per_sqft ? Number(response.price_per_sqft) : (area && estPrice ? estPrice / area : null)
        const askPpsf = area && askingPrice ? askingPrice / area : null
        const diff = (askingPrice != null && estPrice != null) ? askingPrice - estPrice : null
        const diffPct = (askingPrice != null && estPrice) ? (askingPrice / estPrice - 1) : null
        if (!(area || askingPrice || estPpsf || askPpsf)) return null
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {area != null && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Area</div>
                <div className="text-xl font-semibold text-gray-900">{Number(area).toLocaleString()} sq ft</div>
              </div>
            )}
            {askingPrice != null && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-800">Asking Price</div>
                <div className="text-xl font-semibold text-purple-900">{formatCurrency(askingPrice)}</div>
              </div>
            )}
            {estPpsf != null && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-800">Est. Price / sq ft</div>
                <div className="text-xl font-semibold text-blue-900">{formatCurrency(Math.round(estPpsf))}</div>
              </div>
            )}
            {askPpsf != null && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-800">Asking / sq ft</div>
                <div className="text-xl font-semibold text-amber-900">{formatCurrency(Math.round(askPpsf))}</div>
              </div>
            )}
            {diff != null && (
              <div className={`md:col-span-2 p-4 rounded-lg ${diff > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                <div className={`text-sm ${diff > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
                  {diff > 0 ? 'Over Ask vs Estimate' : 'Below Ask vs Estimate'}
                </div>
                <div className={`text-xl font-semibold ${diff > 0 ? 'text-red-900' : 'text-emerald-900'}`}>
                  {formatCurrency(Math.abs(diff))}
                  {diffPct != null && (
                    <span className="ml-2 text-sm font-medium">({(diffPct * 100).toFixed(1)}%)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Property Details */}
      {response?.features && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Property details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {response.features.city && (
              <div><span className="text-gray-600">City:</span> <span className="font-medium text-gray-900">{response.features.city}</span></div>
            )}
            {response.features.district && (
              <div><span className="text-gray-600">District:</span> <span className="font-medium text-gray-900">{response.features.district}</span></div>
            )}
            {response.features.property_type && (
              <div><span className="text-gray-600">Type:</span> <span className="font-medium text-gray-900">{response.features.property_type}</span></div>
            )}
            {response.features.beds != null && response.features.beds !== '' && (
              <div><span className="text-gray-600">Bedrooms:</span> <span className="font-medium text-gray-900">{response.features.beds}</span></div>
            )}
            {response.features.baths != null && response.features.baths !== '' && (
              <div><span className="text-gray-600">Bathrooms:</span> <span className="font-medium text-gray-900">{response.features.baths}</span></div>
            )}
            {response.features.year_built && (
              <div><span className="text-gray-600">Year Built:</span> <span className="font-medium text-gray-900">{response.features.year_built}</span></div>
            )}
          </div>
        </div>
      )}

      {response.analyze_restricted ? (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Location analysis is restricted on Free plan</div>
              <div className="text-sm text-gray-600">Upgrade to Standard or Premium to view full location score, risk assessment, and nearby facilities.</div>
            </div>
            <a href="/plans" className="ml-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold">View Plans</a>
          </div>
        </div>
      ) : (
        <>
          {response.analyze_error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              Location analysis failed to complete: {response.analyze_error}
            </div>
          )}
          {response.analyze_location && (
            <AnalyzeLocationView result={response.analyze_location} />
          )}
        </>
      )}
      {/* Provenance */}
      {Array.isArray(response.provenance) && response.provenance.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Sources & References
          </h4>
          {coords && (
            <div className="mb-3">
              <MapPreview lat={coords.lat} lon={coords.lon} height={200} popupText="Property Area" />
            </div>
          )}
          <div className="space-y-2">
            {response.provenance.map((raw, index) => {
              const p = normalizeProv(raw)
              return (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {p.title}
                  </div>
                  {p.snippet && (
                    <div className="text-sm text-gray-600 mb-2">
                      {p.snippet}
                    </div>
                  )}
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Source
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Was this analysis helpful?</h4>
        <div className="flex space-x-3">
          <button
            onClick={() => handleFeedback(true)}
            disabled={submittingFeedback}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              feedback?.is_positive === true
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
            }`}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Helpful
          </button>
          

          <button
            onClick={() => handleFeedback(false)}
            disabled={submittingFeedback}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              feedback?.is_positive === false
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
            }`}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Not Helpful
          </button>
        </div>
        
        {feedback && (
          <p className="text-sm text-gray-600 mt-2">
            Thank you for your feedback!
          </p>
        )}
      </div>

      {/* Query Info */}
      <div className="text-xs text-gray-500 border-t pt-4">
        <div>Query ID: {response.query_id}</div>
        <div>Response ID: {response.response_id}</div>
      </div>
    </div>
  )
}

export default ResponseCard

