'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { settingsSchema, type SettingsFormData } from '@/lib/validations/settings'
import { formatPhone } from '@/lib/utils/phone'
import { loadSettings, saveSettings } from '@/actions/settings'

export function SettingsForm() {
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      whatsapp: '',
      site_name: '',
      broker_name: '',
    },
  })

  // Load existing settings on mount
  useEffect(() => {
    loadSettings().then((data) => {
      reset(data)
    })
  }, [reset])

  // Watch whatsapp field for masking
  const whatsappValue = watch('whatsapp')

  function handleWhatsAppChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(e.target.value)
    setValue('whatsapp', formatted, { shouldValidate: false })
  }

  async function onSubmit(data: SettingsFormData) {
    setSaving(true)
    try {
      const result = await saveSettings(data)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Configuracoes salvas')
      }
    } catch {
      toast.error('Erro ao salvar configuracoes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              placeholder="(61) 99999-9999"
              maxLength={15}
              value={whatsappValue}
              onChange={handleWhatsAppChange}
            />
            {errors.whatsapp && (
              <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_name">Nome do site</Label>
            <Input
              id="site_name"
              placeholder="Jander Imoveis"
              {...register('site_name')}
            />
            {errors.site_name && (
              <p className="text-sm text-red-500">{errors.site_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="broker_name">Nome do corretor</Label>
            <Input
              id="broker_name"
              placeholder="Jander Silva"
              {...register('broker_name')}
            />
            {errors.broker_name && (
              <p className="text-sm text-red-500">{errors.broker_name.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
