'use client'

import { MessageCircle } from 'lucide-react'
import { formatWhatsAppUrl } from '@/lib/utils/whatsapp'

interface WhatsAppButtonProps {
  phone: string
  propertyTitle: string
  propertyUrl: string
}

export function WhatsAppButton({
  phone,
  propertyTitle,
  propertyUrl,
}: WhatsAppButtonProps) {
  const message = `Oi! Tenho interesse no imovel: ${propertyTitle} - ${propertyUrl}`
  const href = formatWhatsAppUrl(phone, message)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg transition-shadow hover:shadow-xl sm:px-5"
      style={{ backgroundColor: '#25D366' }}
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="h-6 w-6 fill-current" />
      <span className="hidden text-sm font-semibold sm:inline">WhatsApp</span>
    </a>
  )
}
