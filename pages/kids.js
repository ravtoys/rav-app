import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const INTERESTS = [
  'Dinosaurios',
  'Muñecas',
  'Carros',
  'Ciencia',
  'Arte',
  'Bebés',
  'Construcción',
  'Peluches',
  'Juegos de mesa',
  'Fantasía',
  'Superhéroes',
  'Tecnología',
]

const AVATARS = [
  { id:'alien', icon:'👽', label:'Alien' },
  { id:'rocket', icon:'🚀', label:'Cohete' },
  { id:'star', icon:'⭐', label:'Estrella' },
  { id:'planet', icon:'🪐', label:'Planeta' },
  { id:'helmet', icon:'🧑‍🚀', label:'Casco' },
]

const PASSPORT_STAMPS = [
  { id:'first-trip', name:'Primer Viaje RAV', icon:'🛸', automatic:true },
  { id:'birthday', name:'Cumple RAV', icon:'🎂' },
  { id:'jungle', name:'Visitó la Selva', icon:'🌿' },
  { id:'dino-hunter', name:'Cazador de Dinosaurios', icon:'🦖' },
  { id:'pilot', name:'Piloto RAV', icon:'🚀' },
  { id:'scientist', name:'Peque Científico', icon:'🔬' },
  { id:'artist', name:'Artista Galáctico', icon:'🎨' },
  { id:'builder', name:'Constructor Estelar', icon:'🧱' },
  { id:'mission', name:'Misión Cumplida', icon:'⭐' },
  { id:'legend', name:'Leyenda en Formación', icon:'🏆' },
]

