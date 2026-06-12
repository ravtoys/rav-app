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
  benefitCard: { background:'rgba(170,235,58,0.07)', border:'1px solid rgba(170,235,58,0.25)', borderRadius:14, padding:13, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, cursor:'pointer' },
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
  overlay: { position:'fixed', inset:0, background:'rgba(8,6,24,0.85)', backdropFilter:'blur(6px)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:9999, animation:'fadeIn 0.2s ease' },
  sheet: { width:'100%', maxWidth:480, background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', borderTop:'2px solid #AAEB3A', borderTopLeftRadius:24, borderTopRightRadius:24, padding:'28px 22px 110px', animation:'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)', position:'relative' },
  sheetClose: { position:'absolute', top:14, right:18, background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:22, cursor:'pointer', padding:0, lineHeight:1 },
  sheetIcon: { width:64, height:64, borderRadius:18, background:'rgba(170,235,58,0.15)', border:'1.5px solid #AAEB3A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 14px' },
  sheetTitle: { fontFamily:"'Exo 2',sans-serif", fontSize:20, fontWeight:900, color:'white', textAlign:'center', marginBottom:6 },
  sheetSub: { fontSize:13, color:'rgba(255,255,255,0.6)', textAlign:'center', marginBottom:20 },
  sheetCost: { textAlign:'center', fontSize:34, fontFamily:"'Exo 2',sans-serif", fontWeight:900, color:'#AAEB3A', lineHeight:1, marginBottom:4 },
  sheetCostLabel: { fontSize:11, color:'rgba(170,235,58,0.6)', textAlign:'center', fontWeight:700, marginBottom:24 },
  btnPrimary: { width:'100%', padding:'15px', borderRadius:14, border:'none', background:'#AAEB3A', color:'#080618', fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif", marginBottom:10 },
  btnGhost: { width:'100%', padding:'13px', borderRadius:14, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.7)', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  codeBox: { background:'rgba(170,235,58,0.1)', border:'2px dashed #AAEB3A', borderRadius:16, padding:'18px 12px', textAlign:'center', marginBottom:14, cursor:'pointer', position:'relative' },
  codeText: { fontFamily:"'Exo 2',sans-serif", fontSize:30, fontWeight:900, color:'#AAEB3A', letterSpacing:3, marginBottom:4 },
  codeHint: { fontSize:10, color:'rgba(170,235,58,0.6)', fontWeight:700 },
  expiryNote: { fontSize:11, color:'rgba(255,255,255,0.5)', textAlign:'center', marginBottom:18, lineHeight:1.5 },
  copiedToast: { position:'absolute', top:8, right:8, background:'#AAEB3A', color:'#080618', fontSize:9, fontWeight:900, padding:'3px 7px', borderRadius:6 },
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
  }, [])

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
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
      <div style={C.header}>
        <p style={C.title}>Premios del universo 🏆</p>
        <p style={C.sub}>Tienes <span style={C.pts}>{points.toLocaleString()} ⭐</span> disponibles</p>
      </div>
      <div style={C.body}>
        <p style={C.sectionTitle}>DISPONIBLES PARA TI</p>
        {BENEFITS.map((b, i) => {
          const canClaim = points >= b.cost
          return (
            <div
              key={i}
              style={canClaim ? C.benefitCard : C.benefitCardDim}
              onClick={canClaim ? () => openConfirm(b) : undefined}
            >
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
                  ? <button style={C.btnClaim} onClick={(e) => { e.stopPropagation(); openConfirm(b) }}>Canjear</button>
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

      {modalState && (
        <div style={C.overlay} onClick={closeModal}>
          <div style={C.sheet} onClick={(e) => e.stopPropagation()}>
            <button style={C.sheetClose} onClick={closeModal}>×</button>
            <div style={C.sheetIcon}>{modalState.mode === 'success' ? '🎉' : modalState.benefit.icon}</div>
            {modalState.mode === 'confirm' && (
              <>
                <p style={C.sheetTitle}>{modalState.benefit.title}</p>
                <p style={C.sheetSub}>{modalState.benefit.sub}</p>
                <p style={C.sheetCost}>{modalState.benefit.cost} ⭐</p>
                <p style={C.sheetCostLabel}>SE DESCONTARÁN DE TU SALDO</p>
                <button style={C.btnPrimary} onClick={confirmRedeem} disabled={busy}>
                  {busy ? 'Procesando...' : 'Confirmar canje'}
                </button>
                <button style={C.btnGhost} onClick={closeModal}>Cancelar</button>
              </>
            )}
            {modalState.mode === 'success' && (
              <>
                <p style={C.sheetTitle}>¡Canjeado!</p>
                <p style={C.sheetSub}>Toca el código para copiarlo</p>
                <div style={C.codeBox} onClick={copyCode}>
                  {copied && <span style={C.copiedToast}>COPIADO ✓</span>}
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
    </div>
  )
}
