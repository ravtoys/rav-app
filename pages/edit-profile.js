import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const C = {
  page: { minHeight:'100vh', background:'#080618', fontFamily:"'Nunito',sans-serif", padding:'0 0 40px' },
  header: { background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', padding:'20px 20px 24px', display:'flex', alignItems:'center', gap:14 },
  backBtn: { background:'none', border:'none', color:'#AAEB3A', fontSize:22, cursor:'pointer', padding:0 },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:18, fontWeight:900, color:'white' },
  body: { padding:'24px 20px' },
  label: { fontSize:12, fontWeight:800, color:'rgba(170,235,58,0.6)', letterSpacing:1, marginBottom:8, display:'block' },
  input: { width:'100%', padding:'14px 16px', borderRadius:12, border:'1px solid rgba(170,235,58,0.3)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:15, outline:'none', marginBottom:20 },
  btn: { width:'100%', padding:'15px', borderRadius:14, border:'none', background:'#AAEB3A', color:'#080618', fontSize:16, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  success: { background:'rgba(170,235,58,0.15)', border:'1px solid #AAEB3A', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#AAEB3A', fontWeight:700, marginBottom:20 },
  err: { color:'#ff6666', fontSize:13, marginBottom:16 },
}

export default function EditProfile() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setName(data.full_name || '')
        setPhone(data.phone || '')
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!name) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({ full_name: name, phone }).eq('id', user.id)
    if (error) setError('Error al guardar. Intenta de nuevo.')
    else {
      setMsg('¡Perfil actualizado! ✅')
      setTimeout(() => router.push('/profile'), 1500)
    }
    setLoading(false)
  }

  return (
    <div style={C.page}>
      <div style={C.header}>
        <button style={C.backBtn} onClick={() => router.push('/profile')}>←</button>
        <p style={C.title}>Editar perfil</p>
      </div>
      <div style={C.body}>
        {msg && <div style={C.success}>{msg}</div>}
        {error && <p style={C.err}>{error}</p>}

        <label style={C.label}>NOMBRE COMPLETO</label>
        <input
          style={C.input}
          placeholder="Tu nombre"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label style={C.label}>TELÉFONO</label>
        <input
          style={C.input}
          placeholder="Ej: 300 123 4567"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <button style={C.btn} onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}