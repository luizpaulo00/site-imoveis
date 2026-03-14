'use client'

import dynamic from 'next/dynamic'

const MapPickerInner = dynamic(() => import('./map-picker-inner'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted animate-pulse rounded-lg" />,
})

interface MapPickerProps {
  latitude?: number | null
  longitude?: number | null
  onLocationChange: (lat: number, lng: number) => void
}

export function MapPicker(props: MapPickerProps) {
  return <MapPickerInner {...props} />
}
