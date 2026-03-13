import { describe, it, expect } from 'vitest'
import { settingsSchema } from '@/lib/validations/settings'

describe('settingsSchema', () => {
  it('passes validation with valid data', () => {
    const validData = {
      whatsapp: '(61) 99999-9999',
      site_name: 'Jander Imoveis',
      broker_name: 'Jander Silva',
    }

    const result = settingsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('fails when whatsapp is empty', () => {
    const data = {
      whatsapp: '',
      site_name: 'Jander Imoveis',
      broker_name: 'Jander Silva',
    }

    const result = settingsSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      const whatsappError = result.error.issues.find(
        (issue) => issue.path[0] === 'whatsapp'
      )
      expect(whatsappError?.message).toBe('WhatsApp e obrigatorio')
    }
  })

  it('fails with invalid phone format', () => {
    const data = {
      whatsapp: '61999999999',
      site_name: 'Jander Imoveis',
      broker_name: 'Jander Silva',
    }

    const result = settingsSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      const whatsappError = result.error.issues.find(
        (issue) => issue.path[0] === 'whatsapp'
      )
      expect(whatsappError?.message).toBe(
        'Formato invalido. Use (XX) XXXXX-XXXX'
      )
    }
  })

  it('fails when site_name is empty', () => {
    const data = {
      whatsapp: '(61) 99999-9999',
      site_name: '',
      broker_name: 'Jander Silva',
    }

    const result = settingsSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      const siteNameError = result.error.issues.find(
        (issue) => issue.path[0] === 'site_name'
      )
      expect(siteNameError?.message).toBe('Nome do site e obrigatorio')
    }
  })

  it('fails when broker_name is empty', () => {
    const data = {
      whatsapp: '(61) 99999-9999',
      site_name: 'Jander Imoveis',
      broker_name: '',
    }

    const result = settingsSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      const brokerNameError = result.error.issues.find(
        (issue) => issue.path[0] === 'broker_name'
      )
      expect(brokerNameError?.message).toBe('Nome do corretor e obrigatorio')
    }
  })
})