const C = {
  page: { minHeight:'100vh', background:'#080618', paddingBottom:92 },
  header: { background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', padding:'22px 20px 18px' },
  eyebrow: { fontSize:11, color:'rgba(170,235,58,0.7)', fontWeight:900, letterSpacing:1, marginBottom:4 },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:22, fontWeight:900, color:'white', lineHeight:1.1 },
  sub: { fontSize:12, color:'rgba(255,255,255,0.58)', marginTop:8, lineHeight:1.45 },
  body: { padding:'14px 16px' },
  panel: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:14, marginBottom:14 },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  label: { fontSize:10, color:'rgba(170,235,58,0.65)', fontWeight:900, letterSpacing:1, margin:'0 0 6px' },
  input: { width:'100%', padding:'12px 13px', borderRadius:12, border:'1px solid rgba(170,235,58,0.28)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none', marginBottom:12 },
  pills: { display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 },
  pill: { padding:'7px 10px', borderRadius:16, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.62)', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  pillActive: { padding:'7px 10px', borderRadius:16, border:'1px solid #AAEB3A', background:'rgba(170,235,58,0.16)', color:'#AAEB3A', fontSize:11, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  avatarRow: { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:14 },
  avatarBtn: { height:50, borderRadius:14, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'white', fontSize:23, cursor:'pointer' },
  avatarBtnActive: { height:50, borderRadius:14, border:'1.5px solid #AAEB3A', background:'rgba(170,235,58,0.16)', color:'white', fontSize:23, cursor:'pointer' },
  btn: { width:'100%', padding:'14px', borderRadius:14, border:'none', background:'#AAEB3A', color:'#080618', fontSize:14, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  ghostBtn: { width:'100%', padding:'12px', borderRadius:14, border:'1px solid rgba(255,255,255,0.14)', background:'transparent', color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif", marginTop:8 },
  err: { color:'#ff6666', fontSize:12, marginBottom:10 },
  consentBox: { display:'flex', gap:12, alignItems:'flex-start', padding:'12px', borderRadius:14, border:'1.5px solid rgba(170,235,58,0.55)', background:'rgba(170,235,58,0.08)', cursor:'pointer', marginBottom:14 },
  checkbox: { width:22, height:22, marginTop:1, accentColor:'#AAEB3A', flexShrink:0, cursor:'pointer' },
  consentTitle: { color:'#AAEB3A', fontSize:13, fontWeight:900, marginBottom:4 },
  consentText: { color:'rgba(255,255,255,0.72)', fontSize:11, lineHeight:1.35 },
  sectionTitle: { fontSize:10, fontWeight:900, color:'rgba(255,255,255,0.35)', letterSpacing:1, margin:'2px 0 10px' },
  empty: { textAlign:'center', padding:'34px 18px', color:'rgba(255,255,255,0.42)', fontSize:13, lineHeight:1.45 },
  card: { background:'rgba(170,235,58,0.06)', border:'1px solid rgba(170,235,58,0.18)', borderRadius:14, padding:14, marginBottom:10 },
  cardTop: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:12 },
  cardLeft: { display:'flex', alignItems:'center', gap:12, minWidth:0 },
  avatar: { width:48, height:48, borderRadius:16, background:'rgba(170,235,58,0.15)', border:'1px solid rgba(170,235,58,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:25, flexShrink:0 },
  name: { color:'white', fontSize:15, fontWeight:900, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  meta: { color:'rgba(255,255,255,0.45)', fontSize:11, marginTop:3 },
  countdown: { color:'#AAEB3A', fontSize:11, fontWeight:900, textAlign:'right' },
  cardBtns: { display:'flex', gap:8, marginTop:12 },
  smallBtn: { flex:1, padding:'10px', borderRadius:12, border:'1px solid rgba(170,235,58,0.25)', background:'transparent', color:'#AAEB3A', fontSize:12, fontWeight:900, cursor:'pointer' },
  deleteBtn: { flex:1, padding:'10px', borderRadius:12, border:'1px solid rgba(255,100,100,0.25)', background:'rgba(200,30,30,0.08)', color:'#ff6666', fontSize:12, fontWeight:900, cursor:'pointer' },
  passportBtn: { width:'100%', padding:'12px', borderRadius:14, border:'1px solid rgba(170,235,58,0.55)', background:'linear-gradient(135deg,rgba(170,235,58,0.22),rgba(43,63,191,0.26))', color:'#AAEB3A', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif", marginTop:10 },
  disabledBtn: { width:'100%', padding:'10px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.32)', fontSize:11, fontWeight:900, marginTop:10 },
  overlay: { position:'fixed', inset:0, zIndex:20, background:'rgba(8,6,24,0.92)', padding:'16px', overflowY:'auto' },
  passport: { maxWidth:520, margin:'0 auto 92px', background:'linear-gradient(180deg,rgba(26,10,61,0.98),rgba(13,11,43,0.98))', border:'1px solid rgba(170,235,58,0.28)', borderRadius:18, padding:16, boxShadow:'0 18px 50px rgba(0,0,0,0.4)' },
  passportTop: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:14 },
  passportTitle: { fontFamily:"'Exo 2',sans-serif", fontSize:23, fontWeight:900, color:'#AAEB3A', lineHeight:1.1 },
  passportSub: { color:'rgba(255,255,255,0.58)', fontSize:12, lineHeight:1.45, marginTop:8 },
  closeBtn: { width:36, height:36, borderRadius:18, border:'1px solid rgba(255,255,255,0.16)', background:'rgba(255,255,255,0.06)', color:'white', fontSize:18, cursor:'pointer', flexShrink:0 },
  passportHero: { display:'flex', alignItems:'center', gap:12, background:'rgba(170,235,58,0.08)', border:'1px solid rgba(170,235,58,0.2)', borderRadius:16, padding:12, marginBottom:14 },
  passportAvatar: { width:62, height:62, borderRadius:20, background:'rgba(170,235,58,0.16)', border:'1px solid rgba(170,235,58,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, flexShrink:0 },
  passportName: { color:'white', fontSize:18, fontWeight:900 },
  passportMeta: { color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:4 },
  stampStats: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 },
  miniStat: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:12 },
  miniStatNum: { fontFamily:"'Exo 2',sans-serif", fontSize:22, fontWeight:900, color:'#AAEB3A' },
  miniStatLabel: { fontSize:10, color:'rgba(255,255,255,0.42)', fontWeight:900, marginTop:2 },
  stampGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 },
  stamp: { minHeight:94, borderRadius:16, border:'1px dashed rgba(170,235,58,0.48)', background:'rgba(170,235,58,0.1)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:10, textAlign:'center' },
  stampLocked: { minHeight:94, borderRadius:16, border:'1px dashed rgba(255,255,255,0.14)', background:'rgba(255,255,255,0.035)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:10, textAlign:'center', filter:'grayscale(0.5)' },
  stampIcon: { fontSize:26, marginBottom:6 },
  stampName: { color:'white', fontSize:12, fontWeight:900, lineHeight:1.15 },
  stampState: { color:'rgba(170,235,58,0.75)', fontSize:9, fontWeight:900, letterSpacing:1, marginTop:6 },
  stampStateLocked: { color:'rgba(255,255,255,0.32)', fontSize:9, fontWeight:900, letterSpacing:1, marginTop:6 },
}

const blankForm = {
  nickname: '',
  birth_date: '',
  interests: [],
  avatar: 'alien',
}

const KIDS_CONSENT_TEXT = 'Confirmo que soy madre, padre o acudiente del peque y autorizo a RAV Toys a usar esta información para beneficios, recomendaciones, sorpresas de cumpleaños y comunicaciones del RAV Club.'

function getAvatarIcon(id) {
  return AVATARS.find((avatar) => avatar.id === id)?.icon || '👽'
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
  if (days === 0) return 'Cumple hoy 🎉'
  if (days === 1) return 'Cumple mañana'
  return `${days} días para su cumple`
}

export default function Kids() {
  const [userId, setUserId] = useState('')
  const [kids, setKids] = useState([])
  const [form, setForm] = useState(blankForm)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [kidsConsent, setKidsConsent] = useState(false)
  const [selectedPassport, setSelectedPassport] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUserId(user.id)
      await loadKids(user.id)
    }
    load()
  }, [])

  const loadKids = async (parentId = userId) => {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*, passport_stamps:child_passport_stamps(*)')
      .eq('parent_id', parentId)
      .order('birth_date', { ascending: false })

    if (!error) setKids(data || [])
    setLoading(false)
  }

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(item => item !== interest)
        : [...prev.interests, interest],
    }))
  }

  const resetForm = () => {
    setForm(blankForm)
    setEditingId('')
    setKidsConsent(false)
    setError('')
  }

  const startEdit = (kid) => {
    setForm({
      nickname: kid.nickname || '',
      birth_date: kid.birth_date || '',
      interests: kid.interests || [],
      avatar: kid.avatar || 'alien',
    })
    setEditingId(kid.id)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveKid = async () => {
    if (!form.nickname.trim() || !form.birth_date) {
      setError('Nombre y cumpleaños son obligatorios')
      return
    }

    if (new Date(`${form.birth_date}T00:00:00`) > new Date()) {
      setError('La fecha de cumpleaños no puede estar en el futuro')
      return
    }

    if (!editingId && !kidsConsent) {
      setError('Debes confirmar que eres madre, padre o acudiente')
      return
    }

    setSaving(true)
    setError('')
    const consentAt = new Date().toISOString()

    const payload = {
      parent_id: userId,
      nickname: form.nickname.trim(),
      birth_date: form.birth_date,
      interests: form.interests,
      avatar: form.avatar,
      updated_at: new Date().toISOString(),
    }

    if (!editingId) {
      payload.consent_at = consentAt
      payload.consent_text = KIDS_CONSENT_TEXT
    }

    const result = editingId
      ? await supabase.from('child_profiles').update(payload).eq('id', editingId)
      : await supabase.from('child_profiles').insert(payload)

    if (result.error) {
      setError('No se pudo guardar. Intenta de nuevo.')
    } else {
      if (!editingId) {
        await supabase
          .from('profiles')
          .update({
            kids_data_consent: true,
            kids_data_consent_at: consentAt,
            kids_data_consent_text: KIDS_CONSENT_TEXT,
          })
          .eq('id', userId)
      }
      resetForm()
      await loadKids()
    }

    setSaving(false)
  }

  const deleteKid = async (kid) => {
    const ok = window.confirm(`¿Eliminar el perfil de ${kid.nickname}?`)
    if (!ok) return
    const { error } = await supabase.from('child_profiles').delete().eq('id', kid.id)
    if (error) setError('No se pudo eliminar. Intenta de nuevo.')
    else await loadKids()
  }

  const hasStamp = (kid, stamp) => {
    return stamp.automatic || (kid.passport_stamps || []).some(item => item.stamp_key === stamp.id)
  }

  const earnedStampCount = (kid) => {
    const earnedKeys = new Set((kid.passport_stamps || []).map(item => item.stamp_key))
    return 1 + earnedKeys.size
  }

  return (
    <div style={C.page}>
      <div style={C.header}>
        <p style={C.eyebrow}>MIS PEQUES</p>
        <p style={C.title}>Mis Pequeños Exploradores</p>
        <p style={C.sub}>Abre un universo de sorpresas pensadas para sus gustos, su edad y sus aventuras.</p>
      </div>

      <div style={C.body}>
        <div style={C.panel}>
          <p style={C.sectionTitle}>{editingId ? 'EDITAR EXPLORADOR' : 'CREAR EXPLORADOR'}</p>
          {error && <p style={C.err}>{error}</p>}

          <label style={C.label}>NOMBRE O APODO</label>
          <input
            style={C.input}
            placeholder="Ej: Sofi, Mateo, Vale"
            value={form.nickname}
            onChange={e => setForm(prev => ({ ...prev, nickname: e.target.value }))}
          />

          <div style={C.row}>
            <div>
              <label style={C.label}>CUMPLEAÑOS</label>
              <input
                style={C.input}
                type="date"
                value={form.birth_date}
                onChange={e => setForm(prev => ({ ...prev, birth_date: e.target.value }))}
              />
            </div>
            <div>
              <label style={C.label}>AVATAR</label>
              <div style={C.avatarRow}>
                {AVATARS.map(avatar => (
                  <button
                    key={avatar.id}
                    style={form.avatar === avatar.id ? C.avatarBtnActive : C.avatarBtn}
                    onClick={() => setForm(prev => ({ ...prev, avatar: avatar.id }))}
                    title={avatar.label}
                    type="button"
                  >
                    {avatar.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label style={C.label}>GUSTOS FAVORITOS</label>
          <div style={C.pills}>
            {INTERESTS.map(interest => (
              <button
                key={interest}
                style={form.interests.includes(interest) ? C.pillActive : C.pill}
                onClick={() => toggleInterest(interest)}
                type="button"
              >
                {interest}
              </button>
            ))}
          </div>

          {!editingId && (
            <label style={C.consentBox}>
              <input
                style={C.checkbox}
                type="checkbox"
                checked={kidsConsent}
                onChange={e => setKidsConsent(e.target.checked)}
              />
              <span>
                <span style={C.consentTitle}>Sí, soy madre, padre o acudiente y autorizo</span>
                <span style={C.consentText}>{KIDS_CONSENT_TEXT}</span>
              </span>
            </label>
          )}

          <button style={C.btn} onClick={saveKid} disabled={saving}>
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar peque'}
          </button>
          {editingId && <button style={C.ghostBtn} onClick={resetForm}>Cancelar edición</button>}
        </div>

        <p style={C.sectionTitle}>EXPLORADORES GUARDADOS</p>
        {loading && <p style={C.empty}>Cargando...</p>}
        {!loading && kids.length === 0 && (
          <div style={C.panel}>
            <div style={C.empty}>
              <p style={{ fontSize:36, marginBottom:8 }}>🛸</p>
              <p>Aún no tienes pequeños exploradores.</p>
              <p style={{ color:'rgba(170,235,58,0.55)', marginTop:4 }}>Crea el primero y empecemos la misión.</p>
            </div>
          </div>
        )}

        {kids.map(kid => (
          <div key={kid.id} style={C.card}>
            <div style={C.cardTop}>
              <div style={C.cardLeft}>
                <div style={C.avatar}>{getAvatarIcon(kid.avatar)}</div>
                <div style={{ minWidth:0 }}>
                  <p style={C.name}>{kid.nickname}</p>
                  <p style={C.meta}>{calculateAge(kid.birth_date)} años · {new Date(`${kid.birth_date}T00:00:00`).toLocaleDateString('es-CO', { day:'numeric', month:'long' })}</p>
                </div>
              </div>
              <p style={C.countdown}>{getBirthdayCountdown(kid.birth_date)}</p>
            </div>

            {!!kid.interests?.length && (
              <div style={C.pills}>
                {kid.interests.map(interest => <span key={interest} style={C.pillActive}>{interest}</span>)}
              </div>
            )}

            <button style={C.passportBtn} onClick={() => setSelectedPassport(kid)}>
              Ver Pasaporte
            </button>
            <button style={C.disabledBtn} disabled>Wishlist próximamente</button>
            <div style={C.cardBtns}>
              <button style={C.smallBtn} onClick={() => startEdit(kid)}>Editar</button>
              <button style={C.deleteBtn} onClick={() => deleteKid(kid)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {selectedPassport && (
        <div style={C.overlay}>
          <div style={C.passport}>
            <div style={C.passportTop}>
              <div>
                <p style={C.passportTitle}>Pasaporte de {selectedPassport.nickname}</p>
                <p style={C.passportSub}>Cada aventura, cumpleaños y sorpresa queda guardada en su universo RAV.</p>
              </div>
              <button style={C.closeBtn} onClick={() => setSelectedPassport(null)}>×</button>
            </div>

            <p style={C.sectionTitle}>PERFIL DEL PEQUE</p>
            <div style={C.passportHero}>
              <div style={C.passportAvatar}>{getAvatarIcon(selectedPassport.avatar)}</div>
              <div style={{ minWidth:0 }}>
                <p style={C.passportName}>{selectedPassport.nickname}</p>
                <p style={C.passportMeta}>{calculateAge(selectedPassport.birth_date)} años</p>
                <p style={C.passportMeta}>{getBirthdayCountdown(selectedPassport.birth_date)}</p>
              </div>
            </div>

            {!!selectedPassport.interests?.length && (
              <div style={C.pills}>
                {selectedPassport.interests.map(interest => <span key={interest} style={C.pillActive}>{interest}</span>)}
              </div>
            )}

            <div style={C.stampStats}>
              <div style={C.miniStat}>
                <p style={C.miniStatNum}>{earnedStampCount(selectedPassport)}</p>
                <p style={C.miniStatLabel}>SELLO GANADO</p>
              </div>
              <div style={C.miniStat}>
                <p style={C.miniStatNum}>{PASSPORT_STAMPS.length}</p>
                <p style={C.miniStatLabel}>MISIONES RAV</p>
              </div>
            </div>

            <p style={C.sectionTitle}>SELLOS</p>
            <div style={C.stampGrid}>
              {PASSPORT_STAMPS.map(stamp => (
                <div key={stamp.id} style={hasStamp(selectedPassport, stamp) ? C.stamp : C.stampLocked}>
                  <p style={C.stampIcon}>{stamp.icon}</p>
                  <p style={C.stampName}>{stamp.name}</p>
                  <p style={hasStamp(selectedPassport, stamp) ? C.stampState : C.stampStateLocked}>
                    {hasStamp(selectedPassport, stamp) ? 'DESBLOQUEADO' : 'POR GANAR'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Navbar active="kids" />
    </div>
  )
}
