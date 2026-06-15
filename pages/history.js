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
  body: { position:'relative', zIndex:3, maxWidth:430, margin:'0 auto', padding:'16px 16px 0' },
  stats: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  statTile: { borderRadius:16, background:'#0E1B3A', padding:'14px 12px', boxShadow:'0 6px 18px rgba(0,0,0,.34)' },
  statNumber: { fontFamily:"'Bungee',sans-serif", fontSize:27, lineHeight:1, whiteSpace:'nowrap' },
  statLabel: { fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:700, color:'#7FA8D8', textTransform:'uppercase', letterSpacing:'.08em', marginTop:8 },
  sectionTitle: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:13, textTransform:'uppercase', margin:'18px 0 12px', letterSpacing:'.02em' },
  play: { color:'#FF6B3D', marginRight:7 },
  timeline: { position:'relative', paddingLeft:20 },
  flightLine: { position:'absolute', top:7, bottom:8, left:7, width:2, borderRadius:2, background:'repeating-linear-gradient(180deg, rgba(63,169,245,.5) 0 5px, transparent 5px 11px)' },
  row: { position:'relative', display:'grid', gridTemplateColumns:'46px 1fr auto', gap:11, alignItems:'center', borderRadius:16, background:'rgba(14,27,58,.72)', border:'1px solid rgba(127,168,216,.15)', padding:'11px 12px', marginBottom:10, boxShadow:'0 6px 18px rgba(0,0,0,.24)' },
  node: { position:'absolute', left:-18, top:'50%', transform:'translateY(-50%)', width:14, height:14, borderRadius:'50%', background:'#0A1228', border:'3px solid currentColor', boxShadow:'0 0 14px currentColor' },
  chip: { width:46, height:46, borderRadius:14, background:'#0A1228', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 0 0 0 1px rgba(255,255,255,.08)' },
  txTitle: { fontFamily:"'Fredoka',sans-serif", fontSize:15, fontWeight:800, color:'#FBEFC8', lineHeight:1.08 },
  txDate: { fontFamily:"'Nunito',sans-serif", fontSize:11, color:'#7FA8D8', marginTop:4, fontWeight:700 },
  delta: { fontFamily:"'Bungee',sans-serif", fontSize:13, whiteSpace:'nowrap', textAlign:'right' },
  empty: { textAlign:'center', color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:14, fontWeight:700, marginTop:48, lineHeight:1.45 },
}

function HeaderRocketIcon() {
  return <svg width="29" height="29" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M18.5 5.5c3-3 6.7-2.8 7.2-2.7.1.5.3 4.2-2.7 7.2l-8.1 8.1-4.5-4.5 8.1-8.1Z" fill="#3FA9F5" stroke="#FBEFC8" strokeWidth="1.7" strokeLinejoin="round"/><path d="m12.5 12.1-5.2 1 3-4.8M18.9 18.5l-1 5.2 4.8-3M9 22.5l-4 4" stroke="#FF6B3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="21.2" cy="7.8" r="1.6" fill="#FFD84D"/></svg>
}

function RocketEntryIcon() {
  return <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M23 7c4.2-4.2 9.5-4 10.2-3.8.2.7.4 6-3.8 10.2L19 23.8 12.6 17 23 7Z" fill="#3FA9F5" stroke="#FBEFC8" strokeWidth="1.8" strokeLinejoin="round"/><path d="m16 15.2-7 1.5 4.2-6.6M25.5 24.5 24 31.5l6.6-4.2" stroke="#3FA9F5" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/><circle cx="27.8" cy="9.7" r="2.2" fill="#FFD84D"/><path d="M13 25.5 7.5 31M16.5 28l-3.2 3.2" stroke="#FF6B3D" strokeWidth="2.2" strokeLinecap="round"/></svg>
}

