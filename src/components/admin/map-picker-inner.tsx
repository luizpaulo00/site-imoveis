'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons - use CDN URLs for Turbopack compatibility
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const FORMOSA_CENTER: [number, number] = [-15.4472, -47.334]
const DEFAULT_ZOOM = 13

interface MapPickerInnerProps {
  latitude?: number | null
  longitude?: number | null
  onLocationChange: (lat: number, lng: number) => void
}

function ClickHandler({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapPickerInner({
  latitude,
  longitude,
  onLocationChange,
}: MapPickerInnerProps) {
  const hasPosition = latitude != null && longitude != null
  const center: [number, number] = hasPosition
    ? [latitude, longitude]
    : FORMOSA_CENTER

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      className="h-[400px] rounded-lg border"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onLocationChange={onLocationChange} />
      {hasPosition && <Marker position={[latitude, longitude]} />}
    </MapContainer>
  )
}
