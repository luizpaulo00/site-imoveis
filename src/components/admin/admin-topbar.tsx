'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'

interface AdminTopbarProps {
  title: string
}

export function AdminTopbar({ title }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </header>
  )
}
