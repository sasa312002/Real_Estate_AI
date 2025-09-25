import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icon for selected location
const selectedLocationIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'selected-location-marker'
})

// Component to handle map clicks
function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    },
  })

  return position ? (
    <Marker position={position} icon={selectedLocationIcon} />
  ) : null
}

// Recenter button component
function RecenterButton({ position }) {
  const map = useMap()
  if (!position) return null
  return (
    <button
      type="button"
      aria-label="Recenter map to selected location"
      onClick={() => map.setView(position, map.getZoom(), { animate: true })}
      className="absolute z-[1000] top-2 right-2 bg-white dark:bg-gray-800 shadow-md rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
    >
      Recenter
    </button>
  )
}

function LocationPicker({ selectedLocation, onLocationChange, city, onInferredCity, className = '' }) {
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]) // Initial default (Colombo)
  const [zoom, setZoom] = useState(13)
  const [cityLoading, setCityLoading] = useState(false)
  const lastGeocodeRef = useRef({ lat: null, lon: null })
  const [searchValue, setSearchValue] = useState('')
  const searchAbortRef = useRef(null)

  // Re-center on the selected location whenever it changes
  useEffect(() => {
    if (selectedLocation) {
      setMapCenter(selectedLocation)
    }
  }, [selectedLocation])

  const reverseGeocode = async (lat, lon) => {
    if (!onInferredCity) return
    // Prevent excessive lookups if user double-clicks near same point (< ~15m apart)
    if (lastGeocodeRef.current.lat !== null) {
      const dLat = lat - lastGeocodeRef.current.lat
      const dLon = lon - lastGeocodeRef.current.lon
      const dist = Math.sqrt(dLat * dLat + dLon * dLon) * 111000 // approx meters
      if (dist < 15) return
    }
    lastGeocodeRef.current = { lat, lon }
    try {
      setCityLoading(true)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 6000)
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'real-estate-ai-demo/1.0 (educational use)'
        },
        signal: controller.signal
      })
      clearTimeout(timeout)
      if (!resp.ok) throw new Error('geocode failed')
      const data = await resp.json()
      const addr = data.address || {}
      const inferred = addr.city || addr.town || addr.village || addr.suburb || addr.county || ''
      if (inferred) {
        onInferredCity(inferred.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '))
      } else {
        onInferredCity('')
      }
    } catch (err) {
      // Silent failure; keep previous city
      // Optionally could surface a toast here
    } finally {
      setCityLoading(false)
    }
  }

  const handleLocationSelect = (lat, lng) => {
    onLocationChange(lat, lng)
    reverseGeocode(lat, lng)
  }

  const geocodeSearch = async (query) => {
    if (!query || query.trim().length < 3) return
    try {
      if (searchAbortRef.current) searchAbortRef.current.abort()
      const controller = new AbortController()
      searchAbortRef.current = controller
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'real-estate-ai-demo/1.0 (educational use)' },
        signal: controller.signal
      })
      if (!resp.ok) return
      const data = await resp.json()
      if (Array.isArray(data) && data.length > 0) {
        const best = data[0]
        const lat = parseFloat(best.lat)
        const lon = parseFloat(best.lon)
        if (!isNaN(lat) && !isNaN(lon)) {
          onLocationChange(lat, lon)
          setMapCenter([lat, lon])
          reverseGeocode(lat, lon)
        }
      }
    } catch (_) {
      // silent
    }
  }

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      geocodeSearch(searchValue)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 Select Property Location on Map
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Click on the map to select the exact location of the property
        </p>
        
        {selectedLocation && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-3">
            <div className="flex items-center text-sm">
              <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                Selected Location:
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-mono">
              Latitude: {selectedLocation[0].toFixed(6)}°<br/>
              Longitude: {selectedLocation[1].toFixed(6)}°
            </div>
          </div>
        )}
      </div>
      
      <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-lg relative">
        {/* Search overlay */}
        <div className="absolute top-2 left-2 z-[1000] flex space-x-2">
          <input
            type="text"
            aria-label="Search location"
            placeholder="Search place..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKey}
            className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => geocodeSearch(searchValue)}
            className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!searchValue || searchValue.length < 3}
          >Go</button>
        </div>
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '400px', width: '100%' }}
          className="z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Primary user-selected marker */}
          <LocationMarker
            position={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
          <RecenterButton position={selectedLocation} />
          {/* No fallback marker; user must click to set a location */}
        </MapContainer>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center space-y-1">
        <div>🖱️ Click anywhere on the map to select the property location. {cityLoading && <span className="text-blue-600 dark:text-blue-400">Resolving city...</span>}</div>
        <div className="text-[10px] text-gray-400">Reverse geocoding courtesy of Nominatim (OSM). Locations approximate; verify before decisions.</div>
      </div>
    </div>
  )
}

export default LocationPicker