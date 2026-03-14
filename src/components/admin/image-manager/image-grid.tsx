'use client'

import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { reorderImages } from '@/actions/images'
import { ImageThumbnail, type ImageRecord } from './image-thumbnail'
import type { UploadQueueItem } from './use-image-upload'

interface ImageGridProps {
  propertyId: string
  images: ImageRecord[]
  uploadQueue: UploadQueueItem[]
  supabaseUrl: string
  onImagesChange: (images: ImageRecord[]) => void
  onSetCover: (imageId: string) => void
  onDelete: (imageId: string) => void
}

function getPublicUrl(supabaseUrl: string, storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/property-images/${storagePath}`
}

function SortableItem({
  image,
  supabaseUrl,
  onSetCover,
  onDelete,
}: {
  image: ImageRecord
  supabaseUrl: string
  onSetCover: (imageId: string) => void
  onDelete: (imageId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ImageThumbnail
        image={image}
        publicUrl={getPublicUrl(supabaseUrl, image.storage_path)}
        onSetCover={onSetCover}
        onDelete={onDelete}
      />
    </div>
  )
}

export function ImageGrid({
  propertyId,
  images,
  uploadQueue,
  supabaseUrl,
  onImagesChange,
  onSetCover,
  onDelete,
}: ImageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      // Optimistic update
      const reordered = arrayMove(images, oldIndex, newIndex).map(
        (img, idx) => ({ ...img, position: idx })
      )
      onImagesChange(reordered)

      // Persist to server
      const orderedIds = reordered.map((img) => img.id)
      const result = await reorderImages(propertyId, orderedIds)
      if ('error' in result) {
        // Revert on failure
        onImagesChange(images)
      }
    },
    [images, onImagesChange, propertyId]
  )

  // Queue items that are still processing (not yet uploaded)
  const activeQueue = uploadQueue.filter(
    (item) => item.status !== 'done'
  )

  if (images.length === 0 && activeQueue.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.id)}
          strategy={rectSortingStrategy}
        >
          {images.map((image) => (
            <SortableItem
              key={image.id}
              image={image}
              supabaseUrl={supabaseUrl}
              onSetCover={onSetCover}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Upload queue items (not sortable, shown at end) */}
      {activeQueue.map((item) => (
        <ImageThumbnail
          key={item.id}
          image={{
            id: item.id,
            storage_path: '',
            position: -1,
            is_cover: false,
          }}
          publicUrl={item.preview}
          uploadStatus={item.status}
          uploadProgress={item.progress}
          uploadError={item.error}
          onSetCover={() => {}}
          onDelete={() => {}}
        />
      ))}
    </div>
  )
}
