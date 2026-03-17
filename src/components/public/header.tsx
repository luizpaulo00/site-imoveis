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
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary/80 via-primary/75 to-primary/70 text-primary-foreground shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-b border-white/10 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center">
              {/* Ensure logo is visible on dark green background, you may need a white version of the logo or we use text if logo isn't adapting */}
              <Image
                src="/assets/logo.svg"
                alt="Jander Venâncio - Formosa-GO"
                width={80}
                height={36}
                className="h-10 w-auto brightness-0 invert" 
                priority
              />
            </Link>

            {/* Nav links - desktop */}
            <nav className="hidden items-center gap-6 sm:flex">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-primary-foreground/80 transition-colors hover:text-secondary"
              >
                Início
              </Link>
              <Link
                href="/#imoveis"
                className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-primary-foreground/80 transition-colors hover:text-secondary"
              >
                Acervo
              </Link>
            </nav>
          </div>

          {/* Desktop Contact CTA - Action Orange */}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex min-h-[44px] items-center justify-center gap-3 border-2 border-secondary bg-secondary px-6 py-2 text-xs uppercase tracking-widest font-bold text-white transition-all hover:bg-transparent hover:text-secondary rounded-sm"
            >
              <Phone className="h-4 w-4" />
              <span>Falar e Agendar</span>
            </a>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-white/10 bg-primary/85 text-primary-foreground backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.1)] sm:hidden pb-safe">
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-1 text-primary-foreground/70 hover:text-primary-foreground"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] uppercase tracking-wider font-medium">Início</span>
        </Link>
        <Link
          href="/#imoveis"
          className="flex flex-col items-center justify-center gap-1 text-primary-foreground/70 hover:text-primary-foreground"
        >
          <div className="flex h-5 w-5 items-center justify-center">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-medium">Acervo</span>
        </Link>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 text-secondary hover:text-secondary/80"
          >
            <div className="flex bg-secondary text-white p-2 rounded-full mb-1">
               <Phone className="h-4 w-4" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold">Falar</span>
          </a>
        )}
      </div>
    </>
  )
}
