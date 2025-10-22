import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useAuth } from '../contexts/AuthContext'
import { useHistory as useHistoryContext } from '../contexts/HistoryContext'
import { propertyAPI } from '../services/api'
import { BadgeCheck, AlertTriangle, Shield, Flame, GraduationCap, Bus, Train, MapPin, Compass, Info, Loader2, TrendingUp, Target, Navigation, Building2, Activity } from 'lucide-react'
import AnalyzeLocationView from '../components/AnalyzeLocationView'

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
  const { user, refreshUser } = useAuth()
  const { triggerRefresh } = useHistoryContext()
  const navigate = useNavigate()
  const [position, setPosition] = useState([6.9271, 79.8612]) // Default to Colombo
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  // Katunayake (Bandaranaike International Airport) coordinates
  const AIRPORT_COORDS = { lat: 7.1808, lon: 79.8841 }

  // Haversine distance in kilometers between two [lat, lon]
  const haversineKm = (a, b) => {
    if (!a || !b) return null
    const toRad = (deg) => (deg * Math.PI) / 180
    const R = 6371 // km
    const [lat1, lon1] = a
    const [lat2, lon2] = b
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const s1 = Math.sin(dLat / 2)
    const s2 = Math.sin(dLon / 2)
    const aa = s1 * s1 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * s2 * s2
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
    return R * c
  }

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
      
      // Refresh user data to update analyses_remaining count
      await refreshUser()
      
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
          <p className="text-sm text-gray-600 ml-14"></p>
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
            Click anywhere on the map to analyze location risk, score, and nearby amenities instantly.
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
      {/* Result / Loading Section */}
      <div className="mt-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">Analyzing location...</div>
                <div className="text-sm text-gray-500">Fetching nearby amenities and running risk analysis. This may take a few seconds.</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-36 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-36 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-36 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-36 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-200 text-red-700">{error}</div>
        ) : result ? (
          <>
            <AnalyzeLocationView result={result} />

            {/* Distance to Bandaranaike International Airport (Katunayake) */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Distance to Bandaranaike International Airport (Katunayake)
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Approximate geodesic distance from the selected location: {haversineKm(position, [AIRPORT_COORDS.lat, AIRPORT_COORDS.lon])?.toFixed(2)} km
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-gray-600">Click on the map to begin analysis.</div>
        )}
      </div>
    </div>
  )
}