function CoinGiftIcon() {
  return <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="15" cy="18" r="9" fill="#FFD84D" stroke="#FBEFC8" strokeWidth="1.6"/><path d="m15 12.2 1.4 2.9 3.2.5-2.3 2.3.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.3 3.2-.5 1.4-2.9Z" fill="#0E1B3A"/><path d="M20 20h11v12H20V20Z" fill="#3FA9F5" stroke="#FBEFC8" strokeWidth="1.5"/><path d="M18.5 16h14v6h-14v-6Z" fill="#FF6B3D" stroke="#FBEFC8" strokeWidth="1.5"/><path d="M24.5 16v16M20 23h11" stroke="#FFD84D" strokeWidth="1.7"/></svg>
}

function TrophyEntryIcon() {
  return <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M14 7h12v6c0 5-2.4 8.4-6 8.4S14 18 14 13V7Z" fill="#FFD84D" stroke="#FBEFC8" strokeWidth="1.7"/><path d="M14 9H9.8c0 5 2.1 7.8 6.1 8M26 9h4.2c0 5-2.1 7.8-6.1 8M20 21.4v5M14.5 32h11M16.5 27h7" stroke="#FFD84D" strokeWidth="2" strokeLinecap="round"/><path d="m20 11 1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3 1-2Z" fill="#0E1B3A"/></svg>
}

function TagEntryIcon() {
  return <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M7 12.5 21 7l12 12-13.5 13.5-12-12V12.5Z" fill="#FF6B3D" stroke="#FBEFC8" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="15" cy="15" r="2.4" fill="#FBEFC8"/><path d="M16 25 25 16M17 17.5h.01M24 23.5h.01" stroke="#FBEFC8" strokeWidth="2.3" strokeLinecap="round"/><path d="m30 7 .8 1.7 1.9.2-1.4 1.3.4 1.9-1.7-.9-1.7.9.4-1.9-1.4-1.3 1.9-.2L30 7Z" fill="#FFD84D"/></svg>
}

function GiftBoxEntryIcon() {
  return <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M8 17h24v17H8V17Z" fill="#3FA9F5" stroke="#FBEFC8" strokeWidth="1.7"/><path d="M6.5 12h27v7H6.5v-7Z" fill="#8B7FE0" stroke="#FBEFC8" strokeWidth="1.7"/><path d="M18 12c-5-1-6.2-6.2-2.8-7.1 2.7-.7 4.4 3.2 4.8 7.1M22 12c5-1 6.2-6.2 2.8-7.1-2.7-.7-4.4 3.2-4.8 7.1" stroke="#BDF24A" strokeWidth="2" strokeLinecap="round"/><path d="M18 12h4v22h-4z" fill="#FFD84D"/></svg>
}

function CometEntryIcon() {
  return <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M19 16C14.7 17 10.2 19.5 5.5 23.6" stroke="#8B7FE0" strokeWidth="4" strokeLinecap="round"/><path d="M20.6 20.2c-3.6 1.3-7.1 3.7-10.5 7.1" stroke="#3FA9F5" strokeWidth="3" strokeLinecap="round"/><path d="m27.2 6.2 2.4 5 5.5.8-4 3.9 1 5.5-4.9-2.6-4.9 2.6 1-5.5-4-3.9 5.5-.8 2.4-5Z" fill="#FBEFC8" stroke="#FFD84D" strokeWidth="1.6"/><path d="m11.2 28.4.7 1.4 1.5.2-1.1 1 .3 1.6-1.4-.8-1.4.8.3-1.6-1.1-1 1.5-.2.7-1.4Z" fill="#BDF24A"/></svg>
}

function formatPoints(value) {
  return Math.abs(value).toLocaleString('es-CO')
}

