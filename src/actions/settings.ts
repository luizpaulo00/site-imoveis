'use server'

import { createClient } from '@/lib/supabase/server'
import { settingsSchema, type SettingsFormData } from '@/lib/validations/settings'

export async function loadSettings(): Promise<SettingsFormData> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('whatsapp, site_name, broker_name')
    .single()

  if (error || !data) {
    return { whatsapp: '', site_name: '', broker_name: '' }
  }

  return {
    whatsapp: data.whatsapp ?? '',
    site_name: data.site_name ?? '',
    broker_name: data.broker_name ?? '',
  }
}

export async function saveSettings(
  data: SettingsFormData
): Promise<{ success: true } | { error: string }> {
  const parsed = settingsSchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Dados invalidos. Verifique os campos.' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Nao autorizado' }

  // Select existing row, then update or insert
  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .single()

  const settingsPayload = {
    whatsapp: parsed.data.whatsapp,
    site_name: parsed.data.site_name,
    broker_name: parsed.data.broker_name,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { error } = await supabase
      .from('site_settings')
      .update(settingsPayload)
      .eq('id', existing.id)

    if (error) {
      return { error: 'Erro ao salvar configuracoes' }
    }
  } else {
    const { error } = await supabase
      .from('site_settings')
      .insert(settingsPayload)

    if (error) {
      return { error: 'Erro ao salvar configuracoes' }
    }
  }

  return { success: true }
}
