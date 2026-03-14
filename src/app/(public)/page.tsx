import { getPublicProperties } from '@/lib/queries/properties'
import { getPublicSettings } from '@/lib/queries/settings'
import { PropertyListing } from '@/components/public/property-listing'
import { StatsSection } from '@/components/public/stats-section'
import { DifferentialsSection } from '@/components/public/differentials-section'
import { CtaSection } from '@/components/public/cta-section'
import { Search, ChevronDown } from 'lucide-react'

export default async function HomePage() {
  const [properties, settings] = await Promise.all([
    getPublicProperties(),
    getPublicSettings(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0D3B3B] px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#FF6A15]/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#FF6A15]/5 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-2 w-2 rounded-full bg-[#FF6A15]/40" />
          <div className="absolute left-1/3 top-1/4 h-1.5 w-1.5 rounded-full bg-white/20" />
          <div className="absolute bottom-1/3 right-1/3 h-1 w-1 rounded-full bg-[#FF6A15]/30" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              {settings.brokerName || 'Jander Venancio'} — CRECI ativo
            </div>
            <h1 className="font-[family-name:var(--font-display,var(--font-poppins))] text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Encontre o imovel{' '}
              <span className="relative inline-block text-[#FF6A15]">
                ideal
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 120 8" fill="none">
                  <path d="M2 6C30 2 90 2 118 6" stroke="#FF6A15" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                </svg>
              </span>{' '}
              para voce
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/60 sm:text-xl">
              Casas e apartamentos selecionados com atendimento personalizado. Seu novo lar esta aqui.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#imoveis"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6A15] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-[#FF6A15]/25 transition-all hover:-translate-y-0.5 hover:bg-[#e55d10] hover:shadow-xl hover:shadow-[#FF6A15]/30"
              >
                <Search className="h-4 w-4" />
                Ver imoveis
              </a>
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/55${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Oi! Gostaria de saber mais sobre os imoveis disponiveis.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
                >
                  Fale comigo
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/30" />
        </div>

        {/* Curved bottom */}
        <div className="absolute inset-x-0 -bottom-1">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80V0C360 60 720 80 1080 60C1260 50 1380 30 1440 0V80H0Z" fill="#F8F5F0" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* Properties */}
      <section id="imoveis" className="scroll-mt-20 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-[family-name:var(--font-display,var(--font-poppins))] text-2xl font-bold text-[#0D3B3B] sm:text-3xl">
            Imoveis disponiveis
          </h2>
          <p className="mt-2 text-gray-500">
            <strong className="text-[#0D3B3B]">{properties.length}</strong>{' '}
            {properties.length === 1 ? 'opcao selecionada' : 'opcoes selecionadas'} para voce
          </p>
        </div>

        <PropertyListing properties={properties} settings={settings} />
      </section>

      {/* Differentials */}
      <DifferentialsSection />

      {/* CTA */}
      <CtaSection whatsapp={settings.whatsapp} brokerName={settings.brokerName} />
    </div>
  )
}
