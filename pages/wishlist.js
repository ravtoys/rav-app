import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const STATUS_LABELS = {
  wanted: 'Deseado',
  purchased: 'Comprado',
  unavailable: 'Agotado',
}

const MATCH_LABELS = {
  manual_confirmed: 'Confirmado manualmente',
  pending_confirmation: 'RAV lo está confirmando',
  shopify_matched: 'Confirmado por Shopify',
}

const blankManualForm = {
  title: '',
  image_url: '',
  price: '',
  product_url: '',
  child_id: '',
  status: 'wanted',
}

const C = {
  page: { minHeight:'100vh', background:'#080618', paddingBottom:92 },
  header: { background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', padding:'22px 20px 18px' },
  eyebrow: { fontSize:11, color:'rgba(170,235,58,0.7)', fontWeight:900, letterSpacing:1, marginBottom:4 },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:24, fontWeight:900, color:'white', lineHeight:1.1 },
  sub: { fontSize:12, color:'rgba(255,255,255,0.58)', marginTop:8, lineHeight:1.45 },
  body: { padding:'14px 16px' },
  topActions: { display:'flex', gap:10, alignItems:'center', marginBottom:14 },
  addBtn: { flex:1, padding:'14px', borderRadius:14, border:'none', background:'#AAEB3A', color:'#080618', fontSize:14, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  cancelBtn: { padding:'13px 14px', borderRadius:14, border:'1px solid rgba(255,255,255,0.14)', background:'transparent', color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  panel: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:14, marginBottom:14 },
  flowPanel: { background:'linear-gradient(180deg,rgba(170,235,58,0.09),rgba(43,63,191,0.1))', border:'1px solid rgba(170,235,58,0.24)', borderRadius:16, padding:14, marginBottom:14 },
  stepPill: { display:'inline-block', padding:'5px 9px', borderRadius:999, background:'rgba(170,235,58,0.14)', color:'#AAEB3A', border:'1px solid rgba(170,235,58,0.28)', fontSize:10, fontWeight:900, marginBottom:10 },
  question: { color:'white', fontSize:18, fontWeight:900, lineHeight:1.15, marginBottom:12 },
  helper: { color:'rgba(255,255,255,0.58)', fontSize:12, lineHeight:1.4, marginBottom:12 },
  optionGrid: { display:'grid', gap:10 },
  optionCard: { width:'100%', display:'flex', alignItems:'center', gap:12, textAlign:'left', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(8,6,24,0.58)', color:'white', borderRadius:14, padding:12, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  optionCardActive: { width:'100%', display:'flex', alignItems:'center', gap:12, textAlign:'left', border:'1.5px solid #AAEB3A', background:'rgba(170,235,58,0.12)', color:'white', borderRadius:14, padding:12, cursor:'pointer', fontFamily:"'Nunito',sans-serif", boxShadow:'0 0 18px rgba(170,235,58,0.12)' },
  optionIcon: { width:42, height:42, borderRadius:14, background:'rgba(170,235,58,0.14)', display:'flex', alignItems:'center', justifyContent:'center', color:'#AAEB3A', flexShrink:0 },
  optionTitle: { color:'white', fontSize:14, fontWeight:900, marginBottom:3 },
  optionSub: { color:'rgba(255,255,255,0.52)', fontSize:12, lineHeight:1.25 },
  secondaryOption: { width:'100%', display:'flex', alignItems:'center', gap:12, textAlign:'left', border:'1px dashed rgba(255,255,255,0.16)', background:'rgba(255,255,255,0.025)', color:'rgba(255,255,255,0.72)', borderRadius:14, padding:12, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  label: { fontSize:10, color:'rgba(170,235,58,0.65)', fontWeight:900, letterSpacing:1, margin:'0 0 6px' },
  input: { width:'100%', padding:'12px 13px', borderRadius:12, border:'1px solid rgba(170,235,58,0.28)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none', marginBottom:12 },
  select: { width:'100%', padding:'12px 13px', borderRadius:12, border:'1px solid rgba(170,235,58,0.28)', background:'#14102c', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none', marginBottom:12 },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  flowActions: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginTop:10 },
  backBtn: { padding:'12px', borderRadius:14, border:'1px solid rgba(255,255,255,0.14)', background:'transparent', color:'rgba(255,255,255,0.72)', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  saveBtn: { padding:'12px', borderRadius:14, border:'none', background:'#AAEB3A', color:'#080618', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  saveBtnDisabled: { padding:'12px', borderRadius:14, border:'none', background:'rgba(255,255,255,0.11)', color:'rgba(255,255,255,0.32)', fontSize:13, fontWeight:900, cursor:'not-allowed', fontFamily:"'Nunito',sans-serif" },
  uploadBox: { border:'1.5px dashed rgba(170,235,58,0.42)', background:'rgba(170,235,58,0.07)', borderRadius:16, padding:16, textAlign:'center', color:'white', marginBottom:12 },
  uploadPreview: { width:'100%', maxHeight:220, objectFit:'cover', borderRadius:14, border:'1px solid rgba(255,255,255,0.12)', marginBottom:10 },
  detectionBox: { border:'1px solid rgba(255,216,77,0.26)', background:'rgba(255,216,77,0.08)', borderRadius:12, padding:'10px 12px', marginBottom:12, textAlign:'left' },
  detectionTitle: { color:'#FFD84D', fontSize:11, fontWeight:900, letterSpacing:.6, marginBottom:5 },
  detectionText: { color:'rgba(255,255,255,0.72)', fontSize:12, lineHeight:1.35 },
  success: { background:'rgba(170,235,58,0.13)', border:'1px solid rgba(170,235,58,0.42)', color:'#AAEB3A', borderRadius:12, padding:'10px 12px', fontSize:12, fontWeight:800, marginBottom:12, lineHeight:1.35 },
  err: { color:'#ff6666', fontSize:12, marginBottom:10, lineHeight:1.35 },
  sectionTitle: { fontSize:10, fontWeight:900, color:'rgba(255,255,255,0.35)', letterSpacing:1, margin:'2px 0 10px' },
  empty: { textAlign:'center', padding:'34px 18px', color:'rgba(255,255,255,0.42)', fontSize:13, lineHeight:1.45 },
  card: { background:'rgba(170,235,58,0.06)', border:'1px solid rgba(170,235,58,0.18)', borderRadius:14, padding:12, marginBottom:10 },
  cardPending: { background:'linear-gradient(180deg,rgba(43,63,191,0.18),rgba(170,235,58,0.06))', border:'1px solid rgba(170,235,58,0.26)', borderRadius:14, padding:12, marginBottom:10 },
  cardTop: { display:'flex', gap:12, alignItems:'flex-start' },
  image: { width:76, height:76, borderRadius:14, objectFit:'cover', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 },
  imageFallback: { width:76, height:76, borderRadius:14, background:'rgba(170,235,58,0.12)', border:'1px solid rgba(170,235,58,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#AAEB3A', flexShrink:0 },
  cardInfo: { flex:1, minWidth:0 },
  toyTitle: { color:'white', fontSize:15, fontWeight:900, lineHeight:1.15 },
  meta: { color:'rgba(255,255,255,0.48)', fontSize:11, marginTop:5 },
  price: { color:'#AAEB3A', fontSize:13, fontWeight:900, marginTop:7 },
  estimatedPrice: { color:'#FFD84D', fontSize:12, fontWeight:900, marginTop:7 },
  badge: { display:'inline-block', padding:'5px 8px', borderRadius:12, background:'rgba(43,63,191,0.42)', border:'1px solid rgba(170,235,58,0.22)', color:'#AAEB3A', fontSize:10, fontWeight:900, marginTop:8 },
  pendingMsg: { color:'rgba(255,255,255,0.56)', fontSize:11, lineHeight:1.35, marginTop:7 },
  link: { display:'inline-block', color:'#AAEB3A', fontSize:11, fontWeight:900, marginTop:8, textDecoration:'none' },
  controls: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 },
  statusSelect: { width:'100%', padding:'10px', borderRadius:12, border:'1px solid rgba(170,235,58,0.25)', background:'#14102c', color:'white', fontSize:12, fontWeight:800, fontFamily:"'Nunito',sans-serif", outline:'none' },
  smallBtn: { padding:'10px', borderRadius:12, border:'1px solid rgba(170,235,58,0.25)', background:'transparent', color:'#AAEB3A', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  deleteBtn: { padding:'10px', borderRadius:12, border:'1px solid rgba(255,100,100,0.25)', background:'rgba(200,30,30,0.08)', color:'#ff6666', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
}

function Icon({ type, size = 22, color = 'currentColor' }) {
  const common = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', 'aria-hidden':'true' }
  if (type === 'gift') return <svg {...common}><path d="M5 10h14v10H5V10Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 10v10M5 14h14M8.5 10C6.8 8.7 6.7 6 8.7 6c1.7 0 2.6 2 3.3 4 .7-2 1.6-4 3.3-4 2 0 1.9 2.7.2 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (type === 'link') return <svg {...common}><path d="M9.5 14.5 14.5 9.5M10.5 7.5l1.1-1.1a4 4 0 0 1 5.7 5.7l-1.1 1.1M13.5 16.5l-1.1 1.1a4 4 0 0 1-5.7-5.7l1.1-1.1" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>
  if (type === 'camera') return <svg {...common}><path d="M5 8h3l1.4-2h5.2L16 8h3v10H5V8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="13" r="3" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'edit') return <svg {...common}><path d="M5 19h4l10-10-4-4L5 15v4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="m13.5 6.5 4 4" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>
  if (type === 'child') return <svg {...common}><circle cx="12" cy="10" r="4" stroke={color} strokeWidth="1.8"/><path d="M5.5 20c1.1-3.3 3.3-5 6.5-5s5.4 1.7 6.5 5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.8"/></svg>
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return Number(price).toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 })
}

function getAssignedName(item, kids) {
  if (!item.child_id) return 'General'
  return kids.find(kid => kid.id === item.child_id)?.nickname || 'Peque'
}

function extractTitleFromRavUrl(url) {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace(/^www\./, '')
    if (host !== 'ravtoys.com') return ''
    const parts = parsed.pathname.split('/').filter(Boolean)
    const slug = parts[parts.length - 1] || ''
    if (!slug) return ''
    return slug
      .replace(/-\d+$/g, '')
      .split('-')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  } catch {
    return ''
  }
}

function isRavUrl(url) {
  try {
    const parsed = new URL(url.trim())
    return parsed.hostname.replace(/^www\./, '') === 'ravtoys.com'
  } catch {
    return false
  }
}

function parseDetectedPrice(text) {
  const matches = text.match(/(?:\$|cop)?\s?(\d{1,3}(?:[.,]\d{3})+|\d{4,7})(?:\s?cop)?/gi) || []
  const prices = matches
    .map(match => Number(match.replace(/[^\d]/g, '')))
    .filter(value => value >= 1000 && value <= 5000000)
  return prices[0] || null
}

function parseDetectedTitle(text) {
  const lines = text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !/\$|cop|precio|total|iva|ref|sku|cod/i.test(line))
    .filter(line => /[a-záéíóúñ]/i.test(line))
    .filter(line => line.length >= 4 && line.length <= 70)

  return lines.sort((a, b) => b.length - a.length)[0] || ''
}

async function detectTextFromImage(file) {
  if (typeof window === 'undefined' || !window.TextDetector || !window.createImageBitmap) {
    return { supported:false, text:'', detected_title:'', detected_price:null }
  }

  const detector = new window.TextDetector()
  const bitmap = await window.createImageBitmap(file)
  const results = await detector.detect(bitmap)
  const text = results.map(item => item.rawValue || '').filter(Boolean).join('\n')
  return {
    supported:true,
    text,
    detected_title: parseDetectedTitle(text),
    detected_price: parseDetectedPrice(text),
  }
}

export default function Wishlist() {
  const [userId, setUserId] = useState('')
  const [kids, setKids] = useState([])
  const [items, setItems] = useState([])
  const [manualForm, setManualForm] = useState(blankManualForm)
  const [editingId, setEditingId] = useState('')
  const [showFlow, setShowFlow] = useState(false)
  const [flowStep, setFlowStep] = useState(1)
  const [selectedChildId, setSelectedChildId] = useState('')
  const [addMethod, setAddMethod] = useState('')
  const [ravLink, setRavLink] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoDetecting, setPhotoDetecting] = useState(false)
  const [photoDetection, setPhotoDetection] = useState({ supported:false, tried:false, title:'', price:null })
  const [showManual, setShowManual] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const photoInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUserId(user.id)
      await Promise.all([loadKids(user.id), loadItems(user.id)])
      setLoading(false)
    }
    load()
  }, [])

  const loadKids = async (parentId = userId) => {
    const { data } = await supabase
      .from('child_profiles')
      .select('id, nickname')
      .eq('parent_id', parentId)
      .order('nickname', { ascending: true })
    setKids(data || [])
  }

  const loadItems = async (ownerId = userId) => {
    const { data } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', ownerId)
      .order('created_at', { ascending: false })
    setItems(data || [])
  }

  const resetFlow = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setShowFlow(false)
    setFlowStep(1)
    setSelectedChildId('')
    setAddMethod('')
    setRavLink('')
    setPhotoFile(null)
    setPhotoPreview('')
    setPhotoDetecting(false)
    setPhotoDetection({ supported:false, tried:false, title:'', price:null })
    setShowManual(false)
    setManualForm(blankManualForm)
    setEditingId('')
    setError('')
  }

  const startAdd = () => {
    resetFlow()
    setMessage('')
    setShowFlow(true)
  }

  const chooseChild = (childId) => {
    setSelectedChildId(childId)
    setFlowStep(2)
    setError('')
  }

  const startEdit = (item) => {
    setManualForm({
      title: item.title || '',
      image_url: item.image_url || '',
      price: item.price ?? '',
      product_url: item.product_url || '',
      child_id: item.child_id || '',
      status: item.status || 'wanted',
    })
    setSelectedChildId(item.child_id || '')
    setEditingId(item.id)
    setShowManual(true)
    setShowFlow(true)
    setFlowStep(2)
    setAddMethod('manual')
    setError('')
    setMessage('')
    window.scrollTo({ top: 0, behavior:'smooth' })
  }

  const uploadWishlistPhoto = async (file) => {
    if (!file) return ''
    if (file.size > 3 * 1024 * 1024) throw new Error('La foto debe pesar menos de 3MB')
    if (!file.type.startsWith('image/')) throw new Error('Elige una imagen válida')
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/wishlist/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { cacheControl:'3600', upsert:true })
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  const saveRavLink = async () => {
    if (!isRavUrl(ravLink)) {
      setError('Pega un link válido de ravtoys.com')
      return
    }
    setSaving(true)
    setError('')
    const detectedTitle = extractTitleFromRavUrl(ravLink)
    const title = detectedTitle || 'Juguete pendiente por confirmar'
    const { error: insertError } = await supabase.from('wishlist_items').insert({
      user_id: userId,
      child_id: selectedChildId || null,
      title,
      detected_title: detectedTitle || null,
      product_url: ravLink.trim(),
      status: 'wanted',
      source: 'rav_link',
      match_status: 'pending_confirmation',
      updated_at: new Date().toISOString(),
    })

    if (insertError) setError('No se pudo guardar. Revisa que Supabase tenga las nuevas columnas de Wishlist.')
    else {
      resetFlow()
      setMessage('RAV confirmará este juguete antes de compartirlo.')
      await loadItems()
    }
    setSaving(false)
  }

  const savePhotoItem = async () => {
    if (!photoFile) {
      setError('Elige o toma una foto del juguete.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const uploadedUrl = await uploadWishlistPhoto(photoFile)
      const { error: insertError } = await supabase.from('wishlist_items').insert({
        user_id: userId,
        child_id: selectedChildId || null,
        title: photoDetection.title || 'Juguete pendiente por confirmar',
        detected_title: photoDetection.title || null,
        detected_price: photoDetection.price || null,
        uploaded_image_url: uploadedUrl,
        status: 'wanted',
        source: 'photo',
        match_status: 'pending_confirmation',
        updated_at: new Date().toISOString(),
      })
      if (insertError) throw insertError
      resetFlow()
      setMessage('Listo. Guardamos la foto y RAV confirmará el juguete y el precio.')
      await loadItems()
    } catch (err) {
      if (err?.message?.includes('3MB') || err?.message?.includes('imagen válida')) setError(err.message)
      else setError('No se pudo guardar la foto. Revisa Storage y las nuevas columnas de Wishlist.')
    }
    setSaving(false)
  }

  const saveManualItem = async () => {
    if (!manualForm.title.trim()) {
      setError('El nombre del juguete es obligatorio')
      return
    }
    if (manualForm.child_id && !kids.some(kid => kid.id === manualForm.child_id)) {
      setError('Ese peque no pertenece a tu cuenta')
      return
    }
    const cleanPrice = manualForm.price === '' ? null : Number(manualForm.price)
    if (cleanPrice !== null && (Number.isNaN(cleanPrice) || cleanPrice < 0)) {
      setError('El precio debe ser un número válido')
      return
    }

    setSaving(true)
    setError('')
    const payload = {
      user_id: userId,
      child_id: manualForm.child_id || null,
      title: manualForm.title.trim(),
      image_url: manualForm.image_url.trim() || null,
      price: cleanPrice,
      product_url: manualForm.product_url.trim() || null,
      status: manualForm.status,
      source: 'manual',
      match_status: 'manual_confirmed',
      updated_at: new Date().toISOString(),
    }

    const result = editingId
      ? await supabase.from('wishlist_items').update(payload).eq('id', editingId).eq('user_id', userId)
      : await supabase.from('wishlist_items').insert(payload)

    if (result.error) setError('No se pudo guardar. Intenta de nuevo.')
    else {
      resetFlow()
      await loadItems()
    }
    setSaving(false)
  }

  const choosePhoto = async (file) => {
    if (!file) return
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoDetection({ supported:false, tried:false, title:'', price:null })
    setError('')

    setPhotoDetecting(true)
    try {
      const result = await detectTextFromImage(file)
      setPhotoDetection({
        supported: result.supported,
        tried: true,
        title: result.detected_title || '',
        price: result.detected_price || null,
      })
    } catch {
      setPhotoDetection({ supported:true, tried:true, title:'', price:null })
    }
    setPhotoDetecting(false)
  }

  const updateStatus = async (item, status) => {
    const { error } = await supabase
      .from('wishlist_items')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .eq('user_id', userId)

    if (!error) setItems(prev => prev.map(current => current.id === item.id ? { ...current, status } : current))
  }

  const deleteItem = async (item) => {
    const ok = window.confirm(`¿Eliminar "${item.title}" de la Wishlist?`)
    if (!ok) return
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', item.id)
      .eq('user_id', userId)

    if (error) setError('No se pudo eliminar. Intenta de nuevo.')
    else setItems(prev => prev.filter(current => current.id !== item.id))
  }

  const selectedChildName = selectedChildId ? kids.find(kid => kid.id === selectedChildId)?.nickname : 'General'

  return (
    <div style={C.page}>
      <div style={C.header}>
        <p style={C.eyebrow}>WISHLIST</p>
        <p style={C.title}>Wishlist RAV</p>
        <p style={C.sub}>Guarda sus juguetes favoritos y empieza a construir una lista mágica para compartir más adelante.</p>
      </div>

      <div style={C.body}>
        <div style={C.topActions}>
          <button style={C.addBtn} onClick={startAdd}>Agregar juguete</button>
          {showFlow && <button style={C.cancelBtn} onClick={resetFlow}>Cancelar</button>}
        </div>

        {message && <div style={C.success}>{message}</div>}
        {error && !showFlow && <p style={C.err}>{error}</p>}

        {showFlow && (
          <div style={C.flowPanel}>
            {error && <p style={C.err}>{error}</p>}

            {flowStep === 1 && (
              <>
                <span style={C.stepPill}>PASO 1</span>
                <p style={C.question}>¿Para quién es este regalo?</p>
                <div style={C.optionGrid}>
                  <button style={selectedChildId === '' ? C.optionCardActive : C.optionCard} onClick={() => chooseChild('')}>
                    <span style={C.optionIcon}><Icon type="gift" /></span>
                    <span><span style={C.optionTitle}>General</span><span style={C.optionSub}>Para la wishlist familiar.</span></span>
                  </button>
                  {kids.map(kid => (
                    <button key={kid.id} style={selectedChildId === kid.id ? C.optionCardActive : C.optionCard} onClick={() => chooseChild(kid.id)}>
                      <span style={C.optionIcon}><Icon type="child" /></span>
                      <span><span style={C.optionTitle}>{kid.nickname}</span><span style={C.optionSub}>Guardar para este peque.</span></span>
                    </button>
                  ))}
                  <button style={C.secondaryOption} onClick={() => router.push('/kids')}>
                    <span style={C.optionIcon}><Icon type="plus" /></span>
                    <span><span style={C.optionTitle}>Agregar peque</span><span style={C.optionSub}>Crea un perfil antes de guardar el regalo.</span></span>
                  </button>
                </div>
              </>
            )}

            {flowStep === 2 && (
              <>
                <span style={C.stepPill}>PASO 2 · {selectedChildName}</span>
                <p style={C.question}>¿Qué juguete quieres guardar?</p>
                <p style={C.helper}>Elige la forma más rápida. RAV lo confirmará después.</p>

                <div style={C.optionGrid}>
                  <button style={addMethod === 'rav_link' ? C.optionCardActive : C.optionCard} onClick={() => setAddMethod('rav_link')}>
                    <span style={C.optionIcon}><Icon type="link" /></span>
                    <span><span style={C.optionTitle}>Pegar link de RAV</span><span style={C.optionSub}>Pega el link del juguete en ravtoys.com.</span></span>
                  </button>
                  <button style={addMethod === 'photo' ? C.optionCardActive : C.optionCard} onClick={() => { setAddMethod('photo'); photoInputRef.current?.click() }}>
                    <span style={C.optionIcon}><Icon type="camera" /></span>
                    <span><span style={C.optionTitle}>Tomar foto en tienda</span><span style={C.optionSub}>Tómale una foto al juguete o a la etiqueta y RAV lo confirmará.</span></span>
                  </button>
                  <button style={addMethod === 'manual' ? C.secondaryOption : C.secondaryOption} onClick={() => { setAddMethod('manual'); setShowManual(true); setManualForm(prev => ({ ...prev, child_id:selectedChildId })) }}>
                    <span style={C.optionIcon}><Icon type="edit" /></span>
                    <span><span style={C.optionTitle}>Agregar manualmente</span><span style={C.optionSub}>Solo pruebas internas.</span></span>
                  </button>
                </div>

                {addMethod === 'rav_link' && (
                  <div style={{ marginTop:14 }}>
                    <label style={C.label}>LINK DE RAVTOYS.COM</label>
                    <input style={C.input} placeholder="https://ravtoys.com/products/..." value={ravLink} onChange={e => setRavLink(e.target.value)} />
                    <p style={C.helper}>RAV confirmará este juguete antes de compartirlo.</p>
                    <div style={C.flowActions}>
                      <button style={C.backBtn} onClick={() => setFlowStep(1)}>Atrás</button>
                      <button style={ravLink.trim() ? C.saveBtn : C.saveBtnDisabled} onClick={saveRavLink} disabled={!ravLink.trim() || saving}>{saving ? 'Guardando...' : 'Guardar link'}</button>
                    </div>
                  </div>
                )}

                {addMethod === 'photo' && (
                  <div style={{ marginTop:14 }}>
                    <input ref={photoInputRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e => choosePhoto(e.target.files?.[0])} />
                    <button style={C.uploadBox} onClick={() => photoInputRef.current?.click()}>
                      {photoPreview ? <img src={photoPreview} alt="Foto del juguete" style={C.uploadPreview} /> : <Icon type="camera" size={34} color="#AAEB3A" />}
                      <p style={{ fontWeight:900, marginTop:8 }}>{photoPreview ? 'Foto lista' : 'Tomar o subir foto'}</p>
                      <p style={C.helper}>Guardaremos la imagen para que RAV confirme el juguete y el precio.</p>
                    </button>
                    {photoPreview && (
                      <div style={C.detectionBox}>
                        <p style={C.detectionTitle}>LECTURA DE IMAGEN</p>
                        {photoDetecting && <p style={C.detectionText}>Intentando leer nombre y precio...</p>}
                        {!photoDetecting && photoDetection.tried && !photoDetection.supported && <p style={C.detectionText}>Este navegador no permite leer texto de la imagen todavía. Guardaremos la foto para que RAV lo confirme.</p>}
                        {!photoDetecting && photoDetection.tried && photoDetection.supported && !photoDetection.title && !photoDetection.price && <p style={C.detectionText}>No se detectó texto claro. RAV confirmará el juguete y el precio.</p>}
                        {!photoDetecting && !!photoDetection.title && <p style={C.detectionText}>Nombre estimado: <strong>{photoDetection.title}</strong></p>}
                        {!photoDetecting && !!photoDetection.price && <p style={C.detectionText}>Precio estimado: <strong>{formatPrice(photoDetection.price)}</strong></p>}
                      </div>
                    )}
                    <div style={C.flowActions}>
                      <button style={C.backBtn} onClick={() => setFlowStep(1)}>Atrás</button>
                      <button style={photoFile ? C.saveBtn : C.saveBtnDisabled} onClick={savePhotoItem} disabled={!photoFile || saving}>{saving ? 'Guardando...' : 'Guardar foto'}</button>
                    </div>
                  </div>
                )}

                {showManual && addMethod === 'manual' && (
                  <div style={{ marginTop:14 }}>
                    <p style={C.sectionTitle}>{editingId ? 'EDITAR · SOLO PRUEBAS INTERNAS' : 'MANUAL · SOLO PRUEBAS INTERNAS'}</p>
                    <label style={C.label}>NOMBRE DEL JUGUETE</label>
                    <input style={C.input} placeholder="Ej: LEGO, Barbie, dinosaurio..." value={manualForm.title} onChange={e => setManualForm(prev => ({ ...prev, title:e.target.value }))} />

                    <label style={C.label}>IMAGEN URL OPCIONAL</label>
                    <input style={C.input} placeholder="https://..." value={manualForm.image_url} onChange={e => setManualForm(prev => ({ ...prev, image_url:e.target.value }))} />

                    <div style={C.row}>
                      <div>
                        <label style={C.label}>PRECIO OPCIONAL</label>
                        <input style={C.input} type="number" min="0" placeholder="Ej: 120000" value={manualForm.price} onChange={e => setManualForm(prev => ({ ...prev, price:e.target.value }))} />
                      </div>
                      <div>
                        <label style={C.label}>ESTADO</label>
                        <select style={C.select} value={manualForm.status} onChange={e => setManualForm(prev => ({ ...prev, status:e.target.value }))}>
                          <option value="wanted">Deseado</option>
                          <option value="purchased">Comprado</option>
                          <option value="unavailable">Agotado</option>
                        </select>
                      </div>
                    </div>

                    <label style={C.label}>PRODUCTO URL OPCIONAL</label>
                    <input style={C.input} placeholder="https://..." value={manualForm.product_url} onChange={e => setManualForm(prev => ({ ...prev, product_url:e.target.value }))} />

                    <label style={C.label}>ASIGNAR A</label>
                    <select style={C.select} value={manualForm.child_id} onChange={e => setManualForm(prev => ({ ...prev, child_id:e.target.value }))}>
                      <option value="">General</option>
                      {kids.map(kid => <option key={kid.id} value={kid.id}>{kid.nickname}</option>)}
                    </select>

                    <div style={C.flowActions}>
                      <button style={C.backBtn} onClick={() => setFlowStep(1)}>Atrás</button>
                      <button style={C.saveBtn} onClick={saveManualItem} disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Guardar prueba'}</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <p style={C.sectionTitle}>JUGUETES GUARDADOS</p>
        {loading && <p style={C.empty}>Cargando...</p>}
        {!loading && items.length === 0 && (
          <div style={C.panel}>
            <div style={C.empty}>
              <p style={{ marginBottom:8, color:'#AAEB3A' }}><Icon type="gift" size={40} color="#AAEB3A" /></p>
              <p>Aún no hay juguetes guardados.</p>
              <p style={{ color:'rgba(170,235,58,0.55)', marginTop:4 }}>Agrega el primero en segundos.</p>
            </div>
          </div>
        )}

        {items.map(item => {
          const isPending = item.match_status === 'pending_confirmation'
          const displayImage = item.uploaded_image_url || item.image_url
          return (
            <div key={item.id} style={isPending ? C.cardPending : C.card}>
              <div style={C.cardTop}>
                {displayImage ? (
                  <img style={C.image} src={displayImage} alt={item.title} onError={e => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <div style={C.imageFallback}><Icon type={item.source === 'rav_link' ? 'link' : 'gift'} color="#AAEB3A" size={30} /></div>
                )}
                <div style={C.cardInfo}>
                  <p style={C.toyTitle}>{item.detected_title || item.title}</p>
                  <p style={C.meta}>{getAssignedName(item, kids)}</p>
                  {isPending ? (
                    <>
                      <span style={C.badge}>{MATCH_LABELS[item.match_status]}</span>
                      {item.detected_price !== null && item.detected_price !== undefined && <p style={C.estimatedPrice}>Precio estimado: {formatPrice(item.detected_price)}</p>}
                      <p style={C.pendingMsg}>El precio oficial será confirmado por RAV.</p>
                    </>
                  ) : (
                    <>
                      {item.price !== null && item.price !== undefined && <p style={C.price}>{formatPrice(item.price)}</p>}
                      <span style={C.badge}>{STATUS_LABELS[item.status] || 'Deseado'}</span>
                    </>
                  )}
                  {item.product_url && <a style={C.link} href={item.product_url} target="_blank" rel="noreferrer">Ver producto</a>}
                </div>
              </div>

              <div style={C.controls}>
                <select style={C.statusSelect} value={item.status || 'wanted'} onChange={e => updateStatus(item, e.target.value)}>
                  <option value="wanted">Deseado</option>
                  <option value="purchased">Comprado</option>
                  <option value="unavailable">Agotado</option>
                </select>
                <button style={C.smallBtn} onClick={() => startEdit(item)}>Editar</button>
                <button style={C.deleteBtn} onClick={() => deleteItem(item)}>Eliminar</button>
              </div>
            </div>
          )
        })}
      </div>

      <Navbar active="wishlist" />
    </div>
  )
}
