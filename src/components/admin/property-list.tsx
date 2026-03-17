'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus } from 'lucide-react'

import type { Property } from '@/types/database'
import { deleteProperty } from '@/actions/properties'
import { formatCurrency } from '@/lib/utils/currency'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PropertyStatusBadge } from '@/components/admin/property-status-badge'

export type PropertyWithImageCount = Property & { image_count: number }

type StatusFilter = 'todos' | 'disponivel' | 'reservado' | 'vendido'

interface PropertyListProps {
  properties: PropertyWithImageCount[]
}

function capitalize(value: string | null): string {
  if (!value) return '-'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function PropertyList({ properties }: PropertyListProps) {
  const [activeTab, setActiveTab] = useState<StatusFilter>('todos')
  const [deletingProperty, setDeletingProperty] =
    useState<PropertyWithImageCount | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const filtered =
    activeTab === 'todos'
      ? properties
      : properties.filter((p) => p.status === activeTab)

  const counts = {
    todos: properties.length,
    disponivel: properties.filter((p) => p.status === 'disponivel').length,
    reservado: properties.filter((p) => p.status === 'reservado').length,
    vendido: properties.filter((p) => p.status === 'vendido').length,
  }

  function handleDelete() {
    if (!deletingProperty) return

    startTransition(async () => {
      const result = await deleteProperty(deletingProperty.id)

      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Imovel excluido com sucesso')
        router.refresh()
      }

      setDeletingProperty(null)
    })
  }

  return (
    <>
      <Tabs
        defaultValue="todos"
        onValueChange={(value) => setActiveTab(value as StatusFilter)}
      >
        <TabsList>
          <TabsTrigger value="todos">Todos ({counts.todos})</TabsTrigger>
          <TabsTrigger value="disponivel">
            Disponivel ({counts.disponivel})
          </TabsTrigger>
          <TabsTrigger value="reservado">
            Reservado ({counts.reservado})
          </TabsTrigger>
          <TabsTrigger value="vendido">Vendido ({counts.vendido})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-6 py-24 shadow-sm border-dashed">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="size-6" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground">
              {activeTab === 'todos'
                ? 'Nenhum imovel cadastrado'
                : `Sem resultado para "${activeTab}"`}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Comece adicionando seu primeiro imovel ao sistema para gerencia-lo em seu painel.
            </p>
          </div>
          {activeTab === 'todos' && (
            <Button
              render={<Link href="/admin/imoveis/novo" />}
              className="mt-2 px-8 font-medium"
            >
              <Plus className="mr-2 size-4" />
              Adicionar Imovel
            </Button>
          )}
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titulo</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead>Preco</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Fotos</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((property) => (
              <TableRow key={property.id} className="group transition-colors hover:bg-muted/50 cursor-pointer">
                <TableCell className="font-medium">
                  {property.title}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {capitalize(property.property_type)}
                </TableCell>
                <TableCell>{formatCurrency(property.price)}</TableCell>
                <TableCell>
                  <PropertyStatusBadge status={property.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {property.image_count}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                      render={
                        <Link href={`/admin/imoveis/${property.id}/editar`} />
                      }
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => setDeletingProperty(property)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog
        open={deletingProperty !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingProperty(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imovel</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deletingProperty?.title}
              &quot;? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
