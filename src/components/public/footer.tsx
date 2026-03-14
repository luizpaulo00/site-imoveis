import Link from 'next/link'
import { MessageCircle, Instagram, Phone, MapPin } from 'lucide-react'

interface PublicFooterProps {
  brokerName: string
  whatsapp: string
}

export function PublicFooter({ brokerName, whatsapp }: PublicFooterProps) {
  const year = new Date().getFullYear()

  const whatsappLink = whatsapp
    ? `https://wa.me/55${whatsapp.replace(/\D/g, '')}`
    : null

  const whatsappFormatted = whatsapp
    ? whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    : null

  return (
    <footer className="bg-[#0D3B3B]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.svg"
              alt={brokerName || 'Jander Venancio'}
              className="h-10 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Seu corretor de confianca. Atendimento personalizado para encontrar o imovel perfeito para voce e sua familia.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/30">
              Navegacao
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-white/60 transition-colors hover:text-[#FF6A15]">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/#imoveis" className="text-sm text-white/60 transition-colors hover:text-[#FF6A15]">
                  Imoveis disponiveis
                </Link>
              </li>
              {whatsappLink && (
                <li>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 transition-colors hover:text-[#FF6A15]">
                    Fale comigo
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/30">
              Contato
            </h3>
            <ul className="space-y-3">
              {whatsappFormatted && (
                <li>
                  <a
                    href={whatsappLink!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-[#FF6A15]"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {whatsappFormatted}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 shrink-0" />
                Goiania, GO
              </li>
            </ul>

            {/* Social + WhatsApp CTA */}
            <div className="mt-6 flex items-center gap-3">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400 transition-all hover:bg-green-500 hover:text-white"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-[#FF6A15] hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-white/30">
            &copy; {year} {brokerName || 'Jander Venancio'}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/20">
            Corretor de Imoveis
          </p>
        </div>
      </div>
    </footer>
  )
}
