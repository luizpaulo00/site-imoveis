'use client'

import { useEffect, useRef, useState } from 'react'
import { Home, Users, MapPin, Award } from 'lucide-react'

const stats = [
  { icon: Home, value: 100, suffix: '+', label: 'Imoveis negociados' },
  { icon: Users, value: 200, suffix: '+', label: 'Clientes satisfeitos' },
  { icon: MapPin, value: 15, suffix: '+', label: 'Bairros atendidos' },
  { icon: Award, value: 10, suffix: '+', label: 'Anos de experiencia' },
]

function useCountUp(target: number, isVisible: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    let frame: number
    const duration = 2000
    const start = performance.now()

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target, isVisible])

  return count
}

function StatItem({ icon: Icon, value, suffix, label, isVisible, delay }: {
  icon: typeof Home
  value: number
  suffix: string
  label: string
  isVisible: boolean
  delay: number
}) {
  const count = useCountUp(value, isVisible)

  return (
    <div
      className="aos-hidden flex flex-col items-center gap-3 text-center"
      style={{ animationDelay: `${delay}ms` }}
      ref={(el) => {
        if (el && isVisible) {
          setTimeout(() => el.classList.add('aos-visible'), delay)
        }
      }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6A15]/10">
        <Icon className="h-7 w-7 text-[#FF6A15]" />
      </div>
      <div>
        <p className="text-3xl font-bold text-[#0D3B3B] sm:text-4xl">
          {count}{suffix}
        </p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatItem
              key={stat.label}
              {...stat}
              isVisible={isVisible}
              delay={i * 150}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
