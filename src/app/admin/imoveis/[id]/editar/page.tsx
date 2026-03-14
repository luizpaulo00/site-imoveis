import { redirect } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { PropertyForm } from '@/components/admin/property-form'
import { getProperty } from '@/actions/properties'
import type { PropertyFormData } from '@/lib/validations/property'

export default async function EditarImovelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const property = await getProperty(id)

  if (!property) {
    redirect('/admin/imoveis')
  }

  const propertyData = {
    id: property.id as string,
    title: (property.title as string) ?? '',
    description: (property.description as string) ?? '',
    price: (property.price as number) ?? undefined,
    property_type: (property.property_type as PropertyFormData['property_type']) ?? undefined,
    bedrooms: (property.bedrooms as number) ?? undefined,
    bathrooms: (property.bathrooms as number) ?? undefined,
    parking_spaces: (property.parking_spaces as number) ?? undefined,
    area: (property.area as number) ?? undefined,
    condition: (property.condition as PropertyFormData['condition']) ?? undefined,
    address: (property.address as string) ?? '',
    neighborhood: (property.neighborhood as string) ?? '',
    latitude: (property.latitude as number) ?? undefined,
    longitude: (property.longitude as number) ?? undefined,
    status: (property.status as PropertyFormData['status']) ?? 'disponivel',
    featured: (property.featured as boolean) ?? false,
  }

  return (
    <>
      <AdminTopbar title="Editar Imovel" />
      <PropertyForm property={propertyData} />
    </>
  )
}
