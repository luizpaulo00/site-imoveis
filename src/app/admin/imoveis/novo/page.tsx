import { AdminTopbar } from '@/components/admin/admin-topbar'
import { PropertyForm } from '@/components/admin/property-form'

export default function NovoImovelPage() {
  return (
    <>
      <AdminTopbar title="Novo Imovel" />
      <PropertyForm />
    </>
  )
}
