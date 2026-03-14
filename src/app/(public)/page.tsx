import { getPublicProperties } from '@/lib/queries/properties'
import { getPublicSettings } from '@/lib/queries/settings'
import { PropertyListing } from '@/components/public/property-listing'

export default async function HomePage() {
  const [properties, settings] = await Promise.all([
    getPublicProperties(),
    getPublicSettings(),
  ])

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display,var(--font-poppins))] text-2xl font-bold text-gray-900 sm:text-3xl">
        {settings.siteName || 'Imoveis'}
      </h1>
      <PropertyListing properties={properties} settings={settings} />
    </div>
  )
}
