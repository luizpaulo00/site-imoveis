import { getPublicProperties } from '@/lib/queries/properties'
import { getPublicSettings } from '@/lib/queries/settings'
import { PropertyListing } from '@/components/public/property-listing'
import { StatsSection } from '@/components/public/stats-section'
import { DifferentialsSection } from '@/components/public/differentials-section'
import { CtaSection } from '@/components/public/cta-section'
import { formatWhatsAppUrl } from '@/lib/utils/whatsapp'
import { Search, ChevronDown } from 'lucide-react'

export default async function HomePage() {
  const [properties, settings] = await Promise.all([
    getPublicProperties(),
    getPublicSettings(),
  ])

  return (
    <div className="bg-background text-foreground scroll-smooth">
      {/* Accessible Premium Hero */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#0a5c47] to-[#0D3B3B] px-4 sm:px-6 lg:px-8">

        {/* Animated gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(255,106,21,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,78,59,0.3) 0%, transparent 50%)',
            animation: 'gradient-shift 8s ease-in-out infinite alternate',
          }}
        />

        {/* Subtle Decorative Light */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[50vw] h-[50vw] md:w-[40vw] md:h-[40vw] bg-secondary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw] bg-background/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 animate-float-medium" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl w-full flex flex-col items-center text-center">
          
          <div className="mb-6 inline-flex items-center gap-2 border border-background/20 bg-background/5 px-5 py-2 text-xs uppercase tracking-widest text-background backdrop-blur-sm animate-fade-in-down duration-500 rounded-sm">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            {settings.brokerName || 'Jander Venancio'} — Corretor de Imóveis
          </div>
          
          <h1 className="font-serif text-5xl font-black leading-[0.9] tracking-tighter text-background sm:text-7xl md:text-8xl lg:text-9xl animate-fade-in-up duration-700">
            SEU PRÓXIMO<br/>
            <span className="text-secondary italic font-light">CAPÍTULO</span> COMEÇA AQUI.
          </h1>
          
          <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-background/90 sm:text-xl md:text-2xl animate-fade-in-up duration-700 delay-200">
            Imóveis selecionados com padrão de excelência em Formosa, Goiás.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row animate-fade-in-up duration-700 delay-300">
            <a
              href="#imoveis"
              className="group inline-flex items-center justify-center gap-3 bg-secondary px-8 py-4 text-sm tracking-widest uppercase font-bold text-white transition-all hover:bg-background hover:text-secondary hover:scale-105 rounded-sm"
            >
              Explorar Imóveis
              <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
            </a>
            
            {settings.whatsapp && settings.whatsapp.replace(/\D/g, '').length > 0 && (
              <a
                href={formatWhatsAppUrl(settings.whatsapp, 'Olá! Estou buscando um imóvel em Formosa e gostaria da sua orientação.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-background/30 px-8 py-4 text-sm tracking-widest uppercase text-background transition-colors hover:border-secondary hover:text-secondary rounded-sm font-semibold"
              >
                Falar com Jander
              </a>
            )}
          </div>
        </div>

        {/* Scroll indicator - bottom-24 on mobile to clear bottom nav */}
        <div className="absolute bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow">
          <span className="text-xs uppercase tracking-widest text-white/40">Explore</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* Properties */}
      <section id="imoveis" className="scroll-mt-0 mx-auto w-full px-4 py-24 sm:px-6 lg:px-8 bg-background">
        <div className="mb-16 text-center lg:text-left flex flex-col lg:flex-row items-end justify-between border-b border-foreground/10 pb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold uppercase tracking-widest text-foreground sm:text-4xl md:text-5xl">
              Imóveis Selecionados
            </h2>
            <p className="mt-4 text-foreground/70 max-w-lg font-light text-lg">
              Cada propriedade é escolhida por critérios de qualidade, localização e potencial.
            </p>
          </div>
          <div className="mt-6 lg:mt-0 text-right">
            <span className="text-4xl font-serif text-primary">{properties.length}</span>
            <span className="block text-sm uppercase tracking-widest text-foreground/50 mt-1">
              Disponíveis
            </span>
          </div>
        </div>

        <PropertyListing properties={properties} />
      </section>

      {/* Differentials */}
      <DifferentialsSection />

      {/* CTA */}
      <CtaSection whatsapp={settings.whatsapp} brokerName={settings.brokerName} />
    </div>
  )
}
