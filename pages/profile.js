import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const C = {
  page: { minHeight:'100vh', background:'#080618', paddingBottom:80 },
  header: { background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', padding:'20px 20px 24px', display:'flex', flexDirection:'column', alignItems:'center' },
  avatar: { width:70, height:70, borderRadius:'50%', background:'#AAEB3A', border:'3px solid rgba(170,235,58,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:900, color:'#080618', marginBottom:10 },
  name: { fontFamily:"'Exo 2',sans-serif", fontSize:17, fontWeight:900, color:'white' },
  email: { fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:3 },
  badge: { fontSize:11, fontWeight:800, padding:'4px 12px', borderRadius:20, background:'rgba(170,235,58,0.15)', color:'#AAEB3A', border:'1px solid rgba(170,235,58,0.4)', marginTop:10 },
  body: { padding:'14px 16px' },
  menuCard: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, overflow:'hidden', marginBottom:12 },
  menuItem: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px', borderBottom:'1px solid rgba(255,255,255,0.06)', cursor:'pointer' },
  menuItemLast: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px' },
  menuText: { fontSize:13, fontWeight:700, color:'white' },
  menuArrow: { fontSize:14, color:'rgba(170,235,58,0.6)' },
  dangerCard: { background:'rgba(200,30,30,0.08)', border:'1px solid rgba(255,80,80,0.15)', borderRadius:14, overflow:'hidden', marginBottom:12 },
  dangerText: { fontSize:13, fontWeight:700, color:'#ff6666' },
  foot: { fontSize:10, color:'rgba(255,255,255,0.2)', textAlign:'center', marginTop:8 },
}

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile({ ...data, email: user.email })
    }
    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getLevel = (p) => {
    if (p >= 2000) return 'Leyenda 🏆'
    if (p >= 500) return 'Aventurero ⭐'
    return 'Explorador 🌱'
  }

  if (!profile) return <div style={{ ...C.page, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'rgba(255,255,255,0.4)' }}>Cargando...</p></div>

  const initials = (profile.full_name || 'R').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div style={C.page}>
      <div style={C.header}>
        <div style={C.avatar}>{initials}</div>
        <p style={C.name}>{profile.full_name || 'RAV Explorer'}</p>
        <p style={C.email}>{profile.email}</p>
        <span style={C.badge}>{getLevel(profile.points || 0)} · {(profile.points || 0).toLocaleString()} ⭐</span>
      </div>

      <div style={C.body}>
        <div style={C.menuCard}>
          <div style={C.menuItem}>
            <span style={C.menuText}>Mis estrellas RAV</span>
            <span style={{ ...C.menuArrow, color:'#AAEB3A', fontWeight:800 }}>{(profile.points || 0).toLocaleString()} ⭐</span>
          </div>
          <div style={C.menuItem}>
            <span style={C.menuText}>Mi teléfono</span>
            <span style={C.menuArrow}>{profile.phone || 'No registrado'}</span>
          </div>
          <div style={{ ...C.menuItemLast }}>
            <span style={C.menuText}>Notificaciones</span>
            <span style={C.menuArrow}>›</span>
          </div>
        </div>

        <div style={C.dangerCard}>
          <div style={C.menuItemLast} onClick={handleLogout}>
            <span style={C.dangerText}>Cerrar sesión</span>
            <span style={{ color:'#ff6666', fontSize:14 }}>›</span>
          </div>
        </div>

        <p style={C.foot}>RAV Toys · RAV Club v1.0 · 🌌</p>
      </div>
      <Navbar active="profile" />
    </div>
  )
}