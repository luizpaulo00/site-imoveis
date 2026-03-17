'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  maxTilt?: number
}

export function TiltCard({ children, className = '', maxTilt = 4 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [isHovering, setIsHovering] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    setIsDisabled(reducedMotion || isTouch)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = ((y - centerY) / centerY) * -maxTilt
      const rotateY = ((x - centerX) / centerX) * maxTilt
      setTransform(
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      )
    },
    [maxTilt, isDisabled]
  )

  const handleMouseEnter = useCallback(() => {
    if (isDisabled) return
    setIsHovering(true)
  }, [isDisabled])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setTransform('')
  }, [])

  // On touch devices, render children directly without tilt wrapper overhead
  if (isDisabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        transform:
          transform || 'perspective(800px) rotateX(0deg) rotateY(0deg)',
        transition: isHovering
          ? 'transform 0.1s ease-out'
          : 'transform 0.3s ease-out',
        willChange: isHovering ? 'transform' : 'auto',
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
