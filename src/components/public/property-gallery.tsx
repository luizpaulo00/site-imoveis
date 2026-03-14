'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Zoom, Navigation, Pagination } from 'swiper/modules'
import { X, ImageIcon } from 'lucide-react'
import { getImageUrl } from '@/lib/utils/image-url'

import 'swiper/css'
import 'swiper/css/zoom'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface GalleryImage {
  id: string
  storage_path: string
  is_cover: boolean
  position: number
}

interface PropertyGalleryProps {
  images: GalleryImage[]
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [fullscreen])

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted rounded-lg">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-12 w-12" />
          <span className="text-sm">Sem fotos</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Inline preview */}
      <div
        className="cursor-pointer"
        onClick={() => setFullscreen(true)}
      >
        <Swiper
          modules={[Pagination]}
          pagination={{ type: 'fraction' }}
          onSlideChange={(s) => setActiveIndex(s.activeIndex)}
          className="aspect-[16/9] w-full rounded-lg overflow-hidden [&_.swiper-pagination]{bg-black/50;text-white;px-3;py-1;rounded-full;w-auto;left-auto;right-3;bottom-3;font-size:0.875rem}"
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id}>
              <img
                src={getImageUrl(img.storage_path)}
                alt=""
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            aria-label="Fechar galeria"
          >
            <X className="h-6 w-6" />
          </button>

          <Swiper
            modules={[Zoom, Navigation, Pagination]}
            zoom={true}
            navigation={true}
            pagination={{ type: 'fraction' }}
            initialSlide={activeIndex}
            className="h-full w-full [&_.swiper-button-prev],[&_.swiper-button-next]{color:white;hidden;md:flex} [&_.swiper-pagination]{color:white;font-size:1rem}"
          >
            {images.map((img) => (
              <SwiperSlide key={img.id} className="flex items-center justify-center">
                <div className="swiper-zoom-container">
                  <img
                    src={getImageUrl(img.storage_path)}
                    alt=""
                    className="max-h-screen w-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </>
  )
}
