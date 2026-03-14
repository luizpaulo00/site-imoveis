import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface PublicSettings {
  whatsapp: string
  siteName: string
  brokerName: string
}

export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_settings')
    .select('whatsapp, site_name, broker_name')
    .single()

  if (error || !data) {
    return { whatsapp: '', siteName: '', brokerName: '' }
  }

  return {
    whatsapp: data.whatsapp ?? '',
    siteName: data.site_name ?? '',
    brokerName: data.broker_name ?? '',
  }
})
