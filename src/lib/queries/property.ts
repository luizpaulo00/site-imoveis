import { createClient } from '@/lib/supabase/server'

export interface PropertyImage {
  id: string
  storage_path: string
  is_cover: boolean
  position: number
}

export interface PropertyWithImages {
  id: string
  title: string
  description: string | null
  price: number | null
  property_type: 'casa' | 'apartamento' | 'lote' | null
  condition: 'novo' | 'usado' | null
  construction_status: 'em_construcao' | 'pronto_para_morar' | null
  bedrooms: number | null
  bathrooms: number | null
  parking_spaces: number | null
  area: number | null
  built_area: number | null
  address: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  status: 'disponivel' | 'reservado' | 'vendido'
  featured: boolean
  updated_at: string
  created_at: string
  property_images: PropertyImage[]
}

export async function getPropertyWithImages(
  id: string
): Promise<PropertyWithImages | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select(
      '*, property_images(id, storage_path, is_cover, position)'
    )
    .eq('id', id)
    .order('position', {
      ascending: true,
      referencedTable: 'property_images',
    })
    .single()

  if (error || !data) {
    return null
  }

  return data as PropertyWithImages
}
