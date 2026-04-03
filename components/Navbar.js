import { useRouter } from 'next/router'

const S = {
  nav: { display:'flex', justifyContent:'space-around', padding:'8px 0 12px', borderTop:'1px solid rgba(170,235,58,0.15)', background:'rgba(8,6,24,0.98)', position:'fixed', bottom:0, left:0, right:0, zIndex:100 },
  btn: { display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', padding:'4px 16px' },
  icon: { fontSize:22 },
  label: { fontSize:10, fontFamily:'Nunito,sans-serif', fontWeight:700 },
}

export default function Navbar({ active }) {
  const router = useRouter()
  const items = [
    { id:'home', icon:'🏠', label:'Inicio', path:'/home' },
    { id:'benefits', icon:'🎁', label:'Premios', path:'/benefits' },
    { id:'history', icon:'🪐', label:'Historial', path:'/history' },
    { id:'profile', icon:'👽', label:'Perfil', path:'/profile' },
  ]
  return (
    <nav style={S.nav}>
      {items.map(item => (
        <button key={item.id} style={S.btn} onClick={() => router.push(item.path)}>
          <span style={S.icon}>{item.icon}</span>
          <span style={{ ...S.label, color: active === item.id ? '#AAEB3A' : 'rgba(170,235,58,0.4)' }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}