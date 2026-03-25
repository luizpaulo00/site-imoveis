'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import CurrencyInput from 'react-currency-input-field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPicker } from '@/components/admin/map-picker'
import { propertySchema, type PropertyFormData } from '@/lib/validations/property'
import { createProperty, updateProperty } from '@/actions/properties'

interface PropertyFormProps {
  property?: PropertyFormData & { id?: string }
}

export function PropertyForm({ property }: PropertyFormProps) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const isEdit = !!property?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<PropertyFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(propertySchema) as any,
    defaultValues: property ?? {
      title: '',
      description: '',
      price: undefined,
      property_type: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      parking_spaces: undefined,
      area: undefined,
      built_area: undefined,
      condition: undefined,
      construction_status: undefined,
      address: '',
      neighborhood: '',
      latitude: undefined,
      longitude: undefined,
      status: 'disponivel',
      featured: false,
    },
  })

  const latitude = watch('latitude')
  const longitude = watch('longitude')

  function handleLocationChange(lat: number, lng: number) {
    setValue('latitude', lat, { shouldValidate: true })
    setValue('longitude', lng, { shouldValidate: true })
  }

  async function onSubmit(data: PropertyFormData) {
    setSaving(true)
    try {
      const result = isEdit
        ? await updateProperty(property!.id!, data)
        : await createProperty(data)

      if ('error' in result) {
        toast.error(result.error)
      } else if (isEdit) {
        toast.success('Imovel atualizado')
        router.push('/admin/imoveis')
      } else if ('id' in result) {
        toast.success('Imovel criado! Agora adicione as fotos.')
        router.push(`/admin/imoveis/${result.id}/editar`)
      }
    } catch {
      toast.error('Erro ao salvar imovel')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 max-w-2xl">
      {/* Dados Basicos */}
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-medium">Dados Basicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo</Label>
            <Input
              id="title"
              placeholder="Ex: Casa 3 quartos no Jardim America"
              className="bg-background transition-colors focus-visible:ring-primary/50"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              placeholder="Descreva o imovel..."
              rows={4}
              className="bg-background transition-colors focus-visible:ring-primary/50"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preco</Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="price"
                  intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                  value={field.value ?? ''}
                  onValueChange={(value) =>
                    field.onChange(value ? parseFloat(value) : undefined)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  placeholder="R$ 0,00"
                />
              )}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_type">Tipo</Label>
            <Controller
              name="property_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="property_type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="apartamento">Apartamento</SelectItem>
                    <SelectItem value="lote">Lote</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.property_type && (
              <p className="text-sm text-red-500">{errors.property_type.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Caracteristicas */}
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-medium">Caracteristicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input
                id="bedrooms"
                type="number"
                min={0}
                max={20}
                className="bg-background transition-colors focus-visible:ring-primary/50"
                {...register('bedrooms', { valueAsNumber: true })}
              />
              {errors.bedrooms && (
                <p className="text-sm text-red-500">{errors.bedrooms.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Banheiros</Label>
              <Input
                id="bathrooms"
                type="number"
                min={0}
                max={20}
                className="bg-background transition-colors focus-visible:ring-primary/50"
                {...register('bathrooms', { valueAsNumber: true })}
              />
              {errors.bathrooms && (
                <p className="text-sm text-red-500">{errors.bathrooms.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parking_spaces">Vagas de garagem</Label>
              <Input
                id="parking_spaces"
                type="number"
                min={0}
                max={20}
                className="bg-background transition-colors focus-visible:ring-primary/50"
                {...register('parking_spaces', { valueAsNumber: true })}
              />
              {errors.parking_spaces && (
                <p className="text-sm text-red-500">{errors.parking_spaces.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area total (m2)</Label>
              <Input
                id="area"
                type="number"
                min={0}
                step="0.01"
                className="bg-background transition-colors focus-visible:ring-primary/50"
                {...register('area', { valueAsNumber: true })}
              />
              {errors.area && (
                <p className="text-sm text-red-500">{errors.area.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="built_area">Area construida (m2)</Label>
              <Input
                id="built_area"
                type="number"
                min={0}
                step="0.01"
                className="bg-background transition-colors focus-visible:ring-primary/50"
                {...register('built_area', { valueAsNumber: true })}
              />
              {errors.built_area && (
                <p className="text-sm text-red-500">{errors.built_area.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condicao</Label>
            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Selecione a condicao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="usado">Usado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.condition && (
              <p className="text-sm text-red-500">{errors.condition.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="construction_status">Status da construcao</Label>
            <Controller
              name="construction_status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={(value) => field.onChange(value || null)}
                >
                  <SelectTrigger id="construction_status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pronto_para_morar">Pronto para morar</SelectItem>
                    <SelectItem value="em_construcao">Em construcao</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.construction_status && (
              <p className="text-sm text-red-500">{errors.construction_status.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Localizacao */}
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-medium">Localizacao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereco</Label>
              <Input
                id="address"
                placeholder="Rua, numero..."
                className="bg-background transition-colors focus-visible:ring-primary/50"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                placeholder="Nome do bairro"
                className="bg-background transition-colors focus-visible:ring-primary/50"
                {...register('neighborhood')}
              />
              {errors.neighborhood && (
                <p className="text-sm text-red-500">{errors.neighborhood.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                placeholder="Ex: Formosa"
                className="bg-background transition-colors focus-visible:ring-primary/50"
                {...register('city')}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                placeholder="Ex: GO"
                className="bg-background transition-colors focus-visible:ring-primary/50"
                {...register('state')}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          <MapPicker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleLocationChange}
          />
          <p className="text-sm text-muted-foreground">
            Clique no mapa para marcar a localizacao do imovel (opcional)
          </p>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? 'disponivel'}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponivel</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <Switch
                  id="featured"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="featured">Destacar na pagina inicial</Label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? 'Salvando...' : 'Salvar Imovel'}
      </Button>
    </form>
  )
}
