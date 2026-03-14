const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

export function getImageUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/property-images/${storagePath}`
}

export function getOGImageUrl(propertyId: string, updatedAt: string): string {
  const timestamp = new Date(updatedAt).getTime()
  return `${getImageUrl(`${propertyId}/og-cover.jpg`)}?v=${timestamp}`
}
