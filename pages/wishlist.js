import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const STATUS_LABELS = {
  wanted: 'Deseado',
  reserved: 'Reservado',
  purchased: 'Comprado',
  unavailable: 'Agotado',
}

const blankManualForm = {
  title: '',
  image_url: '',
  price: '',
  product_url: '',
  child_id: '',
  status: 'wanted',
}

const FILTERS = ['all', 'general']
const TONES = ['#BDF24A', '#3FA9F5', '#FF6B3D', '#8B7FE0', '#FFD84D']

const C = {
  page: {
    minHeight:'100vh',
    paddingBottom:104,
    position:'relative',
    overflow:'hidden',
    color:'#FBEFC8',
    background:'radial-gradient(120% 70% at 50% -6%, rgba(63,169,245,.30), transparent 55%), radial-gradient(95% 60% at 92% 8%, rgba(255,107,61,.22), transparent 52%), linear-gradient(180deg,#0E1B3A,#0A1228 52%,#060A18)',
  },
  nebula: { position:'absolute', width:230, height:230, borderRadius:'50%', filter:'blur(52px)', opacity:.42, zIndex:0 },
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
  star: { position:'absolute', borderRadius:'50%', opacity:.8 },
  header: { position:'relative', zIndex:2, padding:'58px 18px 18px', background:'linear-gradient(135deg, rgba(108,96,184,.45), rgba(63,169,245,.16) 72%), #0C1530', borderBottom:'2px solid #3FA9F5', boxShadow:'0 10px 22px rgba(0,0,0,.26)' },
  headerInner: { width:'100%', maxWidth:430, margin:'0 auto' },
  titleRow: { display:'flex', alignItems:'center', gap:10 },
  title: { fontFamily:"'Bungee',sans-serif", fontSize:23, lineHeight:1.05, color:'#FBEFC8', textTransform:'uppercase', textShadow:'2px 2px 0 #FF6B3D' },
  sub: { fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:600, color:'#7FA8D8', marginTop:7, lineHeight:1.35 },
  body: { position:'relative', zIndex:2, width:'100%', maxWidth:430, margin:'0 auto', padding:'16px 14px 0' },
  captureCard: { width:'100%', display:'grid', gridTemplateColumns:'62px 1fr 26px', alignItems:'center', gap:12, textAlign:'left', border:'2px solid #BDF24A', borderRadius:20, padding:14, background:'linear-gradient(150deg, rgba(189,242,74,.16), #0E1B3A 62%)', boxShadow:'0 0 0 3px rgba(189,242,74,.12), 0 16px 34px rgba(0,0,0,.34), inset 0 0 24px rgba(189,242,74,.08)', color:'#FBEFC8', cursor:'pointer', overflow:'hidden', position:'relative' },
  captureChip: { width:52, height:52, borderRadius:17, display:'flex', alignItems:'center', justifyContent:'center', color:'#10240A', background:'linear-gradient(160deg,#D6FF6E,#BDF24A 55%,#7FC916)', boxShadow:'0 10px 20px rgba(127,201,22,.32), inset 0 2px 0 rgba(255,255,255,.5)', position:'relative' },
  sparkle: { position:'absolute', right:-2, top:-4, color:'#FFD84D', filter:'drop-shadow(0 0 8px rgba(255,216,77,.75))' },
  captureTitle: { fontFamily:"'Bungee',sans-serif", fontSize:16, color:'#FBEFC8', lineHeight:1.05 },
  captureSub: { fontFamily:"'Fredoka',sans-serif", color:'#9FD8FF', fontSize:12, fontWeight:600, lineHeight:1.3, marginTop:5 },
  shareRow: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, margin:'14px 0', padding:12, borderRadius:17, border:'1.5px solid rgba(189,242,74,.28)', background:'rgba(20,26,58,.5)', backdropFilter:'blur(10px)' },
  shareLeft: { display:'flex', alignItems:'center', gap:10, minWidth:0 },
  goldChip: { width:40, height:40, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', background:'#FFD84D', color:'#0E1B3A', flex:'0 0 auto', boxShadow:'0 0 16px rgba(255,216,77,.28)' },
  shareTitle: { fontFamily:"'Fredoka',sans-serif", fontSize:15, fontWeight:800, color:'#FBEFC8' },
  shareSub: { fontFamily:"'Nunito',sans-serif", fontSize:11, color:'#7FA8D8', marginTop:2 },
  shareBtn: { border:0, borderRadius:999, padding:'9px 11px', background:'#3FA9F5', color:'#06101F', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, display:'flex', alignItems:'center', gap:6, flex:'0 0 auto' },
  shareLinkBox: { display:'flex', gap:8, alignItems:'center', margin:'-4px 0 13px', padding:10, borderRadius:14, background:'rgba(10,18,40,.72)', border:'1px solid rgba(63,169,245,.28)' },
  shareLinkText: { flex:1, minWidth:0, color:'#9FD8FF', fontFamily:"'Nunito',sans-serif", fontSize:11, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  copySmallBtn: { border:'1px solid rgba(189,242,74,.35)', borderRadius:11, padding:'8px 9px', background:'rgba(189,242,74,.1)', color:'#BDF24A', fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:800 },
  filters: { display:'flex', gap:8, overflowX:'auto', padding:'0 1px 12px', scrollbarWidth:'none' },
  filterPill: { border:'1px solid rgba(127,168,216,.3)', borderRadius:999, padding:'8px 11px', background:'rgba(10,18,40,.62)', color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:7 },
  filterActive: { border:'1px solid #BDF24A', background:'#BDF24A', color:'#10240A', boxShadow:'0 0 16px rgba(189,242,74,.35)' },
  tinyAvatar: { width:20, height:20, borderRadius:'50%', background:'#0A1228', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' },
  sectionTitle: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:13, textTransform:'uppercase', margin:'3px 0 12px', letterSpacing:'.02em' },
  play: { color:'#FF6B3D', marginRight:7 },
  empty: { textAlign:'center', padding:'34px 18px', color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:13, lineHeight:1.45, border:'1px dashed rgba(127,168,216,.35)', borderRadius:18, background:'rgba(14,27,58,.58)' },
  card: { position:'relative', overflow:'hidden', display:'grid', gridTemplateColumns:'104px 1fr', gap:12, borderRadius:18, padding:12, marginBottom:12, background:'linear-gradient(145deg, rgba(14,27,58,.96), rgba(10,18,40,.96))', boxShadow:'0 13px 28px rgba(0,0,0,.34), inset 0 0 22px rgba(63,169,245,.05)' },
  foil: { position:'absolute', inset:-20, background:'linear-gradient(115deg, transparent 0 34%, rgba(63,169,245,.18) 42%, rgba(189,242,74,.16) 50%, rgba(255,107,61,.14) 58%, transparent 68%)', backgroundSize:'280% 100%', mixBlendMode:'screen', opacity:.5, pointerEvents:'none', animation:'foil-sweep 5.5s ease-in-out infinite alternate' },
  trash: { position:'absolute', top:8, right:8, zIndex:3, width:30, height:30, borderRadius:12, border:'1px solid rgba(255,107,61,.35)', background:'rgba(6,10,24,.62)', color:'#FF8A5B', display:'flex', alignItems:'center', justifyContent:'center' },
  photoWrap: { position:'relative', zIndex:2, width:104, height:104, borderRadius:16, overflow:'hidden', background:'#0A1228', border:'1px solid rgba(251,239,200,.16)' },
  photo: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  fallback: { width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#BDF24A', background:'radial-gradient(circle at 50% 35%, rgba(189,242,74,.22), rgba(10,18,40,.88))' },
  recipientBadge: { position:'absolute', top:6, left:6, width:30, height:30, borderRadius:'50%', background:'#0A1228', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', boxShadow:'0 0 0 2px var(--tone), 0 0 12px var(--tone)' },
  scanBeam: { position:'absolute', left:0, right:0, top:-34, height:34, background:'linear-gradient(180deg, transparent, rgba(63,169,245,.55), transparent)', animation:'scan-down 2.2s linear infinite' },
  stamp: { position:'absolute', left:10, bottom:10, transform:'rotate(-7deg)', border:'2px solid currentColor', borderRadius:5, padding:'3px 6px 2px', fontFamily:"'Bungee',sans-serif", fontSize:9, lineHeight:1, background:'rgba(6,10,24,.58)', textTransform:'uppercase' },
  cardInfo: { position:'relative', zIndex:2, minWidth:0, paddingRight:20 },
  toyTitle: { fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:800, color:'#FBEFC8', lineHeight:1.12, paddingRight:14 },
  recipientLine: { fontFamily:"'Fredoka',sans-serif", color:'var(--tone)', fontSize:12, fontWeight:800, marginTop:5 },
  pendingNote: { display:'flex', alignItems:'center', gap:7, color:'#9FD8FF', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:700, lineHeight:1.25, marginTop:10 },
  pulseDot: { width:8, height:8, borderRadius:'50%', background:'#3FA9F5', boxShadow:'0 0 12px rgba(63,169,245,.9)', flex:'0 0 auto', animation:'pulse-dot 1.3s ease-in-out infinite' },
  priceRow: { display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginTop:10 },
  priceTag: { position:'relative', display:'inline-flex', alignItems:'center', minHeight:30, padding:'6px 11px 5px 16px', borderRadius:'8px 10px 10px 8px', background:'#FF6B3D', color:'#FBEFC8', fontFamily:"'Bungee',sans-serif", fontSize:13, boxShadow:'3px 3px 0 rgba(0,0,0,.2)' },
  rewardChip: { borderRadius:999, padding:'6px 9px', background:'rgba(189,242,74,.16)', color:'#BDF24A', border:'1px solid rgba(189,242,74,.34)', fontFamily:"'Bungee',sans-serif", fontSize:10 },
  estimate: { color:'#FFD84D', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, marginTop:7 },
  productLink: { display:'inline-block', marginTop:8, color:'#BDF24A', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, textDecoration:'none' },
  cardFooter: { gridColumn:'1 / -1', position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'1fr 96px', gap:8, marginTop:3 },
  statusSelect: { width:'100%', borderRadius:12, border:'1px solid rgba(127,168,216,.3)', background:'#081024', color:'#FBEFC8', padding:'10px 9px', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, outline:'none' },
  editBtn: { border:'1px solid rgba(189,242,74,.4)', borderRadius:12, background:'rgba(189,242,74,.12)', color:'#BDF24A', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800 },
  success: { background:'rgba(189,242,74,.13)', border:'1px solid rgba(189,242,74,.42)', color:'#BDF24A', borderRadius:14, padding:'10px 12px', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:800, marginBottom:12, lineHeight:1.35 },
  err: { color:'#FF8A5B', fontFamily:"'Fredoka',sans-serif", fontSize:12, margin:'0 0 10px', lineHeight:1.35 },
  overlay: { position:'fixed', inset:0, zIndex:220, background:'rgba(6,10,24,.97)', overflowY:'auto', color:'#FBEFC8' },
  overlayInner: { minHeight:'100vh', maxWidth:460, margin:'0 auto', padding:'16px 14px 108px' },
  overlayTop: { position:'sticky', top:0, zIndex:2, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'10px 0 14px', background:'linear-gradient(180deg, rgba(6,10,24,.98), rgba(6,10,24,.74))', backdropFilter:'blur(12px)' },
  backBtn: { border:'1px solid rgba(127,168,216,.35)', background:'rgba(10,18,40,.72)', color:'#9FD8FF', borderRadius:999, padding:'9px 12px', fontFamily:"'Fredoka',sans-serif", fontWeight:800 },
  overlayTitle: { fontFamily:"'Bungee',sans-serif", color:'#FBEFC8', fontSize:18, textShadow:'2px 2px 0 #FF6B3D', textAlign:'right' },
  flowCard: { border:'2px solid rgba(189,242,74,.38)', borderRadius:20, background:'linear-gradient(180deg,rgba(14,27,58,.92),rgba(10,18,40,.92))', padding:14, boxShadow:'0 16px 34px rgba(0,0,0,.34)' },
  stepPill: { display:'inline-block', padding:'6px 10px', borderRadius:999, background:'rgba(189,242,74,.14)', color:'#BDF24A', border:'1px solid rgba(189,242,74,.32)', fontFamily:"'Bungee',sans-serif", fontSize:10, marginBottom:10 },
  question: { color:'#FBEFC8', fontFamily:"'Fredoka',sans-serif", fontSize:20, fontWeight:800, lineHeight:1.12, marginBottom:6 },
  helper: { color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:13, lineHeight:1.35, marginBottom:12 },
  methodGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, margin:'12px 0 14px' },
  methodCard: { minHeight:132, border:'1.5px solid rgba(127,168,216,.28)', borderRadius:17, padding:12, background:'rgba(10,18,40,.72)', color:'#FBEFC8', textAlign:'left', fontFamily:"'Fredoka',sans-serif", display:'flex', flexDirection:'column', gap:8, boxShadow:'inset 0 0 20px rgba(63,169,245,.04)' },
  methodActive: { border:'2px solid #BDF24A', background:'linear-gradient(160deg, rgba(189,242,74,.16), rgba(10,18,40,.88))', boxShadow:'0 0 0 3px rgba(189,242,74,.10), 0 12px 24px rgba(0,0,0,.24)' },
  methodIcon: { width:38, height:38, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', background:'#BDF24A', color:'#10240A', boxShadow:'0 8px 18px rgba(189,242,74,.22)' },
  methodTitle: { fontSize:15, fontWeight:900, lineHeight:1.05, color:'#FBEFC8' },
  methodSub: { fontSize:11, fontWeight:700, color:'#9FD8FF', lineHeight:1.3 },
  uploadBox: { width:'100%', minHeight:236, border:'2px dashed rgba(189,242,74,.52)', background:'rgba(189,242,74,.07)', borderRadius:18, padding:14, textAlign:'center', color:'#FBEFC8', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, overflow:'hidden' },
  uploadPreview: { width:'100%', maxHeight:320, objectFit:'cover', borderRadius:14, border:'1px solid rgba(251,239,200,.18)' },
  changePhoto: { color:'#BDF24A', fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:800 },
  recipientList: { display:'grid', gap:9, marginTop:14 },
  recipientBtn: { width:'100%', display:'flex', alignItems:'center', gap:11, textAlign:'left', border:'1px solid rgba(127,168,216,.25)', background:'rgba(10,18,40,.72)', color:'#FBEFC8', borderRadius:15, padding:11, fontFamily:"'Fredoka',sans-serif" },
  recipientActive: { border:'1.5px solid var(--tone)', background:'rgba(189,242,74,.10)', boxShadow:'0 0 16px var(--soft)' },
  checkMark: { marginLeft:'auto', color:'var(--tone)', fontFamily:"'Bungee',sans-serif", fontSize:16 },
  input: { width:'100%', padding:'13px 13px', borderRadius:13, border:'1px solid rgba(189,242,74,.28)', background:'rgba(255,255,255,.05)', color:'#FBEFC8', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none', marginTop:10 },
  fieldHint: { color:'#9FD8FF', fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:700, lineHeight:1.3, margin:'-2px 0 0' },
  details: { marginTop:12, border:'1px dashed rgba(127,168,216,.32)', borderRadius:15, padding:12, background:'rgba(255,255,255,.025)' },
  detailsSummary: { color:'#9FD8FF', fontFamily:"'Fredoka',sans-serif", fontSize:13, fontWeight:800, cursor:'pointer' },
  label: { display:'block', fontFamily:"'Fredoka',sans-serif", fontSize:10, color:'#BDF24A', fontWeight:800, letterSpacing:'.08em', margin:'12px 0 6px', textTransform:'uppercase' },
  select: { width:'100%', padding:'12px', borderRadius:12, border:'1px solid rgba(189,242,74,.28)', background:'#081024', color:'#FBEFC8', fontFamily:"'Nunito',sans-serif", fontSize:14, outline:'none' },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  saveBtn: { width:'100%', minHeight:54, marginTop:14, border:0, borderRadius:16, background:'linear-gradient(160deg,#D6FF6E,#BDF24A 55%,#7FC916)', color:'#10240A', fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:800, boxShadow:'0 10px 26px rgba(127,201,22,.34), inset 0 2px 0 rgba(255,255,255,.5)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
  disabledBtn: { width:'100%', minHeight:54, marginTop:14, border:0, borderRadius:16, background:'rgba(127,168,216,.16)', color:'rgba(216,224,248,.38)', fontFamily:"'Fredoka',sans-serif", fontSize:16, fontWeight:800 },
  detectionBox: { border:'1px solid rgba(255,216,77,.28)', background:'rgba(255,216,77,.08)', borderRadius:14, padding:'10px 12px', marginTop:12, textAlign:'left' },
  detectionTitle: { color:'#FFD84D', fontFamily:"'Bungee',sans-serif", fontSize:10, marginBottom:5 },
  detectionText: { color:'#FBEFC8', fontFamily:"'Fredoka',sans-serif", fontSize:12, lineHeight:1.35 },
  catalogBox: { marginTop:12, border:'1px solid rgba(63,169,245,.32)', background:'rgba(63,169,245,.07)', borderRadius:15, padding:12 },
  catalogHint: { color:'#9FD8FF', fontFamily:"'Fredoka',sans-serif", fontSize:12, fontWeight:700, lineHeight:1.3, margin:'0 0 10px' },
  linkDivider: { display:'flex', alignItems:'center', gap:10, margin:'14px 0 2px', color:'#7FA8D8', fontFamily:"'Fredoka',sans-serif", fontSize:11, fontWeight:800 },
  dividerLine: { flex:1, height:1, background:'rgba(127,168,216,.24)' },
  catalogResults: { display:'grid', gap:9, marginTop:10 },
  catalogCard: { width:'100%', display:'grid', gridTemplateColumns:'56px 1fr auto', gap:10, alignItems:'center', textAlign:'left', border:'1px solid rgba(127,168,216,.24)', borderRadius:14, padding:9, background:'rgba(10,18,40,.72)', color:'#FBEFC8', fontFamily:"'Fredoka',sans-serif" },
  catalogImg: { width:56, height:56, borderRadius:12, objectFit:'cover', background:'#0A1228', border:'1px solid rgba(251,239,200,.16)' },
  catalogTitle: { fontSize:13, fontWeight:800, lineHeight:1.15 },
  catalogPrice: { fontSize:11, color:'#FFD84D', fontWeight:800, marginTop:4 },
  catalogPick: { border:0, borderRadius:999, padding:'8px 9px', background:'#BDF24A', color:'#10240A', fontSize:11, fontWeight:900 },
  scanner: { position:'fixed', inset:0, zIndex:260, background:'rgba(6,10,24,.98)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
  scannerBox: { width:'100%', maxWidth:360, textAlign:'center' },
  scannerFrame: { position:'relative', width:'100%', aspectRatio:'1 / 1', borderRadius:22, overflow:'hidden', border:'2px solid #3FA9F5', background:'#081024', boxShadow:'0 0 0 3px rgba(63,169,245,.18), 0 0 34px rgba(63,169,245,.34)' },
  scannerImg: { width:'100%', height:'100%', objectFit:'cover', opacity:.82 },
  gridOverlay: { position:'absolute', inset:0, background:'linear-gradient(rgba(63,169,245,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(63,169,245,.18) 1px, transparent 1px)', backgroundSize:'24px 24px' },
  scannerBeam: { position:'absolute', left:0, right:0, top:-60, height:64, background:'linear-gradient(180deg, transparent, rgba(189,242,74,.68), transparent)', animation:'scan-down 1.2s linear infinite' },
  orbit: { position:'absolute', inset:24, border:'1.5px dashed rgba(189,242,74,.6)', borderRadius:'50%', animation:'spin-slow 5.5s linear infinite' },
  ufo: { position:'absolute', top:-17, left:'50%', transform:'translateX(-50%)' },
  scannerTitle: { fontFamily:"'Bungee',sans-serif", fontSize:18, color:'#FBEFC8', marginTop:18, textShadow:'2px 2px 0 #FF6B3D' },
  scannerSub: { fontFamily:"'Fredoka',sans-serif", fontSize:13, color:'#9FD8FF', marginTop:6 },
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

function Icon({ type, size = 24, color = 'currentColor' }) {
  const common = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', 'aria-hidden':'true' }
  if (type === 'camera') return <svg {...common}><path d="M5 8h3l1.4-2h5.2L16 8h3v10H5V8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="13" r="3" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'gift') return <svg {...common}><path d="M5 10h14v10H5V10Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 10v10M5 14h14M8.5 10C6.8 8.7 6.7 6 8.7 6c1.7 0 2.6 2 3.3 4 .7-2 1.6-4 3.3-4 2 0 1.9 2.7.2 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (type === 'share') return <svg {...common}><path d="M8.5 12.5 15.5 8M8.5 11.5l7 4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><circle cx="6.5" cy="12" r="2.6" stroke={color} strokeWidth="1.8"/><circle cx="17.5" cy="6.7" r="2.6" stroke={color} strokeWidth="1.8"/><circle cx="17.5" cy="17.3" r="2.6" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'search') return <svg {...common}><circle cx="10.5" cy="10.5" r="5.5" stroke={color} strokeWidth="1.8"/><path d="m15 15 4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>
  if (type === 'cart') return <svg {...common}><path d="M5 5h2l1.2 9h8.6L19 8H8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="18" r="1.4" fill={color}/><circle cx="17" cy="18" r="1.4" fill={color}/></svg>
  if (type === 'chevron') return <svg {...common}><path d="m9 5 7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (type === 'trash') return <svg {...common}><path d="M5 7h14M10 11v5M14 11v5M8 7l1-2h6l1 2M7 7l1 13h8l1-13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (type === 'link') return <svg {...common}><path d="M9.5 14.5 14.5 9.5M10.5 7.5l1.1-1.1a4 4 0 0 1 5.7 5.7l-1.1 1.1M13.5 16.5l-1.1 1.1a4 4 0 0 1-5.7-5.7l1.1-1.1" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>
  if (type === 'edit') return <svg {...common}><path d="M5 19h4l10-10-4-4L5 15v4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="m13.5 6.5 4 4" stroke={color} strokeWidth="1.8"/></svg>
  if (type === 'spark') return <svg {...common}><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" fill={color}/></svg>
  if (type === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.8"/></svg>
}

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

function UfoIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M15 20c1.3-6 16.7-6 18 0" fill="#9FD8FF" opacity=".58"/>
      <path d="M18.5 19.4c.4-3.4 10.6-3.4 11 0" fill="#BDF24A"/>
      <circle cx="22" cy="17.3" r="1.3" fill="#063B13"/><circle cx="26" cy="17.3" r="1.3" fill="#063B13"/><circle cx="24" cy="15.4" r="1" fill="#063B13"/>
      <path d="M7 23c4.4-6.4 29.6-6.4 34 0 2 3-5.8 6.8-17 6.8S5 26 7 23Z" fill="#D6DCE8" stroke="#FBEFC8" strokeWidth="2"/>
      <circle cx="16" cy="25" r="1.7" fill="#FF6B3D"/><circle cx="24" cy="25.7" r="1.7" fill="#FFD84D"/><circle cx="32" cy="25" r="1.7" fill="#3FA9F5"/>
    </svg>
  )
}

function KidAvatar({ kid, tone = '#BDF24A', size = 28 }) {
  if (kid?.avatar_url) return <img src={kid.avatar_url} alt={kid.nickname} style={{ width:size, height:size, objectFit:'cover', borderRadius:'50%' }} />
  const letter = (kid?.nickname || 'G').trim().charAt(0).toUpperCase()
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#0A1228" />
      <path d="M17 14 13 7M31 14l4-7" stroke={tone} strokeWidth="3" strokeLinecap="round"/>
      <circle cx="13" cy="7" r="3.2" fill={tone}/><circle cx="35" cy="7" r="3.2" fill={tone}/>
      <path d="M9 26c0-9.5 6.5-15 15-15s15 5.5 15 15c0 8.7-6.5 15-15 15S9 34.7 9 26Z" fill={tone}/>
      <circle cx="18" cy="25" r="5" fill="#fff"/><circle cx="30" cy="25" r="5" fill="#fff"/>
      <circle cx="18" cy="25" r="2.5" fill="#063B13"/><circle cx="30" cy="25" r="2.5" fill="#063B13"/>
      <circle cx="24" cy="18" r="3.7" fill="#fff"/><circle cx="24" cy="18" r="2" fill="#063B13"/>
      <path d="M18 32c3.4 2.5 8.6 2.5 12 0" stroke="#063B13" strokeWidth="2" strokeLinecap="round"/>
      {!kid && <text x="24" y="29" textAnchor="middle" fontFamily="Fredoka" fontSize="15" fontWeight="800" fill="#063B13">{letter}</text>}
    </svg>
  )
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return Number(price).toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 })
}

function rewardForPrice(price) {
  const value = Number(price || 0)
  if (!value) return 0
  return Math.max(1, Math.round(value / 1000))
}

function getTone(kids, childId) {
  if (!childId) return '#BDF24A'
  const index = Math.max(0, kids.findIndex(kid => kid.id === childId))
  return TONES[index % TONES.length]
}

function getAssignedName(item, kids) {
  if (!item.child_id) return 'Lista familiar'
  return `Para ${kids.find(kid => kid.id === item.child_id)?.nickname || 'Peque'}`
}

function getKid(kids, childId) {
  return kids.find(kid => kid.id === childId) || null
}

function extractTitleFromRavUrl(url) {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace(/^www\./, '')
    if (host !== 'ravtoys.com') return ''
    const parts = parsed.pathname.split('/').filter(Boolean)
    const slug = parts[parts.length - 1] || ''
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
  const [filter, setFilter] = useState('all')
  const [manualForm, setManualForm] = useState(blankManualForm)
  const [editingId, setEditingId] = useState('')
  const [showFlow, setShowFlow] = useState(false)
  const [addMethod, setAddMethod] = useState('catalog')
  const [selectedChildId, setSelectedChildId] = useState('')
  const [ravLink, setRavLink] = useState('')
  const [catalogQuery, setCatalogQuery] = useState('')
  const [catalogResults, setCatalogResults] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogMessage, setCatalogMessage] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoDetecting, setPhotoDetecting] = useState(false)
  const [photoDetection, setPhotoDetection] = useState({ supported:false, tried:false, title:'', price:null })
  const [optionalTitle, setOptionalTitle] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareLoading, setShareLoading] = useState(false)
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
  }, [router])

  const loadKids = async (parentId = userId) => {
    const { data } = await supabase
      .from('child_profiles')
      .select('id, nickname, avatar, avatar_url')
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

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items
    if (filter === 'general') return items.filter(item => !item.child_id)
    return items.filter(item => item.child_id === filter)
  }, [filter, items])

  const resetFlow = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setShowFlow(false)
    setAddMethod('catalog')
    setSelectedChildId('')
    setRavLink('')
    setCatalogQuery('')
    setCatalogResults([])
    setCatalogLoading(false)
    setCatalogMessage('')
    setPhotoFile(null)
    setPhotoPreview('')
    setPhotoDetecting(false)
    setPhotoDetection({ supported:false, tried:false, title:'', price:null })
    setOptionalTitle('')
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
    setError('')
    setMessage('')
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

  const savePhotoItem = async () => {
    if (!photoFile) {
      setError('Toma o sube una foto del juguete.')
      return
    }
    setSaving(true)
    setScanning(true)
    setError('')
    try {
      const uploadedUrl = await uploadWishlistPhoto(photoFile)
      await new Promise(resolve => setTimeout(resolve, 1700))
      const title = optionalTitle.trim() || photoDetection.title || 'Juguete por confirmar'
      const { error: insertError } = await supabase.from('wishlist_items').insert({
        user_id: userId,
        child_id: selectedChildId || null,
        title,
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
      setMessage('Listo. RAV está rastreando el juguete y confirmará el precio oficial.')
      await loadItems()
    } catch (err) {
      if (err?.message?.includes('3MB') || err?.message?.includes('imagen válida')) setError(err.message)
      else setError('No se pudo guardar la foto. Revisa Storage y las columnas de Wishlist.')
    }
    setScanning(false)
    setSaving(false)
  }

  const saveRavLink = async () => {
    if (!isRavUrl(ravLink)) {
      setError('Pega un link válido de ravtoys.com')
      return
    }
    setSaving(true)
    setError('')
    const detectedTitle = extractTitleFromRavUrl(ravLink)
    const title = detectedTitle || optionalTitle.trim() || 'Juguete por confirmar'
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
    if (insertError) setError('No se pudo guardar. Revisa que Supabase tenga las columnas de Wishlist.')
    else {
      resetFlow()
      setMessage('RAV confirmará este juguete antes de compartirlo.')
      await loadItems()
    }
    setSaving(false)
  }

  const searchCatalog = async () => {
    if (catalogQuery.trim().length < 2) {
      setCatalogMessage('Escribe al menos 2 letras para buscar.')
      return
    }

    setCatalogLoading(true)
    setCatalogMessage('')
    setCatalogResults([])

    try {
      const res = await fetch(`/api/shopify/search-products?q=${encodeURIComponent(catalogQuery.trim())}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo buscar en Shopify')
      setCatalogResults(json.products || [])
      if (json.notConfigured) setCatalogMessage('Falta conectar el token de Shopify en Vercel.')
      else if (!json.products?.length) setCatalogMessage('No encontramos productos con ese nombre.')
    } catch {
      setCatalogMessage('No se pudo buscar en el catálogo RAV.')
    }

    setCatalogLoading(false)
  }

  const saveCatalogProduct = async (product) => {
    setSaving(true)
    setError('')

    const { error: insertError } = await supabase.from('wishlist_items').insert({
      user_id: userId,
      child_id: selectedChildId || null,
      title: product.title,
      image_url: product.image_url || null,
      price: product.price,
      product_url: product.product_url,
      status: 'wanted',
      source: 'shopify',
      match_status: 'shopify_matched',
      shopify_product_id: product.product_id,
      shopify_variant_id: product.variant_id || null,
      sku: product.sku || null,
      updated_at: new Date().toISOString(),
    })

    if (insertError) setError('No se pudo guardar el producto Shopify. Revisa la tabla Wishlist.')
    else {
      resetFlow()
      setMessage('Producto RAV agregado a tu Wishlist.')
      await loadItems()
    }

    setSaving(false)
  }

  const saveManualItem = async () => {
    if (!manualForm.title.trim()) {
      setError('El nombre del juguete es obligatorio')
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

  const shareWishlist = async () => {
    setShareLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo crear el link')
      setShareUrl(json.url)
      const text = 'Esta es nuestra Wishlist RAV.'
      if (navigator.share) await navigator.share({ title:'Wishlist RAV', text, url:json.url })
      else {
        await navigator.clipboard?.writeText(json.url)
        setMessage('Link público copiado.')
      }
    } catch {
      setError('No se pudo crear el link público. Revisa que Supabase tenga las columnas nuevas.')
    }
    setShareLoading(false)
  }

  const selectedKid = getKid(kids, selectedChildId)
  const selectedTone = getTone(kids, selectedChildId)

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
            <ShootingStarIcon />
            <p style={C.title}>Wishlist RAV</p>
          </div>
          <p style={C.sub}>Guarda sus juguetes favoritos y arma una lista mágica para compartir.</p>
        </div>
      </header>

      <main style={C.body}>
        <button style={C.captureCard} onClick={startAdd}>
          <span style={C.captureChip}><Icon type="search" size={27} /><span style={C.sparkle}><Icon type="spark" size={17} color="#FFD84D" /></span></span>
          <span>
            <span style={C.captureTitle}>Agregar juguete</span>
            <span style={C.captureSub}>Busca en ravtoys.com o toma una foto. Guardarlo debe sentirse rápido y mágico.</span>
          </span>
          <Icon type="chevron" color="#BDF24A" />
        </button>

        <section style={C.shareRow}>
          <div style={C.shareLeft}>
            <span style={C.goldChip}><Icon type="spark" size={22} color="#0E1B3A" /></span>
            <div>
              <p style={C.shareTitle}>Tu lista mágica</p>
              <p style={C.shareSub}>{items.length} juguetes guardados</p>
            </div>
          </div>
          <button style={C.shareBtn} onClick={shareWishlist} disabled={shareLoading}><Icon type="share" size={15} color="currentColor" /> {shareLoading ? 'Creando...' : 'Compartir'}</button>
        </section>

        {shareUrl && (
          <div style={C.shareLinkBox}>
            <span style={C.shareLinkText}>{shareUrl}</span>
            <button style={C.copySmallBtn} onClick={async () => { await navigator.clipboard?.writeText(shareUrl); setMessage('Link público copiado.') }}>Copiar</button>
          </div>
        )}

        {message && <div style={C.success}>{message}</div>}
        {error && !showFlow && <p style={C.err}>{error}</p>}

        <div style={C.filters}>
          {FILTERS.map(id => (
            <button key={id} style={{ ...C.filterPill, ...(filter === id ? C.filterActive : {}) }} onClick={() => setFilter(id)}>
              {id === 'all' ? 'Todos' : 'General'}
            </button>
          ))}
          {kids.map((kid, index) => (
            <button key={kid.id} style={{ ...C.filterPill, ...(filter === kid.id ? C.filterActive : {}) }} onClick={() => setFilter(kid.id)}>
              <span style={{ ...C.tinyAvatar, boxShadow:`0 0 0 1.5px ${TONES[index % TONES.length]}` }}><KidAvatar kid={kid} tone={TONES[index % TONES.length]} size={20} /></span>
              {kid.nickname}
            </button>
          ))}
        </div>

        <p style={C.sectionTitle}><span style={C.play}>▸</span>Juguetes guardados</p>

        {loading && <p style={C.empty}>Cargando...</p>}
        {!loading && filteredItems.length === 0 && (
          <div style={C.empty}>
            <ShootingStarIcon size={52} />
            <p style={{ color:'#FBEFC8', fontSize:15, fontWeight:800, marginTop:8 }}>Aún no hay juguetes aquí</p>
            <p>Toca "Agregar juguete" y busca en ravtoys.com o toma la primera foto.</p>
          </div>
        )}

        {filteredItems.map(item => {
          const pending = item.match_status === 'pending_confirmation'
          const displayImage = item.uploaded_image_url || item.image_url
          const tone = getTone(kids, item.child_id)
          const kid = getKid(kids, item.child_id)
          const officialPrice = item.price || (item.match_status === 'shopify_matched' ? item.detected_price : null)
          return (
            <article key={item.id} style={{ ...C.card, '--tone':tone, '--soft':`${tone}33`, border:`1.5px solid ${pending ? '#3FA9F5' : '#BDF24A'}`, boxShadow:`0 13px 28px rgba(0,0,0,.34), 0 0 18px ${pending ? 'rgba(63,169,245,.24)' : 'rgba(189,242,74,.22)'}` }}>
              <span style={C.foil} />
              <button style={C.trash} onClick={() => deleteItem(item)} aria-label="Eliminar"><Icon type="trash" size={16} color="currentColor" /></button>

              <div style={C.photoWrap}>
                {displayImage ? <img style={{ ...C.photo, filter:pending ? 'saturate(.72)' : 'none' }} src={displayImage} alt={item.title} /> : <div style={C.fallback}><Icon type={item.source === 'rav_link' ? 'link' : 'gift'} size={34} color="#BDF24A" /></div>}
                <span style={C.recipientBadge}><KidAvatar kid={kid} tone={tone} size={30} /></span>
                {pending && <span style={C.scanBeam} />}
                <span style={{ ...C.stamp, color:pending ? '#3FA9F5' : '#BDF24A' }}>{pending ? 'En orbita' : 'Confirmado'}</span>
              </div>

              <div style={C.cardInfo}>
                <p style={C.toyTitle}>{pending ? (item.detected_title || item.title || 'Juguete por confirmar') : (item.title || item.detected_title)}</p>
                <p style={C.recipientLine}>{getAssignedName(item, kids)}</p>
                {pending ? (
                  <>
                    <p style={C.pendingNote}><span style={C.pulseDot} /> RAV está confirmando el precio oficial...</p>
                    {item.detected_price !== null && item.detected_price !== undefined && <p style={C.estimate}>Precio estimado: {formatPrice(item.detected_price)}</p>}
                  </>
                ) : (
                  <div style={C.priceRow}>
                    {officialPrice ? <span style={C.priceTag}>{formatPrice(officialPrice)}</span> : <span style={C.pendingNote}><span style={C.pulseDot} /> Precio pendiente</span>}
                    {officialPrice && <span style={C.rewardChip}>★ +{rewardForPrice(officialPrice)}</span>}
                  </div>
                )}
                {item.product_url && <a style={C.productLink} href={item.product_url} target="_blank" rel="noreferrer">Ver producto</a>}
              </div>

              <div style={C.cardFooter}>
                <select style={C.statusSelect} value={item.status || 'wanted'} onChange={e => updateStatus(item, e.target.value)}>
                  <option value="wanted">{STATUS_LABELS.wanted}</option>
                  <option value="reserved">{STATUS_LABELS.reserved}</option>
                  <option value="purchased">{STATUS_LABELS.purchased}</option>
                </select>
                <button style={C.editBtn} onClick={() => startEdit(item)}>Editar</button>
              </div>
            </article>
          )
        })}
      </main>

      {showFlow && (
        <div style={C.overlay}>
          <div style={C.overlayInner}>
            <div style={C.overlayTop}>
              <button style={C.backBtn} onClick={resetFlow}>‹ Volver</button>
              <p style={C.overlayTitle}>Agregar juguete</p>
            </div>

            <section style={C.flowCard}>
              {error && <p style={C.err}>{error}</p>}
              <span style={C.stepPill}>Paso 1</span>
              <p style={C.question}>¿Para quién es este regalo?</p>
              <p style={C.helper}>Elige si va para toda la familia o para uno de tus peques exploradores.</p>
              <div style={C.recipientList}>
                <button style={{ ...C.recipientBtn, ...(selectedChildId === '' ? C.recipientActive : {}), '--tone':'#BDF24A', '--soft':'rgba(189,242,74,.22)' }} onClick={() => setSelectedChildId('')}>
                  <span style={{ ...C.recipientBadge, position:'static', boxShadow:'0 0 0 2px #BDF24A' }}><Icon type="gift" size={17} color="#BDF24A" /></span>
                  <span><strong>General</strong><br /><small style={{ color:'#7FA8D8' }}>Para la wishlist familiar.</small></span>
                  {selectedChildId === '' && <span style={C.checkMark}>✓</span>}
                </button>
                {kids.map((kid, index) => {
                  const tone = TONES[index % TONES.length]
                  return (
                    <button key={kid.id} style={{ ...C.recipientBtn, ...(selectedChildId === kid.id ? C.recipientActive : {}), '--tone':tone, '--soft':`${tone}33` }} onClick={() => setSelectedChildId(kid.id)}>
                      <span style={{ ...C.recipientBadge, position:'static', boxShadow:`0 0 0 2px ${tone}` }}><KidAvatar kid={kid} tone={tone} size={30} /></span>
                      <span><strong>{kid.nickname}</strong><br /><small style={{ color:'#7FA8D8' }}>Guardar para este peque.</small></span>
                      {selectedChildId === kid.id && <span style={C.checkMark}>✓</span>}
                    </button>
                  )
                })}
                <button style={{ ...C.recipientBtn, border:'1px dashed rgba(127,168,216,.38)' }} onClick={() => router.push('/kids')}>
                  <span style={{ ...C.recipientBadge, position:'static', boxShadow:'0 0 0 2px #7FA8D8' }}><Icon type="plus" size={17} color="#9FD8FF" /></span>
                  <span><strong>Agregar peque</strong><br /><small style={{ color:'#7FA8D8' }}>Crear perfil explorador.</small></span>
                </button>
              </div>

              <span style={{ ...C.stepPill, marginTop:18 }}>Paso 2</span>
              <p style={C.question}>¿Qué juguete quieres guardar?</p>
              <p style={C.helper}>Si está en ravtoys.com, lo agregamos con foto, precio y link oficial. Si lo viste en tienda, una foto basta.</p>

              <div style={C.methodGrid}>
                <button type="button" style={{ ...C.methodCard, ...(addMethod === 'catalog' ? C.methodActive : {}) }} onClick={() => setAddMethod('catalog')}>
                  <span style={C.methodIcon}><Icon type="search" size={21} color="currentColor" /></span>
                  <span style={C.methodTitle}>Buscar en ravtoys.com</span>
                  <span style={C.methodSub}>Encuentra el juguete oficial o pega su link.</span>
                </button>
                <button type="button" style={{ ...C.methodCard, ...(addMethod === 'photo' ? C.methodActive : {}) }} onClick={() => setAddMethod('photo')}>
                  <span style={C.methodIcon}><Icon type="camera" size={22} color="currentColor" /></span>
                  <span style={C.methodTitle}>Tomar o subir foto</span>
                  <span style={C.methodSub}>Perfecto si lo viste en tienda o no sabes el nombre.</span>
                </button>
              </div>

              {addMethod === 'catalog' && (
                <div style={C.catalogBox}>
                  <label style={{ ...C.label, marginTop:0 }}>Buscar juguete en ravtoys.com</label>
                  <p style={C.catalogHint}>Busca por nombre, marca o tipo de juguete. Cuando lo elijas, quedará guardado con su información oficial.</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 92px', gap:8 }}>
                    <input style={{ ...C.input, marginTop:0 }} placeholder="Ej: LEGO, Barbie, dinosaurio..." value={catalogQuery} onChange={e => setCatalogQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') searchCatalog() }} />
                    <button style={{ ...C.catalogPick, borderRadius:13 }} onClick={searchCatalog} disabled={catalogLoading}>{catalogLoading ? '...' : 'Buscar'}</button>
                  </div>
                  {catalogMessage && <p style={{ ...C.detectionText, marginTop:9 }}>{catalogMessage}</p>}
                  {!!catalogResults.length && (
                    <div style={C.catalogResults}>
                      {catalogResults.map(product => (
                        <button key={product.product_id} style={C.catalogCard} onClick={() => saveCatalogProduct(product)} disabled={saving}>
                          {product.image_url ? <img src={product.image_url} alt={product.image_alt || product.title} style={C.catalogImg} /> : <span style={C.catalogImg} />}
                          <span>
                            <span style={C.catalogTitle}>{product.title}</span>
                            <span style={C.catalogPrice}>{product.price ? formatPrice(product.price) : 'Precio por confirmar'}</span>
                          </span>
                          <span style={C.catalogPick}><Icon type="cart" size={13} color="currentColor" /> Agregar</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={C.linkDivider}><span style={C.dividerLine} /> o pega el link oficial <span style={C.dividerLine} /></div>
                  <input style={C.input} placeholder="https://ravtoys.com/products/..." value={ravLink} onChange={e => setRavLink(e.target.value)} />
                  <button style={ravLink.trim() ? C.saveBtn : C.disabledBtn} onClick={saveRavLink} disabled={!ravLink.trim() || saving}>Guardar link de RAV</button>
                </div>
              )}

              {addMethod === 'photo' && (
                <>
                  <input ref={photoInputRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e => choosePhoto(e.target.files?.[0])} />
                  <button style={C.uploadBox} onClick={() => photoInputRef.current?.click()}>
                    {photoPreview ? <img src={photoPreview} alt="Foto del juguete" style={C.uploadPreview} /> : <Icon type="camera" size={44} color="#BDF24A" />}
                    <span style={C.changePhoto}>{photoPreview ? 'Cambiar foto' : 'Tomar o subir foto'}</span>
                  </button>

                  {photoPreview && (
                    <div style={C.detectionBox}>
                      <p style={C.detectionTitle}>Lectura de imagen</p>
                      {photoDetecting && <p style={C.detectionText}>Intentando leer nombre y precio...</p>}
                      {!photoDetecting && photoDetection.tried && !photoDetection.supported && <p style={C.detectionText}>Este navegador no permite leer texto todavía. Guardaremos la foto para que RAV lo confirme.</p>}
                      {!photoDetecting && photoDetection.tried && photoDetection.supported && !photoDetection.title && !photoDetection.price && <p style={C.detectionText}>No se detectó texto claro. RAV confirmará el juguete y el precio.</p>}
                      {!photoDetecting && !!photoDetection.title && <p style={C.detectionText}>Nombre estimado: <strong>{photoDetection.title}</strong></p>}
                      {!photoDetecting && !!photoDetection.price && <p style={C.detectionText}>Precio estimado: <strong>{formatPrice(photoDetection.price)}</strong></p>}
                    </div>
                  )}

                  <label style={C.label}>Nombre del juguete</label>
                  <p style={C.fieldHint}>Opcional, pero ayuda a RAV a confirmarlo más rápido.</p>
                  <input style={C.input} placeholder="Ej: Set LEGO, muñeca, carro..." value={optionalTitle} onChange={e => setOptionalTitle(e.target.value)} />

                  <button style={photoFile ? C.saveBtn : C.disabledBtn} onClick={savePhotoItem} disabled={!photoFile || saving}>
                    <Icon type="spark" size={18} color="currentColor" /> {saving ? 'Guardando...' : 'Guardar foto en la wishlist'}
                  </button>
                </>
              )}

              <details style={C.details} open={!!editingId || showManual}>
                <summary style={C.detailsSummary}>Opciones internas · solo pruebas</summary>

                <label style={C.label}>Manual · solo pruebas internas</label>
                <input style={C.input} placeholder="Nombre del juguete" value={manualForm.title} onChange={e => setManualForm(prev => ({ ...prev, title:e.target.value }))} />
                <input style={C.input} placeholder="Imagen URL opcional" value={manualForm.image_url} onChange={e => setManualForm(prev => ({ ...prev, image_url:e.target.value }))} />
                <div style={C.row}>
                  <input style={C.input} type="number" min="0" placeholder="Precio" value={manualForm.price} onChange={e => setManualForm(prev => ({ ...prev, price:e.target.value }))} />
                  <select style={{ ...C.select, marginTop:10 }} value={manualForm.status} onChange={e => setManualForm(prev => ({ ...prev, status:e.target.value }))}>
                    <option value="wanted">Deseado</option>
                    <option value="reserved">Reservado</option>
                    <option value="purchased">Comprado</option>
                  </select>
                </div>
                <input style={C.input} placeholder="Producto URL opcional" value={manualForm.product_url} onChange={e => setManualForm(prev => ({ ...prev, product_url:e.target.value }))} />
                <select style={C.select} value={manualForm.child_id} onChange={e => setManualForm(prev => ({ ...prev, child_id:e.target.value }))}>
                  <option value="">General</option>
                  {kids.map(kid => <option key={kid.id} value={kid.id}>{kid.nickname}</option>)}
                </select>
                <button style={manualForm.title.trim() ? C.saveBtn : C.disabledBtn} onClick={saveManualItem} disabled={!manualForm.title.trim() || saving}>{editingId ? 'Guardar cambios' : 'Guardar prueba'}</button>
              </details>
            </section>
          </div>
        </div>
      )}

      {scanning && (
        <div style={C.scanner}>
          <div style={C.scannerBox}>
            <div style={C.scannerFrame}>
              {photoPreview && <img src={photoPreview} alt="RAV rastreando" style={C.scannerImg} />}
              <span style={C.gridOverlay} />
              <span style={C.scannerBeam} />
              <span style={C.orbit}><span style={C.ufo}><UfoIcon /></span></span>
            </div>
            <p style={C.scannerTitle}>Rastreando en el RAV Universo...</p>
            <p style={C.scannerSub}>Identificando tu juguete y su precio oficial</p>
          </div>
        </div>
      )}

      <Navbar active="wishlist" />

      <style jsx global>{`
        @keyframes foil-sweep {
          from { background-position: 0% 50%; }
          to { background-position: 100% 50%; }
        }
        @keyframes scan-down {
          from { transform: translateY(0); }
          to { transform: translateY(170px); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(.78); opacity: .55; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
        }
        @media (max-width: 380px) {
          .wishlist-card { grid-template-columns: 92px 1fr !important; }
        }
      `}</style>
    </div>
  )
}
