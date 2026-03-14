import { Shield, Clock, Handshake, TrendingUp, HeadphonesIcon, FileCheck } from 'lucide-react'
import { AnimateOnScroll } from './animate-on-scroll'

const differentials = [
  {
    icon: Shield,
    title: 'Seguranca juridica',
    description: 'Toda documentacao verificada e processo transparente do inicio ao fim.',
  },
  {
    icon: Clock,
    title: 'Atendimento agil',
    description: 'Resposta rapida pelo WhatsApp e visitas agendadas no seu horario.',
  },
  {
    icon: Handshake,
    title: 'Negociacao justa',
    description: 'Trabalho para encontrar o melhor acordo para todas as partes.',
  },
  {
    icon: TrendingUp,
    title: 'Avaliacao precisa',
    description: 'Analise de mercado detalhada para precificar seu imovel corretamente.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Suporte completo',
    description: 'Acompanhamento em todas as etapas, da visita ate a entrega das chaves.',
  },
  {
    icon: FileCheck,
    title: 'Documentacao simplificada',
    description: 'Cuidamos de toda a burocracia para voce focar no que importa.',
  },
]

export function DifferentialsSection() {
  return (
    <section className="bg-[#0D3B3B] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center">
          <h2 className="font-[family-name:var(--font-display,var(--font-poppins))] text-2xl font-bold text-white sm:text-3xl">
            Por que escolher o{' '}
            <span className="text-[#FF6A15]">Jander Venancio</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Compromisso com excelencia e atendimento personalizado em cada negociacao.
          </p>
        </AnimateOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {differentials.map((item, i) => (
            <AnimateOnScroll key={item.title} delay={i * 100}>
              <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-[#FF6A15]/30 hover:bg-white/10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6A15]/20 transition-colors group-hover:bg-[#FF6A15]/30">
                  <item.icon className="h-6 w-6 text-[#FF6A15]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {item.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
