import { formatCurrency } from './currency'

interface OGDescriptionInput {
  price?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  neighborhood?: string | null
}

export function formatOGDescription(property: OGDescriptionInput): string {
  const parts: string[] = []
  if (property.price) parts.push(formatCurrency(property.price))
  if (property.bedrooms) parts.push(`${property.bedrooms} quartos`)
  if (property.bathrooms) parts.push(`${property.bathrooms} banheiros`)
  if (property.area) parts.push(`${property.area}m²`)
  if (property.neighborhood) parts.push(property.neighborhood)
  return parts.join(' | ')
}
