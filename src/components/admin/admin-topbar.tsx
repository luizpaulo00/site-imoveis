'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'

interface AdminTopbarProps {
  title: string
}

export function AdminTopbar({ title }: AdminTopbarProps) {
  return (
    <header className="flex h-14 items-center gap-3 border-b bg-white px-4">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  )
}
