import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

const TONES = ['#BDF24A', '#3FA9F5', '#FF6B3D', '#8B7FE0', '#FFD84D']

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
  nebula: { position:'absolute', width:230, height:230, borderRadius:'50%', filter:'blur(52px)', opacity:.42, zIndex:0 },
  stars: { position:'absolute', inset:0, zIndex:0, pointerEvents:'none' },
  star: { position:'absolute', borderRadius:'50%' },
  header: { position:'relative', zIndex:2, padding:'58px 18px 20px', background:'linear-gradient(135deg, rgba(108,96,184,.45), rgba(63,169,245,.16) 72%), #0C1530', borderBottom:'2px solid #3FA9F5', boxShadow:'0 10px 22px rgba(0,0,0,.26)' },
  wrap: { position:'relative', zIndex:2, width:'100%', maxWidth:430, margin:'0 auto' },
  titleRow: { display:'flex', alignItems:'center', gap:10 },
  title: { fontFamily:"'Bungee',sans-serif", fontSize:23, lineHeight:1.05, color:'#FBEFC8', textTransform:'uppercase', textShadow:'2px 2px 0 #FF6B3D' },
  sub: { fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:600, color:'#7FA8D8', marginTop:7, lineHeight:1.35 },
  owner: { marginTop:15, display:'flex', alignItems:'center', gap:10 },
  avatar: { width:46, height:46, borderRadius:'50%', border:'2px solid #FF6B3D', background:'#0A1228', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', color:'#FBEFC8', fontFamily:"'Bungee',sans-serif", boxShadow:'0 0 18px rgba(255,107,61,.34)' },
  avatarImg: { width:'100%', height:'100%', objectFit:'cover' },
  ownerLabel: { fontFamily:"'Fredoka',sans-serif", color:'#7FA8D8', fontSize:11, fontWeight:800, textTransform:'uppercase' },
  ownerName: { fontFamily:"'Fredoka',sans-serif", color:'#FBEFC8', fontSize:16, fontWeight:800, marginTop:1 },
  body: { position:'relative', zIndex:2, width:'100%', maxWidth:430, margin:'0 auto', padding:'16px 14px 28px' },
  notice: { border:'1.5px solid rgba(189,242,74,.28)', background:'rgba(189,242,74,.08)', borderRadius:18, padding:13, fontFamily:"'Fredoka',sans-serif", color:'#BDF24A', fontSize:13, fontWeight:800, lineHeight:1.35, marginBottom:14 },
  filters: { display:'flex', gap:8, overflowX:'auto', padding:'0 1px 13px', scrollbarWidth:'none' },
  filterPill: { border:'1px solid rgba(127,168,216,.3)', borderRadius:999, padding:'8px 11px', background:'rgba(10,18,40,.62)', color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, whiteSpace:'nowrap' },
  filterActive: { border:'1px solid #BDF24A', background:'#BDF24A', color:'#10240A', boxShadow:'0 0 16px rgba(189,242,74,.35)' },
  sectionTitle: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:13, textTransform:'uppercase', margin:'3px 0 12px', letterSpacing:'.02em' },
  play: { color:'#FF6B3D', marginRight:7 },
  card: { position:'relative', overflow:'hidden', display:'grid', gridTemplateColumns:'104px 1fr', gap:12, borderRadius:18, padding:12, marginBottom:12, background:'linear-gradient(145deg, rgba(14,27,58,.96), rgba(10,18,40,.96))', border:'1.5px solid var(--accent)', boxShadow:'0 13px 28px rgba(0,0,0,.34), 0 0 18px var(--soft)' },
  foil: { position:'absolute', inset:-20, background:'linear-gradient(115deg, transparent 0 34%, rgba(63,169,245,.18) 42%, rgba(189,242,74,.16) 50%, rgba(255,107,61,.14) 58%, transparent 68%)', backgroundSize:'280% 100%', mixBlendMode:'screen', opacity:.5, pointerEvents:'none', animation:'foil-sweep 5.5s ease-in-out infinite alternate' },
  photoWrap: { position:'relative', zIndex:2, width:104, height:104, borderRadius:16, overflow:'hidden', background:'#0A1228', border:'1px solid rgba(251,239,200,.16)' },
  photo: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  fallback: { width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#BDF24A', background:'radial-gradient(circle at 50% 35%, rgba(189,242,74,.22), rgba(10,18,40,.88))' },
  stamp: { position:'absolute', left:9, bottom:9, transform:'rotate(-7deg)', border:'2px solid currentColor', borderRadius:5, padding:'3px 6px 2px', fontFamily:"'Bungee',sans-serif", fontSize:9, lineHeight:1, background:'rgba(6,10,24,.62)', textTransform:'uppercase' },
  info: { position:'relative', zIndex:2, minWidth:0 },
  toyTitle: { fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:800, color:'#FBEFC8', lineHeight:1.12 },
  recipient: { fontFamily:"'Fredoka',sans-serif", color:'var(--accent)', fontSize:12, fontWeight:800, marginTop:5 },
  price: { display:'inline-flex', marginTop:10, minHeight:30, padding:'6px 11px 5px 16px', borderRadius:'8px 10px 10px 8px', background:'#FF6B3D', color:'#FBEFC8', fontFamily:"'Bungee',sans-serif", fontSize:13, boxShadow:'3px 3px 0 rgba(0,0,0,.2)' },
  pending: { display:'flex', alignItems:'center', gap:7, color:'#9FD8FF', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:700, lineHeight:1.25, marginTop:10 },
  dot: { width:8, height:8, borderRadius:'50%', background:'#3FA9F5', boxShadow:'0 0 12px rgba(63,169,245,.9)', flex:'0 0 auto', animation:'pulse-dot 1.3s ease-in-out infinite' },
  actions: { gridColumn:'1 / -1', position:'relative', zIndex:2, display:'grid', gap:8 },
  buyBtn: { minHeight:46, border:0, borderRadius:15, background:'linear-gradient(160deg,#D6FF6E,#BDF24A 55%,#7FC916)', color:'#10240A', fontFamily:"'Fredoka',sans-serif", fontSize:14, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:8, textDecoration:'none', boxShadow:'0 10px 20px rgba(127,201,22,.28), inset 0 2px 0 rgba(255,255,255,.5)' },
  boughtBtn: { minHeight:44, border:'1.5px solid rgba(255,216,77,.55)', borderRadius:15, background:'rgba(255,216,77,.11)', color:'#FFD84D', fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  boughtBtnBusy: { opacity:.62, cursor:'wait' },
  disabledBtn: { gridColumn:'1 / -1', position:'relative', zIndex:2, minHeight:46, border:'1px solid rgba(127,168,216,.28)', borderRadius:15, background:'rgba(127,168,216,.12)', color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' },
  inlineMessage: { margin:'0 0 12px', padding:'10px 12px', borderRadius:14, background:'rgba(255,216,77,.11)', border:'1px solid rgba(255,216,77,.32)', color:'#FFD84D', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, lineHeight:1.3 },
  empty: { textAlign:'center', padding:'38px 18px', color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:13, lineHeight:1.45, border:'1px dashed rgba(127,168,216,.35)', borderRadius:18, background:'rgba(14,27,58,.58)' },
  error: { minHeight:'100vh', background:'#060A18', color:'#7FA8D8', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24, fontFamily:"'Fredoka',sans-serif" },
}

const STARS = Array.from({ length: 70 }, (_, i) => {
  const tone = i % 17 === 0 ? '#FFD84D' : i % 7 === 0 ? '#BDF24A' : '#EAF0FF'
  return {
    x: (i * 37 + 11) % 100,
    y: (i * 53 + 7) % 100,
    size: 0.7 + ((i * 17) % 16) / 10,
    tone,
    opacity: .25 + ((i * 13) % 60) / 100,
  }
})

function ShootingStarIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M18 16C13.6 16.7 9.1 18.9 4.5 22.8" stroke="#8B7FE0" strokeWidth="4" strokeLinecap="round"/>
      <path d="M20.2 20.1c-3.6 1.1-7 3.2-10.2 6.5" stroke="#3FA9F5" strokeWidth="3" strokeLinecap="round"/>
      <path d="M15.2 12.2c-3.4.1-6.5.9-9.2 2.5" stroke="#BDF24A" strokeWidth="2" strokeLinecap="round"/>
      <path d="m27.2 6.2 2.4 5 5.5.8-4 3.9 1 5.5-4.9-2.6-4.9 2.6 1-5.5-4-3.9 5.5-.8 2.4-5Z" fill="#FBEFC8" stroke="#FFD84D" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  )
}

