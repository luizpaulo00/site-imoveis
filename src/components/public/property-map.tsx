'use client'

import dynamic from 'next/dynamic'

const PropertyMapInner = dynamic(() => import('./property-map-inner'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-muted animate-pulse rounded-lg" />,
})

interface PropertyMapProps {
  latitude: number
  longitude: number
}

export function PropertyMap({ latitude, longitude }: PropertyMapProps) {
  return <PropertyMapInner latitude={latitude} longitude={longitude} />
}
