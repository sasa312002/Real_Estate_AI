import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon paths in many bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// MapPreview component to display a map with a marker at given latitude and longitude
function MapPreview({ lat, lon, className = '', height = 200, popupText = 'Location' }) {
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
    return null
  }
  const position = [lat, lon]
  return (
    <div className={className} style={{ height }}>
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{popupText}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default MapPreview
