import { AdminTopbar } from '@/components/admin/admin-topbar'
import { SettingsForm } from '@/components/admin/settings-form'

export default function ConfiguracoesPage() {
  return (
    <>
      <AdminTopbar title="Configuracoes" />
      <SettingsForm />
    </>
  )
}
