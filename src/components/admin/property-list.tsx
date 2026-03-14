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
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-muted-foreground">
            {activeTab === 'todos'
              ? 'Nenhum imovel cadastrado.'
              : `Nenhum imovel com status ${activeTab}.`}
          </p>
          {activeTab === 'todos' && (
            <Button render={<Link href="/admin/imoveis/novo" />}>
              <Plus className="size-4" />
              Novo Imovel
            </Button>
          )}
        </div>
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
              <TableRow key={property.id}>
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
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      render={
                        <Link
                          href={`/admin/imoveis/${property.id}/editar`}
                        />
                      }
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingProperty(property)}
                    >
                      <Trash2 className="size-4 text-destructive" />
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
