'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@supabase/supabase-js'

// Inicialización del cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default function EventoPage({ params }: { params: Promise<{ slug: string }> }) {
  // Desempaquetamos los parámetros usando el hook 'use' de React
  const resolvedParams = use(params)
  const slug = resolvedParams?.slug

  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (slug) {
      cargarEvento(slug)
    } else {
      setLoading(false)
    }
  }, [slug])

  async function cargarEvento(slugParam) {
    console.log('Buscando en Supabase el slug:', slugParam)
    console.log('URL de Supabase activa:', supabaseUrl)

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('slug', slugParam)
      .maybeSingle()

    if (error) {
      console.error('Error reportado por Supabase:', error)
    }

    if (data) {
      console.log('Datos encontrados:', data)
      setEvento(data)
    } else {
      console.warn('No se encontraron registros para el slug:', slugParam)
    }
    
    setLoading(false)
  }

  // ... (deja el resto de tus funciones handleFileUpload y JSX tal como están)
