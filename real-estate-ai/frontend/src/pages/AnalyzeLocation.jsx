import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useAuth } from '../contexts/AuthContext'
import { propertyAPI } from '../services/api'

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

  const handleSelect = (coords) => {
    setPosition(coords)
    setError('')
    setResult(null)
    // Trigger backend analysis as soon as a location is selected
    runAnalysis(coords)
  }

  const runAnalysis = async (coords) => {
    try {
      setLoading(true)
      const [lat, lon] = coords
      const res = await propertyAPI.analyzeLocation({ lat, lon })
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to analyze location')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Analyze Location</h2>
  <p className="text-sm text-gray-600 mb-4">Click on the map to select a location for analysis. Results will appear below.</p>

      <div className="w-full h-96 rounded-lg overflow-hidden border">
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector onSelect={handleSelect} />
          <Marker position={position} />
        </MapContainer>
      </div>

      <div className="mt-4">
        {loading && <span className="text-gray-600">Analyzing location…</span>}
        {error && <span className="ml-3 text-red-600">{error}</span>}
      </div>

      {result && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="col-span-1 bg-white dark:bg-gray-800 border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Location Overview</h3>
            <div className="text-sm mb-1"><span className="font-medium">Score:</span> {Math.round((result.score || 0) * 100)}%</div>
            {result.summary && <p className="text-sm text-gray-700 mb-2">{result.summary}</p>}
            {Array.isArray(result.bullets) && result.bullets.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {result.bullets.map((b, i) => (<li key={i}>{b}</li>))}
              </ul>
            )}
            {result.facility_summary && (
              <p className="text-sm text-gray-700 mt-2">{result.facility_summary}</p>
            )}
          </div>

          <div className="col-span-1 bg-white dark:bg-gray-800 border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Risk Assessment</h3>
            <div className="text-sm mb-2"><span className="font-medium">Level:</span> {result.risk?.level || 'N/A'}</div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {result.risk?.factors?.map((f, i) => (
                <li key={i}><span className="font-medium">{f.name}</span> (severity {f.severity}): {f.description}</li>
              ))}
            </ul>
            {result.risk?.summary && <p className="text-sm text-gray-600 mt-2">{result.risk.summary}</p>}
          </div>

          <div className="col-span-1 bg-white dark:bg-gray-800 border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Nearby Healthcare</h3>
            <div className="text-sm font-medium">Hospitals</div>
            <ul className="list-disc pl-5 text-sm mb-3">
              {(result.nearby?.hospitals || []).map((h, i) => (
                <li key={i}>{h.name} — {h.distance_km} km</li>
              ))}
            </ul>
            <div className="text-sm font-medium">Police & Fire</div>
            <ul className="list-disc pl-5 text-sm">
              {(result.nearby?.police || []).map((p, i) => (
                <li key={i}>Police: {p.name} — {p.distance_km} km</li>
              ))}
              {(result.nearby?.fire_stations || []).map((f, i) => (
                <li key={i}>Fire: {f.name} — {f.distance_km} km</li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 bg-white dark:bg-gray-800 border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Nearby Education & Transport</h3>
            <div className="text-sm font-medium">Schools & Universities</div>
            <ul className="list-disc pl-5 text-sm mb-3">
              {(result.nearby?.schools || []).map((s, i) => (
                <li key={i}>School: {s.name} — {s.distance_km} km</li>
              ))}
              {(result.nearby?.universities || []).map((u, i) => (
                <li key={i}>University: {u.name} — {u.distance_km} km</li>
              ))}
            </ul>
            <div className="text-sm font-medium">Transport & Roads</div>
            <ul className="list-disc pl-5 text-sm">
              {(result.nearby?.bus_stations || []).map((b, i) => (
                <li key={i}>Bus station: {b.name} — {b.distance_km} km</li>
              ))}
              {(result.nearby?.train_stations || []).map((t, i) => (
                <li key={i}>Railway station: {t.name} — {t.distance_km} km</li>
              ))}
              {(result.nearby?.roads || []).map((r, i) => (
                <li key={i}>Road: {r.name} — {r.distance_km} km</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
