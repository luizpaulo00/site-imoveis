'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

const ACCEPT =
  'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif'

export function ImageDropzone({ onFilesSelected, disabled }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return
      onFilesSelected(Array.from(fileList))
    },
    [onFilesSelected, disabled]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setIsDragOver(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (!disabled) handleFiles(e.dataTransfer.files)
    },
    [disabled, handleFiles]
  )

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors
        ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
      `}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <div className="text-sm text-muted-foreground">
        <span>Arraste fotos aqui ou</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.click()
        }}
      >
        Selecionar fotos
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
    </div>
  )
}
