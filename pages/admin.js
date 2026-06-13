import { useState, useEffect } from 'react'

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
  statLabel: { fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2, fontWeight:700 },
  kidsBox: { background:'rgba(43,63,191,0.12)', border:'1px solid rgba(43,63,191,0.35)', borderRadius:12, padding:'10px 12px', margin:'10px 0 12px' },
  kidsTitle: { fontSize:10, fontWeight:900, color:'rgba(170,235,58,0.7)', letterSpacing:1, marginBottom:8 },
  kidRow: { display:'flex', justifyContent:'space-between', gap:12, padding:'8px 0', borderTop:'1px solid rgba(255,255,255,0.07)' },
  kidName: { fontSize:13, fontWeight:900, color:'white' },
  kidMeta: { fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:2 },
  kidCountdown: { fontSize:11, fontWeight:900, color:'#AAEB3A', textAlign:'right', whiteSpace:'nowrap' },
  interestsRow: { display:'flex', flexWrap:'wrap', gap:6, marginTop:6 },
  interestPill: { padding:'4px 7px', borderRadius:10, background:'rgba(170,235,58,0.12)', border:'1px solid rgba(170,235,58,0.22)', color:'rgba(170,235,58,0.82)', fontSize:10, fontWeight:800 },
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

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.country || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.children || []).some(child =>
      (child.nickname || '').toLowerCase().includes(search.toLowerCase()) ||
      (child.interests || []).some(interest => interest.toLowerCase().includes(search.toLowerCase()))
    )
  )

  const totalUsers = users.length
  const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0)
  const legends = users.filter(u => (u.points || 0) >= 2000).length
  const totalKids = users.reduce((sum, u) => sum + (u.children?.length || 0), 0)
  const birthdaySoon = users.reduce((sum, u) => {
    return sum + (u.children || []).filter(child => {
      const countdown = getBirthdayCountdown(child.birth_date)
      if (countdown === 'Cumple hoy' || countdown === 'Cumple mañana') return true
      const days = parseInt(countdown, 10)
      return !Number.isNaN(days) && days <= 30
    }).length
  }, 0)

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
              <span style={C.userLevel}>{getLevel(user.points || 0)}</span>
            </div>
            <div>
              <p style={C.userPoints}>{(user.points || 0).toLocaleString()} ⭐</p>
              <p style={C.userPointsSub}>estrellas</p>
            </div>
          </div>
          {!!user.children?.length && (
            <div style={C.kidsBox}>
              <p style={C.kidsTitle}>MIS PEQUES</p>
              {user.children.map(child => (
                <div key={child.id} style={C.kidRow}>
                  <div>
                    <p style={C.kidName}>{getAvatarIcon(child.avatar)} {child.nickname}</p>
                    <p style={C.kidMeta}>
                      {calculateAge(child.birth_date)} años · {new Date(`${child.birth_date}T00:00:00`).toLocaleDateString('es-CO', { day:'numeric', month:'long' })}
                    </p>
                    {!!child.interests?.length && (
                      <div style={C.interestsRow}>
                        {child.interests.map(interest => <span key={interest} style={C.interestPill}>{interest}</span>)}
                      </div>
                    )}
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
