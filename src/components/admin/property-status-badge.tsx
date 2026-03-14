import { Badge } from '@/components/ui/badge'

const statusConfig = {
  disponivel: {
    label: 'Disponivel',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  reservado: {
    label: 'Reservado',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
  vendido: {
    label: 'Vendido',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
} as const

interface PropertyStatusBadgeProps {
  status: 'disponivel' | 'reservado' | 'vendido'
}

export function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}
