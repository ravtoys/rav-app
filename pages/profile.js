import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

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
    paddingBottom:104,
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
  header: { position:'relative', zIndex:2, padding:'58px 18px 18px', background:'linear-gradient(135deg, rgba(108,96,184,.45), rgba(63,169,245,.16) 72%), #0C1530', borderBottom:'2px solid #3FA9F5', boxShadow:'0 10px 22px rgba(0,0,0,.26)' },
  headerInner: { width:'100%', maxWidth:430, margin:'0 auto' },
  titleRow: { display:'flex', alignItems:'center', gap:10 },
  title: { fontFamily:"'Bungee',sans-serif", fontSize:23, lineHeight:1.05, color:'#FBEFC8', textTransform:'uppercase', textShadow:'2px 2px 0 #FF6B3D' },
  sub: { fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:600, color:'#7FA8D8', marginTop:7, lineHeight:1.35 },
  body: { position:'relative', zIndex:2, width:'100%', maxWidth:430, margin:'0 auto', padding:'16px 14px 0' },
  idCard: { position:'relative', overflow:'hidden', borderRadius:22, border:'2px solid #3FA9F5', background:'linear-gradient(155deg,#102448,#0A1730 66%,#081024)', boxShadow:'0 0 0 3px rgba(63,169,245,.16), 0 16px 34px rgba(0,0,0,.36), inset 0 0 28px rgba(63,169,245,.10)', padding:16 },
  idShine: { position:'absolute', inset:-40, background:'linear-gradient(115deg, transparent 0 37%, rgba(63,169,245,.16) 46%, rgba(189,242,74,.12) 54%, transparent 64%)', mixBlendMode:'screen', opacity:.55, animation:'profile-shine 6s ease-in-out infinite alternate' },
  idTop: { position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'104px 1fr', gap:14, alignItems:'center' },
  avatarShell: { position:'relative', width:104, height:104, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  orbitRing: { position:'absolute', inset:-5, borderRadius:'50%', border:'1.5px dashed rgba(63,169,245,.82)', animation:'spin-slow 14s linear infinite' },
  orbitDot: { position:'absolute', right:4, top:2, width:10, height:10, borderRadius:'50%', background:'#FFD84D', boxShadow:'0 0 10px rgba(255,216,77,.9)' },
  avatar: { width:98, height:98, borderRadius:'50%', overflow:'hidden', border:'3px solid #FF6B3D', background:'#0A1228', display:'flex', alignItems:'center', justifyContent:'center', color:'#FBEFC8', fontFamily:"'Bungee',sans-serif", fontSize:30, boxShadow:'0 0 22px rgba(255,107,61,.35)' },
  avatarImg: { width:'100%', height:'100%', objectFit:'cover' },
  cameraBadge: { position:'absolute', bottom:2, right:0, width:32, height:32, borderRadius:'50%', background:'#BDF24A', color:'#10240A', border:'3px solid #0A1228', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 14px rgba(189,242,74,.45)' },
  eyebrow: { fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#3FA9F5', marginBottom:6 },
  name: { fontFamily:"'Bungee',sans-serif", fontSize:21, lineHeight:1.05, color:'#FBEFC8', textTransform:'uppercase', textShadow:'2px 2px 0 #FF6B3D', wordBreak:'break-word' },
  email: { fontFamily:"'Nunito',sans-serif", fontSize:12, color:'#7FA8D8', marginTop:7, lineHeight:1.25, wordBreak:'break-word' },
  rankPill: { display:'inline-flex', alignItems:'center', gap:6, marginTop:10, padding:'6px 10px 5px', borderRadius:999, background:'#FFD84D', color:'#0E1B3A', fontFamily:"'Bungee',sans-serif", fontSize:10, boxShadow:'2px 2px 0 #FF6B3D' },
  scoreCard: { position:'relative', zIndex:2, marginTop:16, borderRadius:18, border:'1.5px solid rgba(189,242,74,.4)', background:'rgba(189,242,74,.08)', padding:13, display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center' },
  scoreLabel: { fontFamily:"'Bungee',sans-serif", fontSize:11, color:'#FF6B3D', textTransform:'uppercase' },
  score: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:32, lineHeight:1, textShadow:'0 0 16px rgba(251,239,200,.35)' },
  scoreSub: { fontFamily:"'Fredoka',sans-serif", color:'#7FA8D8', fontSize:11, fontWeight:700, textTransform:'uppercase', marginTop:3 },
  editBtn: { border:0, borderRadius:15, minHeight:46, padding:'0 13px', background:'linear-gradient(160deg,#D6FF6E,#BDF24A 55%,#7FC916)', color:'#10240A', fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:800, boxShadow:'0 10px 20px rgba(127,201,22,.28), inset 0 2px 0 rgba(255,255,255,.5)', display:'flex', alignItems:'center', gap:7 },
  sectionTitle: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:13, textTransform:'uppercase', margin:'18px 0 10px', letterSpacing:'.02em' },
  play: { color:'#FF6B3D', marginRight:7 },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  stat: { minHeight:82, borderRadius:16, padding:12, background:'#0E1B3A', border:'1.5px solid var(--accent)', boxShadow:'0 0 0 3px var(--soft), 0 8px 18px rgba(0,0,0,.25)' },
  statIcon: { width:34, height:34, borderRadius:12, background:'#0A1228', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 0 0 0 1px currentColor', marginBottom:9 },
  statLabel: { fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:800, color:'#7FA8D8', textTransform:'uppercase' },
  statValue: { fontFamily:"'Fredoka',sans-serif", fontSize:14, fontWeight:800, color:'#FBEFC8', marginTop:3, overflow:'hidden', textOverflow:'ellipsis' },
  menuCard: { background:'rgba(14,27,58,.78)', border:'1px solid rgba(127,168,216,.22)', borderRadius:18, overflow:'hidden', boxShadow:'0 10px 22px rgba(0,0,0,.22)' },
  menuItem: { display:'grid', gridTemplateColumns:'42px 1fr auto', alignItems:'center', gap:10, padding:'13px 12px', borderBottom:'1px solid rgba(127,168,216,.13)', cursor:'pointer' },
  menuItemLast: { display:'grid', gridTemplateColumns:'42px 1fr auto', alignItems:'center', gap:10, padding:'13px 12px', cursor:'pointer' },
  menuIcon: { width:38, height:38, borderRadius:13, background:'#0A1228', color:'#3FA9F5', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 0 0 0 1px rgba(63,169,245,.55)' },
  menuTitle: { fontFamily:"'Fredoka',sans-serif", fontSize:14, fontWeight:800, color:'#FBEFC8' },
  menuSub: { fontFamily:"'Nunito',sans-serif", fontSize:11, color:'#7FA8D8', marginTop:2, wordBreak:'break-word' },
  arrow: { color:'#9FD8FF', fontSize:20, fontFamily:"'Fredoka',sans-serif", fontWeight:800 },
  dangerCard: { marginTop:12, borderRadius:18, border:'1.5px solid rgba(255,107,61,.34)', background:'rgba(255,107,61,.08)', overflow:'hidden' },
  dangerText: { fontFamily:"'Fredoka',sans-serif", fontSize:14, fontWeight:800, color:'#FF8A5B' },
  foot: { fontFamily:"'Fredoka',sans-serif", fontSize:10, color:'rgba(127,168,216,.48)', textAlign:'center', marginTop:14 },
  loading: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", background:'#060A18' },
}

function Icon({ type, size = 22, color = 'currentColor' }) {
  const common = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', 'aria-hidden':'true' }
  if (type === 'helmet') return <svg {...common}><path d="M4.5 12.3C4.5 7.5 7.5 4 12 4s7.5 3.5 7.5 8.3v4.2c0 1.5-1 2.5-2.5 2.5H7c-1.5 0-2.5-1-2.5-2.5v-4.2Z" stroke={color} strokeWidth="1.8"/><path d="M7.5 13c.6-2.5 2.3-4 4.5-4s3.9 1.5 4.5 4c-.9 1.2-2.4 2-4.5 2s-3.6-.8-4.5-2Z" fill={color} fillOpacity=".16" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'camera') return <svg {...common}><path d="M5 8h3l1.4-2h5.2L16 8h3v10H5V8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="13" r="3" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'edit') return <svg {...common}><path d="M5 19h4l10-10-4-4L5 15v4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="m13.5 6.5 4 4" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'star') return <svg {...common}><path d="m12 3.8 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 3.8Z" fill={color}/></svg>
  if (type === 'phone') return <svg {...common}><path d="M8 4h8v16H8V4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M11 17h2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>
  if (type === 'location') return <svg {...common}><path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.4" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'mail') return <svg {...common}><path d="M4 6.5h16v11H4v-11Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="m5 8 7 5 7-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (type === 'bell') return <svg {...common}><path d="M6.5 17h11l-1.3-2.2V11a4.2 4.2 0 0 0-8.4 0v3.8L6.5 17Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M10 19c1.1 1 2.9 1 4 0" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>
  if (type === 'logout') return <svg {...common}><path d="M10 5H6v14h4M14 8l4 4-4 4M18 12H9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.8"/></svg>
}

function formatName(name) {
  const clean = (name || 'Explorador RAV').trim()
  return clean.toUpperCase()
}

function getInitials(name) {
  return (name || 'RAV').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getLevel(points) {
  if (points >= 2000) return 'Leyenda'
  if (points >= 500) return 'Aventurero'
  return 'Explorador'
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
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!profile) return <div style={C.loading}>Cargando perfil...</div>

  const points = profile.points || 0
  const level = getLevel(points)
  const initials = getInitials(profile.full_name)
  const cityCountry = [profile.city, profile.country].filter(Boolean).join(', ') || 'No registrado'

  return (
    <div style={C.page}>
      <div style={C.stars}>
        {STARS.map((star, i) => <span key={i} style={{ ...C.star, left:`${star.x}%`, top:`${star.y}%`, width:star.size, height:star.size, background:star.tone, opacity:star.opacity, boxShadow:star.tone === '#EAF0FF' ? 'none' : `0 0 8px ${star.tone}` }} />)}
      </div>
      <span style={{ ...C.nebula, left:-90, top:80, background:'rgba(63,169,245,.7)' }} />
      <span style={{ ...C.nebula, right:-110, top:120, background:'rgba(255,107,61,.5)' }} />
      <span style={{ ...C.nebula, left:'35%', bottom:80, background:'rgba(251,239,200,.16)' }} />
      <span style={C.grain} />

      <header style={C.header}>
        <div style={C.headerInner}>
          <div style={C.titleRow}>
            <Icon type="helmet" size={32} color="#9FD8FF" />
            <p style={C.title}>Perfil</p>
          </div>
          <p style={C.sub}>Tu credencial de explorador dentro del RAV Universo.</p>
        </div>
      </header>

      <main style={C.body}>
        <section style={C.idCard}>
          <span style={C.idShine} />
          <div style={C.idTop}>
            <button style={C.avatarShell} onClick={() => router.push('/edit-profile')} aria-label="Editar foto de perfil">
              <span style={C.orbitRing} />
              <span style={C.orbitDot} />
              <span style={C.avatar}>
                {profile.avatar_url ? <img src={profile.avatar_url} alt="Foto de perfil" style={C.avatarImg} /> : initials}
              </span>
              <span style={C.cameraBadge}><Icon type="camera" size={16} color="currentColor" /></span>
            </button>
            <div>
              <p style={C.eyebrow}>Credencial RAV</p>
              <h1 style={C.name}>{formatName(profile.full_name)}</h1>
              <p style={C.email}>{profile.email}</p>
              <span style={C.rankPill}><Icon type="star" size={13} color="currentColor" /> {level}</span>
            </div>
          </div>

          <div style={C.scoreCard}>
            <div>
              <p style={C.scoreLabel}>Mis Estrellas</p>
              <p style={C.score}>{points.toLocaleString('es-CO')}</p>
              <p style={C.scoreSub}>Estrellas acumuladas</p>
            </div>
            <button style={C.editBtn} onClick={() => router.push('/edit-profile')}><Icon type="edit" size={16} color="currentColor" /> Editar</button>
          </div>
        </section>

        <p style={C.sectionTitle}><span style={C.play}>▸</span>Datos de contacto</p>
        <section style={C.grid}>
          <div style={{ ...C.stat, '--accent':'#3FA9F5', '--soft':'rgba(63,169,245,.14)' }}>
            <span style={C.statIcon}><Icon type="phone" size={19} color="currentColor" /></span>
            <p style={C.statLabel}>Teléfono</p>
            <p style={C.statValue}>{profile.phone || 'No registrado'}</p>
          </div>
          <div style={{ ...C.stat, '--accent':'#FFD84D', '--soft':'rgba(255,216,77,.14)' }}>
            <span style={C.statIcon}><Icon type="location" size={19} color="currentColor" /></span>
            <p style={C.statLabel}>Residencia</p>
            <p style={C.statValue}>{cityCountry}</p>
          </div>
        </section>

        <p style={C.sectionTitle}><span style={C.play}>▸</span>Centro de control</p>
        <section style={C.menuCard}>
          <div style={C.menuItem} onClick={() => router.push('/edit-profile')}>
            <span style={C.menuIcon}><Icon type="edit" size={19} color="currentColor" /></span>
            <span>
              <p style={C.menuTitle}>Editar perfil</p>
              <p style={C.menuSub}>Nombre, teléfono, ciudad, país y foto.</p>
            </span>
            <span style={C.arrow}>›</span>
          </div>
          <div style={C.menuItem}>
            <span style={C.menuIcon}><Icon type="mail" size={19} color="currentColor" /></span>
            <span>
              <p style={C.menuTitle}>Correo</p>
              <p style={C.menuSub}>{profile.email}</p>
            </span>
            <span style={C.arrow}>•</span>
          </div>
          <div style={C.menuItemLast}>
            <span style={C.menuIcon}><Icon type="bell" size={19} color="currentColor" /></span>
            <span>
              <p style={C.menuTitle}>Notificaciones</p>
              <p style={C.menuSub}>WhatsApp, SMS y sorpresas RAV próximamente.</p>
            </span>
            <span style={C.arrow}>›</span>
          </div>
        </section>

        <section style={C.dangerCard}>
          <div style={C.menuItemLast} onClick={handleLogout}>
            <span style={{ ...C.menuIcon, color:'#FF8A5B', boxShadow:'inset 0 0 0 1px rgba(255,107,61,.5)' }}><Icon type="logout" size={19} color="currentColor" /></span>
            <span style={C.dangerText}>Cerrar sesión</span>
            <span style={{ ...C.arrow, color:'#FF8A5B' }}>›</span>
          </div>
        </section>

        <p style={C.foot}>RAV Toys · RAV Club v1.0</p>
      </main>

      <Navbar active="profile" />

      <style jsx global>{`
        @keyframes profile-shine {
          from { transform: translateX(-30%); }
          to { transform: translateX(30%); }
        }
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
