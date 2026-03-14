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
    <footer className="bg-[#0D3B3B] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold">
              {brokerName || 'Jander Venancio'}
            </p>
            <p className="text-sm text-white/70">Corretor de Imoveis</p>
          </div>

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
        </div>

        <div className="mt-6 border-t border-white/20 pt-4 text-center text-xs text-white/50">
          {year} {brokerName || 'Jander Venancio'}. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  )
}
