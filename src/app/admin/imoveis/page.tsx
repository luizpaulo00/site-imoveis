import { AdminTopbar } from '@/components/admin/admin-topbar'

export default function ImoveisPage() {
  return (
    <>
      <AdminTopbar title="Imoveis" />
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">
          Nenhum imovel cadastrado.
        </p>
      </div>
    </>
  )
}
