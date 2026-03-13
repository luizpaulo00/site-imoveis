export type SiteSettings = {
  id: string
  whatsapp: string
  site_name: string
  broker_name: string
  updated_at: string
}

export type KeepAlive = {
  id: number
  pinged_at: string
}

export type Property = {
  id: string
  title: string
  description: string | null
  price: number | null
  property_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  address: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  status: 'disponivel' | 'reservado' | 'vendido'
  featured: boolean
  created_at: string
  updated_at: string
}

export type PropertyImage = {
  id: string
  property_id: string
  storage_path: string
  position: number
  is_cover: boolean
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: SiteSettings
        Insert: Omit<SiteSettings, 'id' | 'updated_at'> & {
          id?: string
          updated_at?: string
        }
        Update: Partial<Omit<SiteSettings, 'id'>>
      }
      keep_alive: {
        Row: KeepAlive
        Insert: {
          id?: number
          pinged_at?: string
        }
        Update: {
          pinged_at?: string
        }
      }
      properties: {
        Row: Property
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'status' | 'featured'> & {
          id?: string
          created_at?: string
          updated_at?: string
          status?: 'disponivel' | 'reservado' | 'vendido'
          featured?: boolean
        }
        Update: Partial<Omit<Property, 'id'>>
      }
      property_images: {
        Row: PropertyImage
        Insert: Omit<PropertyImage, 'id' | 'created_at' | 'position' | 'is_cover'> & {
          id?: string
          created_at?: string
          position?: number
          is_cover?: boolean
        }
        Update: Partial<Omit<PropertyImage, 'id'>>
      }
    }
  }
}
