import Link from 'next/link'
import { Phone } from 'lucide-react'

interface PublicHeaderProps {
  whatsapp?: string
}

export function PublicHeader({ whatsapp }: PublicHeaderProps) {
  const whatsappLink = whatsapp
    ? `https://wa.me/55${whatsapp.replace(/\D/g, '')}`
    : null

  return (
    <header className="sticky top-0 z-50 bg-[#0D3B3B]/95 shadow-md backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.svg"
            alt="JV - Jander Venancio Corretor de Imoveis"
            className="h-9 w-auto"
          />
        </Link>

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full bg-[#FF6A15] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#e55d10] hover:shadow-lg"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Fale Comigo</span>
          </a>
        )}
      </div>
    </header>
  )
}
