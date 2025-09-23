import React, { useEffect, useState } from 'react'
import { propertyAPI } from '../services/api'
import { Clock, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import MapPreview from '../components/MapPreview'

function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)
  const [details, setDetails] = useState({})
  const [loadingDetailId, setLoadingDetailId] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await propertyAPI.history(20)
        setItems(res.data)
      } catch (e) {
        setError(e.response?.data?.detail || 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleDetails = async (id) => {
    if (openId === id) {
      setOpenId(null)
      return
    }
    setOpenId(id)
    if (!details[id]) {
      setLoadingDetailId(id)
      try {
        const res = await propertyAPI.details(id)
        setDetails(prev => ({ ...prev, [id]: res.data }))
      } catch (e) {
        setDetails(prev => ({ ...prev, [id]: { error: e.response?.data?.detail || 'Failed to load details' } }))
      } finally {
        setLoadingDetailId(null)
      }
    }
  }

  const formatCurrency = (amount, d) => {
    if (amount == null) return '-'
    const currency = d?.currency || 'LKR'
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
    } catch {
      return amount
    }
  }

  const formatPercentage = (value) => {
    if (value == null) return '-'
    return `${(value * 100).toFixed(0)}%`
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
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (atMatch) return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) }
      const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (qMatch) return { lat: parseFloat(qMatch[1]), lon: parseFloat(qMatch[2]) }
      const osmMatch = url.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/)
      if (osmMatch) return { lat: parseFloat(osmMatch[1]), lon: parseFloat(osmMatch[2]) }
    } catch {}
    return null
  }

  const firstCoords = (prov) => {
    if (!Array.isArray(prov)) return null
    for (const raw of prov) {
      const p = normalizeProv(raw)
      const c = extractCoordsFromLink(p.link)
      if (c) return c
    }
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Past Analyses</h1>
        <p className="text-gray-600">Review your recent property analysis queries and details.</p>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          Loading history...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          No past analyses yet.
        </div>
      )}

      <div className="space-y-3">
        {items.map((h) => (
          <div key={h.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button onClick={() => toggleDetails(h.id)} className="w-full text-left p-4">
              <div className="flex items-start justify-between">
                <div className="pr-4">
                  <div className="text-gray-900 font-medium mb-1 line-clamp-2">{h.query_text}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {new Date(h.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-2 py-1 rounded-full border ${h.has_response ? 'text-green-700 bg-green-50 border-green-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'}`}>
                    {h.has_response ? 'Analyzed' : 'Pending'}
                  </span>
                  {openId === h.id ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
            </button>

            {openId === h.id && (
              <div className="px-4 pb-4">
                {loadingDetailId === h.id && (
                  <div className="text-sm text-gray-500">Loading details...</div>
                )}
                {!loadingDetailId && details[h.id]?.error && (
                  <div className="text-sm text-red-600">{details[h.id].error}</div>
                )}
                {!loadingDetailId && details[h.id] && !details[h.id].error && (
                  <div className="bg-gray-50 rounded-md p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Estimated Price</div>
                        <div className="text-gray-900 font-semibold">{formatCurrency(details[h.id].estimated_price, details[h.id])}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Location Score</div>
                        <div className="text-gray-900 font-semibold">{formatPercentage(details[h.id].location_score)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Deal Verdict</div>
                        <div className="text-gray-900 font-semibold">{details[h.id].deal_verdict}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Why</div>
                      <div className="text-gray-800">{details[h.id].why}</div>
                    </div>
                    {Array.isArray(details[h.id].provenance) && details[h.id].provenance.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-2">Sources & References</div>
                        {firstCoords(details[h.id].provenance) && (
                          <div className="mb-2">
                            <MapPreview lat={firstCoords(details[h.id].provenance).lat} lon={firstCoords(details[h.id].provenance).lon} height={180} popupText="Property Area" />
                          </div>
                        )}
                        <div className="space-y-2">
                          {details[h.id].provenance.map((raw, idx) => {
                            const p = normalizeProv(raw)
                            return (
                              <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                <div className="text-sm font-medium text-gray-900 mb-1">{p.title}</div>
                                {p.snippet && (
                                  <div className="text-sm text-gray-600 mb-2">{p.snippet}</div>
                                )}
                                {p.link && (
                                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700">
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
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default History
