import Link from 'next/link'

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.svg"
            alt="JV - Jander Venancio Corretor de Imoveis"
            className="h-10 w-auto invert"
          />
        </Link>
      </div>
    </header>
  )
}
