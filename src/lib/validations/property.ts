import { z } from 'zod'

export const propertySchema = z.object({
  title: z
    .string()
    .min(1, 'Titulo e obrigatorio')
    .max(200, 'Titulo deve ter no maximo 200 caracteres'),
  description: z.string().nullable().optional(),
  price: z.coerce
    .number()
    .positive('Preco deve ser um valor positivo')
    .nullable()
    .optional(),
  property_type: z.enum(['casa', 'apartamento'], {
    message: 'Tipo deve ser casa ou apartamento',
  }).nullable().optional(),
  bedrooms: z.coerce
    .number()
    .int('Quartos deve ser um numero inteiro')
    .min(0, 'Quartos deve ser entre 0 e 20')
    .max(20, 'Quartos deve ser entre 0 e 20')
    .nullable()
    .optional(),
  bathrooms: z.coerce
    .number()
    .int('Banheiros deve ser um numero inteiro')
    .min(0, 'Banheiros deve ser entre 0 e 20')
    .max(20, 'Banheiros deve ser entre 0 e 20')
    .nullable()
    .optional(),
  parking_spaces: z.coerce
    .number()
    .int('Vagas deve ser um numero inteiro')
    .min(0, 'Vagas deve ser entre 0 e 20')
    .max(20, 'Vagas deve ser entre 0 e 20')
    .nullable()
    .optional(),
  area: z.coerce
    .number()
    .positive('Area deve ser um valor positivo')
    .nullable()
    .optional(),
  address: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude deve ser entre -90 e 90')
    .max(90, 'Latitude deve ser entre -90 e 90')
    .nullable()
    .optional(),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude deve ser entre -180 e 180')
    .max(180, 'Longitude deve ser entre -180 e 180')
    .nullable()
    .optional(),
  status: z
    .enum(['disponivel', 'reservado', 'vendido'], {
      message: 'Status invalido',
    })
    .default('disponivel'),
  condition: z
    .enum(['novo', 'usado'], {
      message: 'Condicao deve ser novo ou usado',
    })
    .nullable()
    .optional(),
  featured: z.boolean().default(false),
})

export type PropertyFormData = z.infer<typeof propertySchema>
