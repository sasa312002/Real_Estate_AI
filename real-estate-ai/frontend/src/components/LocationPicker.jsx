import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet'
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

function LocationPicker({ selectedLocation, onLocationChange, city, className = '' }) {
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]) // Default to Colombo
  const [zoom, setZoom] = useState(13)
  
  // Helper to recenter the React Leaflet map when center/zoom state changes
  function RecenterOnChange({ center, zoom }) {
    const map = useMap()
    useEffect(() => {
      if (center && Array.isArray(center) && center.length === 2) {
        map.setView(center, zoom)
      }
    }, [center?.[0], center?.[1], zoom])
    return null
  }

  // Extended Sri Lanka city coordinates (approximate)
  const cityCoordinates = {
    // Western Province & Metro
    'colombo': [6.9271, 79.8612],
    'dehiwala': [6.8402, 79.8712],
    'mount lavinia': [6.8402, 79.8712],
    'moratuwa': [6.7730, 79.8816],
    'kesbewa': [6.7844, 79.9660],
    'maharagama': [6.8480, 79.9288],
    'kotte': [6.9022, 79.9090],
    'kaduwela': [6.9333, 79.9833],
    'homagama': [6.8432, 80.0020],
    'pannipitiya': [6.8480, 79.9410],
    'battaramulla': [6.9096, 79.9220],
    'ragama': [7.0244, 79.9217],
    'ja-ela': [7.0744, 79.8910],
    'jaela': [7.0744, 79.8910],
    'wattala': [6.9909, 79.8808],
    'negombo': [7.2083, 79.8358],
    'katunayake': [7.1695, 79.8908],

    'kelaniya': [6.9613, 79.9308],
    'kiribathgoda': [6.9724, 79.9253],
    // Central Province
    'kandy': [7.2906, 80.6337],
    'gampola': [7.1642, 80.5766],
    'nawalapitiya': [7.0536, 80.5347],
    'peradeniya': [7.2558, 80.5986],
    'matale': [7.4659, 80.6234],
    'dambulla': [7.8566, 80.6490],
    'nuwara eliya': [6.9497, 80.7891],
    'hatton': [6.8916, 80.5953],
    'talawakele': [6.9373, 80.6613],
    'bandarawela': [6.8298, 80.9870],
    'haputale': [6.7667, 80.9667],
    // Southern
    'galle': [6.0535, 80.2210],
    'matara': [5.9485, 80.5353],
    'weligama': [5.9730, 80.4297],
    'hambantota': [6.1241, 81.1185],
    'tangalle': [6.0236, 80.7966],
    'ambalangoda': [6.2350, 80.0536],
    'hikkaduwa': [6.1400, 80.1000],
    'tissamaharama': [6.2833, 81.2833],
    // Northern
    'jaffna': [9.6615, 80.0255],
    'mannar': [8.9770, 79.9091],
    'kilinochchi': [9.3961, 80.3982],
    'vavuniya': [8.7510, 80.4970],
    'point pedro': [9.8167, 80.2333],
    'chavakachcheri': [9.6650, 80.1626],
    'mulaitivu': [9.2671, 80.8149],
    // Eastern
    'trincomalee': [8.5874, 81.2152],
    'batticaloa': [7.7102, 81.6924],
    'kalmunai': [7.4159, 81.8164],
    'ampara': [7.3018, 81.6747],
    'kattankudy': [7.6737, 81.7337],
    'eravur': [7.7782, 81.6145],
    'valachchenai': [7.9347, 81.5612],
    'kalkudah': [7.9208, 81.5614],
    'sainthamaruthu': [7.3714, 81.8369],
    // North Western
    'kurunegala': [7.4863, 80.3647],
    'kuliyapitiya': [7.4686, 80.0409],
    'narammala': [7.4308, 80.2159],
    'pannala': [7.3273, 79.9926],
    'puttalam': [8.0362, 79.8283],
    'chilaw': [7.5758, 79.7953],
    'wennappuwa': [7.2792, 79.8589],
    'anamaduwa': [7.8803, 80.0286],
    'maho': [7.8228, 80.2776],
    // North Central
    'anuradhapura': [8.3114, 80.4037],
    'polonnaruwa': [7.9403, 81.0188],
    'hingurakgoda': [8.0402, 80.9517],
    'medirigiriya': [8.1803, 81.0997],
    // Uva
    'badulla': [6.9934, 81.0550],
    'monaragala': [6.8726, 81.3480],
    'bibile': [7.1667, 81.2167],
    'welimada': [6.9000, 80.9000],
    // Sabaragamuwa
    'ratnapura': [6.6828, 80.4126],
    'balangoda': [6.6630, 80.7041],
    'kegalle': [7.2513, 80.3464],
    'mawanella': [7.2528, 80.4381]
  }

  // Try to find coordinates for a typed city with normalization and fuzzy matching
  const lookupCityCoordinates = (input) => {
    if (!input) return null
    let key = String(input).toLowerCase().trim()
    // Normalize common variations
    key = key.replace(/\s+/g, ' ')
    const variants = new Set([
      key,
      key.replace(/-/g, ' '),
      key.replace(/\s/g, '-'),
      key.replace(/\s*[-_]\s*/g, ' '),
    ])

    // Handle Colombo district numbers like "Colombo 7", "Colombo 07" → map to "colombo"
    const colomboMatch = key.match(/^colombo\s*0?\d+$/)
    if (colomboMatch) variants.add('colombo')

    // Exact match on variants
    for (const v of variants) {
      if (cityCoordinates[v]) return cityCoordinates[v]
    }

    // Prefix match
    const keys = Object.keys(cityCoordinates)
    const prefix = keys.find(k => k.startsWith(key))
    if (prefix) return cityCoordinates[prefix]

    // Includes match as a last resort
    const includes = keys.find(k => k.includes(key))
    if (includes) return cityCoordinates[includes]

    return null
  }

  // Track if user has manually clicked on the map
  const [hasManualSelection, setHasManualSelection] = useState(false)

  // Update map center when city changes
  useEffect(() => {
    if (city) {
      const coordinates = lookupCityCoordinates(city)
      if (coordinates) {
        setMapCenter(coordinates)
        setZoom(13)
        // Auto-select coordinates when city changes (unless user manually selected a point)
        if (!hasManualSelection) {
          onLocationChange(coordinates[0], coordinates[1])
        }
      }
    }
  }, [city])

  const handleLocationSelect = (lat, lng) => {
    setHasManualSelection(true)
    onLocationChange(lat, lng)
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
      
      <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-lg">
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
          {/* Recenter map view on city change */}
          <RecenterOnChange center={mapCenter} zoom={zoom} />
          {/* Primary user-selected marker */}
          <LocationMarker
            position={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
          {!selectedLocation && city && lookupCityCoordinates(city) && (
            <Marker position={lookupCityCoordinates(city)} icon={selectedLocationIcon}>
              <Popup>
                {city.charAt(0).toUpperCase() + city.slice(1)} (City Center)<br/>Click elsewhere to refine.
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        🖱️ Click anywhere on the map to select the property location
      </div>
    </div>
  )
}

export default LocationPicker