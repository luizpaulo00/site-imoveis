import Link from 'next/link'
import { Plus } from 'lucide-react'

import { AdminTopbar } from '@/components/admin/admin-topbar'
import { PropertyList } from '@/components/admin/property-list'
import type { PropertyWithImageCount } from '@/components/admin/property-list'
import { Button } from '@/components/ui/button'
import { listProperties } from '@/actions/properties'

export default async function ImoveisPage() {
  const properties = (await listProperties()) as PropertyWithImageCount[]

  return (
    <>
      <AdminTopbar title="Imoveis" />
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-end">
          <Button render={<Link href="/admin/imoveis/novo" />}>
            <Plus className="size-4" />
            Novo Imovel
          </Button>
        </div>
        <PropertyList properties={properties} />
      </div>
    </>
  )
}
