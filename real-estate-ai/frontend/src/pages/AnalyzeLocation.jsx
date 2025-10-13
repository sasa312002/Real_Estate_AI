import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useAuth } from '../contexts/AuthContext'
import { propertyAPI } from '../services/api'
import { BadgeCheck, AlertTriangle, Shield, Flame, GraduationCap, Bus, Train, MapPin, Compass, Info, Loader2, TrendingUp, Target, Navigation, Building2, Activity } from 'lucide-react'

// Fix leaflet icon for many bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function LocationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng])
    }
  })
  return null
}

export default function AnalyzeLocation() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [position, setPosition] = useState([6.9271, 79.8612]) // Default to Colombo
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  // Check plan access (only Standard and Premium allowed)
  useEffect(() => {
    const plan = user?.plan?.toLowerCase()
    if (!plan || !['standard', 'premium'].includes(plan)) {
      navigate('/plans', { replace: true })
    }
  }, [user, navigate])

  // Handle map selection and trigger analysis
  const handleSelect = async ([lat, lon]) => {
    try {
      setPosition([lat, lon])
      setLoading(true)
      setError('')
      setResult(null)
      const { data } = await propertyAPI.analyzeLocation({ lat, lon })
      setResult(data)
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Failed to analyze location'
      setError(msg)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const scorePct = Math.round((result?.score || 0) * 100)
  const riskLevel = (result?.risk?.level || 'N/A').toString()
  const riskColor = riskLevel === 'High' ? 'bg-red-100 text-red-700 border-red-200' : riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : riskLevel === 'Low' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Analyze Location</h2>
          </div>
          <p className="text-sm text-gray-600 ml-14">Click anywhere on the map to analyze location risk, score, and nearby amenities instantly.</p>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm">
            <Navigation className="w-3.5 h-3.5 mr-2" /> 
            <span className="text-xs font-medium">Lat: {position[0].toFixed(5)}</span>
          </div>
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 shadow-sm">
            <Navigation className="w-3.5 h-3.5 mr-2" /> 
            <span className="text-xs font-medium">Lon: {position[1].toFixed(5)}</span>
          </div>
        </div>
      </div>

      {/* Map Card */}
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 inline-flex items-center">
            <div className="p-1.5 bg-white rounded-lg shadow-sm mr-2">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            Click anywhere on the map to analyze
          </div>
          {loading && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" /> 
              Analyzing location...
            </div>
          )}
          {error && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              <AlertTriangle className="w-4 h-4" /> 
              {error}
            </div>
          )}
        </div>
        <div className="w-full h-[500px] relative">
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSelector onSelect={handleSelect} />
            <Marker position={position} />
          </MapContainer>
        </div>
      </div>

      {/* Results */}
      {!result && !loading && (
        <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-2xl">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-4 bg-white rounded-full shadow-md">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Ready to Analyze</h3>
            <p className="text-sm text-gray-600 max-w-md">Click anywhere on the map above to instantly analyze the location's score, risk factors, and nearby facilities.</p>
          </div>
        </div>
      )}

      {/* Skeleton while loading */}
      {loading && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          {/* Top Row - Overview and Risk (stacked) */}
          <div className="grid grid-cols-1 gap-6">
            {/* Overview Card */}
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Location Overview</h3>
              </div>
              
              {/* Score bar */}
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Location Score</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{scorePct}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${scorePct >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : scorePct >= 40 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-pink-500'}`} 
                    style={{ width: `${scorePct}%` }}
                  ></div>
                </div>
              </div>

              {result.summary && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.summary}</p>
                </div>
              )}
              
              {Array.isArray(result.bullets) && result.bullets.length > 0 && (
                <div className="space-y-2">
                  {result.bullets.slice(0, 5).map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <BadgeCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{b}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {result.facility_summary && (
                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-indigo-200 dark:border-gray-600">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{result.facility_summary}</p>
                </div>
              )}
            </div>

            {/* Risk Card */}
            <div className="bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-gray-900 border-2 border-red-200 dark:border-red-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Risk Assessment</h3>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-sm font-bold px-4 py-2 rounded-lg border-2 shadow-md ${riskColor}`}>
                  {riskLevel} Risk
                </span>
              </div>
              
              <div className="space-y-3">
                {result.risk?.factors?.map((f, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${f.severity >= 4 ? 'bg-red-100' : f.severity >= 3 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                        <Shield className={`w-4 h-4 ${f.severity >= 4 ? 'text-red-600' : f.severity >= 3 ? 'text-yellow-600' : 'text-green-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{f.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.severity >= 4 ? 'bg-red-100 text-red-700' : f.severity >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            Level {f.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{f.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {result.risk?.summary && (
                <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-red-200 dark:border-gray-600">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{result.risk.summary}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row - Facilities (4 cards as 2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Hospitals */}
            <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 border-2 border-green-200 dark:border-green-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hospitals</h3>
              </div>
              {Array.isArray(result.nearby?.hospitals) && result.nearby.hospitals.length > 0 ? (
                <div className="space-y-2">
                  {result.nearby.hospitals.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition-shadow">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{h.name}</span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">{h.distance_km} km</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No hospitals found within 1.5 km</p>
              )}
            </div>

            {/* Emergency Services */}
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Emergency Services</h3>
              </div>
              {Array.isArray(result.nearby?.police) && result.nearby.police.length + (result.nearby?.fire_stations?.length || 0) > 0 ? (
                <div className="space-y-2">
                  {(result.nearby?.police || []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">{p.distance_km} km</span>
                    </div>
                  ))}
                  {(result.nearby?.fire_stations || []).map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-orange-600" />
                        <span className="text-gray-700 dark:text-gray-300">{f.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">{f.distance_km} km</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No emergency services found within 1.5 km</p>
              )}
            </div>

            {/* Education */}
            <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Education</h3>
              </div>
              {Array.isArray(result.nearby?.schools) && result.nearby.schools.length + (result.nearby?.universities?.length || 0) > 0 ? (
                <div className="space-y-2">
                  {(result.nearby?.schools || []).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-gray-700 dark:text-gray-300">{s.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">{s.distance_km} km</span>
                    </div>
                  ))}
                  {(result.nearby?.universities || []).map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-gray-700 dark:text-gray-300">{u.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">{u.distance_km} km</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No schools or universities found within 1.5 km</p>
              )}
            </div>

            {/* Transport & Roads */}
            <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-2 border-emerald-200 dark:border-emerald-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Transport & Roads</h3>
              </div>
              {Array.isArray(result.nearby?.bus_stations) && (result.nearby.bus_stations.length + (result.nearby?.train_stations?.length || 0) + (result.nearby?.roads?.length || 0) > 0) ? (
                <div className="space-y-2">
                  {(result.nearby?.bus_stations || []).map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <Bus className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-gray-700 dark:text-gray-300">{b.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">{b.distance_km} km</span>
                    </div>
                  ))}
                  {(result.nearby?.train_stations || []).map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <Train className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-gray-700 dark:text-gray-300">{t.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">{t.distance_km} km</span>
                    </div>
                  ))}
                  {(result.nearby?.roads || []).map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-700 dark:text-gray-300">{r.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">{r.distance_km} km</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No transport hubs or major roads found nearby</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
