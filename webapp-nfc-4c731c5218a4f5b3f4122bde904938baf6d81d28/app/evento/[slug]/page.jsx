'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default function EventoPage({ params }) {
  const [slug, setSlug] = useState(null)
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function init() {
      const resolvedParams = await params
      const currentSlug = resolvedParams?.slug
      setSlug(currentSlug)
      if (currentSlug) {
        cargarEvento(currentSlug)
      }
    }
    init()
  }, [params])

  async function cargarEvento(slugParam) {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('slug', slugParam)
      .maybeSingle()

    if (!error && data) {
      setEvento(data)
    }
    setLoading(false)
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !evento) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${evento.slug}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // 1. Subir la imagen a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('fotos-eventos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Obtener la URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from('fotos-eventos')
        .getPublicUrl(filePath)

      const nuevaUrl = urlData.publicUrl

      // 3. Actualizar la lista de fotos en la tabla eventos
      const fotosActuales = Array.isArray(evento.fotos) ? evento.fotos : []
      const nuevasFotos = [...fotosActuales, nuevaUrl]

      const { error: updateError } = await supabase
        .from('eventos')
        .update({ fotos: nuevasFotos })
        .eq('id', evento.id)

      if (updateError) throw updateError

      // 4. Actualizar la vista de inmediato
      setEvento({ ...evento, fotos: nuevasFotos })
      alert('¡Foto agregada con éxito!')
    } catch (err) {
      console.error(err)
      alert('Hubo un error al subir la foto.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
        <p>Cargando recuerdos...</p>
      </div>
    )
  }

  if (!evento) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
        <h1>Recuerdo no encontrado</h1>
        <p>El enlace no existe o no está disponible.</p>
      </div>
    )
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{evento.titulo}</h1>
      <h3 style={{ color: '#666', fontWeight: 'normal', marginBottom: '20px' }}>{evento.subtitulo}</h3>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>{evento.mensaje}</p>

      {/* Botón interactivo para subir fotos */}
      <div style={{ marginBottom: '40px' }}>
        <label style={{
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '30px',
          fontWeight: 'bold',
          cursor: uploading ? 'not-allowed' : 'pointer',
          display: 'inline-block',
          boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
        }}>
          {uploading ? 'Subiendo foto...' : '📷 Agregar mi foto al álbum'}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            disabled={uploading}
            style={{ display: 'none' }} 
          />
        </label>
      </div>

      {/* Galería de Fotos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        {Array.isArray(evento.fotos) && evento.fotos.length > 0 ? (
          evento.fotos.map((url, index) => (
            <img 
              key={index} 
              src={url} 
              alt={`Foto ${index + 1}`} 
              style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', height: '250px' }} 
            />
          ))
        ) : (
          <p>Aún no hay fotos. ¡Sé el primero en subir una!</p>
        )}
      </div>
    </main>
  )
}
