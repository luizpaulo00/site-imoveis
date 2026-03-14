import { MessageCircle } from 'lucide-react'

interface PublicFooterProps {
  brokerName: string
  whatsapp: string
}

export function PublicFooter({ brokerName, whatsapp }: PublicFooterProps) {
  const year = new Date().getFullYear()

  const whatsappLink = whatsapp
    ? `https://wa.me/55${whatsapp.replace(/\D/g, '')}`
    : null

  return (
    <footer className="bg-[#0D3B3B]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.svg"
              alt={brokerName || 'Jander Venancio'}
              className="mx-auto h-10 w-auto sm:mx-0"
            />
            <p className="mt-3 text-sm text-white/50">Corretor de Imoveis</p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-end">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                Fale pelo WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/30">
          &copy; {year} {brokerName || 'Jander Venancio'}. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  )
}
