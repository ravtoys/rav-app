import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const C = {
  page: { minHeight:'100vh', background:'#080618', paddingBottom:80 },
  header: { background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', padding:'20px 20px 16px' },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:20, fontWeight:900, color:'white' },
  sub: { fontSize:11, color:'rgba(170,235,58,0.6)', marginTop:4 },
  pts: { color:'#AAEB3A', fontWeight:800 },
  body: { padding:'14px 16px' },
  sectionTitle: { fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.35)', margin:'0 0 10px', letterSpacing:1 },
  benefitCard: { background:'rgba(170,235,58,0.07)', border:'1px solid rgba(170,235,58,0.25)', borderRadius:14, padding:13, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  benefitCardDim: { background:'rgba(43,63,191,0.1)', border:'1px solid rgba(43,63,191,0.25)', borderRadius:14, padding:13, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  benefitLeft: { display:'flex', alignItems:'center', gap:10 },
  benefitIcon: { width:42, height:42, borderRadius:12, background:'rgba(170,235,58,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 },
  benefitIconDim: { width:42, height:42, borderRadius:12, background:'rgba(43,63,191,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 },
  benefitTitle: { fontSize:13, fontWeight:800, color:'white' },
  benefitSub: { fontSize:10, color:'rgba(255,255,255,0.45)', marginTop:2 },
  benefitRight: { textAlign:'right' },
  benefitCost: { fontSize:12, fontWeight:800, color:'#AAEB3A' },
  benefitCostDim: { fontSize:12, fontWeight:800, color:'rgba(170,235,58,0.4)' },
  btnClaim: { fontSize:10, fontWeight:800, color:'#080618', background:'#AAEB3A', padding:'3px 10px', borderRadius:10, border:'none', marginTop:4, cursor:'pointer' },
  btnLocked: { fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', background:'rgba(43,63,191,0.2)', padding:'3px 10px', borderRadius:10, border:'none', marginTop:4 },
  levelSection: { marginTop:16 },
  levelCard: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
  levelCardActive: { background:'rgba(170,235,58,0.1)', border:'1.5px solid #AAEB3A', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
  levelName: { fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.5)' },
  levelNameActive: { fontSize:12, fontWeight:800, color:'#AAEB3A' },
  levelRange: { fontSize:10, color:'rgba(255,255,255,0.3)' },
  levelRangeActive: { fontSize:10, color:'#AAEB3A', fontWeight:700 },
}

const BENEFITS = [
  { icon:'🏷️', title:'10% de descuento', sub:'En tu próxima compra', cost:500 },
  { icon:'🚀', title:'Envío gratis', sub:'En compra online', cost:300 },
  { icon:'🧸', title:'Regalo sorpresa', sub:'Juguete pequeño', cost:1000 },
]

const LEVELS = [
  { icon:'🌱', name:'Explorador', range:'0 – 499 ⭐', min:0 },
  { icon:'⭐', name:'Aventurero', range:'500 – 1,999 ⭐', min:500 },
  { icon:'🏆', name:'Leyenda', range:'2,000+ ⭐', min:2000 },
]

export default function Benefits() {
  const [points, setPoints] = useState(0)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('points').eq('id', user.id).single()
      if (data) setPoints(data.points || 0)
    }
    load()
  }, [])

  const getLevel = (p) => {
    if (p >= 2000) return 'Leyenda'
    if (p >= 500) return 'Aventurero'
    return 'Explorador'
  }

  const handleClaim = async (benefit) => {
    if (points < benefit.cost) return
    const { data: { user } } = await supabase.auth.getUser()
    const newPoints = points - benefit.cost
    await supabase.from('profiles').update({ points: newPoints }).eq('id', user.id)
    await supabase.from('transactions').insert({ user_id: user.id, description: `Canje: ${benefit.title}`, amount: 0, points_change: -benefit.cost })
    setPoints(newPoints)
    setMsg(`¡Canjeaste "${benefit.title}"! Un asesor RAV te contactará pronto. 🎉`)
    setTimeout(() => setMsg(''), 5000)
  }

  const currentLevel = getLevel(points)

  return (
    <div style={C.page}>
      <div style={C.header}>
        <p style={C.title}>Premios del universo 🏆</p>
        <p style={C.sub}>Tienes <span style={C.pts}>{points.toLocaleString()} ⭐</span> disponibles</p>
      </div>

      <div style={C.body}>
        {msg && <div style={{ background:'rgba(170,235,58,0.15)', border:'1px solid #AAEB3A', borderRadius:12, padding:12, marginBottom:12, fontSize:13, color:'#AAEB3A', fontWeight:700 }}>{msg}</div>}

        <p style={C.sectionTitle}>DISPONIBLES PARA TI</p>
        {BENEFITS.map((b, i) => {
          const canClaim = points >= b.cost
          return (
            <div key={i} style={canClaim ? C.benefitCard : C.benefitCardDim}>
              <div style={C.benefitLeft}>
                <div style={canClaim ? C.benefitIcon : C.benefitIconDim}>{b.icon}</div>
                <div>
                  <p style={C.benefitTitle}>{b.title}</p>
                  <p style={C.benefitSub}>{b.sub}</p>
                </div>
              </div>
              <div style={C.benefitRight}>
                <p style={canClaim ? C.benefitCost : C.benefitCostDim}>{b.cost} ⭐</p>
                {canClaim
                  ? <button style={C.btnClaim} onClick={() => handleClaim(b)}>Canjear</button>
                  : <button style={C.btnLocked}>Faltan {b.cost - points} ⭐</button>
                }
              </div>
            </div>
          )
        })}

        <div style={C.levelSection}>
          <p style={C.sectionTitle}>NIVELES DE LA GALAXIA</p>
          {LEVELS.map((l, i) => {
            const isActive = currentLevel === l.name
            return (
              <div key={i} style={isActive ? C.levelCardActive : C.levelCard}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16 }}>{l.icon}</span>
                  <span style={isActive ? C.levelNameActive : C.levelName}>{l.name}</span>
                </div>
                <span style={isActive ? C.levelRangeActive : C.levelRange}>{isActive ? 'Tu nivel actual' : l.range}</span>
              </div>
            )
          })}
        </div>
      </div>
      <Navbar active="benefits" />
    </div>
  )
}