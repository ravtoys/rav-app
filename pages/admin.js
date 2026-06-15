import { useState, useEffect } from 'react'

const PASSPORT_STAMPS = [
  { id:'birthday', name:'Cumple RAV' },
  { id:'jungle', name:'Visitó la Selva' },
  { id:'dino-hunter', name:'Cazador de Dinosaurios' },
  { id:'pilot', name:'Piloto RAV' },
  { id:'scientist', name:'Peque Científico' },
  { id:'artist', name:'Artista Galáctico' },
  { id:'builder', name:'Constructor Estelar' },
  { id:'mission', name:'Misión Cumplida' },
  { id:'legend', name:'Leyenda en Formación' },
]

const C = {
  page: { minHeight:'100vh', background:'#080618', padding:'24px 20px 40px', fontFamily:"'Nunito',sans-serif" },
  login: { minHeight:'100vh', background:'#080618', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'Nunito',sans-serif" },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:24, fontWeight:900, color:'#AAEB3A', marginBottom:4 },
  sub: { fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24 },
  input: { width:'100%', maxWidth:340, padding:'14px 16px', borderRadius:12, border:'1px solid rgba(170,235,58,0.3)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:15, outline:'none', marginBottom:12 },
  btn: { width:'100%', maxWidth:340, padding:'14px', borderRadius:12, border:'none', background:'#AAEB3A', color:'#080618', fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
  headerTitle: { fontFamily:"'Exo 2',sans-serif", fontSize:22, fontWeight:900, color:'#AAEB3A' },
  logoutBtn: { padding:'8px 16px', borderRadius:10, border:'1px solid rgba(170,235,58,0.3)', background:'transparent', color:'rgba(170,235,58,0.6)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  searchInput: { width:'100%', padding:'12px 16px', borderRadius:12, border:'1px solid rgba(170,235,58,0.3)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none', marginBottom:16 },
  userCard: { background:'rgba(170,235,58,0.05)', border:'1px solid rgba(170,235,58,0.15)', borderRadius:14, padding:'14px 16px', marginBottom:10 },
  userTop: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 },
  userName: { fontSize:15, fontWeight:800, color:'white' },
  userEmail: { fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 },
  userPoints: { fontSize:20, fontWeight:900, color:'#AAEB3A', textAlign:'right' },
  userPointsSub: { fontSize:10, color:'rgba(255,255,255,0.4)', textAlign:'right' },
  userLevel: { fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:10, background:'rgba(43,63,191,0.4)', color:'#AAEB3A', display:'inline-block', marginTop:4 },
  pointsRow: { display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' },
  pointsInput: { flex:1, minWidth:80, padding:'10px 12px', borderRadius:10, border:'1px solid rgba(170,235,58,0.3)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none' },
  descInput: { flex:2, minWidth:120, padding:'10px 12px', borderRadius:10, border:'1px solid rgba(170,235,58,0.3)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none' },
  addBtn: { padding:'10px 14px', borderRadius:10, border:'none', background:'#AAEB3A', color:'#080618', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif", whiteSpace:'nowrap' },
  removeBtn: { padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,100,100,0.4)', background:'rgba(200,30,30,0.1)', color:'#ff6666', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif", whiteSpace:'nowrap' },
  successMsg: { background:'rgba(170,235,58,0.15)', border:'1px solid #AAEB3A', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#AAEB3A', fontWeight:700, marginBottom:14 },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 },
  statCard: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 14px' },
  statNum: { fontFamily:"'Exo 2',sans-serif", fontSize:24, fontWeight:900, color:'#AAEB3A' },
  statWord: { fontFamily:"'Exo 2',sans-serif", fontSize:18, fontWeight:900, color:'#AAEB3A', lineHeight:1.1 },
  statLabel: { fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2, fontWeight:700 },
  kidsBox: { background:'rgba(43,63,191,0.12)', border:'1px solid rgba(43,63,191,0.35)', borderRadius:12, padding:'10px 12px', margin:'10px 0 12px' },
  kidsTitle: { fontSize:10, fontWeight:900, color:'rgba(170,235,58,0.7)', letterSpacing:1, marginBottom:8 },
  kidRow: { display:'flex', justifyContent:'space-between', gap:12, padding:'8px 0', borderTop:'1px solid rgba(255,255,255,0.07)' },
  kidIdentity: { display:'flex', alignItems:'center', gap:9 },
  kidPhoto: { width:34, height:34, borderRadius:12, objectFit:'cover', border:'1px solid rgba(170,235,58,0.45)', background:'rgba(170,235,58,0.12)', flexShrink:0 },
  kidIconAvatar: { width:34, height:34, borderRadius:12, border:'1px solid rgba(170,235,58,0.28)', background:'rgba(170,235,58,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 },
  kidName: { fontSize:13, fontWeight:900, color:'white' },
  kidMeta: { fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:2 },
  kidCountdown: { fontSize:11, fontWeight:900, color:'#AAEB3A', textAlign:'right', whiteSpace:'nowrap' },
  interestsRow: { display:'flex', flexWrap:'wrap', gap:6, marginTop:6 },
  interestPill: { padding:'4px 7px', borderRadius:10, background:'rgba(170,235,58,0.12)', border:'1px solid rgba(170,235,58,0.22)', color:'rgba(170,235,58,0.82)', fontSize:10, fontWeight:800 },
  consentLine: { fontSize:10, color:'rgba(255,255,255,0.42)', marginTop:6 },
  consentOk: { color:'#AAEB3A', fontWeight:900 },
  consentMissing: { color:'#ff6666', fontWeight:900 },
  passportPanel: { background:'rgba(170,235,58,0.06)', border:'1px solid rgba(170,235,58,0.16)', borderRadius:10, padding:10, marginTop:10 },
  passportMini: { display:'flex', flexWrap:'wrap', gap:8, marginTop:6 },
  passportChip: { padding:'4px 7px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.62)', fontSize:10, fontWeight:800 },
  wishlistPanel: { background:'rgba(170,235,58,0.05)', border:'1px solid rgba(170,235,58,0.16)', borderRadius:12, padding:'10px 12px', margin:'10px 0 12px' },
  wishlistRow: { display:'flex', justifyContent:'space-between', gap:12, padding:'8px 0', borderTop:'1px solid rgba(255,255,255,0.07)' },
  wishlistName: { color:'white', fontSize:12, fontWeight:900 },
  wishlistMeta: { color:'rgba(255,255,255,0.48)', fontSize:10, marginTop:3 },
  wishlistBadge: { display:'inline-block', padding:'4px 7px', borderRadius:10, background:'rgba(43,63,191,0.4)', border:'1px solid rgba(170,235,58,0.18)', color:'#AAEB3A', fontSize:10, fontWeight:900, whiteSpace:'nowrap' },
  wishlistPendingBadge: { display:'inline-block', padding:'4px 7px', borderRadius:10, background:'rgba(255,216,77,0.1)', border:'1px solid rgba(255,216,77,0.28)', color:'#FFD84D', fontSize:10, fontWeight:900, whiteSpace:'nowrap' },
  wishlistSource: { display:'inline-block', padding:'3px 7px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.62)', fontSize:10, fontWeight:900, marginTop:5 },
  wishlistThumb: { width:44, height:44, borderRadius:12, objectFit:'cover', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 },
  wishlistFallback: { width:44, height:44, borderRadius:12, background:'rgba(170,235,58,0.1)', border:'1px solid rgba(170,235,58,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  wishlistLink: { display:'inline-block', color:'#AAEB3A', fontSize:10, fontWeight:900, marginTop:5, textDecoration:'none' },
  wishlistNote: { color:'rgba(255,255,255,0.42)', fontSize:10, lineHeight:1.3, marginTop:5 },
  stampForm: { display:'grid', gridTemplateColumns:'1.3fr 70px 1.5fr auto', gap:8, marginTop:10 },
  stampSelect: { minWidth:120, padding:'9px 10px', borderRadius:10, border:'1px solid rgba(170,235,58,0.3)', background:'#14102c', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:12, outline:'none' },
  stampInput: { minWidth:0, padding:'9px 10px', borderRadius:10, border:'1px solid rgba(170,235,58,0.3)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:12, outline:'none' },
  stampBtn: { padding:'9px 11px', borderRadius:10, border:'none', background:'#AAEB3A', color:'#080618', fontSize:11, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif", whiteSpace:'nowrap' },
  insightGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:10, marginBottom:20 },
  insightPanel: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 14px' },
  insightTitle: { fontSize:10, fontWeight:900, color:'rgba(170,235,58,0.7)', letterSpacing:1, marginBottom:10 },
  insightRow: { display:'flex', justifyContent:'space-between', gap:10, padding:'7px 0', borderTop:'1px solid rgba(255,255,255,0.06)' },
  insightName: { color:'white', fontSize:12, fontWeight:800 },
  insightMeta: { color:'rgba(255,255,255,0.45)', fontSize:10, marginTop:2 },
  insightValue: { color:'#AAEB3A', fontSize:12, fontWeight:900, textAlign:'right', whiteSpace:'nowrap' },
  messageActions: { display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end', marginTop:6 },
  whatsappBtn: { padding:'7px 9px', borderRadius:10, border:'none', background:'#AAEB3A', color:'#080618', fontSize:10, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif", whiteSpace:'nowrap' },
  copyBtn: { padding:'7px 9px', borderRadius:10, border:'1px solid rgba(170,235,58,0.28)', background:'transparent', color:'#AAEB3A', fontSize:10, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif", whiteSpace:'nowrap' },
  warningPill: { display:'inline-block', padding:'4px 7px', borderRadius:10, background:'rgba(255,102,102,0.1)', border:'1px solid rgba(255,102,102,0.2)', color:'#ff6666', fontSize:10, fontWeight:900, marginTop:5 },
  err: { color:'#ff6666', fontSize:12, marginTop:4 },
  empty: { textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14, marginTop:40 },
  sectionTitle: { fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.35)', letterSpacing:1, marginBottom:12 },
}

function getLevel(p) {
  if (p >= 2000) return 'Leyenda 🏆'
  if (p >= 500) return 'Aventurero ⭐'
  return 'Explorador 🌱'
}

function calculateAge(date) {
  const birth = new Date(`${date}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return age
}

function getBirthdayCountdown(date) {
  const today = new Date()
  const birth = new Date(`${date}T00:00:00`)
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  next.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  if (next < start) next.setFullYear(today.getFullYear() + 1)
  const days = Math.ceil((next - start) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Cumple hoy'
  if (days === 1) return 'Cumple mañana'
  return `${days} días`
}

function getDaysUntilBirthday(date) {
  const today = new Date()
  const birth = new Date(`${date}T00:00:00`)
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  next.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  if (next < start) next.setFullYear(today.getFullYear() + 1)
  return Math.ceil((next - start) / (1000 * 60 * 60 * 24))
}

function getAvatarIcon(id) {
  const avatars = {
    alien: '👽',
    rocket: '🚀',
    star: '⭐',
    planet: '🪐',
    helmet: '🧑‍🚀',
  }
  return avatars[id] || '👽'
}

function formatConsentDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })
}

function getWhatsAppPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 10 && digits.startsWith('3')) return `57${digits}`
  return digits
}

function getFirstName(name) {
  return (name || '').trim().split(' ')[0] || 'Hola'
}

function buildBirthdayMessage(user, child) {
  const parentName = getFirstName(user.full_name)
  return `Hola ${parentName}, en RAV Club tenemos presente el cumple de ${child.nickname}. Queremos preparar una sorpresa especial para su próxima aventura en RAV Toys.`
}

function buildStarsMessage(user) {
  const parentName = getFirstName(user.full_name)
  return `Hola ${parentName}, tienes ${(user.points || 0).toLocaleString('es-CO')} Estrellas RAV en tu cuenta. Te esperamos para seguir sumando misiones y sorpresas en RAV Toys.`
}

function getWishlistStatusLabel(status) {
  const labels = {
    wanted: 'Deseado',
    purchased: 'Comprado',
    unavailable: 'Agotado',
  }
  return labels[status] || 'Deseado'
}

function getWishlistMatchLabel(status) {
  const labels = {
    manual_confirmed: 'Manual confirmado',
    pending_confirmation: 'Pendiente RAV',
    shopify_matched: 'Shopify confirmado',
  }
  return labels[status] || 'Manual confirmado'
}

function getWishlistSourceLabel(source) {
  const labels = {
    rav_link: 'Link RAV',
    photo: 'Foto en tienda',
    manual: 'Manual',
  }
  return labels[source] || 'Manual'
}

function getWishlistDisplayTitle(item) {
  return item.detected_title || item.title || 'Juguete pendiente por confirmar'
}

function getWishlistDisplayPrice(item) {
  return item.detected_price ?? item.price
}

function getWishlistImage(item) {
  return item.uploaded_image_url || item.image_url || ''
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return Number(price).toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 })
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [pointsInputs, setPointsInputs] = useState({})
  const [descInputs, setDescInputs] = useState({})
  const [stampInputs, setStampInputs] = useState({})
  const [stampPoints, setStampPoints] = useState({})
  const [stampNotes, setStampNotes] = useState({})

  const getSavedPassword = () => localStorage.getItem('rav_admin_password') || ''

  useEffect(() => {
    const saved = localStorage.getItem('rav_admin')
    if (saved === 'true') setAuthed(true)
  }, [])

  useEffect(() => {
    if (authed) loadUsers()
  }, [authed])

  const loadUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users', {
      headers: { 'x-rav-admin-password': getSavedPassword() },
    })
    const data = await res.json()
    if (!res.ok) {
      localStorage.removeItem('rav_admin')
      localStorage.removeItem('rav_admin_password')
      setAuthed(false)
      setPwError('Sesión admin expirada')
      setUsers([])
    } else {
      setUsers(data.users || [])
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users', {
      headers: { 'x-rav-admin-password': password },
    })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      localStorage.setItem('rav_admin', 'true')
      localStorage.setItem('rav_admin_password', password)
      setAuthed(true)
      setPwError('')
      setUsers(data.users || [])
    } else {
      setPwError('Contraseña incorrecta')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('rav_admin')
    localStorage.removeItem('rav_admin_password')
    setAuthed(false)
  }

  const handlePoints = async (user, type) => {
    const pts = parseInt(pointsInputs[user.id] || 0)
    const desc = descInputs[user.id] || (type === 'add' ? 'Puntos agregados por admin' : 'Puntos deducidos por admin')
    if (!pts || pts <= 0) return

    const res = await fetch('/api/admin/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rav-admin-password': getSavedPassword(),
      },
      body: JSON.stringify({
        userId: user.id,
        points: pts,
        type,
        description: desc,
      }),
    })

    if (!res.ok) {
      setMsg('No se pudo actualizar. Vuelve a iniciar sesión.')
      setTimeout(() => setMsg(''), 4000)
      return
    }

    setMsg(`✅ ${type === 'add' ? '+' : '-'}${pts} estrellas a ${user.full_name || user.id}`)
    setTimeout(() => setMsg(''), 4000)
    setPointsInputs(prev => ({ ...prev, [user.id]: '' }))
    setDescInputs(prev => ({ ...prev, [user.id]: '' }))
    loadUsers()
  }

  const handlePassportStamp = async (user, child) => {
    const stampKey = stampInputs[child.id] || 'mission'
    const points = stampPoints[child.id] ?? '25'
    const notes = stampNotes[child.id] || ''

    const res = await fetch('/api/admin/passport-stamps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rav-admin-password': getSavedPassword(),
      },
      body: JSON.stringify({
        parentId: user.id,
        childId: child.id,
        stampKey,
        points,
        notes,
      }),
    })

    if (!res.ok) {
      setMsg('No se pudo agregar el sello. Vuelve a iniciar sesión.')
      setTimeout(() => setMsg(''), 4000)
      return
    }

    const stampName = PASSPORT_STAMPS.find(stamp => stamp.id === stampKey)?.name || 'Misión RAV'
    setMsg(`✅ Sello agregado a ${child.nickname}: ${stampName}`)
    setTimeout(() => setMsg(''), 4000)
    setStampInputs(prev => ({ ...prev, [child.id]: 'mission' }))
    setStampPoints(prev => ({ ...prev, [child.id]: '25' }))
    setStampNotes(prev => ({ ...prev, [child.id]: '' }))
    loadUsers()
  }

  const openWhatsApp = (phone, message) => {
    const whatsappPhone = getWhatsAppPhone(phone)
    if (!whatsappPhone) {
      setMsg('Este cliente no tiene teléfono listo para WhatsApp.')
      setTimeout(() => setMsg(''), 4000)
      return
    }
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const copyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message)
      setMsg('Mensaje copiado.')
    } catch (error) {
      setMsg('No se pudo copiar el mensaje.')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.country || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.wishlist_items || []).some(item =>
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.detected_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.child_name || '').toLowerCase().includes(search.toLowerCase()) ||
      getWishlistStatusLabel(item.status).toLowerCase().includes(search.toLowerCase()) ||
      getWishlistMatchLabel(item.match_status).toLowerCase().includes(search.toLowerCase()) ||
      getWishlistSourceLabel(item.source).toLowerCase().includes(search.toLowerCase())
    ) ||
    (u.children || []).some(child =>
      (child.nickname || '').toLowerCase().includes(search.toLowerCase()) ||
      (child.interests || []).some(interest => interest.toLowerCase().includes(search.toLowerCase()))
    )
  )

  const totalUsers = users.length
  const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0)
  const legends = users.filter(u => (u.points || 0) >= 2000).length
  const totalKids = users.reduce((sum, u) => sum + (u.children?.length || 0), 0)
  const allChildren = users.flatMap(u => u.children || [])
  const childrenWithParent = users.flatMap(u => (u.children || []).map(child => ({ ...child, parentName: u.full_name, parentPhone: u.phone })))
  const passportEvents = allChildren.flatMap(child => child.passport_stamps || [])
  const totalPassportStamps = totalKids + passportEvents.length
  const activePassportKids = allChildren.filter(child => (child.passport_stamps || []).length > 0).length
  const passportPoints = passportEvents.reduce((sum, stamp) => sum + (stamp.points_awarded || 0), 0)
  const recentPassportVisits = passportEvents.filter(stamp => {
    const created = new Date(stamp.created_at)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    return created >= cutoff
  }).length
  const birthdaySoon = users.reduce((sum, u) => {
    return sum + (u.children || []).filter(child => {
      const countdown = getBirthdayCountdown(child.birth_date)
      if (countdown === 'Cumple hoy' || countdown === 'Cumple mañana') return true
      const days = parseInt(countdown, 10)
      return !Number.isNaN(days) && days <= 30
    }).length
  }, 0)
  const birthday7 = allChildren.filter(child => getDaysUntilBirthday(child.birth_date) <= 7).length
  const missingInterests = allChildren.filter(child => !child.interests?.length).length
  const averageAge = allChildren.length
    ? Math.round(allChildren.reduce((sum, child) => sum + calculateAge(child.birth_date), 0) / allChildren.length)
    : 0
  const upcomingBirthdays = childrenWithParent
    .map(child => ({ ...child, daysToBirthday: getDaysUntilBirthday(child.birth_date) }))
    .filter(child => child.daysToBirthday <= 60)
    .sort((a, b) => a.daysToBirthday - b.daysToBirthday)
    .slice(0, 5)
  const topInterests = Object.entries(allChildren.reduce((map, child) => {
    ;(child.interests || []).forEach(interest => { map[interest] = (map[interest] || 0) + 1 })
    return map
  }, {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const ageGroups = [
    { label:'0-2', count: allChildren.filter(child => calculateAge(child.birth_date) <= 2).length },
    { label:'3-5', count: allChildren.filter(child => {
      const age = calculateAge(child.birth_date)
      return age >= 3 && age <= 5
    }).length },
    { label:'6-8', count: allChildren.filter(child => {
      const age = calculateAge(child.birth_date)
      return age >= 6 && age <= 8
    }).length },
    { label:'9-12', count: allChildren.filter(child => {
      const age = calculateAge(child.birth_date)
      return age >= 9 && age <= 12
    }).length },
    { label:'13+', count: allChildren.filter(child => calculateAge(child.birth_date) >= 13).length },
  ]
  const marketingUsers = users.filter(user => user.marketing_consent)
  const usersReadyForWhatsApp = marketingUsers.filter(user => getWhatsAppPhone(user.phone))
  const usersMissingPhone = marketingUsers.filter(user => !getWhatsAppPhone(user.phone))
  const usersMissingConsent = users.filter(user => !user.marketing_consent)
  const birthdayMessages = users.flatMap(user =>
    (user.children || []).map(child => ({
      user,
      child,
      daysToBirthday: getDaysUntilBirthday(child.birth_date),
    }))
  )
    .filter(item => item.daysToBirthday <= 30 && item.user.marketing_consent)
    .sort((a, b) => a.daysToBirthday - b.daysToBirthday)
    .slice(0, 6)
  const generalMessages = usersReadyForWhatsApp.slice(0, 6)
  const allWishlistItems = users.flatMap(user => user.wishlist_items || [])
  const wishlistWanted = allWishlistItems.filter(item => item.status === 'wanted').length
  const wishlistPurchased = allWishlistItems.filter(item => item.status === 'purchased').length
  const wishlistUnavailable = allWishlistItems.filter(item => item.status === 'unavailable').length
  const wishlistPending = allWishlistItems.filter(item => item.match_status === 'pending_confirmation').length
  const wishlistShopifyMatched = allWishlistItems.filter(item => item.match_status === 'shopify_matched').length
  const wishlistManualConfirmed = allWishlistItems.filter(item => !item.match_status || item.match_status === 'manual_confirmed').length
  const pendingWishlistItems = [...allWishlistItems]
    .filter(item => item.match_status === 'pending_confirmation')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
  const recentWishlistItems = [...allWishlistItems]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  if (!authed) {
    return (
      <div style={C.login}>
        <div style={{ fontSize:48, marginBottom:16 }}>👽</div>
        <p style={C.title}>Admin RAV Club</p>
        <p style={C.sub}>Solo para el equipo RAV Toys</p>
        <input
          style={C.input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        {pwError && <p style={{ ...C.err, marginBottom:8 }}>{pwError}</p>}
        <button style={C.btn} onClick={handleLogin}>Entrar</button>
      </div>
    )
  }

  return (
    <div style={C.page}>
      <div style={C.header}>
        <p style={C.headerTitle}>👽 Admin RAV Club</p>
        <button style={C.logoutBtn} onClick={handleLogout}>Salir</button>
      </div>

      <div style={{ ...C.statsRow, gridTemplateColumns:'repeat(5,1fr)' }}>
        <div style={C.statCard}>
          <p style={C.statNum}>{totalUsers}</p>
          <p style={C.statLabel}>USUARIOS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{totalPoints.toLocaleString()}</p>
          <p style={C.statLabel}>ESTRELLAS TOTALES</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{legends}</p>
          <p style={C.statLabel}>LEYENDAS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{totalKids}</p>
          <p style={C.statLabel}>PEQUES</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{birthdaySoon}</p>
          <p style={C.statLabel}>CUMPLES 30 DÍAS</p>
        </div>
      </div>

      <p style={C.sectionTitle}>WISHLIST RAV</p>
      <div style={{ ...C.statsRow, gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))' }}>
        <div style={C.statCard}>
          <p style={C.statNum}>{allWishlistItems.length}</p>
          <p style={C.statLabel}>JUGUETES GUARDADOS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{wishlistPending}</p>
          <p style={C.statLabel}>PENDIENTES RAV</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{wishlistShopifyMatched}</p>
          <p style={C.statLabel}>SHOPIFY CONFIRMADOS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{wishlistManualConfirmed}</p>
          <p style={C.statLabel}>MANUALES</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{wishlistWanted}</p>
          <p style={C.statLabel}>DESEADOS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{wishlistPurchased}</p>
          <p style={C.statLabel}>COMPRADOS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{wishlistUnavailable}</p>
          <p style={C.statLabel}>AGOTADOS</p>
        </div>
      </div>

      <div style={C.insightGrid}>
        <div style={C.insightPanel}>
          <p style={C.insightTitle}>PENDIENTES POR CONFIRMAR</p>
          {pendingWishlistItems.length === 0 && <p style={C.kidMeta}>No hay juguetes pendientes por confirmar.</p>}
          {pendingWishlistItems.map(item => {
            const image = getWishlistImage(item)
            const displayPrice = getWishlistDisplayPrice(item)
            return (
              <div key={item.id} style={C.insightRow}>
                <div style={{ display:'flex', gap:10, minWidth:0 }}>
                  {image
                    ? <img src={image} alt={getWishlistDisplayTitle(item)} style={C.wishlistThumb} />
                    : <span style={C.wishlistFallback}>🎁</span>}
                  <div>
                    <p style={C.insightName}>{getWishlistDisplayTitle(item)}</p>
                    <p style={C.insightMeta}>
                      {item.parent_name || 'Sin nombre'} · {item.parent_email || 'Sin email'}
                    </p>
                    <p style={C.insightMeta}>
                      Para: {item.child_name || 'General'} · {displayPrice ? `Precio estimado: ${formatPrice(displayPrice)}` : 'Sin precio estimado'}
                    </p>
                    <span style={C.wishlistSource}>{getWishlistSourceLabel(item.source)}</span>
                    {item.product_url && (
                      <a style={C.wishlistLink} href={item.product_url} target="_blank" rel="noopener noreferrer">Abrir producto</a>
                    )}
                    <p style={C.wishlistNote}>No es oficial hasta conectar Shopify.</p>
                  </div>
                </div>
                <span style={C.wishlistPendingBadge}>{getWishlistMatchLabel(item.match_status)}</span>
              </div>
            )
          })}
        </div>

        <div style={C.insightPanel}>
          <p style={C.insightTitle}>ÚLTIMOS JUGUETES GUARDADOS</p>
          {recentWishlistItems.length === 0 && <p style={C.kidMeta}>Aún no hay juguetes en Wishlist.</p>}
          {recentWishlistItems.map(item => (
            <div key={item.id} style={C.insightRow}>
              <div>
                <p style={C.insightName}>{getWishlistDisplayTitle(item)}</p>
                <p style={C.insightMeta}>
                  {item.child_name || 'General'} · {formatPrice(getWishlistDisplayPrice(item)) || 'Sin precio'}
                </p>
                <span style={C.wishlistSource}>{getWishlistSourceLabel(item.source)}</span>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={C.insightValue}>{getWishlistStatusLabel(item.status)}</p>
                <span style={item.match_status === 'pending_confirmation' ? C.wishlistPendingBadge : C.wishlistBadge}>
                  {getWishlistMatchLabel(item.match_status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p style={C.sectionTitle}>PASAPORTE RAV</p>
      <div style={{ ...C.statsRow, gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))' }}>
        <div style={C.statCard}>
          <p style={C.statNum}>{totalPassportStamps}</p>
          <p style={C.statLabel}>SELLOS TOTALES</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{recentPassportVisits}</p>
          <p style={C.statLabel}>VISITAS 30 DÍAS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{activePassportKids}</p>
          <p style={C.statLabel}>PEQUES ACTIVOS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{passportPoints}</p>
          <p style={C.statLabel}>ESTRELLAS POR JUEGO</p>
        </div>
      </div>

      <p style={C.sectionTitle}>KIDS MARKETING KPIS</p>
      <div style={{ ...C.statsRow, gridTemplateColumns:'repeat(4,1fr)' }}>
        <div style={C.statCard}>
          <p style={C.statNum}>{birthday7}</p>
          <p style={C.statLabel}>CUMPLES 7 DÍAS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{averageAge}</p>
          <p style={C.statLabel}>EDAD PROMEDIO</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statWord}>{topInterests[0]?.[0] || '-'}</p>
          <p style={C.statLabel}>INTERÉS #1</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{missingInterests}</p>
          <p style={C.statLabel}>SIN GUSTOS</p>
        </div>
      </div>

      <div style={C.insightGrid}>
        <div style={C.insightPanel}>
          <p style={C.insightTitle}>PRÓXIMOS CUMPLEAÑOS</p>
          {upcomingBirthdays.length === 0 && <p style={C.kidMeta}>No hay cumpleaños en los próximos 60 días.</p>}
          {upcomingBirthdays.map(child => (
            <div key={child.id} style={C.insightRow}>
              <div>
                <p style={C.insightName}>{child.nickname}</p>
                <p style={C.insightMeta}>{child.parentName || 'Sin acudiente'} · {child.parentPhone || 'Sin teléfono'}</p>
              </div>
              <p style={C.insightValue}>{child.daysToBirthday === 0 ? 'Hoy' : `${child.daysToBirthday} días`}</p>
            </div>
          ))}
        </div>

        <div style={C.insightPanel}>
          <p style={C.insightTitle}>GUSTOS MÁS FUERTES</p>
          {topInterests.length === 0 && <p style={C.kidMeta}>Aún no hay intereses registrados.</p>}
          {topInterests.map(([interest, count]) => (
            <div key={interest} style={C.insightRow}>
              <p style={C.insightName}>{interest}</p>
              <p style={C.insightValue}>{count}</p>
            </div>
          ))}
        </div>

        <div style={C.insightPanel}>
          <p style={C.insightTitle}>EDADES</p>
          {ageGroups.map(group => (
            <div key={group.label} style={C.insightRow}>
              <p style={C.insightName}>{group.label} años</p>
              <p style={C.insightValue}>{group.count}</p>
            </div>
          ))}
        </div>
      </div>

      <p style={C.sectionTitle}>CENTRO DE MENSAJES</p>
      <div style={{ ...C.statsRow, gridTemplateColumns:'repeat(3,1fr)' }}>
        <div style={C.statCard}>
          <p style={C.statNum}>{usersReadyForWhatsApp.length}</p>
          <p style={C.statLabel}>WHATSAPP LISTOS</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{birthdayMessages.length}</p>
          <p style={C.statLabel}>CUMPLES PARA ESCRIBIR</p>
        </div>
        <div style={C.statCard}>
          <p style={C.statNum}>{usersMissingPhone.length + usersMissingConsent.length}</p>
          <p style={C.statLabel}>DATOS PENDIENTES</p>
        </div>
      </div>

      <div style={C.insightGrid}>
        <div style={C.insightPanel}>
          <p style={C.insightTitle}>CUMPLES PARA WHATSAPP</p>
          {birthdayMessages.length === 0 && <p style={C.kidMeta}>No hay mensajes de cumpleaños listos.</p>}
          {birthdayMessages.map(({ user, child, daysToBirthday }) => {
            const message = buildBirthdayMessage(user, child)
            return (
              <div key={`${user.id}-${child.id}`} style={C.insightRow}>
                <div>
                  <p style={C.insightName}>{child.nickname} · {daysToBirthday === 0 ? 'Hoy' : `${daysToBirthday} días`}</p>
                  <p style={C.insightMeta}>{user.full_name || 'Sin nombre'} · {user.phone || 'Sin teléfono'}</p>
                  {!getWhatsAppPhone(user.phone) && <span style={C.warningPill}>Falta teléfono</span>}
                </div>
                <div style={C.messageActions}>
                  <button style={C.whatsappBtn} onClick={() => openWhatsApp(user.phone, message)}>WhatsApp</button>
                  <button style={C.copyBtn} onClick={() => copyMessage(message)}>Copiar</button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={C.insightPanel}>
          <p style={C.insightTitle}>MENSAJE GENERAL</p>
          {generalMessages.length === 0 && <p style={C.kidMeta}>Aún no hay clientes con teléfono y consentimiento.</p>}
          {generalMessages.map(user => {
            const message = buildStarsMessage(user)
            return (
              <div key={user.id} style={C.insightRow}>
                <div>
                  <p style={C.insightName}>{user.full_name || 'Sin nombre'}</p>
                  <p style={C.insightMeta}>{user.phone || 'Sin teléfono'} · {(user.points || 0).toLocaleString()}⭐</p>
                </div>
                <div style={C.messageActions}>
                  <button style={C.whatsappBtn} onClick={() => openWhatsApp(user.phone, message)}>WhatsApp</button>
                  <button style={C.copyBtn} onClick={() => copyMessage(message)}>Copiar</button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={C.insightPanel}>
          <p style={C.insightTitle}>FALTAN DATOS</p>
          <div style={C.insightRow}>
            <p style={C.insightName}>Sin teléfono</p>
            <p style={C.insightValue}>{usersMissingPhone.length}</p>
          </div>
          <div style={C.insightRow}>
            <p style={C.insightName}>Sin consentimiento</p>
            <p style={C.insightValue}>{usersMissingConsent.length}</p>
          </div>
          <p style={{ ...C.kidMeta, marginTop:8 }}>Solo escribimos a clientes con permiso de marketing.</p>
        </div>
      </div>

      {msg && <div style={C.successMsg}>{msg}</div>}

      <p style={C.sectionTitle}>USUARIOS REGISTRADOS</p>
      <input
        style={C.searchInput}
        placeholder="Buscar por nombre, email, ciudad, peque o interés..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading && <p style={C.empty}>Cargando...</p>}
      {!loading && filtered.length === 0 && <p style={C.empty}>No se encontraron usuarios</p>}

      {filtered.map(user => (
        <div key={user.id} style={C.userCard}>
          <div style={C.userTop}>
            <div>
              <p style={C.userName}>{user.full_name || 'Sin nombre'}</p>
              <p style={C.userEmail}>{user.email || 'Sin email'}</p>
              <p style={C.userEmail}>{user.phone || 'Sin teléfono'}</p>
              <p style={C.userEmail}>{[user.city, user.country].filter(Boolean).join(', ') || 'Sin ubicación'}</p>
              <p style={C.consentLine}>
                Datos/marketing:{' '}
                {user.marketing_consent
                  ? <span style={C.consentOk}>Sí · {formatConsentDate(user.marketing_consent_at)}</span>
                  : <span style={C.consentMissing}>Pendiente</span>}
              </p>
              <p style={C.consentLine}>
                Datos de peques:{' '}
                {user.kids_data_consent
                  ? <span style={C.consentOk}>Sí · {formatConsentDate(user.kids_data_consent_at)}</span>
                  : <span style={C.consentMissing}>Pendiente</span>}
              </p>
              <span style={C.userLevel}>{getLevel(user.points || 0)}</span>
            </div>
            <div>
              <p style={C.userPoints}>{(user.points || 0).toLocaleString()} ⭐</p>
              <p style={C.userPointsSub}>estrellas</p>
            </div>
          </div>
          {!!user.wishlist_items?.length && (
            <div style={C.wishlistPanel}>
              <p style={C.kidsTitle}>WISHLIST</p>
              {user.wishlist_items.slice(0, 4).map(item => {
                const image = getWishlistImage(item)
                const displayPrice = getWishlistDisplayPrice(item)
                return (
                  <div key={item.id} style={C.wishlistRow}>
                    <div style={{ display:'flex', gap:9, minWidth:0 }}>
                      {image
                        ? <img src={image} alt={getWishlistDisplayTitle(item)} style={C.wishlistThumb} />
                        : <span style={C.wishlistFallback}>🎁</span>}
                      <div>
                        <p style={C.wishlistName}>{getWishlistDisplayTitle(item)}</p>
                        <p style={C.wishlistMeta}>
                          {item.child_name || 'General'} · {formatPrice(displayPrice) || 'Sin precio'}
                        </p>
                        <p style={C.wishlistMeta}>
                          {getWishlistSourceLabel(item.source)}
                          {item.sku ? ` · SKU ${item.sku}` : ''}
                        </p>
                        {item.match_status === 'pending_confirmation' && (
                          <p style={C.wishlistNote}>Pendiente de conectar/confirmar con catálogo.</p>
                        )}
                        {item.product_url && (
                          <a style={C.wishlistLink} href={item.product_url} target="_blank" rel="noopener noreferrer">Abrir producto</a>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={C.wishlistBadge}>{getWishlistStatusLabel(item.status)}</span>
                      <div style={{ marginTop:5 }}>
                        <span style={item.match_status === 'pending_confirmation' ? C.wishlistPendingBadge : C.wishlistBadge}>
                          {getWishlistMatchLabel(item.match_status)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {user.wishlist_items.length > 4 && (
                <p style={C.wishlistMeta}>+{user.wishlist_items.length - 4} juguetes más</p>
              )}
            </div>
          )}
          {!!user.children?.length && (
            <div style={C.kidsBox}>
              <p style={C.kidsTitle}>MIS PEQUES</p>
              {user.children.map(child => (
                <div key={child.id} style={C.kidRow}>
                  <div>
                    <div style={C.kidIdentity}>
                      {child.avatar_url
                        ? <img src={child.avatar_url} alt={`Foto de ${child.nickname}`} style={C.kidPhoto} />
                        : <span style={C.kidIconAvatar}>{getAvatarIcon(child.avatar)}</span>}
                      <p style={C.kidName}>{child.nickname}</p>
                    </div>
                    <p style={C.kidMeta}>
                      {calculateAge(child.birth_date)} años · {new Date(`${child.birth_date}T00:00:00`).toLocaleDateString('es-CO', { day:'numeric', month:'long' })}
                    </p>
                    <p style={C.consentLine}>
                      Consentimiento:{' '}
                      {child.consent_at
                        ? <span style={C.consentOk}>Sí · {formatConsentDate(child.consent_at)}</span>
                        : <span style={C.consentMissing}>Pendiente</span>}
                    </p>
                    {!!child.interests?.length && (
                      <div style={C.interestsRow}>
                        {child.interests.map(interest => <span key={interest} style={C.interestPill}>{interest}</span>)}
                      </div>
                    )}
                    <div style={C.passportPanel}>
                      <p style={C.kidsTitle}>PASAPORTE RAV</p>
                      <p style={C.kidMeta}>
                        Sellos: {1 + new Set((child.passport_stamps || []).map(stamp => stamp.stamp_key)).size} · Eventos: {(child.passport_stamps || []).length}
                      </p>
                      <p style={C.kidMeta}>
                        Última actividad: {(child.passport_stamps || [])[0]
                          ? formatConsentDate(child.passport_stamps[0].created_at)
                          : 'Primer Viaje RAV'}
                      </p>
                      {!!child.passport_stamps?.length && (
                        <div style={C.passportMini}>
                          {child.passport_stamps.slice(0, 3).map(stamp => (
                            <span key={stamp.id} style={C.passportChip}>
                              {stamp.stamp_name} · +{stamp.points_awarded || 0}⭐
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={C.stampForm}>
                        <select
                          style={C.stampSelect}
                          value={stampInputs[child.id] || 'mission'}
                          onChange={e => setStampInputs(prev => ({ ...prev, [child.id]: e.target.value }))}
                        >
                          {PASSPORT_STAMPS.map(stamp => (
                            <option key={stamp.id} value={stamp.id}>{stamp.name}</option>
                          ))}
                        </select>
                        <input
                          style={C.stampInput}
                          type="number"
                          placeholder="⭐"
                          value={stampPoints[child.id] ?? '25'}
                          onChange={e => setStampPoints(prev => ({ ...prev, [child.id]: e.target.value }))}
                        />
                        <input
                          style={C.stampInput}
                          placeholder="Nota: juego, portal, visita..."
                          value={stampNotes[child.id] || ''}
                          onChange={e => setStampNotes(prev => ({ ...prev, [child.id]: e.target.value }))}
                        />
                        <button style={C.stampBtn} onClick={() => handlePassportStamp(user, child)}>
                          + Sello
                        </button>
                      </div>
                    </div>
                  </div>
                  <p style={C.kidCountdown}>{getBirthdayCountdown(child.birth_date)}</p>
                </div>
              ))}
            </div>
          )}
          <div style={C.pointsRow}>
            <input
              style={C.pointsInput}
              type="number"
              placeholder="Puntos"
              value={pointsInputs[user.id] || ''}
              onChange={e => setPointsInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
            />
            <input
              style={C.descInput}
              placeholder="Descripción (ej: Compra tienda)"
              value={descInputs[user.id] || ''}
              onChange={e => setDescInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
            />
            <button style={C.addBtn} onClick={() => handlePoints(user, 'add')}>+ Agregar</button>
            <button style={C.removeBtn} onClick={() => handlePoints(user, 'remove')}>- Quitar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
