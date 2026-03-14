'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageDropzone } from './image-dropzone'
import { ImageGrid } from './image-grid'
import { useImageUpload } from './use-image-upload'
import { deleteImage, setCoverImage } from '@/actions/images'
import { generateAndUploadOG } from './og-image'
import { MAX_IMAGES_PER_PROPERTY } from '@/lib/validations/image'
import type { ImageRecord } from './image-thumbnail'

interface ImageManagerProps {
  propertyId: string
  initialImages: ImageRecord[]
  supabaseUrl: string
}

export function ImageManager({
  propertyId,
  initialImages,
  supabaseUrl,
}: ImageManagerProps) {
  const [images, setImages] = useState<ImageRecord[]>(initialImages)
  const { uploadFiles, uploadQueue, isUploading } = useImageUpload(propertyId)

  const imageCount = images.length
  const atLimit = imageCount >= MAX_IMAGES_PER_PROPERTY
  const nearLimit = imageCount >= MAX_IMAGES_PER_PROPERTY - 2

  // Handle new files from dropzone
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      uploadFiles(files, imageCount)
    },
    [uploadFiles, imageCount]
  )

  // Refresh images from upload queue completions
  // When an upload completes, we need to refetch or reconstruct the image list
  // For now, we listen for 'done' items in queue and fetch fresh data
  // The server action already revalidates the path, so Next.js will refetch on navigation
  // But for immediate feedback, we add completed uploads to local state
  const completedUploads = uploadQueue.filter((item) => item.status === 'done')
  if (completedUploads.length > 0) {
    // Force a page refresh to pick up new images from server
    // This is handled by revalidatePath in the server action
  }

  const handleSetCover = useCallback(
    async (imageId: string) => {
      const targetImage = images.find((img) => img.id === imageId)
      if (!targetImage || targetImage.is_cover) return

      // Optimistic update
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_cover: img.id === imageId,
        }))
      )

      const result = await setCoverImage(propertyId, imageId)
      if ('error' in result) {
        toast.error(result.error)
        // Revert
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_cover: initialImages.find((i) => i.id === img.id)?.is_cover ?? false,
          }))
        )
        return
      }

      toast.success('Foto de capa atualizada')

      // Generate OG image in the background (fire-and-forget)
      if (targetImage.storage_path) {
        const imageUrl = `${supabaseUrl}/storage/v1/object/public/property-images/${targetImage.storage_path}`
        generateAndUploadOG(propertyId, imageUrl).then((ogResult) => {
          if ('error' in ogResult) {
            toast.error('Erro ao gerar preview para redes sociais')
          }
        })
      }
    },
    [images, propertyId, initialImages, supabaseUrl]
  )

  const handleDelete = useCallback(
    async (imageId: string) => {
      // Optimistic update
      setImages((prev) => prev.filter((img) => img.id !== imageId))

      const result = await deleteImage(imageId)
      if ('error' in result) {
        toast.error(result.error)
        // Revert
        setImages(images)
        return
      }

      toast.success('Foto excluida')
    },
    [images]
  )

  const handleImagesChange = useCallback((newImages: ImageRecord[]) => {
    setImages(newImages)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fotos</CardTitle>
        <Badge variant={nearLimit ? 'destructive' : 'secondary'}>
          {imageCount}/{MAX_IMAGES_PER_PROPERTY} fotos
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageDropzone
          onFilesSelected={handleFilesSelected}
          disabled={isUploading || atLimit}
        />
        <ImageGrid
          propertyId={propertyId}
          images={images}
          uploadQueue={uploadQueue}
          supabaseUrl={supabaseUrl}
          onImagesChange={handleImagesChange}
          onSetCover={handleSetCover}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  )
}
