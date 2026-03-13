import { z } from 'zod'

export const settingsSchema = z.object({
  whatsapp: z
    .string()
    .min(1, 'WhatsApp e obrigatorio')
    .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Formato invalido. Use (XX) XXXXX-XXXX'),
  site_name: z.string().min(1, 'Nome do site e obrigatorio'),
  broker_name: z.string().min(1, 'Nome do corretor e obrigatorio'),
})

export type SettingsFormData = z.infer<typeof settingsSchema>