function formatDate(date) {
  const value = new Date(date)
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${value.getDate()} ${months[value.getMonth()]} ${value.getFullYear()}`
}

function getEntryIcon(description, isSpend) {
  const desc = (description || '').toLowerCase()
  if (desc.includes('envío') || desc.includes('envio')) return <RocketEntryIcon />
  if (desc.includes('descuento') || desc.includes('canje')) return <TagEntryIcon />
  if (desc.includes('bienven')) return <GiftBoxEntryIcon />
  if (desc.includes('misión') || desc.includes('mision')) return <TrophyEntryIcon />
  if (desc.includes('reseña') || desc.includes('resena')) return <CometEntryIcon />
  if (isSpend) return <TagEntryIcon />
  return <CoinGiftIcon />
}

export default function History() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setTransactions(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const earned = transactions.filter(tx => tx.points_change > 0).reduce((sum, tx) => sum + tx.points_change, 0)
  const spent = Math.abs(transactions.filter(tx => tx.points_change < 0).reduce((sum, tx) => sum + tx.points_change, 0))

  return (
    <div style={C.page}>
      <div className="history-nebula" style={{ ...C.nebula, left:-82, top:72, background:'rgba(63,169,245,.7)' }} />
      <div className="history-nebula" style={{ ...C.nebula, right:-92, top:170, background:'rgba(255,107,61,.5)' }} />
      <div className="history-nebula" style={{ ...C.nebula, left:'28%', bottom:96, background:'rgba(251,239,200,.16)' }} />
      {STARS.map((star, i) => (
        <span
          key={i}
          className="history-star"
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
            <HeaderRocketIcon />
            <h1 style={C.title}>Historial</h1>
          </div>
          <p style={C.subtitle}>Tu bitácora por el RAV Universo</p>
        </div>
      </header>

      <main style={C.body}>
        <section style={C.stats}>
          <article style={{ ...C.statTile, border:'2px solid #2EE6A0', boxShadow:'0 0 0 3px rgba(46,230,160,.12), 0 6px 18px rgba(0,0,0,.34), 0 0 18px rgba(46,230,160,.20)' }}>
            <p style={{ ...C.statNumber, color:'#2EE6A0' }}>+{earned.toLocaleString('es-CO')}</p>
            <p style={C.statLabel}>Ganadas</p>
          </article>
          <article style={{ ...C.statTile, border:'2px solid #FF6B3D', boxShadow:'0 0 0 3px rgba(255,107,61,.12), 0 6px 18px rgba(0,0,0,.34), 0 0 18px rgba(255,107,61,.20)' }}>
            <p style={{ ...C.statNumber, color:'#FF8A5B' }}>-{spent.toLocaleString('es-CO')}</p>
            <p style={C.statLabel}>Canjeadas</p>
          </article>
        </section>

        <p style={C.sectionTitle}><span style={C.play}>▸</span>Movimientos</p>

        {loading && <p style={C.empty}>Cargando bitácora...</p>}
        {!loading && transactions.length === 0 && (
          <p style={C.empty}>Aún no tienes movimientos.<br />Tu primera misión aparecerá aquí.</p>
        )}
        {!loading && transactions.length > 0 && (
          <section style={C.timeline}>
            <div style={C.flightLine} />
            {transactions.map((tx) => {
              const isSpend = tx.points_change < 0
              const accent = isSpend ? '#FF6B3D' : '#2EE6A0'
              return (
                <article key={tx.id || `${tx.created_at}-${tx.description}`} style={C.row}>
                  <span style={{ ...C.node, color:accent }} />
                  <div style={C.chip}>{getEntryIcon(tx.description, isSpend)}</div>
                  <div style={{ minWidth:0 }}>
                    <p style={C.txTitle}>{tx.description}</p>
                    <p style={C.txDate}>
                      {formatDate(tx.created_at)}
                      {tx.amount > 0 && ` · $${tx.amount.toLocaleString('es-CO')}`}
                    </p>
                  </div>
                  <p style={{ ...C.delta, color:isSpend ? '#FF8A5B' : '#2EE6A0' }}>
                    {isSpend ? '-' : '+'}{formatPoints(tx.points_change)} ★
                  </p>
                </article>
              )
            })}
          </section>
        )}
      </main>

      <Navbar active="history" />

      <style jsx global>{`
        @keyframes history-twinkle {
          0%, 100% { opacity: .32; transform: scale(.85); }
          50% { opacity: 1; transform: scale(1.35); }
        }
        .history-star { animation-name: history-twinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @media (max-width: 360px) {
          header h1 { font-size: 21px !important; }
          article p { word-break: normal; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, .history-star { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  )
}