function GiftIcon({ size = 34, color = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 10h14v10H5V10Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 10v10M5 14h14M8.5 10C6.8 8.7 6.7 6 8.7 6c1.7 0 2.6 2 3.3 4 .7-2 1.6-4 3.3-4 2 0 1.9 2.7.2 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return Number(price).toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 })
}

function getInitials(name) {
  return (name || 'RAV').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function PublicWishlist() {
  const router = useRouter()
  const { token } = router.query
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [markingId, setMarkingId] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    if (!token) return
    const load = async () => {
      setLoading(true)
      const res = await fetch(`/api/public-wishlist/${token}`)
      const json = await res.json()
      if (!res.ok) setError('Esta Wishlist no está disponible.')
      else setData(json)
      setLoading(false)
    }
    load()
  }, [token])

  const visibleItems = useMemo(() => {
    const items = data?.items || []
    if (filter === 'all') return items
    if (filter === 'general') return items.filter(item => !item.child_id)
    return items.filter(item => item.child_id === filter)
  }, [data, filter])

  const markPurchased = async (item) => {
    if (!token || markingId) return
    const ok = window.confirm(`¿Marcar "${item.title}" como comprado?`)
    if (!ok) return

    setMarkingId(item.id)
    setActionMessage('')

    try {
      const res = await fetch('/api/public-wishlist/mark-purchased', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ token:String(token), itemId:item.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No pudimos marcarlo como comprado.')

      setData(current => ({
        ...current,
        items:(current?.items || []).map(existing => existing.id === item.id ? { ...existing, status:'purchased' } : existing),
      }))
      setActionMessage('Listo. Este regalo quedó marcado como comprado.')
    } catch (err) {
      setActionMessage(err.message || 'No pudimos marcarlo como comprado.')
    } finally {
      setMarkingId('')
    }
  }

  if (loading) return <div style={C.error}>Cargando Wishlist RAV...</div>
  if (error || !data) return <div style={C.error}>{error || 'Wishlist no encontrada.'}</div>

  return (
    <div style={C.page}>
      <div style={C.stars}>
        {STARS.map((star, i) => <span key={i} style={{ ...C.star, left:`${star.x}%`, top:`${star.y}%`, width:star.size, height:star.size, background:star.tone, opacity:star.opacity, boxShadow:star.tone === '#EAF0FF' ? 'none' : `0 0 8px ${star.tone}` }} />)}
      </div>
      <span style={{ ...C.nebula, left:-90, top:80, background:'rgba(63,169,245,.7)' }} />
      <span style={{ ...C.nebula, right:-110, top:120, background:'rgba(255,107,61,.5)' }} />
      <span style={C.grain} />

      <header style={C.header}>
        <div style={C.wrap}>
          <div style={C.titleRow}>
            <ShootingStarIcon />
            <p style={C.title}>Wishlist RAV</p>
          </div>
          <p style={C.sub}>Elige un juguete de esta lista mágica y cómpralo directamente en RAV Toys.</p>
          <div style={C.owner}>
            <span style={C.avatar}>{data.owner.avatar_url ? <img src={data.owner.avatar_url} alt={data.owner.name} style={C.avatarImg} /> : getInitials(data.owner.name)}</span>
            <span>
              <p style={C.ownerLabel}>Lista de</p>
              <p style={C.ownerName}>{data.owner.name}</p>
            </span>
          </div>
        </div>
      </header>

      <main style={C.body}>
        <p style={C.notice}>Cuando compres un regalo, toca “Ya lo compré” para evitar duplicados. La compra se completa en ravtoys.com o en tienda.</p>
        {actionMessage ? <p style={C.inlineMessage}>{actionMessage}</p> : null}

        <div style={C.filters}>
          <button style={{ ...C.filterPill, ...(filter === 'all' ? C.filterActive : {}) }} onClick={() => setFilter('all')}>Todos</button>
          <button style={{ ...C.filterPill, ...(filter === 'general' ? C.filterActive : {}) }} onClick={() => setFilter('general')}>General</button>
          {(data.children || []).map((child, index) => (
            <button key={child.id} style={{ ...C.filterPill, ...(filter === child.id ? C.filterActive : {}), borderColor:filter === child.id ? '#BDF24A' : `${TONES[index % TONES.length]}66` }} onClick={() => setFilter(child.id)}>
              {child.nickname}
            </button>
          ))}
        </div>

        <p style={C.sectionTitle}><span style={C.play}>▸</span>Juguetes para regalar</p>
        {visibleItems.length === 0 && <div style={C.empty}>No hay juguetes en esta categoría todavía.</div>}

        {visibleItems.map((item, index) => {
          const pending = item.match_status === 'pending_confirmation'
          const purchased = item.status === 'purchased'
          const accent = pending ? '#3FA9F5' : TONES[index % TONES.length]
          return (
            <article key={item.id} style={{ ...C.card, '--accent':accent, '--soft':`${accent}33` }}>
              <span style={C.foil} />
              <div style={C.photoWrap}>
                {item.image_url ? <img src={item.image_url} alt={item.title} style={{ ...C.photo, filter:pending ? 'saturate(.72)' : 'none' }} /> : <span style={C.fallback}><GiftIcon color="#BDF24A" /></span>}
                <span style={{ ...C.stamp, color:purchased ? '#FFD84D' : pending ? '#3FA9F5' : '#BDF24A' }}>{purchased ? 'Comprado' : pending ? 'En orbita' : 'Disponible'}</span>
              </div>
              <div style={C.info}>
                <p style={C.toyTitle}>{item.title}</p>
                <p style={C.recipient}>{item.child_name ? `Para ${item.child_name}` : 'Lista familiar'}</p>
                {item.price ? <span style={C.price}>{formatPrice(item.price)}</span> : <p style={C.pending}><span style={C.dot} /> Precio por confirmar</p>}
              </div>
              {purchased ? (
                <span style={C.disabledBtn}>Ya marcado como comprado</span>
              ) : (
                <div style={C.actions}>
                  {item.product_url ? (
                    <a style={C.buyBtn} href={item.product_url} target="_blank" rel="noreferrer">Comprar en RAV</a>
                  ) : (
                    <span style={C.disabledBtn}>RAV confirmará este juguete</span>
                  )}
                  <button type="button" style={{ ...C.boughtBtn, ...(markingId === item.id ? C.boughtBtnBusy : {}) }} onClick={() => markPurchased(item)} disabled={markingId === item.id}>
                    {markingId === item.id ? 'Marcando...' : 'Ya lo compré'}
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </main>

      <style jsx global>{`
        @keyframes foil-sweep {
          from { background-position: 0% 50%; }
          to { background-position: 100% 50%; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(.78); opacity: .55; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
        }
      `}</style>
    </div>
  )
}
