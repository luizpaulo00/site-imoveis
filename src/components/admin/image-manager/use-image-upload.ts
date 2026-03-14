'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { uploadImage } from '@/actions/images'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGES_PER_PROPERTY,
  type AcceptedImageType,
} from '@/lib/validations/image'

export interface UploadQueueItem {
  id: string
  file: File
  preview: string
  status: 'compressing' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

function isAcceptedType(type: string): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(type as AcceptedImageType)
}

function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return (
    type.includes('heic') ||
    type.includes('heif') ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  )
}

export function useImageUpload(propertyId: string) {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const previewUrlsRef = useRef<string[]>([])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const updateQueueItem = useCallback(
    (id: string, updates: Partial<UploadQueueItem>) => {
      setUploadQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      )
    },
    []
  )

  const processAndUploadFile = useCallback(
    async (file: File, queueId: string) => {
      try {
        let processedFile = file

        // Step 1: HEIC conversion (if needed)
        if (isHeicFile(file)) {
          updateQueueItem(queueId, { status: 'compressing', progress: 5 })
          const heic2any = (await import('heic2any')).default
          const blob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.85,
          })
          const convertedBlob = Array.isArray(blob) ? blob[0] : blob
          processedFile = new File(
            [convertedBlob],
            file.name.replace(/\.hei[cf]$/i, '.jpg'),
            { type: 'image/jpeg' }
          )
        }

        // Step 2: Compression
        updateQueueItem(queueId, { status: 'compressing', progress: 10 })
        const imageCompression = (await import('browser-image-compression'))
          .default
        const compressed = await imageCompression(processedFile, {
          maxSizeMB: 0.4,
          maxWidthOrHeight: 800,
          initialQuality: 0.8,
          useWebWorker: true,
          fileType: 'image/jpeg',
          onProgress: (p: number) => {
            // Map compression progress to 10-80% range
            const mappedProgress = 10 + Math.round(p * 0.7)
            updateQueueItem(queueId, { progress: mappedProgress })
          },
        })

        // Step 3: Upload via server action
        updateQueueItem(queueId, { status: 'uploading', progress: 85 })
        const formData = new FormData()
        formData.append('file', compressed)
        const result = await uploadImage(propertyId, formData)

        if ('error' in result) {
          updateQueueItem(queueId, {
            status: 'error',
            progress: 0,
            error: result.error,
          })
          toast.error(result.error)
          return
        }

        updateQueueItem(queueId, { status: 'done', progress: 100 })
        toast.success('Foto enviada com sucesso')
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao processar imagem'
        updateQueueItem(queueId, {
          status: 'error',
          progress: 0,
          error: errorMessage,
        })
        toast.error(errorMessage)
      }
    },
    [propertyId, updateQueueItem]
  )

  const uploadFiles = useCallback(
    async (files: File[], currentImageCount: number = 0) => {
      if (isUploading) return

      // Validate and filter files
      const validFiles: File[] = []

      for (const file of files) {
        // Check file type (allow HEIC even if browser reports empty type)
        const hasAcceptedType = isAcceptedType(file.type) || isHeicFile(file)
        if (!hasAcceptedType) {
          toast.error(
            `"${file.name}" nao e um formato suportado. Use JPEG, PNG, WebP ou HEIC.`
          )
          continue
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(
            `"${file.name}" excede o limite de ${MAX_FILE_SIZE_MB}MB.`
          )
          continue
        }

        validFiles.push(file)
      }

      if (validFiles.length === 0) return

      // Enforce limit
      const remainingSlots = MAX_IMAGES_PER_PROPERTY - currentImageCount
      if (remainingSlots <= 0) {
        toast.warning(
          `Limite de ${MAX_IMAGES_PER_PROPERTY} fotos atingido.`
        )
        return
      }

      const filesToUpload = validFiles.slice(0, remainingSlots)
      if (filesToUpload.length < validFiles.length) {
        toast.warning(
          `Apenas ${remainingSlots} foto(s) podem ser adicionadas. ${validFiles.length - filesToUpload.length} foto(s) foram ignoradas.`
        )
      }

      // Create queue items with previews
      const newItems: UploadQueueItem[] = filesToUpload.map((file) => {
        const preview = URL.createObjectURL(file)
        previewUrlsRef.current.push(preview)
        return {
          id: crypto.randomUUID(),
          file,
          preview,
          status: 'compressing' as const,
          progress: 0,
        }
      })

      setUploadQueue((prev) => [...prev, ...newItems])
      setIsUploading(true)

      // Process sequentially to avoid memory issues
      for (const item of newItems) {
        await processAndUploadFile(item.file, item.id)
      }

      setIsUploading(false)
    },
    [isUploading, processAndUploadFile]
  )

  return {
    uploadFiles,
    uploadQueue,
    isUploading,
  }
}
