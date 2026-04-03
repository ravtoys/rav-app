import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const C = {
  page: { minHeight:'100vh', background:'#080618', paddingBottom:80 },
  header: { background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', padding:'20px 20px 24px' },
  row: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  greeting: { fontSize:12, color:'rgba(170,235,58,0.6)', fontWeight:700 },
  name: { fontFamily:"'Exo 2',sans-serif", fontSize:19, fontWeight:900, color:'white', marginTop:2 },
  avatar: { width:40, height:40, borderRadius:'50%', background:'#AAEB3A', border:'2px solid rgba(170,235,58,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:'#080618' },
  card: { background:'rgba(170,235,58,0.07)', border:'1px solid rgba(170,235,58,0.3)', borderRadius:18, padding:16 },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  cardLabel: { fontSize:10, color:'rgba(170,235,58,0.6)', fontWeight:800, letterSpacing:1 },
  badge: { fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:20, background:'rgba(43,63,191,0.6)', color:'#AAEB3A', border:'1px solid #2B3FBF' },
  points: { fontFamily:"'Exo 2',sans-serif", fontSize:44, fontWeight:900, color:'#AAEB3A', lineHeight:1 },
  pointsSub: { fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2 },
  barWrap: { marginTop:12, height:6, background:'rgba(255,255,255,0.1)', borderRadius:6, overflow:'hidden' },
  bar: { height:'100%', background:'#AAEB3A', borderRadius:6 },
  barInfo: { display:'flex', justifyContent:'space-between', marginTop:5 },
  barLeft: { fontSize:10, color:'rgba(170,235,58,0.5)' },
  barRight: { fontSize:10, color:'rgba(255,255,255,0.4)' },
  body: { padding:'0 16px' },
  sectionTitle: { fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.35)', margin:'16px 0 8px', letterSpacing:1 },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 },
  gridCard: { background:'rgba(170,235,58,0.07)', border:'1px solid rgba(170,235,58,0.2)', borderRadius:14, padding:14, cursor:'pointer' },
  gridCardDim: { background:'rgba(43,63,191,0.1)', border:'1px solid rgba(43,63,191,0.25)', borderRadius:14, padding:14 },
  gridIcon: { fontSize:22, marginBottom:6 },
  gridTitle: { fontSize:13, fontWeight:800, color:'white' },
  gridSub: { fontSize:10, color:'rgba(170,235,58,0.6)', marginTop:2 },
  gridSubDim: { fontSize:10, color:'rgba(43,63,191,0.8)', marginTop:2 },
  actCard: { background:'rgba(170,235,58,0.05)', border:'1px solid rgba(170,235,58,0.15)', borderRadius:14, padding:12, display:'flex', alignItems:'center', justifyContent:'space-between' },
  actLeft: { display:'flex', alignItems:'center', gap:10 },
  actIcon: { width:36, height:36, borderRadius:10, background:'rgba(43,63,191,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  actTitle: { fontSize:12, fontWeight:700, color:'white' },
  actDate: { fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 },
  actPts: { fontSize:13, fontWeight:800, color:'#AAEB3A' },
}

function getLevel(points) {
  if (points >= 2000) return 'Leyenda'
  if (points >= 500) return 'Aventurero'
  return 'Explorador'
}

function getNextLevel(points) {
  if (points >= 2000) return { label: '¡Nivel máximo! 🏆', pct: 100 }
  if (points >= 500) return { label: 'Próximo: Leyenda 🚀', pct: Math.round(((points - 500) / 1500) * 100) }
  return { label: 'Próximo: Aventurero ⭐', pct: Math.round((points / 500) * 100) }
}

export default function Home() {
  const [profile, setProfile] = useState(null)
  const [transactions, setTransactions] = useState([])
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
      setProfile(prof)
      setTransactions(txs || [])
    }
    load()
  }, [])

  if (!profile) return <div style={{ ...C.page, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'rgba(255,255,255,0.4)' }}>Cargando universo RAV...</p></div>

  const level = getLevel(profile.points)
  const nextLevel = getNextLevel(profile.points)
  const initials = (profile.full_name || 'R').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  return (
    <>
    <div style={C.page}>
      <div style={C.header}>
        <div style={C.row}>
          <div>
            <p style={C.greeting}>¡Bienvenido de vuelta,</p>
            <p style={C.name}>{profile.full_name || 'Explorador'} 👽</p>
          </div>
          <div style={C.avatar}>{initials}</div>
        </div>
        <div style={C.card}>
          <div style={C.cardTop}>
            <span style={C.cardLabel}>MIS ESTRELLAS RAV</span>
            <span style={C.badge}>⭐ {level}</span>
          </div>
          <p style={C.points}>{(profile.points || 0).toLocaleString()}</p>
          <p style={C.pointsSub}>estrellas acumuladas</p>
          <div style={C.barWrap}>
            <div style={{ ...C.bar, width: `${nextLevel.pct}%` }} />
          </div>
          <div style={C.barInfo}>
            <span style={C.barLeft}>{profile.points || 0} pts</span>
            <span style={C.barRight}>{nextLevel.label}</span>
          </div>
        </div>
      </div>

      <div style={C.body}>
        <p style={C.sectionTitle}>MISIONES</p>
        <div style={C.grid}>
          <div style={C.gridCard} onClick={() => router.push('/benefits')}>
            <div style={C.gridIcon}>🎁</div>
            <p style={C.gridTitle}>Beneficios</p>
            <p style={C.gridSub}>Canjea tus estrellas</p>
          </div>
          <div style={C.gridCard} onClick={() => router.push('/history')}>
            <div style={C.gridIcon}>🪐</div>
            <p style={C.gridTitle}>Historial</p>
            <p style={C.gridSub}>Mis misiones</p>
          </div>
          <div style={C.gridCardDim}>
            <div style={C.gridIcon}>✨</div>
            <p style={C.gridTitle}>Wishlist</p>
            <p style={C.gridSubDim}>Próximamente</p>
          </div>
          <div style={C.gridCardDim}>
            <div style={C.gridIcon}>🛸</div>
            <p style={C.gridTitle}>Tienda</p>
            <p style={C.gridSubDim}>Próximamente</p>
          </div>
        </div>

        {transactions.length > 0 && (
          <>
            <p style={C.sectionTitle}>ÚLTIMA ACTIVIDAD</p>
            <div style={C.actCard}>
              <div style={C.actLeft}>
                <div style={C.actIcon}>🧸</div>
                <div>
                  <p style={C.actTitle}>{transactions[0].description}</p>
                  <p style={C.actDate}>{new Date(transactions[0].created_at).toLocaleDateString('es-CO')}</p>
                </div>
              </div>
              <span style={C.actPts}>{transactions[0].points_change > 0 ? '+' : ''}{transactions[0].points_change} ⭐</span>
            </div>
          </>
        )}
      </div>
    </div>
    <Navbar active="home" />
    </>
  )
}