import { createClient } from '@/lib/supabase/server'

export interface PublicPropertyImage {
  id: string
  storage_path: string
  is_cover: boolean
  position: number
}

export interface PublicProperty {
  id: string
  title: string
  price: number | null
  property_type: 'casa' | 'apartamento' | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  neighborhood: string | null
  status: 'disponivel' | 'reservado' | 'vendido'
  featured: boolean
  updated_at: string
  cover: PublicPropertyImage | null
}

export async function getPublicProperties(): Promise<PublicProperty[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select(
      'id, title, price, property_type, bedrooms, bathrooms, area, neighborhood, status, featured, updated_at, property_images(id, storage_path, is_cover, position)'
    )
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching public properties:', error)
    return []
  }

  return data.map((row) => {
    const images = (row.property_images ?? []) as PublicPropertyImage[]
    const coverImage =
      images.find((img) => img.is_cover) ??
      images.sort((a, b) => a.position - b.position)[0] ??
      null

    return {
      id: row.id,
      title: row.title,
      price: row.price,
      property_type: row.property_type,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      area: row.area,
      neighborhood: row.neighborhood,
      status: row.status,
      featured: row.featured,
      updated_at: row.updated_at,
      cover: coverImage,
    }
  })
}
