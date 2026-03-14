'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Zoom, Navigation, Pagination } from 'swiper/modules'
import { X, ImageIcon, Camera } from 'lucide-react'
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
  propertyTitle?: string
}

export function PropertyGallery({ images, propertyTitle }: PropertyGalleryProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

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
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-[#0D3B3B]/5">
        <div className="flex flex-col items-center gap-2 text-[#0D3B3B]/30">
          <ImageIcon className="h-16 w-16" />
          <span className="text-sm font-medium">Sem fotos</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Inline preview */}
      <div
        className="group relative cursor-pointer"
        onClick={() => setFullscreen(true)}
      >
        <Swiper
          modules={[Pagination]}
          pagination={{ type: 'fraction' }}
          onSlideChange={(s) => setActiveIndex(s.activeIndex)}
          className="aspect-[16/9] w-full overflow-hidden [&_.swiper-pagination]{bg-black/60;text-white;px-3;py-1;rounded-full;w-auto;left-auto;right-4;bottom-4;font-size:0.875rem;font-weight:600}"
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id}>
              <img
                src={getImageUrl(img.storage_path)}
                alt={index === 0 && propertyTitle ? propertyTitle : ''}
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* "See all photos" overlay */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#0D3B3B] opacity-100 shadow-lg backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <Camera className="h-3.5 w-3.5" />
          Ver todas as fotos
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
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
            className="h-full w-full [&_.swiper-button-prev],[&_.swiper-button-next]{color:white;hidden;md:flex} [&_.swiper-pagination]{color:white;font-size:1.125rem;font-weight:600}"
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
