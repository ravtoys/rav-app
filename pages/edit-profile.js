import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const STARS = Array.from({ length: 74 }, (_, i) => {
  const tone = i % 17 === 0 ? '#FFD84D' : i % 7 === 0 ? '#BDF24A' : '#EAF0FF'
  return {
    x: (i * 37 + 11) % 100,
    y: (i * 53 + 7) % 100,
    size: 0.7 + ((i * 17) % 16) / 10,
    tone,
    opacity: .24 + ((i * 13) % 60) / 100,
  }
})

const C = {
  page: {
    minHeight:'100vh',
    position:'relative',
    overflow:'hidden',
    color:'#FBEFC8',
    background:'radial-gradient(120% 70% at 50% -6%, rgba(63,169,245,.30), transparent 55%), radial-gradient(95% 60% at 92% 8%, rgba(255,107,61,.22), transparent 52%), linear-gradient(180deg,#0E1B3A,#0A1228 52%,#060A18)',
  },
  grain: {
    position:'fixed',
    inset:0,
    zIndex:1,
    pointerEvents:'none',
    opacity:.4,
    mixBlendMode:'overlay',
    backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27 viewBox=%270 0 160 160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.78%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27 opacity=%27.7%27/%3E%3C/svg%3E")',
    backgroundSize:'160px 160px',
  },
  stars: { position:'absolute', inset:0, zIndex:0, pointerEvents:'none' },
  star: { position:'absolute', borderRadius:'50%' },
  nebula: { position:'absolute', width:230, height:230, borderRadius:'50%', filter:'blur(52px)', opacity:.42, zIndex:0 },
  shell: { position:'relative', zIndex:2, width:'100%', maxWidth:430, margin:'0 auto', minHeight:'100vh', padding:'18px 14px 112px' },
  topBar: { position:'sticky', top:0, zIndex:5, display:'grid', gridTemplateColumns:'88px 1fr 88px', alignItems:'center', gap:8, padding:'10px 0 16px', background:'linear-gradient(180deg, rgba(10,18,40,.98), rgba(10,18,40,.68))', backdropFilter:'blur(12px)' },
  backBtn: { border:'1px solid rgba(127,168,216,.35)', background:'rgba(10,18,40,.72)', color:'#9FD8FF', borderRadius:999, padding:'9px 12px', fontFamily:"'Fredoka',sans-serif", fontWeight:800, cursor:'pointer' },
  title: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:18, textAlign:'center', textShadow:'2px 2px 0 #FF6B3D', textTransform:'uppercase' },
  hero: { textAlign:'center', margin:'4px 0 24px' },
  avatarBtn: { position:'relative', width:124, height:124, border:0, borderRadius:'50%', background:'transparent', padding:0, margin:'0 auto', display:'block', cursor:'pointer' },
  orbitRing: { position:'absolute', inset:-5, borderRadius:'50%', border:'1.5px dashed rgba(63,169,245,.82)', animation:'spin-slow 14s linear infinite' },
  orbitDot: { position:'absolute', right:6, top:0, width:11, height:11, borderRadius:'50%', background:'#FFD84D', boxShadow:'0 0 10px rgba(255,216,77,.9)' },
  avatar: { position:'relative', width:118, height:118, borderRadius:'50%', overflow:'hidden', border:'3px solid #FF6B3D', background:'#0A1228', display:'flex', alignItems:'center', justifyContent:'center', color:'#FBEFC8', fontFamily:"'Bungee',sans-serif", fontSize:34, boxShadow:'0 0 22px rgba(255,107,61,.35)' },
  avatarImg: { width:'100%', height:'100%', objectFit:'cover' },
  cameraBadge: { position:'absolute', bottom:4, right:0, width:36, height:36, borderRadius:'50%', background:'#BDF24A', color:'#10240A', border:'3px solid #0A1228', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 14px rgba(189,242,74,.45)' },
  hint: { fontFamily:"'Fredoka',sans-serif", fontWeight:700, fontSize:13, color:'#BDF24A', marginTop:10 },
  form: { display:'grid', gap:12 },
  field: { display:'block', border:'1.5px solid rgba(127,168,216,.24)', background:'rgba(14,27,58,.78)', borderRadius:17, padding:'12px 12px 13px', boxShadow:'0 10px 22px rgba(0,0,0,.20)' },
  label: { display:'block', fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:800, color:'#9FD8FF', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 },
  input: { width:'100%', border:0, outline:'none', background:'transparent', color:'#FBEFC8', fontFamily:"'Fredoka',sans-serif", fontSize:17, fontWeight:800 },
  helper: { fontFamily:"'Nunito',sans-serif", color:'#7FA8D8', fontSize:11, lineHeight:1.35, margin:'2px 2px 0' },
  saveBtn: { width:'100%', minHeight:54, marginTop:4, border:0, borderRadius:16, background:'linear-gradient(160deg,#D6FF6E,#BDF24A 55%,#7FC916)', color:'#10240A', fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:900, boxShadow:'0 10px 26px rgba(127,201,22,.34), inset 0 2px 0 rgba(255,255,255,.5)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer' },
  disabledBtn: { width:'100%', minHeight:54, marginTop:4, border:0, borderRadius:16, background:'rgba(127,168,216,.16)', color:'rgba(216,224,248,.38)', fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
  success: { background:'rgba(189,242,74,.13)', border:'1px solid rgba(189,242,74,.42)', color:'#BDF24A', borderRadius:14, padding:'10px 12px', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, marginBottom:12, lineHeight:1.35 },
  err: { color:'#FF8A5B', fontFamily:"'Fredoka',sans-serif", fontSize:12, margin:'0 0 10px', lineHeight:1.35 },
}

function Icon({ type, size = 20, color = 'currentColor' }) {
  const common = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', 'aria-hidden':'true' }
  if (type === 'camera') return <svg {...common}><path d="M5 8h3l1.4-2h5.2L16 8h3v10H5V8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="13" r="3" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'check') return <svg {...common}><path d="m5 12.5 4.2 4L19 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.8"/></svg>
}

function getInitials(name) {
  return (name || 'RAV').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function EditProfile() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('Colombia')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setName(data.full_name || '')
        setPhone(data.phone || '')
        setCity(data.city || '')
        setCountry(data.country || 'Colombia')
        setAvatarUrl(data.avatar_url || '')
      }
    }
    load()
  }, [router])

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Elige una imagen válida.'); return }
    if (file.size > 2 * 1024 * 1024) { setError('La imagen debe pesar menos de 2MB.'); return }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setError('')
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return avatarUrl
    const ext = avatarFile.name.split('.').pop() || 'jpg'
    const path = `${userId}/avatar-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { cacheControl:'3600', upsert:true })
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSave = async () => {
    const cleanName = name.trim()
    const cleanPhone = phone.replace(/\s/g, '')
    const cleanCity = city.trim()
    const cleanCountry = country.trim()

    if (!cleanName) { setError('El nombre es obligatorio.'); return }
    if (!cleanPhone || !/^\+\d{8,15}$/.test(cleanPhone)) { setError('Escribe tu teléfono con indicativo. Ej: +57 3001234567'); return }
    if (!cleanCity || !cleanCountry) { setError('Ciudad y país son obligatorios.'); return }

    setLoading(true)
    setError('')
    setMsg('')
    try {
      const publicAvatarUrl = await uploadAvatar()
      const { error: saveError } = await supabase
        .from('profiles')
        .update({
          full_name: cleanName,
          phone: cleanPhone,
          city: cleanCity,
          country: cleanCountry,
          avatar_url: publicAvatarUrl || null,
        })
        .eq('id', userId)
      if (saveError) throw saveError
      setMsg('Perfil actualizado.')
      setTimeout(() => router.push('/profile'), 900)
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    }
    setLoading(false)
  }

  const ready = name.trim().length > 0 && phone.trim().length > 0 && city.trim().length > 0 && country.trim().length > 0
  const photo = avatarPreview || avatarUrl

  return (
    <div style={C.page}>
      <div style={C.stars}>
        {STARS.map((star, i) => <span key={i} style={{ ...C.star, left:`${star.x}%`, top:`${star.y}%`, width:star.size, height:star.size, background:star.tone, opacity:star.opacity, boxShadow:star.tone === '#EAF0FF' ? 'none' : `0 0 8px ${star.tone}` }} />)}
      </div>
      <span style={{ ...C.nebula, left:-90, top:80, background:'rgba(63,169,245,.7)' }} />
      <span style={{ ...C.nebula, right:-110, top:120, background:'rgba(255,107,61,.5)' }} />
      <span style={C.grain} />

      <main style={C.shell}>
        <div style={C.topBar}>
          <button style={C.backBtn} onClick={() => router.push('/profile')}>‹ Volver</button>
          <p style={C.title}>Editar perfil</p>
          <span />
        </div>

        <section style={C.hero}>
          <button style={C.avatarBtn} onClick={() => fileInputRef.current?.click()} disabled={loading} aria-label="Cambiar foto de perfil">
            <span style={C.orbitRing} />
            <span style={C.orbitDot} />
            <span style={C.avatar}>
              {photo ? <img src={photo} alt="Foto de perfil" style={C.avatarImg} /> : getInitials(name)}
            </span>
            <span style={C.cameraBadge}><Icon type="camera" size={16} color="currentColor" /></span>
          </button>
          <p style={C.hint}>Toca la foto para cambiarla</p>
          <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handleAvatarPick} style={{ display:'none' }} />
        </section>

        {msg && <div style={C.success}>{msg}</div>}
        {error && <p style={C.err}>{error}</p>}

        <section style={C.form}>
          <label style={C.field}>
            <span style={C.label}>Nombre completo</span>
            <input style={C.input} placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} />
          </label>

          <label style={C.field}>
            <span style={C.label}>Teléfono</span>
            <input style={C.input} type="tel" placeholder="+57 ..." value={phone} onChange={e => setPhone(e.target.value)} />
          </label>

          <label style={C.field}>
            <span style={C.label}>Ciudad</span>
            <input style={C.input} placeholder="Tu ciudad" value={city} onChange={e => setCity(e.target.value)} />
          </label>

          <label style={C.field}>
            <span style={C.label}>País</span>
            <input style={C.input} placeholder="Tu país" value={country} onChange={e => setCountry(e.target.value)} />
          </label>

          <p style={C.helper}>Usaremos estos datos para contacto, beneficios y futuras sorpresas RAV.</p>

          <button style={ready && !loading ? C.saveBtn : C.disabledBtn} onClick={handleSave} disabled={!ready || loading}>
            <Icon type="check" size={20} color="currentColor" /> {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </section>
      </main>

      <style jsx global>{`
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
        }
      `}</style>
    </div>
  )
}
