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
  const { error } = await supabase.from('site_settings').upsert({
    id: undefined, // Let the existing row match or create new
    whatsapp: parsed.data.whatsapp,
    site_name: parsed.data.site_name,
    broker_name: parsed.data.broker_name,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    return { error: 'Erro ao salvar configuracoes' }
  }

  return { success: true }
}
