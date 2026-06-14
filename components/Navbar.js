import { useRouter } from 'next/router'

const S = {
  nav: {
    display:'flex',
    justifyContent:'space-around',
    gap:2,
    padding:'11px 8px 14px',
    borderTop:'1px solid rgba(63,169,245,.18)',
    background:'linear-gradient(180deg, rgba(8,13,28,0), rgba(7,11,24,.88) 32%, rgba(5,8,18,.97))',
    backdropFilter:'blur(14px)',
    position:'fixed',
    bottom:0,
    left:0,
    right:0,
    zIndex:100,
  },
  btn: {
    flex:1,
    minWidth:0,
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    gap:4,
    background:'none',
    border:'none',
    cursor:'pointer',
    padding:'4px 1px',
  },
  icon: {
    width:24,
    height:24,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
  },
  label: {
    fontSize:10,
    fontFamily:"'Fredoka',sans-serif",
    fontWeight:700,
    whiteSpace:'nowrap',
    letterSpacing:0,
  },
}

function HomeBaseIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 10.5v8h11v-8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M10 18.5v-5h4v5M12 5V2.8M12 2.8l2-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="15" cy="1.6" r="1.2" fill="currentColor"/></svg>
}

function TrophyIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8v3.5c0 3-1.6 5.2-4 5.2S8 10.5 8 7.5V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 6H5.5c0 3 1.2 5 3.8 5M16 6h2.5c0 3-1.2 5-3.8 5M12 12.7v3.1M8.5 19h7M10 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="m12 6.8.7 1.4 1.5.2-1.1 1.1.3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1.1 1.5-.2.7-1.4Z" fill="currentColor" opacity=".62"/></svg>
}

function RocketIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.5 5.5c2.1-2.1 4.7-2 5-2 .1.3.1 2.9-2 5l-5.9 5.9-3-3 5.9-5.9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="m9.2 9.9-3.6.7 2.1-3.4M14.1 14.8l-.7 3.6 3.4-2.1M7.2 16.8l-2.4 2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="15.7" cy="7.1" r="1.2" fill="currentColor"/></svg>
}

function BabyAlienIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.2 7.2 6.5 3.8M15.8 7.2l1.7-3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="6.2" cy="3.4" r="1.3" fill="currentColor"/><circle cx="17.8" cy="3.4" r="1.3" fill="currentColor"/><path d="M4.5 13c0-4.3 3.3-7 7.5-7s7.5 2.7 7.5 7c0 4-3.3 7.2-7.5 7.2S4.5 17 4.5 13Z" stroke="currentColor" strokeWidth="1.7" fill="currentColor" fillOpacity=".12"/><circle cx="9.2" cy="13" r="1.6" fill="currentColor"/><circle cx="14.8" cy="13" r="1.6" fill="currentColor"/><path d="M9.2 16.2c1.6 1.2 4 1.2 5.6 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
}

function CometIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m16 3.8-1.6 3.2-3.6.5 2.6 2.5-.6 3.6L16 11.9l3.2 1.7-.6-3.6 2.6-2.5-3.6-.5L16 3.8Z" fill="currentColor"/><path d="M11.5 14.2c-2.7.8-5.3 2-7.7 3.9M10 10.7c-2.2.2-4.3.8-6.4 1.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity=".65"/></svg>
}

function HelmetIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12.3C4.5 7.5 7.5 4 12 4s7.5 3.5 7.5 8.3v4.2c0 1.5-1 2.5-2.5 2.5H7c-1.5 0-2.5-1-2.5-2.5v-4.2Z" stroke="currentColor" strokeWidth="1.7"/><path d="M7.5 13c.6-2.5 2.3-4 4.5-4s3.9 1.5 4.5 4c-.9 1.2-2.4 2-4.5 2s-3.6-.8-4.5-2Z" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="1.7"/><path d="M8 18.8v-2M16 18.8v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
}

const icons = {
  home: <HomeBaseIcon />,
  benefits: <TrophyIcon />,
  history: <RocketIcon />,
  kids: <BabyAlienIcon />,
  wishlist: <CometIcon />,
  profile: <HelmetIcon />,
}

export default function Navbar({ active }) {
  const router = useRouter()
  const items = [
    { id:'home', label:'Inicio', path:'/home' },
    { id:'benefits', label:'Premios', path:'/benefits' },
    { id:'history', label:'Historial', path:'/history' },
    { id:'kids', label:'Peques', path:'/kids' },
    { id:'wishlist', label:'Wishlist', path:'/wishlist' },
    { id:'profile', label:'Perfil', path:'/profile' },
  ]

  return (
    <nav style={S.nav}>
      {items.map(item => {
        const isActive = active === item.id
        const color = isActive ? '#3FA9F5' : '#46618f'
        return (
          <button key={item.id} style={S.btn} onClick={() => router.push(item.path)}>
            <span style={{ ...S.icon, color, filter:isActive ? 'drop-shadow(0 0 8px rgba(63,169,245,.8))' : 'none' }}>{icons[item.id]}</span>
            <span style={{ ...S.label, color }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
