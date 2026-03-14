import { redirect } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { PropertyForm } from '@/components/admin/property-form'
import { ImageManager } from '@/components/admin/image-manager/image-manager'
import { getProperty } from '@/actions/properties'
import { createClient } from '@/lib/supabase/server'
import type { PropertyFormData } from '@/lib/validations/property'
import type { ImageRecord } from '@/components/admin/image-manager/image-thumbnail'

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

  // Fetch property images
  const supabase = await createClient()
  const { data: images } = await supabase
    .from('property_images')
    .select('id, storage_path, position, is_cover')
    .eq('property_id', id)
    .order('position', { ascending: true })

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <>
      <AdminTopbar title="Editar Imovel" />
      <PropertyForm property={propertyData} />
      <div className="p-4 max-w-2xl">
        <ImageManager
          propertyId={id}
          initialImages={(images ?? []) as ImageRecord[]}
          supabaseUrl={supabaseUrl}
        />
      </div>
    </>
  )
}
