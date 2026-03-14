import { Poppins } from 'next/font/google'
import localFont from 'next/font/local'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { getPublicSettings } from '@/lib/queries/settings'

export const revalidate = 60

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const displayFont = localFont({
  src: '../../fonts/tt-firs-neue-bold.ttf',
  variable: '--font-display',
  display: 'swap',
})

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getPublicSettings()

  return (
    <div
      className={`${poppins.variable} ${displayFont.variable} min-h-screen bg-[#F8F5F0] font-[family-name:var(--font-poppins)]`}
    >
      <PublicHeader whatsapp={settings.whatsapp} />
      <main>
        {children}
      </main>
      <PublicFooter
        brokerName={settings.brokerName}
        whatsapp={settings.whatsapp}
      />
    </div>
  )
}
