import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
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
  
  // City coordinates mapping for Sri Lanka
  const cityCoordinates = {
    'colombo': [6.9271, 79.8612],
    'kandy': [7.2906, 80.6337],
    'galle': [6.0535, 80.2210],
    'jaffna': [9.6615, 80.0255],
    'negombo': [7.2083, 79.8358],
    'batticaloa': [7.7102, 81.6924],
    'trincomalee': [8.5874, 81.2152],
    'anuradhapura': [8.3114, 80.4037],
    'polonnaruwa': [7.9403, 81.0188],
    'matara': [5.9485, 80.5353],
    'ratnapura': [6.6828, 80.4126],
    'kurunegala': [7.4863, 80.3647],
    'badulla': [6.9934, 81.0550],
    'nuwara eliya': [6.9497, 80.7891],
    'hambantota': [6.1241, 81.1185]
  }

  // Update map center when city changes
  useEffect(() => {
    if (city) {
      const cityKey = city.toLowerCase()
      const coordinates = cityCoordinates[cityKey]
      if (coordinates) {
        setMapCenter(coordinates)
        setZoom(13)
      }
    }
  }, [city])

  const handleLocationSelect = (lat, lng) => {
    const newLocation = [lat, lng]
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
          <LocationMarker
            position={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
        </MapContainer>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        🖱️ Click anywhere on the map to select the property location
      </div>
    </div>
  )
}

export default LocationPicker