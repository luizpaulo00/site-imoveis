const OG_WIDTH = 1200
const OG_HEIGHT = 630

/**
 * Generate a 1200x630 JPEG OG image from any input photo.
 * Uses canvas API with cover-fit (crop to fill, centered).
 * Targets under 200KB for WhatsApp preview compatibility.
 */
export async function generateOGImage(file: File | Blob): Promise<File> {
  const bitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = OG_WIDTH
  canvas.height = OG_HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context not available')
  }

  // Cover-fit: scale to fill, then center-crop
  const scale = Math.max(OG_WIDTH / bitmap.width, OG_HEIGHT / bitmap.height)
  const scaledWidth = bitmap.width * scale
  const scaledHeight = bitmap.height * scale
  const offsetX = (OG_WIDTH - scaledWidth) / 2
  const offsetY = (OG_HEIGHT - scaledHeight) / 2

  ctx.drawImage(bitmap, offsetX, offsetY, scaledWidth, scaledHeight)
  bitmap.close()

  // Try quality 0.75 first, fall back to 0.6 if over 200KB
  let blob = await canvasToBlob(canvas, 0.75)

  if (blob.size > 200 * 1024) {
    blob = await canvasToBlob(canvas, 0.6)
  }

  return new File([blob], 'og-cover.jpg', { type: 'image/jpeg' })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas toBlob failed'))
        }
      },
      'image/jpeg',
      quality
    )
  })
}

/**
 * Fetch an image from URL, generate OG variant, and upload it.
 * Decoupled helper for ImageManager to call after setting cover.
 */
export async function generateAndUploadOG(
  propertyId: string,
  imageUrl: string
): Promise<{ url: string } | { error: string }> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return { error: 'Erro ao baixar imagem para gerar OG' }
    }

    const blob = await response.blob()
    const ogFile = await generateOGImage(blob)

    const formData = new FormData()
    formData.append('file', ogFile)

    const { uploadOGImage } = await import('@/actions/images')
    return await uploadOGImage(propertyId, formData)
  } catch {
    return { error: 'Erro ao gerar imagem OG' }
  }
}
