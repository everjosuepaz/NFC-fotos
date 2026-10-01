import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function EventoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: evento, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !evento) {
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        {Array.isArray(evento.fotos) ? (
          evento.fotos.map((url: string, index: number) => (
            <img 
              key={index} 
              src={url} 
              alt={`Foto ${index + 1}`} 
              style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', height: '250px' }} 
            />
          ))
        ) : (
          <p>No hay fotos en este álbum.</p>
        )}
      </div>
    </main>
  )
}
