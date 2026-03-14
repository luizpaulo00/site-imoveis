'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { UploadQueueItem } from './use-image-upload'

export interface ImageRecord {
  id: string
  storage_path: string
  position: number
  is_cover: boolean
}

interface ImageThumbnailProps {
  image: ImageRecord
  publicUrl: string
  uploadStatus?: UploadQueueItem['status']
  uploadProgress?: number
  uploadError?: string
  onSetCover: (imageId: string) => void
  onDelete: (imageId: string) => void
  dragHandleProps?: Record<string, unknown>
}

export function ImageThumbnail({
  image,
  publicUrl,
  uploadStatus,
  uploadProgress,
  uploadError,
  onSetCover,
  onDelete,
  dragHandleProps,
}: ImageThumbnailProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isUploading = uploadStatus === 'compressing' || uploadStatus === 'uploading'
  const isError = uploadStatus === 'error'
  const isReady = !uploadStatus || uploadStatus === 'done'

  return (
    <div
      className={`
        group relative aspect-square overflow-hidden rounded-lg bg-muted
        ${image.is_cover ? 'ring-2 ring-primary' : ''}
      `}
      {...dragHandleProps}
    >
      {/* Thumbnail image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={publicUrl}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {/* Upload progress overlay */}
      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
          <span className="text-xs font-medium text-white">
            {uploadStatus === 'compressing' ? 'Comprimindo...' : 'Enviando...'}
          </span>
          <div className="w-3/4">
            <Progress value={uploadProgress ?? 0} className="h-2" />
          </div>
          <span className="text-xs text-white/80">{uploadProgress ?? 0}%</span>
        </div>
      )}

      {/* Error overlay */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/70 p-2">
          <span className="text-center text-xs font-medium text-white">
            {uploadError ?? 'Erro no upload'}
          </span>
        </div>
      )}

      {/* Action buttons (only visible when ready) */}
      {isReady && (
        <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
          {/* Cover button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSetCover(image.id)
            }}
            className={`
              absolute left-1.5 top-1.5 rounded-full p-1 transition-colors
              ${image.is_cover
                ? 'bg-primary text-primary-foreground'
                : 'bg-black/50 text-white hover:bg-primary hover:text-primary-foreground'
              }
            `}
            title={image.is_cover ? 'Foto de capa' : 'Definir como capa'}
          >
            <Star className={`h-4 w-4 ${image.is_cover ? 'fill-current' : ''}`} />
          </button>

          {/* Delete button */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger
              onClick={(e) => e.stopPropagation()}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir esta foto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acao nao pode ser desfeita. A foto sera removida permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => onDelete(image.id)}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Always-visible cover indicator */}
      {image.is_cover && isReady && (
        <div className="absolute left-1.5 top-1.5 rounded-full bg-primary p-1 text-primary-foreground group-hover:opacity-0">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}
    </div>
  )
}
