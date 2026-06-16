import { useEffect, useRef, useState } from 'react'
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
  { id:'rav-green', label:'RAV Verde', type:'rav', skin:'#9BDC2E', dark:'#3a6b0e', eye:'#0e3b12', bg:'#16351a', rim:'#BDF24A', blush:'#FF8FB0' },
  { id:'rav-purple', label:'RAV Morado', type:'rav', skin:'#B79CFF', dark:'#5b3aa0', eye:'#2a1a52', bg:'#1c1430', rim:'#8B7FE0', blush:'#FF8FB0' },
  { id:'rav-pink', label:'RAV Rosa', type:'rav', skin:'#FF9AD0', dark:'#c14d8a', eye:'#5a1a3e', bg:'#33122a', rim:'#FF8FB0', blush:'#E0457F' },
  { id:'rocket', label:'Cohete', type:'rocket' },
  { id:'star', label:'Estrella', type:'star' },
  { id:'planet', label:'Planeta', type:'planet' },
]

const PASSPORT_STAMPS = [
  { id:'first-trip', caption:'Primera visita', place:'BASE RAV', date:'01·25', color:'#2A6FDB', icon:'flag', shape:'circle' },
  { id:'five-visits', caption:'5 visitas', place:'TIENDA', date:'02·25', color:'#1F9E6B', icon:'store', shape:'rect' },
  { id:'first-buy', caption:'Primera compra', place:'RAV TOYS', date:'02·25', color:'#E0521F', icon:'box', shape:'oval' },
  { id:'daily', caption:'Misión diaria', place:'ÓRBITA 1', date:'03·25', color:'#C79212', icon:'navTrophy', shape:'scallop' },
  { id:'birthday', caption:'Cumpleaños', place:'ESTELAR', date:'06·25', color:'#D6488C', icon:'cake', shape:'hex' },
  { id:'review', caption:'Reseña', place:'RESEÑA', date:'07·25', color:'#6BA82E', icon:'star', shape:'tri' },
  { id:'kid-month', caption:'Peque del mes', place:'GALAXIA', date:'08·25', color:'#7A5CD6', icon:'saturn', shape:'circle' },
  { id:'ten-visits', caption:'10 visitas', place:'TIENDA', date:'', color:'#2A6FDB', icon:'rocketC', shape:'rect' },
  { id:'deals', caption:'Caza-ofertas', place:'MERCADO', date:'', color:'#E0521F', icon:'ufo', shape:'oval' },
  { id:'collector', caption:'Coleccionista', place:'COSMOS', date:'', color:'#7A5CD6', icon:'sparkle', shape:'circle' },
  { id:'super-fan', caption:'Súper fan', place:'CLUB RAV', date:'', color:'#C79212', icon:'gift', shape:'scallop' },
  { id:'legend', caption:'Leyenda peque', place:'OLIMPO', date:'', color:'#1F9E6B', icon:'trophy', shape:'shield' },
]
const KIDS_CONSENT_TEXT = 'Confirmo que soy madre, padre o acudiente del peque y autorizo a RAV Toys a usar esta información para beneficios, recomendaciones, sorpresas de cumpleaños y comunicaciones del RAV Club.'
const TOTAL_STAMPS = PASSPORT_STAMPS.length

const blankForm = {
  nickname: '',
  birth_date: '',
  interests: [],
  avatar: 'rav-green',
  photoFile: null,
  photoPreview: '',
  photoMode: 'avatar',
}

