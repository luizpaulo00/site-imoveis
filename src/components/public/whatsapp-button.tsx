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
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-green-500 px-5 py-3.5 text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-2xl"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="h-6 w-6 fill-current" />
      <span className="hidden sm:inline text-sm font-bold">WhatsApp</span>
    </a>
  )
}
