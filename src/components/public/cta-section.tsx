import Link from 'next/link'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { AnimateOnScroll } from './animate-on-scroll'
import { formatWhatsAppUrl } from '@/lib/utils/whatsapp'

interface CtaSectionProps {
  whatsapp: string
  brokerName: string
}

export function CtaSection({ whatsapp, brokerName }: CtaSectionProps) {
  const hasPhone = whatsapp.replace(/\D/g, '').length > 0
  const whatsappLink = hasPhone
    ? formatWhatsAppUrl(whatsapp, 'Oi! Gostaria de saber mais sobre os imoveis disponiveis.')
    : null

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A15] to-[#e55500]" />
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0v40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center">
          <h2 className="font-[family-name:var(--font-display,var(--font-poppins))] text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Pronto para encontrar seu imovel ideal?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Fale diretamente com {brokerName || 'Jander Venancio'} e receba atendimento personalizado.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-bold text-[#FF6A15] shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <MessageCircle className="h-5 w-5" />
                Falar no WhatsApp
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
            >
              Ver imoveis
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
