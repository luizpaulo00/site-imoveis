import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const supabase = await createClient()
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')

  const propertyEntries: MetadataRoute.Sitemap = (properties ?? []).map(
    (p) => ({
      url: `${baseUrl}/imoveis/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })
  )

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...propertyEntries,
  ]
}
