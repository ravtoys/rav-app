import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const STATUS_LABELS = {
  wanted: 'Deseado',
  purchased: 'Comprado',
  unavailable: 'Agotado',
}

const C = {
  page: { minHeight:'100vh', background:'#080618', paddingBottom:92 },
  header: { background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', padding:'22px 20px 18px' },
  eyebrow: { fontSize:11, color:'rgba(170,235,58,0.7)', fontWeight:900, letterSpacing:1, marginBottom:4 },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:24, fontWeight:900, color:'white', lineHeight:1.1 },
  sub: { fontSize:12, color:'rgba(255,255,255,0.58)', marginTop:8, lineHeight:1.45 },
  body: { padding:'14px 16px' },
  panel: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:14, marginBottom:14 },
  topActions: { display:'flex', gap:10, alignItems:'center', marginBottom:14 },
  addBtn: { flex:1, padding:'14px', borderRadius:14, border:'none', background:'#AAEB3A', color:'#080618', fontSize:14, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  cancelBtn: { padding:'13px 14px', borderRadius:14, border:'1px solid rgba(255,255,255,0.14)', background:'transparent', color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  label: { fontSize:10, color:'rgba(170,235,58,0.65)', fontWeight:900, letterSpacing:1, margin:'0 0 6px' },
  input: { width:'100%', padding:'12px 13px', borderRadius:12, border:'1px solid rgba(170,235,58,0.28)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none', marginBottom:12 },
  select: { width:'100%', padding:'12px 13px', borderRadius:12, border:'1px solid rgba(170,235,58,0.28)', background:'#14102c', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none', marginBottom:12 },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  sectionTitle: { fontSize:10, fontWeight:900, color:'rgba(255,255,255,0.35)', letterSpacing:1, margin:'2px 0 10px' },
  err: { color:'#ff6666', fontSize:12, marginBottom:10 },
  empty: { textAlign:'center', padding:'34px 18px', color:'rgba(255,255,255,0.42)', fontSize:13, lineHeight:1.45 },
  card: { background:'rgba(170,235,58,0.06)', border:'1px solid rgba(170,235,58,0.18)', borderRadius:14, padding:12, marginBottom:10 },
  cardTop: { display:'flex', gap:12, alignItems:'flex-start' },
  image: { width:76, height:76, borderRadius:14, objectFit:'cover', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 },
  imageFallback: { width:76, height:76, borderRadius:14, background:'rgba(170,235,58,0.12)', border:'1px solid rgba(170,235,58,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 },
  cardInfo: { flex:1, minWidth:0 },
  toyTitle: { color:'white', fontSize:15, fontWeight:900, lineHeight:1.15 },
  meta: { color:'rgba(255,255,255,0.48)', fontSize:11, marginTop:5 },
  price: { color:'#AAEB3A', fontSize:13, fontWeight:900, marginTop:7 },
  badge: { display:'inline-block', padding:'5px 8px', borderRadius:12, background:'rgba(43,63,191,0.42)', border:'1px solid rgba(170,235,58,0.22)', color:'#AAEB3A', fontSize:10, fontWeight:900, marginTop:8 },
  link: { display:'inline-block', color:'#AAEB3A', fontSize:11, fontWeight:900, marginTop:8, textDecoration:'none' },
  controls: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 },
  statusSelect: { width:'100%', padding:'10px', borderRadius:12, border:'1px solid rgba(170,235,58,0.25)', background:'#14102c', color:'white', fontSize:12, fontWeight:800, fontFamily:"'Nunito',sans-serif", outline:'none' },
  smallBtn: { padding:'10px', borderRadius:12, border:'1px solid rgba(170,235,58,0.25)', background:'transparent', color:'#AAEB3A', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  deleteBtn: { padding:'10px', borderRadius:12, border:'1px solid rgba(255,100,100,0.25)', background:'rgba(200,30,30,0.08)', color:'#ff6666', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
}

const blankForm = {
  title: '',
  image_url: '',
  price: '',
  product_url: '',
  child_id: '',
  status: 'wanted',
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return Number(price).toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 })
}

function getAssignedName(item, kids) {
  if (!item.child_id) return 'General'
  return kids.find(kid => kid.id === item.child_id)?.nickname || 'Peque'
}

export default function Wishlist() {
  const [userId, setUserId] = useState('')
  const [kids, setKids] = useState([])
  const [items, setItems] = useState([])
  const [form, setForm] = useState(blankForm)
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
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

  const resetForm = () => {
    setForm(blankForm)
    setEditingId('')
    setShowForm(false)
    setError('')
  }

  const startAdd = () => {
    setForm(blankForm)
    setEditingId('')
    setError('')
    setShowForm(true)
  }

  const startEdit = (item) => {
    setForm({
      title: item.title || '',
      image_url: item.image_url || '',
      price: item.price ?? '',
      product_url: item.product_url || '',
      child_id: item.child_id || '',
      status: item.status || 'wanted',
    })
    setEditingId(item.id)
    setError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior:'smooth' })
  }

  const saveItem = async () => {
    if (!form.title.trim()) {
      setError('El nombre del juguete es obligatorio')
      return
    }

    if (form.child_id && !kids.some(kid => kid.id === form.child_id)) {
      setError('Ese peque no pertenece a tu cuenta')
      return
    }

    const cleanPrice = form.price === '' ? null : Number(form.price)
    if (cleanPrice !== null && (Number.isNaN(cleanPrice) || cleanPrice < 0)) {
      setError('El precio debe ser un número válido')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      user_id: userId,
      child_id: form.child_id || null,
      title: form.title.trim(),
      image_url: form.image_url.trim() || null,
      price: cleanPrice,
      product_url: form.product_url.trim() || null,
      status: form.status,
      source: 'manual',
      updated_at: new Date().toISOString(),
    }

    const result = editingId
      ? await supabase.from('wishlist_items').update(payload).eq('id', editingId).eq('user_id', userId)
      : await supabase.from('wishlist_items').insert(payload)

    if (result.error) {
      setError('No se pudo guardar. Intenta de nuevo.')
    } else {
      resetForm()
      await loadItems()
    }

    setSaving(false)
  }

  const updateStatus = async (item, status) => {
    const { error } = await supabase
      .from('wishlist_items')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .eq('user_id', userId)

    if (!error) {
      setItems(prev => prev.map(current => current.id === item.id ? { ...current, status } : current))
    }
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
          {showForm && <button style={C.cancelBtn} onClick={resetForm}>Cancelar</button>}
        </div>

        {showForm && (
          <div style={C.panel}>
            <p style={C.sectionTitle}>{editingId ? 'EDITAR JUGUETE' : 'NUEVO JUGUETE'}</p>
            {error && <p style={C.err}>{error}</p>}

            <label style={C.label}>NOMBRE DEL JUGUETE</label>
            <input
              style={C.input}
              placeholder="Ej: LEGO, Barbie, dinosaurio..."
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            />

            <label style={C.label}>IMAGEN URL OPCIONAL</label>
            <input
              style={C.input}
              placeholder="https://..."
              value={form.image_url}
              onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
            />

            <div style={C.row}>
              <div>
                <label style={C.label}>PRECIO OPCIONAL</label>
                <input
                  style={C.input}
                  type="number"
                  min="0"
                  placeholder="Ej: 120000"
                  value={form.price}
                  onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div>
                <label style={C.label}>ESTADO</label>
                <select
                  style={C.select}
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="wanted">Deseado</option>
                  <option value="purchased">Comprado</option>
                  <option value="unavailable">Agotado</option>
                </select>
              </div>
            </div>

            <label style={C.label}>PRODUCTO URL OPCIONAL</label>
            <input
              style={C.input}
              placeholder="https://..."
              value={form.product_url}
              onChange={e => setForm(prev => ({ ...prev, product_url: e.target.value }))}
            />

            <label style={C.label}>ASIGNAR A</label>
            <select
              style={C.select}
              value={form.child_id}
              onChange={e => setForm(prev => ({ ...prev, child_id: e.target.value }))}
            >
              <option value="">General</option>
              {kids.map(kid => <option key={kid.id} value={kid.id}>{kid.nickname}</option>)}
            </select>

            <button style={C.addBtn} onClick={saveItem} disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Guardar juguete'}
            </button>
          </div>
        )}

        <p style={C.sectionTitle}>JUGUETES GUARDADOS</p>
        {loading && <p style={C.empty}>Cargando...</p>}
        {!loading && items.length === 0 && (
          <div style={C.panel}>
            <div style={C.empty}>
              <p style={{ fontSize:36, marginBottom:8 }}>🎁</p>
              <p>Aún no hay juguetes guardados.</p>
              <p style={{ color:'rgba(170,235,58,0.55)', marginTop:4 }}>Agrega el primero para empezar la lista mágica.</p>
            </div>
          </div>
        )}

        {items.map(item => (
          <div key={item.id} style={C.card}>
            <div style={C.cardTop}>
              {item.image_url ? (
                <img
                  style={C.image}
                  src={item.image_url}
                  alt={item.title}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <div style={C.imageFallback}>🎁</div>
              )}
              <div style={C.cardInfo}>
                <p style={C.toyTitle}>{item.title}</p>
                <p style={C.meta}>{getAssignedName(item, kids)}</p>
                {item.price !== null && item.price !== undefined && <p style={C.price}>{formatPrice(item.price)}</p>}
                <span style={C.badge}>{STATUS_LABELS[item.status] || 'Deseado'}</span>
                {item.product_url && (
                  <a style={C.link} href={item.product_url} target="_blank" rel="noreferrer">Ver producto</a>
                )}
              </div>
            </div>

            <div style={C.controls}>
              <select
                style={C.statusSelect}
                value={item.status || 'wanted'}
                onChange={e => updateStatus(item, e.target.value)}
              >
                <option value="wanted">Deseado</option>
                <option value="purchased">Comprado</option>
                <option value="unavailable">Agotado</option>
              </select>
              <button style={C.smallBtn} onClick={() => startEdit(item)}>Editar</button>
              <button style={C.deleteBtn} onClick={() => deleteItem(item)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <Navbar active="wishlist" />
    </div>
  )
}
