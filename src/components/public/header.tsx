import Link from 'next/link'
import Image from 'next/image'
import { Phone, Home } from 'lucide-react'
import { formatWhatsAppUrl } from '@/lib/utils/whatsapp'

interface PublicHeaderProps {
  whatsapp?: string
}

export function PublicHeader({ whatsapp }: PublicHeaderProps) {
  const whatsappLink =
    whatsapp && whatsapp.replace(/\D/g, '').length > 0
      ? formatWhatsAppUrl(whatsapp, '')
      : null

  return (
    <header className="sticky top-0 z-50 bg-[#0D3B3B]/95 shadow-md backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo.svg"
              alt="JV - Jander Venancio Corretor de Imoveis"
              width={80}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Nav links - desktop */}
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              Inicio
            </Link>
            <Link
              href="/#imoveis"
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Imoveis
            </Link>
          </nav>
        </div>

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
