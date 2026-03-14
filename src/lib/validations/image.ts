import { z } from 'zod'

export const MAX_IMAGES_PER_PROPERTY = 15
export const MAX_FILE_SIZE_MB = 15
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number]

export const imageFileSchema = z.object({
  type: z.string().refine(
    (type) =>
      ACCEPTED_IMAGE_TYPES.includes(type as AcceptedImageType),
    { message: 'Formato de imagem nao suportado. Use JPEG, PNG, WebP ou HEIC.' }
  ),
  size: z
    .number()
    .max(
      MAX_FILE_SIZE_BYTES,
      `Arquivo deve ter no maximo ${MAX_FILE_SIZE_MB}MB`
    ),
})