const C = {
  page: { minHeight:'100vh', position:'relative', overflow:'hidden', background:'#060A18', color:'#FBEFC8', paddingBottom:96, fontFamily:"'Nunito',sans-serif" },
  bg: { position:'fixed', inset:0, pointerEvents:'none', background:'radial-gradient(120% 70% at 50% -6%, rgba(63,169,245,.30), transparent 55%), radial-gradient(95% 60% at 92% 8%, rgba(255,107,61,.22), transparent 52%), linear-gradient(180deg,#0E1B3A,#0A1228 52%,#060A18)' },
  grain: { position:'fixed', inset:0, pointerEvents:'none', opacity:.34, mixBlendMode:'overlay', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E")` },
  stars: { position:'fixed', inset:0, pointerEvents:'none', backgroundImage:'radial-gradient(circle at 12% 18%, rgba(251,239,200,.9) 0 1px, transparent 1.4px), radial-gradient(circle at 76% 12%, rgba(189,242,74,.8) 0 1px, transparent 1.5px), radial-gradient(circle at 22% 68%, rgba(63,169,245,.75) 0 1px, transparent 1.6px), radial-gradient(circle at 88% 66%, rgba(255,216,77,.8) 0 1px, transparent 1.5px), radial-gradient(circle at 46% 38%, rgba(251,239,200,.65) 0 1px, transparent 1.4px)', backgroundSize:'150px 150px, 210px 210px, 180px 180px, 240px 240px, 270px 270px' },
  content: { position:'relative', zIndex:1, maxWidth:520, margin:'0 auto' },
  header: { padding:'54px 18px 18px', background:'linear-gradient(135deg, rgba(108,96,184,.45), rgba(63,169,245,.16) 72%), #0C1530', borderBottom:'2px solid rgba(63,169,245,.72)', boxShadow:'0 14px 28px rgba(0,0,0,.24)' },
  eyebrow: { fontFamily:"'Fredoka',sans-serif", color:'#3FA9F5', fontSize:11, fontWeight:800, letterSpacing:.9, textTransform:'uppercase', marginBottom:7 },
  headerRow: { display:'flex', alignItems:'center', gap:10 },
  title: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:23, lineHeight:1.05, textShadow:'2px 2px 0 #FF6B3D' },
  sub: { color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:13, lineHeight:1.35, marginTop:9 },
  body: { padding:'16px 14px 12px' },
  section: { display:'flex', alignItems:'center', gap:7, fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:13, margin:'4px 0 12px', textTransform:'uppercase' },
  sectionArrow: { color:'#FF6B3D' },
  kidCard: { position:'relative', background:'#0E1B3A', border:'2px solid var(--tone)', boxShadow:'0 0 0 3px color-mix(in srgb, var(--tone) 18%, transparent), 0 14px 26px rgba(0,0,0,.36)', borderRadius:20, padding:14, marginBottom:14, overflow:'hidden' },
  kidCardGlow: { position:'absolute', inset:'-20% -20% auto auto', width:150, height:150, borderRadius:'50%', background:'var(--toneSoft)', filter:'blur(20px)', opacity:.5, pointerEvents:'none' },
  kidTop: { position:'relative', display:'flex', alignItems:'center', gap:11, marginBottom:12 },
  kidAvatar: { width:56, height:56, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', background:'#0A1228', border:'2px solid var(--tone)', boxShadow:'0 0 16px var(--toneSoft)', flexShrink:0 },
  kidPhoto: { width:'100%', height:'100%', objectFit:'cover' },
  kidInfo: { minWidth:0, flex:1 },
  kidName: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:17, lineHeight:1.05, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  kidMeta: { color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:600, marginTop:3 },
  countdownPill: { display:'flex', alignItems:'center', gap:5, borderRadius:999, background:'var(--toneSoft)', color:'var(--tone)', border:'1px solid var(--tone)', padding:'7px 8px', fontFamily:"'Bungee',sans-serif", fontSize:10, flexShrink:0, boxShadow:'0 0 12px var(--toneSoft)' },
  chips: { display:'flex', flexWrap:'wrap', gap:7, margin:'8px 0 12px' },
  chip: { border:'1px solid var(--tone)', color:'var(--tone)', background:'rgba(10,18,40,.68)', borderRadius:999, padding:'6px 9px', fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:700 },
  meterTop: { display:'flex', justifyContent:'space-between', alignItems:'center', color:'#FBEFC8', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, marginBottom:7 },
  meterNum: { color:'var(--tone)', fontFamily:"'Bungee',sans-serif", fontSize:11 },
  meterTrack: { height:8, borderRadius:999, background:'#0A1228', border:'1px solid rgba(127,168,216,.25)', overflow:'hidden', marginBottom:12 },
  meterFill: { height:'100%', width:'var(--progress)', background:'linear-gradient(90deg,var(--tone),#fff)', borderRadius:999 },
  actions: { display:'grid', gridTemplateColumns:'1.2fr .8fr', gap:9, marginTop:9 },
  primaryBtn: { border:0, borderRadius:14, minHeight:45, background:'linear-gradient(160deg,#D6FF6E,#BDF24A 55%,#7FC916)', color:'#10240a', fontFamily:"'Fredoka',sans-serif", fontSize:14, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 10px 22px rgba(127,201,22,.34), inset 0 2px 0 rgba(255,255,255,.5)' },
  ghostBtn: { border:'1px solid rgba(127,168,216,.35)', borderRadius:14, minHeight:45, background:'rgba(10,18,40,.6)', color:'#9FD8FF', fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:7 },
  editRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginTop:9 },
  editBtn: { border:'1px solid rgba(255,216,77,.42)', borderRadius:13, background:'rgba(255,216,77,.08)', color:'#FFD84D', minHeight:38, fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800 },
  deleteBtn: { border:'1px solid rgba(255,107,61,.48)', borderRadius:13, background:'rgba(255,107,61,.08)', color:'#FF8A5B', minHeight:38, fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800 },
  addCard: { width:'100%', minHeight:96, margin:'8px 0 22px', border:'2px dashed rgba(189,242,74,.62)', borderRadius:20, background:'rgba(189,242,74,.07)', color:'#BDF24A', fontFamily:"'Fredoka',sans-serif", fontSize:15, fontWeight:800, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:7 },
  empty: { color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", textAlign:'center', padding:'22px 10px', lineHeight:1.4 },
  overlay: { position:'fixed', inset:0, zIndex:80, background:'rgba(6,10,24,.96)', overflowY:'auto', color:'#FBEFC8' },
  overlayInner: { minHeight:'100vh', maxWidth:560, margin:'0 auto', padding:'16px 14px 104px' },
  overlayTop: { position:'sticky', top:0, zIndex:2, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'10px 0 14px', background:'linear-gradient(180deg, rgba(6,10,24,.98), rgba(6,10,24,.78))', backdropFilter:'blur(12px)' },
  backBtn: { border:'1px solid rgba(127,168,216,.35)', background:'rgba(10,18,40,.72)', color:'#9FD8FF', borderRadius:999, padding:'9px 12px', fontFamily:"'Fredoka',sans-serif", fontWeight:800 },
  overlayTitle: { fontFamily:"'Bungee',sans-serif", fontSize:17, color:'#FBEFC8', textShadow:'2px 2px 0 #FF6B3D', textAlign:'right' },
  formPanel: { background:'#0E1B3A', border:'2px solid rgba(63,169,245,.55)', borderRadius:20, padding:14, boxShadow:'0 18px 34px rgba(0,0,0,.36)' },
  preview: { display:'flex', alignItems:'center', gap:12, border:'1px solid rgba(189,242,74,.38)', borderRadius:18, padding:12, background:'linear-gradient(135deg,rgba(189,242,74,.12),rgba(63,169,245,.10))', marginBottom:14 },
  previewAvatar: { width:74, height:74, borderRadius:24, overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#0A1228', border:'2px solid #BDF24A', boxShadow:'0 0 18px rgba(189,242,74,.28)' },
  previewName: { fontFamily:"'Bungee',sans-serif", fontSize:18, color:'#FBEFC8', lineHeight:1.1 },
  label: { display:'block', color:'#3FA9F5', fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:800, letterSpacing:.8, textTransform:'uppercase', margin:'12px 0 6px' },
  input: { width:'100%', height:50, borderRadius:14, border:'1.5px solid rgba(127,168,216,.34)', background:'rgba(10,18,40,.82)', color:'#FBEFC8', padding:'0 13px', fontSize:15, fontFamily:"'Nunito',sans-serif", outline:'none' },
  segment: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 },
  segmentBtn: { border:'1px solid rgba(127,168,216,.32)', background:'rgba(10,18,40,.7)', color:'#7FA8D8', borderRadius:13, minHeight:42, fontFamily:"'Fredoka',sans-serif", fontWeight:800 },
  segmentActive: { border:'1px solid #BDF24A', background:'rgba(189,242,74,.16)', color:'#BDF24A', borderRadius:13, minHeight:42, fontFamily:"'Fredoka',sans-serif", fontWeight:800, boxShadow:'0 0 14px rgba(189,242,74,.18)' },
  avatarRail: { display:'flex', gap:10, overflowX:'auto', padding:'3px 2px 12px' },
  avatarPick: { width:64, height:64, borderRadius:20, border:'1px solid rgba(127,168,216,.28)', background:'#0A1228', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  avatarPickActive: { width:64, height:64, borderRadius:20, border:'2px solid #BDF24A', background:'#0A1228', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transform:'translateY(-2px)', boxShadow:'0 0 18px rgba(189,242,74,.38)' },
  photoReady: { display:'flex', alignItems:'center', gap:11, background:'rgba(189,242,74,.08)', border:'1px solid rgba(189,242,74,.34)', borderRadius:16, padding:10, marginBottom:10 },
  photoThumb: { width:56, height:56, borderRadius:16, objectFit:'cover' },
  formChips: { display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 },
  formChip: { border:'1px solid rgba(127,168,216,.25)', color:'#7FA8D8', background:'rgba(10,18,40,.74)', borderRadius:999, padding:'8px 10px', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:700 },
  formChipActive: { border:'1px solid #BDF24A', color:'#10240a', background:'#BDF24A', borderRadius:999, padding:'8px 10px', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800 },
  consentBox: { display:'flex', gap:11, alignItems:'flex-start', border:'1px solid rgba(189,242,74,.42)', background:'rgba(189,242,74,.08)', borderRadius:16, padding:12, margin:'12px 0' },
  checkbox: { width:22, height:22, accentColor:'#BDF24A', flexShrink:0 },
  consentText: { color:'#D8E0F8', fontSize:12, lineHeight:1.35, fontFamily:"'Nunito',sans-serif" },
  submit: { width:'100%', minHeight:52, border:0, borderRadius:16, background:'linear-gradient(160deg,#D6FF6E,#BDF24A 55%,#7FC916)', color:'#10240a', fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:800, boxShadow:'0 10px 24px rgba(127,201,22,.36), inset 0 2px 0 rgba(255,255,255,.5)' },
  submitDisabled: { width:'100%', minHeight:52, border:0, borderRadius:16, background:'rgba(127,168,216,.16)', color:'rgba(216,224,248,.38)', fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:800 },
  error: { color:'#FF8A5B', fontFamily:"'Fredoka',sans-serif", fontSize:12, lineHeight:1.35, margin:'8px 0' },
  success: { color:'#BDF24A', fontFamily:"'Fredoka',sans-serif", fontSize:12, margin:'8px 0' },
  passportShell: { padding:'8px 2px 0', background:'transparent' },
  passportBook: { position:'relative', margin:'2px auto 12px', maxWidth:430 },
  pageEdge: { position:'absolute', inset:'8px -7px -9px 12px', borderRadius:'6px 16px 16px 6px', background:'#d7deea', boxShadow:'5px 6px 0 -2px #c5cedd, 10px 12px 0 -4px #d7deea, 14px 18px 26px rgba(0,0,0,.4)' },
  passportPage: { position:'relative', overflow:'hidden', borderRadius:'6px 15px 15px 6px', padding:'13px 13px 0 34px', background:'linear-gradient(168deg,#e7eefb 0%,#d8e3f5 55%,#c7d6ef 100%)', border:'2px solid color-mix(in srgb, var(--tone) 56%, rgba(63,118,196,.5))', boxShadow:'0 16px 40px rgba(0,0,0,.4), inset 0 0 0 1px rgba(255,255,255,.5)', color:'#15233E' },
  passportSpine: { position:'absolute', left:0, top:0, bottom:0, width:30, background:'linear-gradient(90deg, rgba(40,64,110,.26), rgba(40,64,110,.09) 45%, rgba(40,64,110,.02) 80%, transparent)', boxShadow:'inset 1px 0 0 rgba(255,255,255,.7)', zIndex:1 },
  stitchLine: { position:'absolute', left:20, top:12, bottom:12, borderLeft:'1.6px dashed rgba(63,118,196,.4)', zIndex:2 },
  securityPattern: { position:'absolute', inset:0, pointerEvents:'none', background:'repeating-radial-gradient(circle at 30% 20%, rgba(63,118,196,.06) 0 1px, transparent 1px 8px), repeating-linear-gradient(135deg, rgba(46,160,120,.05) 0 1px, transparent 1px 9px)', mixBlendMode:'multiply' },
  watermark: { position:'absolute', right:-28, bottom:28, opacity:.07, transform:'rotate(-9deg)', pointerEvents:'none' },
  passportHeader: { position:'relative', zIndex:3, display:'grid', gridTemplateColumns:'34px 1fr auto', alignItems:'center', gap:8, paddingBottom:7, borderBottom:'1px solid rgba(40,64,110,.18)' },
  passportMicro: { fontFamily:"'Fredoka',sans-serif", fontSize:8, fontWeight:800, letterSpacing:.7, textTransform:'uppercase', color:'#6B7C99', lineHeight:1 },
  passportTitle: { fontFamily:"'Bungee',sans-serif", fontSize:13.5, color:'#16294B', lineHeight:1.05 },
  passportNumber: { fontFamily:'monospace', fontSize:11, color:'#C0392B', fontWeight:900, whiteSpace:'nowrap' },
  identityBlock: { position:'relative', zIndex:3, display:'grid', gridTemplateColumns:'92px 1fr', gap:10, padding:'10px 0 8px', borderBottom:'1px dashed rgba(40,64,110,.24)' },
  portrait: { width:86, height:96, borderRadius:13, border:'2px solid var(--tone)', background:'#dde6f2', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', boxShadow:'0 0 0 3px rgba(255,255,255,.42)' },
  portraitSheen: { position:'absolute', inset:0, background:'linear-gradient(120deg, transparent 0 42%, rgba(255,255,255,.45) 46%, transparent 54%)' },
  photoCaption: { fontFamily:'monospace', color:'#7184A0', fontSize:7.5, fontWeight:900, marginTop:5, textAlign:'center' },
  fieldsGrid: { display:'grid', gap:5 },
  fieldPair: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  dataLabel: { color:'#7184A0', fontFamily:'monospace', fontSize:7.5, fontWeight:900, letterSpacing:.6, textTransform:'uppercase', marginBottom:1 },
  dataValue: { color:'#15233E', fontFamily:"'Fredoka',sans-serif", fontSize:12.5, fontWeight:800, lineHeight:1.05, wordBreak:'break-word' },
  editableValue: { display:'inline-flex', alignItems:'center', gap:4, color:'#15233E', fontFamily:"'Fredoka',sans-serif", fontSize:12.5, fontWeight:800, border:0, background:'transparent', padding:0, textAlign:'left' },
  planetInput: { width:'100%', height:28, border:'1px solid rgba(124,92,224,.45)', borderRadius:8, background:'rgba(255,255,255,.45)', color:'#15233E', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, padding:'0 7px' },
  stampHead: { position:'relative', zIndex:3, display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, padding:'8px 0 5px' },
  stampTitle: { display:'flex', alignItems:'center', gap:6, color:'#2F4D78', fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:900 },
  stampCount: { color:'var(--tone)', fontFamily:"'Bungee',sans-serif", fontSize:12 },
  passportProgress: { position:'relative', zIndex:3, height:6, borderRadius:999, background:'rgba(40,64,110,.14)', overflow:'hidden', marginBottom:7 },
  passportProgressFill: { height:'100%', width:'var(--progress)', background:'var(--tone)', borderRadius:999 },
  stampGrid: { position:'relative', zIndex:3, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'7px 5px', padding:'0 0 8px' },
  stampCell: { minWidth:0, textAlign:'center' },
  stampCaption: { color:'#3A4D6E', fontFamily:"'Fredoka',sans-serif", fontSize:8, fontWeight:800, lineHeight:1.05, marginTop:1 },
  stampLockedCaption: { color:'#8593AD', fontFamily:"'Fredoka',sans-serif", fontSize:8, fontWeight:800, lineHeight:1.05, marginTop:1 },
  stampCenter: { position:'absolute', left:'50%', top:'46%', transform:'translate(-50%,-50%)', display:'flex', alignItems:'center', justifyContent:'center' },
  mrz: { position:'relative', zIndex:3, margin:'0 -13px 0 -34px', background:'#f0ede2', color:'#15233E', fontFamily:'monospace', fontSize:10, lineHeight:1.22, padding:'7px 8px 7px 34px', letterSpacing:.4, whiteSpace:'nowrap', overflow:'hidden', borderTop:'1px solid rgba(40,64,110,.18)' },
  footerNote: { margin:'12px 4px 0', border:'1.5px dashed #FFD84D', color:'#FFD84D', borderRadius:16, padding:10, textAlign:'center', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, background:'rgba(255,216,77,.08)' },
}

function SvgWrap({ children, size = 48, style }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" style={style}>{children}</svg>
}

function RavAvatar({ avatar, size = 48 }) {
  const config = typeof avatar === 'object' ? avatar : AVATARS.find(item => item.id === avatar) || AVATARS[0]
  if (config.type === 'rocket') return <RocketFriend size={size} />
  if (config.type === 'star') return <StarFriend size={size} />
  if (config.type === 'planet') return <PlanetFriend size={size} />
  const skin = config.skin || '#9BDC2E'
  const dark = config.dark || '#3a6b0e'
  const eye = config.eye || '#0e3b12'
  const bg = config.bg || '#16351a'
  const rim = config.rim || '#BDF24A'
  const blush = config.blush || '#FF8FB0'
  return (
    <SvgWrap size={size}>
      <circle cx="24" cy="24" r="22" fill={bg} />
      <circle cx="24" cy="24" r="21" stroke={rim} strokeWidth="2" opacity=".8" />
      <path d="M12 21c-4 0-6 2.5-6 5s2 4.5 6 4" fill={skin} stroke={dark} strokeWidth="1.4" />
      <path d="M36 21c4 0 6 2.5 6 5s-2 4.5-6 4" fill={skin} stroke={dark} strokeWidth="1.4" />
      <path d="M17 12 12 4" stroke={dark} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M31 12 36 4" stroke={dark} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="11" cy="4" r="3.4" fill={skin} stroke={dark} strokeWidth="1.4" />
      <circle cx="37" cy="4" r="3.4" fill={skin} stroke={dark} strokeWidth="1.4" />
      <path d="M9 24c0-10 6.5-16.5 15-16.5S39 14 39 24c0 9.5-6.5 16.5-15 16.5S9 33.5 9 24Z" fill={skin} stroke={dark} strokeWidth="1.5" />
      <path d="M16 8c2.5-2 5.2-3 8-3s5.5 1 8 3c-2.6-.7-5.3-.7-8-.7S18.6 7.3 16 8Z" fill={dark} opacity=".18" />
      <ellipse cx="18" cy="23" rx="5.1" ry="6" fill="#fff" />
      <ellipse cx="30" cy="23" rx="5.1" ry="6" fill="#fff" />
      <circle cx="18" cy="23" r="3.4" fill={eye} />
      <circle cx="30" cy="23" r="3.4" fill={eye} />
      <circle cx="16.7" cy="21.2" r="1.2" fill="#fff" />
      <circle cx="28.7" cy="21.2" r="1.2" fill="#fff" />
      <circle cx="20" cy="25.2" r=".8" fill="#fff" opacity=".9" />
      <circle cx="32" cy="25.2" r=".8" fill="#fff" opacity=".9" />
      <ellipse cx="24" cy="15.4" rx="2.8" ry="3.2" fill="#fff" />
      <circle cx="24" cy="15.4" r="1.9" fill={eye} />
      <circle cx="23.2" cy="14.3" r=".75" fill="#fff" />
      <ellipse cx="14.3" cy="29.8" rx="2.2" ry="1.4" fill={blush} opacity=".62" />
      <ellipse cx="33.7" cy="29.8" rx="2.2" ry="1.4" fill={blush} opacity=".62" />
      <path d="M19.2 32.5c2.7 2.2 6.9 2.2 9.6 0" stroke={dark} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M25.8 33.9v2.4c0 .9-.6 1.3-1.3.8l-1.6-1.1" fill="#fff" />
      <ellipse cx="23" cy="15" rx="17" ry="15" stroke="#DFF7FF" strokeWidth="1.2" opacity=".3" />
      <path d="M12 16c6-5.2 14.7-6.2 23-1.8" stroke="#fff" strokeWidth="1.1" opacity=".18" strokeLinecap="round" />
    </SvgWrap>
  )
}

function RocketFriend({ size = 48 }) {
  return <SvgWrap size={size}><circle cx="24" cy="24" r="21" fill="#1A2448" stroke="#FF6B3D" strokeWidth="2"/><path d="M27 8c7 5 8 14 2 24l-9-9C18 17 20 11 27 8Z" fill="#FBEFC8" stroke="#3FA9F5" strokeWidth="1.6"/><path d="m18 25-6 2 4-6M28 35l-2 6 6-4" fill="#FF6B3D"/><circle cx="27" cy="17" r="3.4" fill="#9FD8FF" stroke="#0A1228" strokeWidth="1.2"/><path d="M18 31c-3 1-5 3-7 6" stroke="#FFD84D" strokeWidth="2" strokeLinecap="round"/></SvgWrap>
}

function StarFriend({ size = 48 }) {
  return <SvgWrap size={size}><circle cx="24" cy="24" r="21" fill="#231638" stroke="#8B7FE0" strokeWidth="2"/><path d="m24 7 4.6 10.5 11.4 1.1-8.6 7.5 2.5 11.2L24 31.5l-9.9 5.8 2.5-11.2L8 18.6l11.4-1.1L24 7Z" fill="#FFD84D" stroke="#FBEFC8" strokeWidth="1.4"/><circle cx="20" cy="22" r="1.5" fill="#0A1228"/><circle cx="28" cy="22" r="1.5" fill="#0A1228"/><path d="M20.5 27c2 1.4 5 1.4 7 0" stroke="#0A1228" strokeWidth="1.5" strokeLinecap="round"/></SvgWrap>
}

function PlanetFriend({ size = 48 }) {
  return <SvgWrap size={size}><circle cx="24" cy="24" r="21" fill="#102448" stroke="#3FA9F5" strokeWidth="2"/><circle cx="24" cy="24" r="10" fill="#8B7FE0"/><path d="M7 27c8 4 25 2 34-7" stroke="#FFD84D" strokeWidth="3" strokeLinecap="round"/><path d="M13 18c5 3 16 4 25 1" stroke="#FBEFC8" strokeWidth="1.2" opacity=".55"/><circle cx="21" cy="22" r="1.4" fill="#FBEFC8"/><circle cx="28" cy="22" r="1.4" fill="#FBEFC8"/><path d="M21 27c2 1.4 4 1.4 6 0" stroke="#FBEFC8" strokeWidth="1.5" strokeLinecap="round"/></SvgWrap>
}

function SmallIcon({ type, color = 'currentColor', size = 22 }) {
  const common = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', 'aria-hidden':'true' }
  if (type === 'passport') return <svg {...common}><path d="M6 4h10c1.1 0 2 .9 2 2v14H8c-1.1 0-2-.9-2-2V4Z" stroke={color} strokeWidth="1.8"/><path d="M8 4v14c0 1.1.9 2 2 2" stroke={color} strokeWidth="1.8"/><circle cx="13" cy="11" r="3" stroke={color} strokeWidth="1.5"/><path d="M10 11h6M13 8c.8.9 1.1 1.9 1.1 3S13.8 13.1 13 14" stroke={color} strokeWidth="1.2"/><path d="m14.8 6.4.5 1 1.1.2-.8.8.2 1.1-1-.5-1 .5.2-1.1-.8-.8 1.1-.2.5-1Z" fill={color}/></svg>
  if (type === 'comet') return <svg {...common}><path d="m15 4 1.7 3.4 3.8.5-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.5L15 4Z" fill={color}/><path d="M10 14c-2.4.8-4.5 2-6.4 3.8M8.5 10.5c-1.9.2-3.7.8-5.4 1.7" stroke={color} strokeWidth="1.7" strokeLinecap="round" opacity=".62"/></svg>
  if (type === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.1" strokeLinecap="round"/></svg>
  if (type === 'cake') return <svg {...common}><path d="M7 11h10v8H7v-8Z" stroke={color} strokeWidth="1.7"/><path d="M7 14c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0M12 8v3M12 5c1 1.2 1 2 0 3-1-1-1-1.8 0-3Z" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
  if (type === 'pencil') return <svg {...common}><path d="M5 19h4l10-10-4-4L5 15v4Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/><path d="m13.5 6.5 4 4" stroke={color} strokeWidth="1.7"/></svg>
  if (type === 'lock') return <svg {...common}><rect x="6" y="10" width="12" height="9" rx="2" stroke={color} strokeWidth="1.7"/><path d="M9 10V8a3 3 0 0 1 6 0v2" stroke={color} strokeWidth="1.7"/></svg>
  if (type === 'seal') return <svg {...common}><path d="M8 5h8v5c0 2.4-1.6 4.2-4 4.2S8 12.4 8 10V5Z" stroke={color} strokeWidth="1.7"/><path d="M9 19h6M12 14v3" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>
  if (type === 'saturn') return <svg {...common}><circle cx="12" cy="12" r="5.2" stroke={color} strokeWidth="1.7"/><path d="M3.5 14.3c4.2 2.1 12.2.8 17-3.6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M8.2 7.5c2.4 1.4 5.9 1.7 9 .7" stroke={color} strokeWidth="1.2" opacity=".7" strokeLinecap="round"/></svg>
  if (type === 'flag') return <svg {...common}><path d="M7 4v16M7 5h11l-2 4 2 4H7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.7"/></svg>
}

function StampIcon({ type, color }) {
  if (type === 'flag') return <path d="M20 17v18M20 18h12l-2 4 2 4H20" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  if (type === 'store') return <path d="M15 22h18l-2-6H17l-2 6Zm2 0v11h14V22M21 33v-6h6v6" stroke={color} strokeWidth="2.1" strokeLinejoin="round" />
  if (type === 'box') return <path d="M15 20h18v14H15V20Zm0 0 4-5h10l4 5M24 15v19" stroke={color} strokeWidth="2.1" strokeLinejoin="round" />
  if (type === 'trophy' || type === 'navTrophy') return <path d="M19 15h10v5c0 3-2 5-5 5s-5-2-5-5v-5Zm0 2h-4c0 4 2 6 5 6M29 17h4c0 4-2 6-5 6M24 25v4M19 33h10" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
  if (type === 'cake') return <path d="M16 23h16v10H16V23Zm0 4c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M24 18v5" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
  if (type === 'star' || type === 'spark' || type === 'sparkle') return <path d="m24 14 3 7 7 1-5 5 1 7-6-3.5L18 34l1-7-5-5 7-1 3-7Z" stroke={color} strokeWidth="2.1" strokeLinejoin="round" />
  if (type === 'planet' || type === 'saturn') return <><circle cx="24" cy="24" r="7" stroke={color} strokeWidth="2"/><path d="M12 27c7 4 18 2 24-6" stroke={color} strokeWidth="2" strokeLinecap="round"/></>
  if (type === 'tag') return <path d="M15 16h10l8 8-10 10-8-8V16Zm5 5h.1" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
  if (type === 'rocketC') return <path d="M28 13c5 4 6 11 1 20l-9-9c-1.5-5 1-9 8-11Zm-9 12-5 2 3-5m12 12-2 5 5-3" stroke={color} strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round" />
  if (type === 'ufo') return <><path d="M14 26c3-5 17-5 20 0-2 5-18 5-20 0Z" stroke={color} strokeWidth="2.1"/><path d="M20 24c.7-4 7.3-4 8 0" stroke={color} strokeWidth="2.1"/><path d="M19 30v3m5-2v3m5-4v3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>
  if (type === 'gift') return <path d="M16 22h16v12H16V22Zm8 0v12M16 27h16M20 22c-2-1.3-2-5 .2-5 1.8 0 2.8 2.2 3.8 5 1-2.8 2-5 3.8-5 2.2 0 2.2 3.7.2 5" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
  return <circle cx="24" cy="24" r="7" stroke={color} strokeWidth="2" />
}

function StampShape({ shape, color, locked, filterId }) {
  const common = { stroke:color, fill:'none', strokeLinecap:'round', strokeLinejoin:'round', filter:locked ? undefined : `url(#${filterId})` }
  const dash = locked ? '4 4' : '0'
  if (shape === 'rect') return <><rect x="9" y="13" width="50" height="42" rx="8" {...common} strokeWidth="2.2" strokeDasharray={dash} /><rect x="14" y="18" width="40" height="32" rx="6" {...common} strokeWidth="1" strokeDasharray={dash} /></>
  if (shape === 'oval') return <><ellipse cx="34" cy="34" rx="28" ry="21" {...common} strokeWidth="2.2" strokeDasharray={dash} /><ellipse cx="34" cy="34" rx="22" ry="16" {...common} strokeWidth="1" strokeDasharray={dash} /></>
  if (shape === 'scallop') return <><path d="M34 5c3 0 5 4 8 5 3 1 7-1 9 1s0 6 1 9c1 3 5 5 5 8s-4 5-5 8c-1 3 1 7-1 9s-6 0-9 1c-3 1-5 5-8 5s-5-4-8-5c-3-1-7 1-9-1s0-6-1-9c-1-3-5-5-5-8s4-5 5-8c1-3-1-7 1-9s6 0 9-1c3-1 5-5 8-5Z" {...common} strokeWidth="2.2" strokeDasharray={dash} /><circle cx="34" cy="34" r="21" {...common} strokeWidth="1" strokeDasharray={dash} /></>
  if (shape === 'hex') return <><path d="M34 6 57 20v28L34 62 11 48V20L34 6Z" {...common} strokeWidth="2.2" strokeDasharray={dash} /><path d="M34 13 51 23v22L34 55 17 45V23L34 13Z" {...common} strokeWidth="1" strokeDasharray={dash} /></>
  if (shape === 'tri') return <><path d="M34 7 60 57H8L34 7Z" {...common} strokeWidth="2.2" strokeDasharray={dash} /><path d="M34 18 51 52H17L34 18Z" {...common} strokeWidth="1" strokeDasharray={dash} /></>
  if (shape === 'shield') return <><path d="M13 10h42v22c0 13-8 23-21 29-13-6-21-16-21-29V10Z" {...common} strokeWidth="2.2" strokeDasharray={dash} /><path d="M19 16h30v16c0 9-5 17-15 22-10-5-15-13-15-22V16Z" {...common} strokeWidth="1" strokeDasharray={dash} /></>
  return <><circle cx="34" cy="34" r="29" {...common} strokeWidth="2.2" strokeDasharray={dash} /><circle cx="34" cy="34" r="22" {...common} strokeWidth="1" strokeDasharray={dash} /></>
}

function RubberStamp({ stamp, locked, index }) {
  const arcTop = `arcTop-${stamp.id}`
  const filterId = `stampDistress-${stamp.id}`
  const rotation = locked ? 0 : [-6, 4, -3, 5, -5, 3, -2, 6, -4, 2, -5, 4][index % 12]
  const color = locked ? '#9aa9c2' : stamp.color
  const isRound = stamp.shape === 'circle' || stamp.shape === 'scallop'
  return (
    <div style={{ position:'relative', width:68, height:68, margin:'0 auto', transform:`rotate(${rotation}deg)`, opacity:locked ? .58 : 1, color, mixBlendMode:locked ? 'normal' : 'multiply' }}>
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none" aria-hidden="true">
        <defs>
          <path id={arcTop} d="M12 35a22 22 0 0 1 44 0" />
          <filter id={filterId}>
            <feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="1" seed={index + 3} />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 9 -4" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
        </defs>
        <StampShape shape={stamp.shape} color="currentColor" locked={locked} filterId={filterId} />
        {!locked && isRound && (
          <text fontSize="5.6" fontFamily="monospace" fontWeight="900" fill="currentColor" letterSpacing=".7">
            <textPath href={`#${arcTop}`} startOffset="50%" textAnchor="middle">{stamp.place}</textPath>
          </text>
        )}
        {!locked && !isRound && <text x="34" y="16" textAnchor="middle" fontSize="5.6" fontFamily="monospace" fontWeight="900" fill="currentColor" letterSpacing=".7">{stamp.place}</text>}
        {!locked && <text x="34" y="55" textAnchor="middle" fontSize="6.6" fontFamily="monospace" fontWeight="900" fill="currentColor">{stamp.date || '★ RAV ★'}</text>}
      </svg>
      <span style={{ ...C.stampCenter, color }}>{locked ? <SmallIcon type="lock" color="currentColor" size={20} /> : <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true"><StampIcon type={stamp.icon} color="currentColor" /></svg>}</span>
    </div>
  )
}

function calculateAge(date) {
  if (!date) return 0
  const birth = new Date(`${date}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return Math.max(age, 0)
}

function formatBirthday(date) {
  if (!date) return 'Sin fecha'
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-CO', { day:'numeric', month:'long' })
}

function getBirthdayDays(date) {
  if (!date) return 0
  const today = new Date()
  const birth = new Date(`${date}T00:00:00`)
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  next.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  if (next < start) next.setFullYear(today.getFullYear() + 1)
  return Math.ceil((next - start) / (1000 * 60 * 60 * 24))
}

function getBirthdayCountdown(date) {
  const days = getBirthdayDays(date)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  return `${days} días`
}

function normalizeAvatar(id) {
  if (id === 'alien' || id === 'helmet') return 'rav-green'
  if (id === 'rocket' || id === 'star' || id === 'planet') return id
  return id || 'rav-green'
}

function getTone(kid, index = 0) {
  const avatar = normalizeAvatar(kid.avatar)
  if (avatar === 'rav-purple' || avatar === 'planet') return { color:'#8B7FE0', soft:'rgba(139,127,224,.24)', name:'Morado' }
  if (avatar === 'rav-pink' || avatar === 'star') return { color:'#FF8FB0', soft:'rgba(255,143,176,.22)', name:'Rosa' }
  if (index % 3 === 1) return { color:'#8B7FE0', soft:'rgba(139,127,224,.24)', name:'Morado' }
  return { color:'#BDF24A', soft:'rgba(189,242,74,.24)', name:'Verde' }
}

function getEarnedStampCount(kid) {
  return Math.min(TOTAL_STAMPS, 1 + (kid.passport_stamps || []).length)
}

function getRank(kid) {
  const count = getEarnedStampCount(kid)
  if (count >= 8) return 'Capitán'
  if (count >= 4) return 'Piloto'
  return 'Explorador'
}

function getPassportNumber(kid) {
  const source = (kid.id || '').replace(/-/g, '').slice(0, 4).toUpperCase() || '0042'
  return `RAV-${source.padStart(4, '0')}`
}

function buildMrz(kid, planet) {
  const cleanName = (kid.nickname || 'EXPLORADOR').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z]/g, '<')
  const id = getPassportNumber(kid).replace('-', '')
  const cleanPlanet = (planet || 'TIERRA9').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, '<')
  const line1 = (`P<RAV<<${cleanName}`).padEnd(40, '<').slice(0, 40)
  const line2 = (`${id}<${cleanPlanet}<CLUBRAV`).padEnd(40, '<').slice(0, 40)
  return [line1, line2]
}

export default function Kids() {
  const [userId, setUserId] = useState('')
  const [kids, setKids] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(blankForm)
  const [kidsConsent, setKidsConsent] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [selectedPassport, setSelectedPassport] = useState(null)
  const [passportUploading, setPassportUploading] = useState(false)
  const [planetEditing, setPlanetEditing] = useState(false)
  const [planetName, setPlanetName] = useState('Tierra-9')
  const photoInputRef = useRef(null)
  const passportFileInputRef = useRef(null)
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

  useEffect(() => {
    if (!selectedPassport) return
    const saved = window.localStorage.getItem(`rav-planet-${selectedPassport.id}`)
    setPlanetName(saved || defaultPlanet(selectedPassport))
    setPlanetEditing(false)
  }, [selectedPassport?.id])

  const loadKids = async (parentId = userId) => {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*, passport_stamps:child_passport_stamps(*)')
      .eq('parent_id', parentId)
      .order('birth_date', { ascending: false })

    if (!error) setKids(data || [])
    setLoading(false)
  }

  const defaultPlanet = (kid) => {
    const avatar = normalizeAvatar(kid.avatar)
    if (avatar === 'rav-pink' || avatar === 'star') return 'Nebulosa Rosa'
    if (avatar === 'rav-purple' || avatar === 'planet') return 'Nube-7'
    return 'Tierra-9'
  }

  const resetForm = () => {
    if (form.photoPreview) URL.revokeObjectURL(form.photoPreview)
    setForm(blankForm)
    setKidsConsent(false)
    setEditingId('')
    setError('')
    setSuccess('')
    setShowForm(false)
  }

  const openCreate = () => {
    setForm(blankForm)
    setKidsConsent(false)
    setEditingId('')
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const openEdit = (kid) => {
    setForm({
      nickname: kid.nickname || '',
      birth_date: kid.birth_date || '',
      interests: kid.interests || [],
      avatar: normalizeAvatar(kid.avatar),
      photoFile: null,
      photoPreview: kid.avatar_url || '',
      photoMode: kid.avatar_url ? 'photo' : 'avatar',
    })
    setKidsConsent(true)
    setEditingId(kid.id)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(item => item !== interest)
        : [...prev.interests, interest],
    }))
  }

  const choosePhoto = (file) => {
    if (!file) return
    if (form.photoPreview && form.photoPreview.startsWith('blob:')) URL.revokeObjectURL(form.photoPreview)
    setForm(prev => ({ ...prev, photoFile:file, photoPreview:URL.createObjectURL(file), photoMode:'photo' }))
  }

  const updateKidEverywhere = (kidId, patch) => {
    setKids(prev => prev.map(kid => kid.id === kidId ? { ...kid, ...patch } : kid))
    setSelectedPassport(prev => prev?.id === kidId ? { ...prev, ...patch } : prev)
  }

  const uploadChildPhoto = async (kidId, file) => {
    if (!file) return ''
    if (file.size > 2 * 1024 * 1024) throw new Error('La imagen debe pesar menos de 2MB')
    if (!file.type.startsWith('image/')) throw new Error('Elige una imagen válida')

    const ext = file.name.split('.').pop()
    const path = `${userId}/kids/${kidId}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { cacheControl:'3600', upsert:true })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = urlData.publicUrl
    const { error: dbError } = await supabase
      .from('child_profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', kidId)
      .eq('parent_id', userId)
    if (dbError) throw dbError
    updateKidEverywhere(kidId, { avatar_url: publicUrl })
    return publicUrl
  }

  const getPhotoErrorMessage = (err) => {
    const msg = err?.message || ''
    if (msg.includes('2MB') || msg.includes('imagen válida')) return msg
    if (msg.includes('avatar_url')) return 'No se pudo guardar la foto. Falta el campo avatar_url en Supabase.'
    return 'No se pudo subir la foto. Intenta de nuevo.'
  }

  const saveKid = async () => {
    if (!form.nickname.trim()) { setError('Escribe el nombre o apodo del peque.'); return }
    if (!form.birth_date) { setError('El cumpleaños es obligatorio.'); return }
    if (new Date(`${form.birth_date}T00:00:00`) > new Date()) { setError('La fecha de cumpleaños no puede estar en el futuro.'); return }
    if (!editingId && !kidsConsent) { setError('Debes confirmar que eres madre, padre o acudiente.'); return }

    setSaving(true)
    setError('')
    setSuccess('')
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

    try {
      if (editingId) {
        const { error: updateError } = await supabase.from('child_profiles').update(payload).eq('id', editingId).eq('parent_id', userId)
        if (updateError) throw updateError
        if (form.photoFile) await uploadChildPhoto(editingId, form.photoFile)
      } else {
        const { data, error: insertError } = await supabase.from('child_profiles').insert(payload).select('id').single()
        if (insertError) throw insertError
        if (form.photoFile) await uploadChildPhoto(data.id, form.photoFile)
        await supabase
          .from('profiles')
          .update({ kids_data_consent:true, kids_data_consent_at:consentAt, kids_data_consent_text:KIDS_CONSENT_TEXT })
          .eq('id', userId)
      }
      resetForm()
      await loadKids()
    } catch (err) {
      setError(err?.message?.includes('avatar') ? getPhotoErrorMessage(err) : 'No se pudo guardar. Intenta de nuevo.')
    }
    setSaving(false)
  }

  const deleteKid = async (kid) => {
    const ok = window.confirm(`¿Eliminar el perfil de ${kid.nickname}?`)
    if (!ok) return
    const { error } = await supabase.from('child_profiles').delete().eq('id', kid.id).eq('parent_id', userId)
    if (error) setError('No se pudo eliminar. Intenta de nuevo.')
    else await loadKids()
  }

  const openPassport = (kid) => {
    setSelectedPassport(kid)
    setError('')
    setSuccess('')
  }

  const handlePassportPhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !selectedPassport) return
    setPassportUploading(true)
    setError('')
    setSuccess('')
    try {
      await uploadChildPhoto(selectedPassport.id, file)
      setSuccess('Foto del pasaporte actualizada')
      setTimeout(() => setSuccess(''), 1800)
    } catch (err) {
      setError(getPhotoErrorMessage(err))
    }
    setPassportUploading(false)
  }

  const savePlanet = (value) => {
    const next = value.slice(0, 16)
    setPlanetName(next)
    if (selectedPassport) window.localStorage.setItem(`rav-planet-${selectedPassport.id}`, next)
  }

  const formReady = !!form.nickname.trim() && (editingId || kidsConsent)
  const selectedTone = selectedPassport ? getTone(selectedPassport, kids.findIndex(k => k.id === selectedPassport.id)) : getTone({ avatar:'rav-green' })
  const selectedEarnedCount = selectedPassport ? getEarnedStampCount(selectedPassport) : 0
  const mrz = selectedPassport ? buildMrz(selectedPassport, planetName) : ['', '']

  return (
    <div style={C.page}>
      <div style={C.bg} />
      <div style={C.stars} />
      <div style={C.grain} />

      <main style={C.content}>
        <header style={C.header}>
          <p style={C.eyebrow}>MIS PEQUES</p>
          <div style={C.headerRow}>
            <SmallIcon type="seal" color="#BDF24A" size={30} />
            <h1 style={C.title}>Mis Pequeños</h1>
          </div>
          <p style={C.sub}>Un RAV Universo de sorpresas para sus gustos, su edad y sus aventuras.</p>
        </header>

        <section style={C.body}>
          <p style={C.section}><span style={C.sectionArrow}>▸</span> Exploradores</p>
          {loading && <p style={C.empty}>Cargando exploradores...</p>}
          {!loading && kids.length === 0 && <p style={C.empty}>Aún no tienes pequeños exploradores. Crea el primero y empecemos la misión.</p>}

          {kids.map((kid, index) => {
            const tone = getTone(kid, index)
            const earnedCount = getEarnedStampCount(kid)
            const progress = Math.min(100, Math.round((earnedCount / TOTAL_STAMPS) * 100))
            return (
              <article key={kid.id} style={{ ...C.kidCard, '--tone':tone.color, '--toneSoft':tone.soft, '--progress':`${progress}%` }}>
                <span style={C.kidCardGlow} />
                <div style={C.kidTop}>
                  <div style={C.kidAvatar}>{kid.avatar_url ? <img src={kid.avatar_url} alt={`Foto de ${kid.nickname}`} style={C.kidPhoto} /> : <RavAvatar avatar={normalizeAvatar(kid.avatar)} />}</div>
                  <div style={C.kidInfo}>
                    <p style={C.kidName}>{kid.nickname}</p>
                    <p style={C.kidMeta}>{calculateAge(kid.birth_date)} años · {formatBirthday(kid.birth_date)}</p>
                  </div>
                  <span style={C.countdownPill}><SmallIcon type="cake" color="currentColor" size={15} /> {getBirthdayCountdown(kid.birth_date)}</span>
                </div>

                {!!kid.interests?.length && <div style={C.chips}>{kid.interests.map(interest => <span key={interest} style={C.chip}>{interest}</span>)}</div>}

                <div style={C.meterTop}><span>Sellos del pasaporte</span><span style={C.meterNum}>{earnedCount}/{TOTAL_STAMPS}</span></div>
                <div style={C.meterTrack}><div style={C.meterFill} /></div>

                <div style={C.actions}>
                  <button style={C.primaryBtn} onClick={() => openPassport(kid)}><SmallIcon type="passport" color="#10240a" /> Ver Pasaporte</button>
                  <button style={C.ghostBtn} onClick={() => router.push('/wishlist')}><SmallIcon type="comet" color="#9FD8FF" /> Wishlist</button>
                </div>
                <div style={C.editRow}>
                  <button style={C.editBtn} onClick={() => openEdit(kid)}>Editar perfil</button>
                  <button style={C.deleteBtn} onClick={() => deleteKid(kid)}>Eliminar</button>
                </div>
              </article>
            )
          })}

          <button style={C.addCard} onClick={openCreate}>
            <SmallIcon type="plus" color="#BDF24A" size={28} />
            Agregar peque
          </button>
        </section>
      </main>

      {showForm && (
        <div style={C.overlay}>
          <div style={C.overlayInner}>
            <div style={C.overlayTop}>
              <button style={C.backBtn} onClick={resetForm}>‹ Volver</button>
              <p style={C.overlayTitle}>{editingId ? 'Editar explorador' : 'Nuevo explorador'}</p>
            </div>

            <div style={C.formPanel}>
              <div style={C.preview}>
                <div style={C.previewAvatar}>{form.photoPreview && form.photoMode === 'photo' ? <img src={form.photoPreview} alt="Foto lista" style={C.kidPhoto} /> : <RavAvatar avatar={form.avatar} size={64} />}</div>
                <div>
                  <p style={C.previewName}>{form.nickname.trim() || 'Tu peque'}</p>
                  <p style={C.sub}>Su perfil de explorador empieza aquí.</p>
                </div>
              </div>

              {error && <p style={C.error}>{error}</p>}
              {success && <p style={C.success}>{success}</p>}

              <label style={C.label}>Nombre o apodo</label>
              <input style={C.input} value={form.nickname} onChange={e => setForm(prev => ({ ...prev, nickname:e.target.value }))} placeholder="Ej: Sofi, Mateo, Vale" />

              <label style={C.label}>Cumpleaños</label>
              <input style={C.input} type="date" value={form.birth_date} onChange={e => setForm(prev => ({ ...prev, birth_date:e.target.value }))} />

              <label style={C.label}>Foto o avatar</label>
              <div style={C.segment}>
                <button type="button" style={form.photoMode === 'avatar' ? C.segmentActive : C.segmentBtn} onClick={() => setForm(prev => ({ ...prev, photoMode:'avatar' }))}>Avatar</button>
                <button type="button" style={form.photoMode === 'photo' ? C.segmentActive : C.segmentBtn} onClick={() => photoInputRef.current?.click()}>Foto del peque</button>
              </div>

              {form.photoMode === 'avatar' && <div style={C.avatarRail}>{AVATARS.map(avatar => <button key={avatar.id} type="button" style={form.avatar === avatar.id ? C.avatarPickActive : C.avatarPick} onClick={() => setForm(prev => ({ ...prev, avatar:avatar.id, photoMode:'avatar' }))} title={avatar.label}><RavAvatar avatar={avatar} size={52} /></button>)}</div>}
              <input ref={photoInputRef} type="file" accept="image/*" capture="user" style={{ display:'none' }} onChange={e => choosePhoto(e.target.files?.[0])} />
              {form.photoPreview && form.photoMode === 'photo' && <div style={C.photoReady}><img src={form.photoPreview} alt="Foto lista" style={C.photoThumb} /><div><p style={C.editBtn}>Foto lista</p><button type="button" style={C.ghostBtn} onClick={() => photoInputRef.current?.click()}>Cambiar foto</button></div></div>}

              <label style={C.label}>Gustos favoritos</label>
              <div style={C.formChips}>{INTERESTS.map(interest => <button key={interest} type="button" style={form.interests.includes(interest) ? C.formChipActive : C.formChip} onClick={() => toggleInterest(interest)}>{interest}</button>)}</div>

              {!editingId && <label style={C.consentBox}><input type="checkbox" checked={kidsConsent} onChange={e => setKidsConsent(e.target.checked)} style={C.checkbox} /><span style={C.consentText}>{KIDS_CONSENT_TEXT}</span></label>}

              <button style={formReady ? C.submit : C.submitDisabled} onClick={saveKid} disabled={!formReady || saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar peque'}</button>
            </div>
          </div>
        </div>
      )}

      {selectedPassport && (
        <div style={C.overlay}>
          <div style={C.overlayInner}>
            <div style={C.overlayTop}>
              <button style={C.backBtn} onClick={() => setSelectedPassport(null)}>‹ Volver</button>
              <p style={C.overlayTitle}>Pasaporte de {selectedPassport.nickname}</p>
            </div>

            <div style={{ ...C.passportShell, '--tone':selectedTone.color, '--toneSoft':selectedTone.soft, '--progress':`${Math.round((selectedEarnedCount / TOTAL_STAMPS) * 100)}%` }}>
              {error && <p style={{ ...C.error, margin:'0 4px 10px' }}>{error}</p>}
              {success && <p style={{ ...C.success, margin:'0 4px 10px' }}>{success}</p>}

              <section style={C.passportBook}>
                <span style={C.pageEdge} />
                <div style={C.passportPage}>
                  <span style={C.passportSpine} />
                  <span style={C.stitchLine} />
                  <span style={C.securityPattern} />
                  <span style={C.watermark}><RavAvatar avatar={normalizeAvatar(selectedPassport.avatar)} size={170} /></span>

                  <div style={C.passportHeader}>
                    <SmallIcon type="saturn" color="#C28A1A" size={30} />
                    <div>
                      <p style={C.passportMicro}>Unión Galáctica de Exploradores</p>
                      <p style={C.passportTitle}>Pasaporte · Club RAV</p>
                    </div>
                    <p style={C.passportNumber}>{getPassportNumber(selectedPassport)}</p>
                  </div>

                  <div style={C.identityBlock}>
                    <div>
                      <div style={C.portrait} onClick={() => !passportUploading && passportFileInputRef.current?.click()} title="Cambiar foto">
                        {selectedPassport.avatar_url ? <img src={selectedPassport.avatar_url} alt={`Foto de ${selectedPassport.nickname}`} style={C.kidPhoto} /> : <RavAvatar avatar={normalizeAvatar(selectedPassport.avatar)} size={80} />}
                        <span style={C.portraitSheen} />
                      </div>
                      <p style={C.photoCaption}>{passportUploading ? 'SUBIENDO...' : 'FOTO OFICIAL · TOCA PARA EDITAR'}</p>
                      <input ref={passportFileInputRef} type="file" accept="image/*" capture="user" style={{ display:'none' }} onChange={handlePassportPhotoUpload} />
                    </div>
                    <div style={C.fieldsGrid}>
                      <div>
                        <p style={C.dataLabel}>Nombre del explorador</p>
                        <p style={{ ...C.dataValue, fontSize:15 }}>{selectedPassport.nickname}</p>
                      </div>
                      <div style={C.fieldPair}>
                        <div><p style={C.dataLabel}>Rango</p><p style={{ ...C.dataValue, color:selectedTone.color }}>{getRank(selectedPassport)}</p></div>
                        <div><p style={C.dataLabel}>Edad estelar</p><p style={C.dataValue}>{calculateAge(selectedPassport.birth_date)} años</p></div>
                      </div>
                      <div style={C.fieldPair}>
                        <div><p style={C.dataLabel}>Cumpleaños</p><p style={C.dataValue}>{formatBirthday(selectedPassport.birth_date)}</p></div>
                        <div>
                          <p style={C.dataLabel}>Planeta de origen</p>
                          {planetEditing
                            ? <input style={C.planetInput} value={planetName} maxLength={16} onChange={e => savePlanet(e.target.value)} onBlur={() => setPlanetEditing(false)} autoFocus />
                            : <button style={C.editableValue} onClick={() => setPlanetEditing(true)}>{planetName}<SmallIcon type="pencil" color="#7C5CE0" size={13} /></button>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={C.stampHead}>
                    <p style={C.stampTitle}><SmallIcon type="flag" color="#C0392B" size={17} /> Sellos de viaje</p>
                    <p style={C.stampCount}>{selectedEarnedCount}/{TOTAL_STAMPS}</p>
                  </div>
                  <div style={C.passportProgress}><div style={C.passportProgressFill} /></div>

                  <div style={C.stampGrid}>{PASSPORT_STAMPS.map((stamp, index) => {
                    const locked = index >= selectedEarnedCount
                    return <div key={stamp.id} style={C.stampCell}><RubberStamp stamp={stamp} locked={locked} index={index} /><p style={locked ? C.stampLockedCaption : C.stampCaption}>{stamp.caption}</p></div>
                  })}</div>

                  <div style={C.mrz}>{mrz[0]}<br />{mrz[1]}</div>
                </div>
              </section>

              <p style={C.footerNote}>Visita la tienda RAV para sellar tu pasaporte.</p>
            </div>
          </div>
        </div>
      )}

      <Navbar active="kids" />
    </div>
  )
}
