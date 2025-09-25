import React, { useState } from 'react'
import { feedbackAPI } from '../services/api'
import { ThumbsUp, ThumbsDown, ExternalLink, FileText, Info, ChevronDown, ChevronUp, AlertTriangle, ListChecks } from 'lucide-react'
import MapPreview from './MapPreview'

function ResponseCard({ response }) {
  const [feedback, setFeedback] = useState(null)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [showRationale, setShowRationale] = useState(false)
  const [showRetrieval, setShowRetrieval] = useState(false)

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

  const hasMarketRange = response.market_low != null && response.market_high != null
  const asking = response?.deal_key_metrics?.asking_price || null
  const est = response?.estimated_price || null
  let positionPct = null
  if (hasMarketRange && asking) {
    const span = response.market_high - response.market_low
    if (span > 0) positionPct = ((asking - response.market_low) / span) * 100
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6 border border-gray-200 dark:border-gray-700">
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
      {/* Market Range & Rationale */}
      {hasMarketRange && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 flex items-center">
              <Info className="h-4 w-4 mr-2" /> Estimated Market Range
            </h4>
            <button
              type="button"
              onClick={() => setShowRationale(r => !r)}
              className="text-xs text-blue-600 dark:text-blue-300 hover:underline flex items-center"
            >
              {showRationale ? <><ChevronUp className="h-3 w-3 mr-1" /> Hide</> : <><ChevronDown className="h-3 w-3 mr-1" /> Details</>}
            </button>
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-300 mb-3 font-semibold">
            {formatCurrency(response.market_low)} – {formatCurrency(response.market_high)}
          </div>
          <div className="relative h-3 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden mb-2">
            <div className="absolute inset-y-0 left-0 bg-blue-400/30" style={{ width: '100%' }} />
            {positionPct != null && (
              <div
                className={`absolute -top-1 h-5 w-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold ${positionPct < 0 ? 'hidden' : ''}`}
                style={{ left: `calc(${Math.min(Math.max(positionPct,0),100)}% - 10px)`, background: '#2563eb', color: 'white' }}
                title={`Asking price position: ${positionPct.toFixed(1)}% of range`}
              >A</div>
            )}
            {est && (
              <div
                className="absolute top-0 h-3 w-1 bg-green-500"
                style={{ left: hasMarketRange ? `${((est - response.market_low)/(response.market_high - response.market_low))*100}%` : '50%' }}
                title="Estimated price marker"
              />
            )}
          </div>
          {showRationale && (
            <div className="text-xs text-blue-700 dark:text-blue-300 leading-snug">
              {response.market_range_rationale || 'No rationale provided.'}
            </div>
          )}
        </div>
      )}

      {/* Entities & Summary */}
      {(response.entities?.length || response.query_summary) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {response.query_summary && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">Summary</h4>
              <p className="text-sm text-purple-800 dark:text-purple-300 whitespace-pre-line">{response.query_summary}</p>
            </div>
          )}
          {response.entities?.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h4 className="font-medium text-emerald-900 dark:text-emerald-200 mb-2">Extracted Entities</h4>
              <div className="flex flex-wrap gap-2">
                {response.entities.slice(0,20).map((ent, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-full bg-emerald-200 dark:bg-emerald-700/60 text-emerald-900 dark:text-white font-medium" title={ent.label}>{ent.text}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deal Metrics & Risks */}
      {(response.deal_key_metrics || response.deal_risk_flags?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {response.deal_key_metrics && (
            <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center mb-2"><ListChecks className="h-4 w-4 mr-2" /> Key Metrics</h4>
              <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                {Object.entries(response.deal_key_metrics).map(([k,v]) => (
                  <li key={k} className="flex justify-between"><span className="font-medium capitalize mr-2">{k.replace(/_/g,' ')}:</span><span>{typeof v === 'number' ? v.toLocaleString() : String(v)}</span></li>
                ))}
              </ul>
            </div>
          )}
          {response.deal_risk_flags?.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-800 dark:text-red-300 flex items-center mb-2"><AlertTriangle className="h-4 w-4 mr-2" /> Risk Flags</h4>
              <ul className="text-xs space-y-1 text-red-700 dark:text-red-300 list-disc ml-4">
                {response.deal_risk_flags.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Retrieval Context */}
      {response.retrieved_context?.length > 0 && (
        <div className="bg-white dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-lg">
          <button
            type="button"
            onClick={() => setShowRetrieval(r => !r)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
          >
            <span className="flex items-center"><FileText className="h-4 w-4 mr-2" /> Retrieved Market Context ({response.retrieved_context.length})</span>
            {showRetrieval ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showRetrieval && (
            <div className="px-4 pb-4 space-y-2 text-xs text-gray-700 dark:text-gray-300">
              {response.retrieved_context.map((doc, idx) => (
                <div key={idx} className="p-2 rounded bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-600">
                  <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{doc.doc_id}</div>
                  <div>{doc.snippet}</div>
                  <div className="mt-1 text-[10px] opacity-70">score: {doc.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
      <div className="text-xs text-gray-500 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>Query ID: {response.query_id}</div>
        <div>Response ID: {response.response_id}</div>
        {response.location_rationale && (
          <div className="md:col-span-2 text-[11px] text-gray-400 mt-1">
            Location Factor: {response.location_factor != null ? response.location_factor.toFixed(3) : '—'} — {response.location_rationale}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResponseCard

