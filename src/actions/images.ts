'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadImage(
  propertyId: string,
  formData: FormData
): Promise<{ success: true; image: Record<string, unknown> } | { error: string }> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { error: 'Nenhum arquivo enviado' }
  }

  const supabase = await createClient()

  // Generate unique filename
  const fileId = crypto.randomUUID()
  const storagePath = `${propertyId}/${fileId}.jpg`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    return { error: 'Erro ao fazer upload da imagem' }
  }

  // Get next position
  const { data: existingImages } = await supabase
    .from('property_images')
    .select('id')
    .eq('property_id', propertyId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existingImages && existingImages.length > 0 ? 1 : 0
  const isFirstImage = !existingImages || existingImages.length === 0

  // Get correct next position by counting
  const { count } = await supabase
    .from('property_images')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId)

  const position = count ?? 0

  // Insert DB row
  const { data: imageRecord, error: insertError } = await supabase
    .from('property_images')
    .insert({
      property_id: propertyId,
      storage_path: storagePath,
      position,
      is_cover: isFirstImage,
    })
    .select()
    .single()

  if (insertError || !imageRecord) {
    // Clean up storage on DB failure
    await supabase.storage.from('property-images').remove([storagePath])
    return { error: 'Erro ao salvar registro da imagem' }
  }

  revalidatePath('/admin/imoveis')
  return { success: true, image: imageRecord }
}

export async function deleteImage(
  imageId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()

  // Fetch image record
  const { data: image, error: fetchError } = await supabase
    .from('property_images')
    .select('*')
    .eq('id', imageId)
    .single()

  if (fetchError || !image) {
    return { error: 'Imagem nao encontrada' }
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('property-images')
    .remove([image.storage_path])

  if (storageError) {
    return { error: 'Erro ao remover arquivo da imagem' }
  }

  // Delete DB row
  const { error: deleteError } = await supabase
    .from('property_images')
    .delete()
    .eq('id', imageId)

  if (deleteError) {
    return { error: 'Erro ao excluir registro da imagem' }
  }

  // If deleted image was cover, promote lowest-position image
  if (image.is_cover) {
    const { data: remaining } = await supabase
      .from('property_images')
      .select('id')
      .eq('property_id', image.property_id)
      .order('position', { ascending: true })
      .limit(1)

    if (remaining && remaining.length > 0) {
      await supabase
        .from('property_images')
        .update({ is_cover: true })
        .eq('id', remaining[0].id)
    }
  }

  revalidatePath('/admin/imoveis')
  return { success: true }
}

export async function reorderImages(
  propertyId: string,
  imageIds: string[]
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()

  // Update each image position to its array index
  const updates = imageIds.map((id, index) =>
    supabase
      .from('property_images')
      .update({ position: index })
      .eq('id', id)
      .eq('property_id', propertyId)
  )

  const results = await Promise.all(updates)
  const hasError = results.some((r) => r.error)

  if (hasError) {
    return { error: 'Erro ao reordenar imagens' }
  }

  revalidatePath('/admin/imoveis')
  return { success: true }
}

export async function setCoverImage(
  propertyId: string,
  imageId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()

  // Unset all covers for this property
  const { error: unsetError } = await supabase
    .from('property_images')
    .update({ is_cover: false })
    .eq('property_id', propertyId)

  if (unsetError) {
    return { error: 'Erro ao atualizar foto de capa' }
  }

  // Set the target image as cover
  const { error: setError } = await supabase
    .from('property_images')
    .update({ is_cover: true })
    .eq('id', imageId)
    .eq('property_id', propertyId)

  if (setError) {
    return { error: 'Erro ao definir foto de capa' }
  }

  revalidatePath('/admin/imoveis')
  return { success: true }
}

export async function uploadOGImage(
  propertyId: string,
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { error: 'Nenhum arquivo enviado' }
  }

  const supabase = await createClient()

  const storagePath = `${propertyId}/og-cover.jpg`

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(storagePath, file, {
      cacheControl: '31536000',
      upsert: true,
    })

  if (uploadError) {
    return { error: 'Erro ao fazer upload da imagem OG' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('property-images').getPublicUrl(storagePath)

  return { url: publicUrl }
}
