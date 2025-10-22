import React, { useEffect, useState } from 'react'
import { propertyAPI } from '../services/api'
import { Clock, Search, ChevronDown, ChevronUp, ExternalLink, Trash2, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import MapPreview from '../components/MapPreview'
import AnalyzeLocationView from '../components/AnalyzeLocationView'
import { useLocation } from 'react-router-dom'

function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)
  const [details, setDetails] = useState({})
  const [loadingDetailId, setLoadingDetailId] = useState(null)
  const locationHook = useLocation()
  const [selectedId, setSelectedId] = useState(null)

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

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search)
    const sel = params.get('select')
    if (sel) {
      setSelectedId(sel)
      setOpenId(sel) // auto open
      // Attempt to lazy-load details for this id
      ;(async () => {
        if (!details[sel]) {
          setLoadingDetailId(sel)
          try {
            const res = await propertyAPI.details(sel)
            setDetails(prev => ({ ...prev, [sel]: res.data }))
          } catch (e) {
            setDetails(prev => ({ ...prev, [sel]: { error: e.response?.data?.detail || 'Failed to load details' } }))
          } finally {
            setLoadingDetailId(null)
          }
        }
      })()
    }
  }, [locationHook.search])

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this history item?')) return
    try {
      await propertyAPI.deleteHistory(id)
      setItems(prev => prev.filter(i => i.id !== id))
      // clean details cache
      setDetails(prev => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
      if (openId === id) setOpenId(null)
      if (selectedId === id) setSelectedId(null)
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete')
    }
  }

  const handleDownloadPdf = async (id) => {
    try {
      const detail = details[id] || (await propertyAPI.details(id).then(r => r.data))
      if (!details[id]) setDetails(prev => ({ ...prev, [id]: detail }))

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 40
      let y = margin
      
      const checkPageBreak = (minSpace = 60) => {
        if (y + minSpace > 760) {
          doc.addPage()
          y = margin
        }
      }

      const addColoredBox = (label, value, bgColor, textColor) => {
        checkPageBreak(80)
        doc.setFillColor(...bgColor)
        doc.rect(margin, y, pageWidth - 2 * margin, 50, 'F')
        
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(label, margin + 10, y + 15)
        
        doc.setFontSize(14)
        doc.setTextColor(...textColor)
        doc.setFont(undefined, 'bold')
        const lines = doc.splitTextToSize(String(value), pageWidth - 2 * margin - 20)
        lines.forEach((line, idx) => {
          doc.text(line, margin + 10, y + 35 + (idx * 12))
        })
        doc.setFont(undefined, 'normal')
        doc.setTextColor(0, 0, 0)
        
        y += 60
      }

      const addSectionTitle = (title, color) => {
        checkPageBreak(40)
        doc.setFillColor(...color)
        doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F')
        
        doc.setFontSize(14)
        doc.setTextColor(255, 255, 255)
        doc.setFont(undefined, 'bold')
        doc.text(title, margin + 10, y + 17)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(0, 0, 0)
        
        y += 35
      }

      const addText = (text, fontSize = 11, bold = false, indent = 0) => {
        checkPageBreak(30)
        doc.setFontSize(fontSize)
        if (bold) doc.setFont(undefined, 'bold')
        const maxWidth = pageWidth - 2 * margin - indent
        const lines = doc.splitTextToSize(text, maxWidth)
        lines.forEach(line => {
          doc.text(line, margin + indent, y)
          y += fontSize + 4
          if (y > 760) {
            doc.addPage()
            y = margin
          }
        })
        if (bold) doc.setFont(undefined, 'normal')
      }

      // Header with gradient effect
      doc.setFillColor(30, 58, 138) // Dark blue
      doc.rect(0, 0, pageWidth, 80, 'F')
      
      doc.setFontSize(28)
      doc.setTextColor(255, 255, 255)
      doc.setFont(undefined, 'bold')
      doc.text('Real Estate Analysis Report', margin, 35)
      
      const historyItem = items.find(i => i.id === id)
      doc.setFontSize(11)
      doc.setFont(undefined, 'normal')
      doc.text(`Generated on ${new Date().toLocaleString()}`, margin, 55)
      
      y = 95

      // Query Info Section
      addSectionTitle('Query Information', [52, 152, 219])
      addText(`Query: ${historyItem?.query_text || 'N/A'}`, 11, true)
      addText(`City: ${historyItem?.city || '-'}`, 11)
      if (historyItem?.lat && historyItem?.lon) {
        addText(`Location: ${Number(historyItem.lat).toFixed(4)}, ${Number(historyItem.lon).toFixed(4)}`, 11)
      }
      if (historyItem?.tags && historyItem.tags.length > 0) {
        addText(`Tags: ${historyItem.tags.join(', ')}`, 11)
      }
      addText(`Analysis Date: ${new Date(historyItem?.created_at || Date.now()).toLocaleString()}`, 10)
      y += 6

      // Key Metrics Section with colored boxes
      addSectionTitle('Key Metrics', [46, 204, 113])
      
      addColoredBox('Estimated Market Value', formatCurrency(detail.estimated_price, detail), [173, 216, 230], [0, 51, 102])
      
      const locationScore = detail.location_score ?? 0
      const scorePct = Math.round(locationScore * 100)
      const scoreColor = scorePct >= 70 ? [144, 238, 144] : scorePct >= 40 ? [255, 218, 185] : [255, 182, 193]
      const scoreTextColor = scorePct >= 70 ? [0, 100, 0] : scorePct >= 40 ? [178, 90, 0] : [139, 0, 0]
      addColoredBox('Location Score', `${scorePct}%`, scoreColor, scoreTextColor)
      
      const dealColor = detail.deal_verdict === 'Good Deal' ? [144, 238, 144] : detail.deal_verdict === 'Fair Deal' ? [255, 218, 185] : [255, 182, 193]
      const dealTextColor = detail.deal_verdict === 'Good Deal' ? [0, 100, 0] : detail.deal_verdict === 'Fair Deal' ? [178, 90, 0] : [139, 0, 0]
      addColoredBox('Deal Verdict', detail.deal_verdict || '-', dealColor, dealTextColor)
      
      const confidence = detail.confidence != null ? (detail.confidence * 100).toFixed(0) : 'N/A'
      addColoredBox('Confidence Level', `${confidence}%`, [216, 191, 216], [75, 0, 130])

      y += 6

      // Summary Section
      addSectionTitle('Analysis Summary', [155, 89, 182])
      if (detail.why) {
        addText(detail.why, 11)
      } else {
        addText('No summary available', 10)
      }
      y += 6

      // Location Analysis if available
      if (detail.analyze_location) {
        addSectionTitle('Location Analysis', [52, 73, 94])
        
        const locationResult = detail.analyze_location
        const locScorePct = Math.round((locationResult?.score || 0) * 100)
        
        checkPageBreak(60)
        doc.setFillColor(240, 248, 255)
        doc.rect(margin, y, pageWidth - 2 * margin, 50, 'F')
        doc.setDrawColor(30, 144, 255)
        doc.setLineWidth(2)
        doc.rect(margin, y, pageWidth - 2 * margin, 50)
        
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(30, 58, 138)
        doc.text(`Location Score: ${locScorePct}%`, margin + 10, y + 15)
        
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        const locSummary = locationResult.summary ? locationResult.summary.substring(0, 150) + '...' : 'Analysis complete'
        const summaryLines = doc.splitTextToSize(locSummary, pageWidth - 2 * margin - 20)
        summaryLines.slice(0, 2).forEach((line, idx) => {
          doc.text(line, margin + 10, y + 30 + (idx * 12))
        })
        
        y += 60

        // Risk Assessment
        if (locationResult.risk) {
          checkPageBreak(60)
          const riskLevel = (locationResult.risk.level || 'N/A').toString()
          const riskBgColor = riskLevel === 'High' ? [255, 200, 200] : riskLevel === 'Medium' ? [255, 238, 200] : [200, 255, 200]
          const riskTextColor = riskLevel === 'High' ? [178, 34, 34] : riskLevel === 'Medium' ? [178, 90, 0] : [0, 100, 0]
          
          doc.setFillColor(...riskBgColor)
          doc.rect(margin, y, pageWidth - 2 * margin, 40, 'F')
          doc.setDrawColor(...riskTextColor)
          doc.setLineWidth(2)
          doc.rect(margin, y, pageWidth - 2 * margin, 40)
          
          doc.setFontSize(12)
          doc.setFont(undefined, 'bold')
          doc.setTextColor(...riskTextColor)
          doc.text(`Risk Assessment: ${riskLevel} Risk`, margin + 10, y + 15)
          
          doc.setFontSize(9)
          doc.setFont(undefined, 'normal')
          if (locationResult.risk.summary) {
            const riskLines = doc.splitTextToSize(locationResult.risk.summary.substring(0, 120), pageWidth - 2 * margin - 20)
            riskLines.slice(0, 1).forEach((line, idx) => {
              doc.text(line, margin + 10, y + 28 + (idx * 10))
            })
          }
          
          y += 50
        }

        // Nearby Facilities
        const nearby = locationResult.nearby || {}
        const facilityGroups = [
          { name: 'Hospitals', key: 'hospitals', color: [200, 255, 200] },
          { name: 'Schools', key: 'schools', color: [200, 220, 255] },
          { name: 'Transport', key: 'bus_stations', color: [255, 240, 200] }
        ]

        facilityGroups.forEach(group => {
          const facilities = nearby[group.key] || []
          if (facilities.length > 0) {
            checkPageBreak(50)
            doc.setFillColor(...group.color)
            doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
            doc.setDrawColor(100, 100, 100)
            doc.setLineWidth(1)
            doc.rect(margin, y, pageWidth - 2 * margin, 20)
            
            doc.setFontSize(11)
            doc.setFont(undefined, 'bold')
            doc.setTextColor(0, 0, 0)
            doc.text(`${group.name}`, margin + 10, y + 14)
            
            y += 25
            
            doc.setFontSize(9)
            doc.setFont(undefined, 'normal')
            facilities.slice(0, 5).forEach(facility => {
              addText(`• ${facility.name} (${facility.distance_km} km away)`, 9, false, 10)
            })
            if (facilities.length > 5) {
              addText(`...and ${facilities.length - 5} more`, 9, true, 10)
            }
            y += 6
          }
        })
      }

      // Sources Section
      if (Array.isArray(detail.provenance) && detail.provenance.length > 0) {
        y += 6
        addSectionTitle('Sources & References', [230, 126, 34])
        
        detail.provenance.forEach((raw, idx) => {
          const p = normalizeProv(raw)
          checkPageBreak(50)
          
          doc.setFillColor(255, 248, 240)
          doc.rect(margin, y, pageWidth - 2 * margin, 5, 'F')
          doc.setDrawColor(200, 100, 50)
          doc.setLineWidth(1)
          doc.rect(margin, y, pageWidth - 2 * margin, 5)
          
          y += 12
          
          doc.setFontSize(11)
          doc.setFont(undefined, 'bold')
          doc.setTextColor(139, 69, 19)
          addText(`${idx + 1}. ${p.title}`)
          
          if (p.snippet) {
            doc.setFontSize(10)
            doc.setFont(undefined, 'normal')
            doc.setTextColor(80, 80, 80)
            addText(`${p.snippet}`, 9)
          }
          
          if (p.link) {
            doc.setFontSize(9)
            doc.setTextColor(0, 0, 255)
            addText(`Link: ${p.link.substring(0, 80)}${p.link.length > 80 ? '...' : ''}`, 8)
          }
          
          y += 6
        })
      }

      // Footer
      checkPageBreak(20)
      y = 750
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Real Estate AI - Powered by Advanced Analysis', pageWidth / 2, y, { align: 'center' })
      
      const totalPages = doc.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(200, 200, 200)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, 760)
      }

      doc.save(`real_estate_analysis_${id}.pdf`)
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to generate PDF')
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Review your recent property analysis queries and results.</p>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">

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
          <div key={h.id} className={`bg-white rounded-lg shadow-sm border ${selectedId === h.id ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200'}`}>
            <button onClick={() => toggleDetails(h.id)} className="w-full text-left p-4">
              <div className="flex items-start justify-between">
                <div className="pr-4">
                  <div className="text-gray-900 font-medium mb-1 line-clamp-2 flex items-center space-x-2">
                    <span>{h.query_text}</span>
                    {selectedId === h.id && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">Selected</span>}
                  </div>
                  {h.city && (
                    <div className="text-sm text-gray-700 font-medium mb-1">
                      {h.city}
                    </div>
                  )}
                  {/* Show small summary of user inputs */}
                  <div className="text-xs text-gray-500">
                    {h.tags && h.tags.length > 0 && (
                      <span className="mr-2">Tags: {h.tags.join(', ')}</span>
                    )}
                    {h.lat != null && h.lon != null && (
                      <span>Coords: {Number(h.lat).toFixed(4)},{Number(h.lon).toFixed(4)}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {new Date(h.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-2 py-1 rounded-full border ${h.has_response ? 'text-green-700 bg-green-50 border-green-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'}`}>
                    {h.has_response ? 'Analyzed' : 'Pending'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownloadPdf(h.id) }}
                    title="Download PDF"
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(h.id) }}
                    title="Delete"
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
                    
                      {/* Location analysis output (if present) */}
                      {details[h.id].analyze_location && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Saved Location Analysis</h4>
                          <AnalyzeLocationView result={details[h.id].analyze_location} />
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
      </div>
    </div>
  )
}

export default History
