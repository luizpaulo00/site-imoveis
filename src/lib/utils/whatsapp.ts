export function formatWhatsAppUrl(phone: string, message: string): string {
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '')
  // Prepend Brazil country code if not already present
  const fullPhone = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`
}
