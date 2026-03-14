const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-'
  }
  // Replace non-breaking space (U+00A0) with regular space for consistency
  return formatter.format(value).replace(/\u00A0/g, ' ')
}
