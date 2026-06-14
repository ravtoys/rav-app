import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const STARS = Array.from({ length: 78 }, (_, i) => {
  const x = (i * 37 + 11) % 100
  const y = (i * 53 + 7) % 100
  const size = 0.7 + ((i * 17) % 16) / 10
  const tone = i % 17 === 0 ? 'cream' : i % 7 === 0 ? 'blue' : 'white'
  const duration = 2.4 + ((i * 19) % 31) / 10
  const delay = ((i * 23) % 55) / 10
  return { x, y, size, tone, duration, delay }
})

const C = {
  page: {
    minHeight:'100vh',
    position:'relative',
    overflow:'hidden',
    background:'radial-gradient(120% 70% at 50% -6%, rgba(63,169,245,.30), transparent 55%), radial-gradient(95% 60% at 92% 8%, rgba(255,107,61,.22), transparent 52%), linear-gradient(180deg,#0E1B3A,#0A1228 52%,#060A18)',
    color:'#FBEFC8',
    paddingBottom:104,
  },
  nebula: { position:'absolute', width:230, height:230, borderRadius:'50%', filter:'blur(52px)', opacity:.42, zIndex:0 },
  star: { position:'absolute', borderRadius:'50%', zIndex:1, opacity:.78 },
  grain: {
    position:'fixed',
    inset:0,
    zIndex:2,
    pointerEvents:'none',
    opacity:.4,
    mixBlendMode:'overlay',
    backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27 viewBox=%270 0 160 160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.78%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27 opacity=%27.7%27/%3E%3C/svg%3E")',
    backgroundSize:'160px 160px',
  },
  header: {
    position:'relative',
    zIndex:3,
    padding:'58px 18px 18px',
    borderBottom:'2px solid #3FA9F5',
    background:'linear-gradient(135deg, rgba(108,96,184,.45), rgba(63,169,245,.16) 72%), #0C1530',
    boxShadow:'0 10px 28px rgba(0,0,0,.30)',
  },
  headerInner: { maxWidth:430, margin:'0 auto' },
  titleRow: { display:'flex', alignItems:'center', gap:10 },
  title: { fontFamily:"'Bungee',sans-serif", fontSize:23, fontWeight:400, color:'#FBEFC8', lineHeight:1.05, textShadow:'2px 2px 0 #FF6B3D', textTransform:'uppercase' },
  subtitle: { fontFamily:"'Fredoka',sans-serif", fontSize:13, color:'#7FA8D8', fontWeight:700, marginTop:8 },
  pts: { color:'#BDF24A', fontWeight:800 },
  body: { position:'relative', zIndex:3, maxWidth:430, margin:'0 auto', padding:'16px 16px 0' },
  sectionTitle: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:13, textTransform:'uppercase', margin:'16px 0 10px', letterSpacing:'.02em' },
  play: { color:'#FF6B3D', marginRight:7 },
  rewardCard: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, borderRadius:16, padding:12, marginBottom:11, background:'#0E1B3A', boxShadow:'0 6px 18px rgba(0,0,0,.34)' },
  rewardLeft: { display:'flex', alignItems:'center', gap:12, minWidth:0 },
  rewardChip: { width:56, height:56, borderRadius:16, background:'#0A1228', display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto', boxShadow:'inset 0 0 0 1px rgba(255,255,255,.08)' },
  rewardTitle: { fontFamily:"'Fredoka',sans-serif", fontSize:17, fontWeight:800, color:'#FBEFC8', lineHeight:1.05 },
  rewardSub: { fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:600, color:'#7FA8D8', marginTop:4 },
  rewardRight: { textAlign:'right', flex:'0 0 auto' },
  cost: { fontFamily:"'Bungee',sans-serif", fontSize:13, color:'#FFD84D', lineHeight:1 },
  claimBtn: { marginTop:8, border:'none', borderRadius:999, padding:'8px 13px 7px', background:'linear-gradient(160deg,#D6FF6E,#BDF24A 55%,#7FC916)', color:'#10240a', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:700, boxShadow:'0 8px 18px rgba(127,201,22,.28), inset 0 2px 0 rgba(255,255,255,.45)', cursor:'pointer' },
  lockedBtn: { marginTop:8, border:'1px solid rgba(127,168,216,.22)', borderRadius:999, padding:'8px 10px 7px', background:'rgba(10,18,40,.6)', color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:700 },
  levelCard: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, borderRadius:14, padding:'12px 13px', marginBottom:9, background:'#0E1B3A', border:'1px solid rgba(127,168,216,.16)' },
  levelCardActive: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, borderRadius:14, padding:'12px 13px', marginBottom:9, background:'linear-gradient(135deg, rgba(189,242,74,.14), rgba(14,27,58,.94))', border:'2px solid #BDF24A', boxShadow:'0 0 0 3px rgba(189,242,74,.12), 0 0 20px rgba(189,242,74,.20)' },
  levelLeft: { display:'flex', alignItems:'center', gap:10 },
  levelGlyph: { width:34, height:34, borderRadius:12, background:'#0A1228', display:'flex', alignItems:'center', justifyContent:'center', color:'#FFD84D', boxShadow:'inset 0 0 0 1px currentColor' },
  levelName: { fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:800, color:'#FBEFC8' },
  levelNameActive: { fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:800, color:'#BDF24A' },
  levelRange: { fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:700, color:'#7FA8D8', textAlign:'right' },
  levelRangeActive: { fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, color:'#BDF24A', textAlign:'right' },
  overlay: { position:'fixed', inset:0, background:'rgba(5,8,18,0.84)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:9999, animation:'fadeIn .2s ease' },
  sheet: { width:'100%', maxWidth:480, background:'linear-gradient(180deg,#102448,#0A1730)', borderTop:'2px solid #3FA9F5', borderTopLeftRadius:24, borderTopRightRadius:24, padding:'28px 22px 112px', animation:'slideUp .3s cubic-bezier(0.16, 1, 0.3, 1)', position:'relative', boxShadow:'0 -18px 42px rgba(0,0,0,.42)' },
  sheetClose: { position:'absolute', top:14, right:18, width:32, height:32, borderRadius:16, border:'1px solid rgba(127,168,216,.22)', background:'rgba(10,18,40,.55)', color:'#7FA8D8', fontSize:20, cursor:'pointer', lineHeight:1 },
  sheetIcon: { width:70, height:70, borderRadius:20, background:'#0A1228', border:'1.5px solid #3FA9F5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px', color:'#3FA9F5', boxShadow:'0 0 20px rgba(63,169,245,.24), inset 0 0 0 1px rgba(255,255,255,.04)' },
  sheetTitle: { fontFamily:"'Bungee',sans-serif", fontSize:21, color:'#FBEFC8', textAlign:'center', marginBottom:7, textShadow:'2px 2px 0 #FF6B3D' },
  sheetSub: { fontFamily:"'Fredoka',sans-serif", fontSize:13, color:'#7FA8D8', textAlign:'center', marginBottom:20 },
  sheetCost: { textAlign:'center', fontSize:34, fontFamily:"'Bungee',sans-serif", fontWeight:400, color:'#FFD84D', lineHeight:1, marginBottom:5 },
  sheetCostLabel: { fontFamily:"'Fredoka',sans-serif", fontSize:11, color:'#7FA8D8', textAlign:'center', fontWeight:700, marginBottom:24, textTransform:'uppercase' },
  btnPrimary: { width:'100%', padding:'15px', borderRadius:999, border:'none', background:'linear-gradient(160deg,#D6FF6E,#BDF24A 55%,#7FC916)', color:'#10240a', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'Fredoka',sans-serif", marginBottom:10, boxShadow:'0 8px 20px rgba(127,201,22,.28), inset 0 2px 0 rgba(255,255,255,.45)' },
  btnGhost: { width:'100%', padding:'13px', borderRadius:999, border:'1px solid rgba(127,168,216,.24)', background:'transparent', color:'#7FA8D8', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Fredoka',sans-serif" },
  codeBox: { background:'rgba(251,239,200,.08)', border:'2px dashed #FBEFC8', borderRadius:16, padding:'18px 12px', textAlign:'center', marginBottom:14, cursor:'pointer', position:'relative' },
  codeText: { fontFamily:"'Bungee',sans-serif", fontSize:30, color:'#FBEFC8', letterSpacing:3, marginBottom:4 },
  codeHint: { fontFamily:"'Fredoka',sans-serif", fontSize:11, color:'#7FA8D8', fontWeight:700 },
  expiryNote: { fontSize:11, color:'#7FA8D8', textAlign:'center', marginBottom:18, lineHeight:1.5 },
  copiedToast: { position:'absolute', top:8, right:8, background:'#BDF24A', color:'#10240a', fontSize:9, fontWeight:900, padding:'3px 7px', borderRadius:6 },
}

function TrophyGlyph({ size = 28 }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M11 5h10v5c0 4-2 7-5 7s-5-3-5-7V5Z" fill="#FFD84D" stroke="#FBEFC8" strokeWidth="1.6"/><path d="M11 7H7.2c0 4.2 1.8 6.6 5.2 6.8M21 7h3.8c0 4.2-1.8 6.6-5.2 6.8M16 17v4M11.8 26h8.4M13 22h6" stroke="#FFD84D" strokeWidth="1.8" strokeLinecap="round"/><path d="m16 8.5.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3.8-1.6Z" fill="#0E1B3A"/></svg>
}

function TagRewardIcon() {
  return <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M7 12.5 21 7l12 12-13.5 13.5-12-12V12.5Z" fill="#FF6B3D" stroke="#FBEFC8" strokeWidth="1.7" strokeLinejoin="round"/><path d="M12 14.5 21.5 11" stroke="#FFD84D" strokeWidth="2" strokeLinecap="round" opacity=".75"/><circle cx="15" cy="15" r="2.4" fill="#FBEFC8"/><path d="M16 25 25 16M17 17.5h.01M24 23.5h.01" stroke="#FBEFC8" strokeWidth="2.3" strokeLinecap="round"/><path d="m30 7 .8 1.7 1.9.2-1.4 1.3.4 1.9-1.7-.9-1.7.9.4-1.9-1.4-1.3 1.9-.2L30 7Z" fill="#FFD84D"/></svg>
}

function RocketRewardIcon() {
  return <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M22 7c4.2-4.2 9.5-4 10.2-3.8.2.7.4 6-3.8 10.2L18 23.8 11.6 17 22 7Z" fill="#3FA9F5" stroke="#FBEFC8" strokeWidth="1.8" strokeLinejoin="round"/><path d="m15 15.2-7 1.5 4.2-6.6M24.5 24.5 23 31.5l6.6-4.2" stroke="#3FA9F5" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/><circle cx="26.8" cy="9.7" r="2.2" fill="#FFD84D"/><path d="M12 25.5 6.5 31M9 22.5 5.5 26M15.5 28l-3.2 3.2" stroke="#FF6B3D" strokeWidth="2.2" strokeLinecap="round"/><path d="M18.2 23.6c-1.2 4.3-3.6 6.6-7.4 7.3.7-3.8 3-6.2 7.3-7.4" fill="#FFD84D" opacity=".75"/></svg>
}

function GiftRewardIcon() {
  return <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M8 17h24v17H8V17Z" fill="#3FA9F5" stroke="#FBEFC8" strokeWidth="1.7" strokeLinejoin="round"/><path d="M6.5 12h27v7H6.5v-7Z" fill="#8B7FE0" stroke="#FBEFC8" strokeWidth="1.7" strokeLinejoin="round"/><path d="M18 12c-5-1-6.2-6.2-2.8-7.1 2.7-.7 4.4 3.2 4.8 7.1M22 12c5-1 6.2-6.2 2.8-7.1-2.7-.7-4.4 3.2-4.8 7.1" stroke="#BDF24A" strokeWidth="2" strokeLinecap="round"/><path d="M18 12h4v22h-4z" fill="#FFD84D"/><path d="m31 4 .8 1.7 1.9.2-1.4 1.3.4 1.9-1.7-.9-1.7.9.4-1.9-1.4-1.3 1.9-.2L31 4Z" fill="#FFD84D"/></svg>
}

function RocketLevelIcon() {
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.5 5.5c2.1-2.1 4.7-2 5-2 .1.3.1 2.9-2 5l-5.9 5.9-3-3 5.9-5.9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M7.2 16.8 4.8 19.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
}

function StarLevelIcon() {
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 3.5Z" fill="currentColor" opacity=".82"/></svg>
}

const BENEFITS = [
  { icon:<TagRewardIcon />, title:'10% de descuento', sub:'En tu próxima compra', cost:500, color:'#3FA9F5' },
  { icon:<RocketRewardIcon />, title:'Envío gratis', sub:'En compra online', cost:300, color:'#FF6B3D' },
  { icon:<GiftRewardIcon />, title:'Regalo sorpresa', sub:'Juguete pequeño', cost:1000, color:'#8B7FE0' },
]

const LEVELS = [
  { icon:<RocketLevelIcon />, name:'Explorador', range:'0 – 499 ★' },
  { icon:<StarLevelIcon />, name:'Aventurero', range:'500 – 1.999 ★' },
  { icon:<TrophyGlyph size={23} />, name:'Leyenda', range:'2.000+ ★' },
]

export default function Benefits() {
  const [points, setPoints] = useState(0)
  const [busy, setBusy] = useState(false)
  const [modalState, setModalState] = useState(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('points').eq('id', user.id).single()
      if (data) setPoints(data.points || 0)
    }
    load()
  }, [router])

  const getLevel = (p) => {
    if (p >= 2000) return 'Leyenda'
    if (p >= 500) return 'Aventurero'
    return 'Explorador'
  }

  const openConfirm = (benefit) => {
    if (points < benefit.cost) return
    setModalState({ mode: 'confirm', benefit })
  }

  const closeModal = () => {
    setModalState(null)
    setCopied(false)
  }

  const confirmRedeem = async () => {
    if (busy || !modalState) return
    const benefit = modalState.benefit
    setBusy(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prizeName: benefit.title }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al canjear')

      setPoints(data.points)
      setModalState({ mode: 'success', benefit, code: data.code })
    } catch (err) {
      window.alert('Error al canjear. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const copyCode = async () => {
    if (!modalState?.code) return
    try {
      await navigator.clipboard.writeText(modalState.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {}
  }

  const currentLevel = getLevel(points)

  return (
    <div style={C.page}>
      <div className="benefits-nebula" style={{ ...C.nebula, left:-82, top:72, background:'rgba(63,169,245,.7)' }} />
      <div className="benefits-nebula" style={{ ...C.nebula, right:-92, top:170, background:'rgba(255,107,61,.5)' }} />
      <div className="benefits-nebula" style={{ ...C.nebula, left:'28%', bottom:96, background:'rgba(251,239,200,.16)' }} />
      {STARS.map((star, i) => (
        <span
          key={i}
          className="benefit-star"
          style={{
            ...C.star,
            left:`${star.x}%`,
            top:`${star.y}%`,
            width:star.size,
            height:star.size,
            background: star.tone === 'blue' ? '#3FA9F5' : star.tone === 'cream' ? '#FBEFC8' : '#FFFFFF',
            boxShadow: star.tone === 'white' ? 'none' : `0 0 10px ${star.tone === 'blue' ? '#3FA9F5' : '#FBEFC8'}`,
            animationDuration:`${star.duration}s`,
            animationDelay:`${star.delay}s`,
          }}
        />
      ))}
      <div style={C.grain} />

      <header style={C.header}>
        <div style={C.headerInner}>
          <div style={C.titleRow}>
            <TrophyGlyph />
            <h1 style={C.title}>Premios del universo</h1>
          </div>
          <p style={C.subtitle}>Tienes <span style={C.pts}>{points.toLocaleString('es-CO')} ★</span> disponibles</p>
        </div>
      </header>

      <main style={C.body}>
        <p style={C.sectionTitle}><span style={C.play}>▸</span>Disponibles para ti</p>
        {BENEFITS.map((benefit) => {
          const canClaim = points >= benefit.cost
          return (
            <article
              key={benefit.title}
              style={{ ...C.rewardCard, border:`2px solid ${benefit.color}`, opacity:canClaim ? 1 : .58, boxShadow:`0 0 0 3px ${benefit.color}18, 0 6px 18px rgba(0,0,0,.34), 0 0 18px ${benefit.color}22` }}
              onClick={canClaim ? () => openConfirm(benefit) : undefined}
            >
              <div style={C.rewardLeft}>
                <div style={C.rewardChip}>{benefit.icon}</div>
                <div style={{ minWidth:0 }}>
                  <p style={C.rewardTitle}>{benefit.title}</p>
                  <p style={C.rewardSub}>{benefit.sub}</p>
                </div>
              </div>
              <div style={C.rewardRight}>
                <p style={C.cost}>{benefit.cost} ★</p>
                {canClaim
                  ? <button style={C.claimBtn} onClick={(e) => { e.stopPropagation(); openConfirm(benefit) }}>Canjear</button>
                  : <button style={C.lockedBtn}>Faltan {(benefit.cost - points).toLocaleString('es-CO')} ★</button>
                }
              </div>
            </article>
          )
        })}

        <p style={C.sectionTitle}><span style={C.play}>▸</span>Niveles de la galaxia</p>
        {LEVELS.map((level) => {
          const isActive = currentLevel === level.name
          return (
            <article key={level.name} style={isActive ? C.levelCardActive : C.levelCard}>
              <div style={C.levelLeft}>
                <div style={{ ...C.levelGlyph, color:isActive ? '#BDF24A' : '#FFD84D' }}>{level.icon}</div>
                <p style={isActive ? C.levelNameActive : C.levelName}>{level.name}</p>
              </div>
              <p style={isActive ? C.levelRangeActive : C.levelRange}>{isActive ? 'Tu nivel actual' : level.range}</p>
            </article>
          )
        })}
      </main>

      {modalState && (
        <div style={C.overlay} onClick={closeModal}>
          <div style={C.sheet} onClick={(e) => e.stopPropagation()}>
            <button style={C.sheetClose} onClick={closeModal}>×</button>
            <div style={C.sheetIcon}>{modalState.mode === 'success' ? <TrophyGlyph size={40} /> : modalState.benefit.icon}</div>
            {modalState.mode === 'confirm' && (
              <>
                <p style={C.sheetTitle}>{modalState.benefit.title}</p>
                <p style={C.sheetSub}>{modalState.benefit.sub}</p>
                <p style={C.sheetCost}>{modalState.benefit.cost} ★</p>
                <p style={C.sheetCostLabel}>Se descontarán de tu saldo</p>
                <button style={C.btnPrimary} onClick={confirmRedeem} disabled={busy}>
                  {busy ? 'Procesando...' : 'Confirmar canje'}
                </button>
                <button style={C.btnGhost} onClick={closeModal}>Cancelar</button>
              </>
            )}
            {modalState.mode === 'success' && (
              <>
                <p style={C.sheetTitle}>Canjeado</p>
                <p style={C.sheetSub}>Toca el código para copiarlo</p>
                <div style={C.codeBox} onClick={copyCode}>
                  {copied && <span style={C.copiedToast}>COPIADO</span>}
                  <p style={C.codeText}>{modalState.code}</p>
                  <p style={C.codeHint}>{modalState.benefit.title}</p>
                </div>
                <p style={C.expiryNote}>Muéstralo en la tienda RAV o úsalo online.<br/>Vence en 30 días.</p>
                <button style={C.btnPrimary} onClick={closeModal}>Listo</button>
              </>
            )}
          </div>
        </div>
      )}

      <Navbar active="benefits" />

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes benefit-twinkle {
          0%, 100% { opacity: .32; transform: scale(.85); }
          50% { opacity: 1; transform: scale(1.35); }
        }
        .benefit-star { animation-name: benefit-twinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @media (max-width: 360px) {
          header h1 { font-size: 20px !important; }
          article button { padding-left: 9px !important; padding-right: 9px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, .benefit-star { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  )
}
