'use server'

import { createClient } from '@/lib/supabase/server'
import { propertySchema, type PropertyFormData } from '@/lib/validations/property'
import { uuidSchema } from '@/lib/validations/uuid'
import { revalidatePath } from 'next/cache'

export async function createProperty(
  data: PropertyFormData
): Promise<{ success: true; id: string } | { error: string }> {
  const parsed = propertySchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Dados invalidos' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Nao autorizado' }

  const { data: result, error } = await supabase
    .from('properties')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error || !result) {
    console.error('Supabase Insert Error:', error?.message)
    return { error: 'Erro ao criar imovel' }
  }

  revalidatePath('/admin/imoveis')
  return { success: true, id: result.id }
}

export async function updateProperty(
  id: string,
  data: PropertyFormData
): Promise<{ success: true } | { error: string }> {
  const idValidation = uuidSchema.safeParse(id)
  if (!idValidation.success) return { error: 'ID invalido' }

  const parsed = propertySchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Dados invalidos' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Nao autorizado' }

  const { error } = await supabase
    .from('properties')
    .update(parsed.data)
    .eq('id', id)

  if (error) {
    console.error('Supabase Update Error:', error?.message)
    return { error: 'Erro ao atualizar imovel' }
  }

  revalidatePath('/admin/imoveis')
  return { success: true }
}

export async function deleteProperty(
  id: string
): Promise<{ success: true } | { error: string }> {
  const idValidation = uuidSchema.safeParse(id)
  if (!idValidation.success) return { error: 'ID invalido' }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Nao autorizado' }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao excluir imovel' }
  }

  revalidatePath('/admin/imoveis')
  return { success: true }
}

export async function listProperties(
  status?: string
): Promise<Array<Record<string, unknown>>> {
  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select('*, property_images(count)')

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((property) => {
    const imageCount = Array.isArray(property.property_images)
      ? property.property_images[0]?.count ?? 0
      : 0
    const { property_images, ...rest } = property
    return { ...rest, image_count: imageCount }
  })
}

export async function getProperty(
  id: string
): Promise<Record<string, unknown> | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}
