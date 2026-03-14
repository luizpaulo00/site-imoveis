'use client'

import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons - use CDN URLs for Turbopack compatibility
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface PropertyMapInnerProps {
  latitude: number
  longitude: number
}

export default function PropertyMapInner({
  latitude,
  longitude,
}: PropertyMapInnerProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      dragging={false}
      scrollWheelZoom={false}
      zoomControl={true}
      className="h-[300px] rounded-lg"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} />
    </MapContainer>
  )
}
