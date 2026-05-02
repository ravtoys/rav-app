import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const C = {
  page: { minHeight:'100vh', background:'#080618', fontFamily:"'Nunito',sans-serif", padding:'0 0 40px' },
  header: { background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', padding:'20px 20px 24px', display:'flex', alignItems:'center', gap:14 },
  backBtn: { background:'none', border:'none', color:'#AAEB3A', fontSize:22, cursor:'pointer', padding:0 },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:18, fontWeight:900, color:'white' },
  body: { padding:'24px 20px' },
  avatarWrap: { display:'flex', flexDirection:'column', alignItems:'center', marginBottom:28 },
  avatar: { position:'relative', width:120, height:120, borderRadius:'50%', objectFit:'cover', border:'3px solid #AAEB3A', background:'rgba(170,235,58,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, color:'#AAEB3A', fontWeight:900, overflow:'visible', cursor:'pointer' },
  avatarInner: { width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  cameraBadge: { position:'absolute', bottom:2, right:2, width:36, height:36, borderRadius:'50%', background:'#AAEB3A', border:'3px solid #080618', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 },
  hint: { marginTop:14, fontSize:12, color:'rgba(170,235,58,0.6)', fontWeight:700 },
  label: { fontSize:12, fontWeight:800, color:'rgba(170,235,58,0.6)', letterSpacing:1, marginBottom:8, display:'block' },
  input: { width:'100%', padding:'14px 16px', borderRadius:12, border:'1px solid rgba(170,235,58,0.3)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:15, outline:'none', marginBottom:20 },
  btn: { width:'100%', padding:'15px', borderRadius:14, border:'none', background:'#AAEB3A', color:'#080618', fontSize:16, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  success: { background:'rgba(170,235,58,0.15)', border:'1px solid #AAEB3A', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#AAEB3A', fontWeight:700, marginBottom:20 },
  err: { color:'#ff6666', fontSize:13, marginBottom:16 },
}

export default function EditProfile() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [userId, setUserId] = useState('')
  const [uploading, setUploading] = useState(false)
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
        setAvatarUrl(data.avatar_url || '')
      }
    }
    load()
  }, [])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('La imagen debe pesar menos de 2MB'); return }
    setError('')
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: true })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = urlData.publicUrl
      const { error: dbErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
      if (dbErr) throw dbErr
      setAvatarUrl(publicUrl)
      setMsg('¡Foto actualizada! 📸')
      setTimeout(() => setMsg(''), 2000)
    } catch (err) {
      setError('Error al subir la imagen. Intenta de nuevo.')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!name) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.from('profiles').update({ full_name: name, phone }).eq('id', userId)
    if (error) setError('Error al guardar. Intenta de nuevo.')
    else {
      setMsg('¡Perfil actualizado! ✅')
      setTimeout(() => router.push('/profile'), 1500)
    }
    setLoading(false)
  }

  const initial = (name || 'R').charAt(0).toUpperCase()

  return (
    <div style={C.page}>
      <div style={C.header}>
        <button style={C.backBtn} onClick={() => router.push('/profile')}>←</button>
        <p style={C.title}>Editar perfil</p>
      </div>
      <div style={C.body}>
        <div style={C.avatarWrap}>
          <div style={C.avatar} onClick={() => !uploading && fileInputRef.current?.click()}>
            <div style={C.avatarInner}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : initial}
            </div>
            <div style={C.cameraBadge}>{uploading ? '⏳' : '📷'}</div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} />
          <p style={C.hint}>{uploading ? 'Subiendo...' : 'Toca la foto para cambiarla'}</p>
        </div>

        {msg && <div style={C.success}>{msg}</div>}
        {error && <p style={C.err}>{error}</p>}

        <label style={C.label}>NOMBRE COMPLETO</label>
        <input style={C.input} placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} />

        <label style={C.label}>TELÉFONO</label>
        <input style={C.input} placeholder="Ej: 300 123 4567" value={phone} onChange={e => setPhone(e.target.value)} />

        <button style={C.btn} onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
