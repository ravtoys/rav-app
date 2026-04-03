import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const C = {
  wrap: { minHeight:'100vh', background:'linear-gradient(180deg,#080618 0%,#1a0a3d 60%,#0d0b2b 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', padding:'0 24px 48px', position:'relative' },
  star: { position:'absolute', borderRadius:'50%', background:'white' },
  mascot: { position:'absolute', top:40, left:'50%', transform:'translateX(-50%)', width:160 },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:32, fontWeight:900, color:'#AAEB3A', letterSpacing:1, textAlign:'center', marginBottom:4 },
  sub: { fontSize:13, color:'rgba(170,235,58,0.6)', textAlign:'center', marginBottom:32, fontWeight:700 },
  form: { width:'100%', maxWidth:360, display:'flex', flexDirection:'column', gap:12 },
  btnGreen: { padding:'15px', borderRadius:14, border:'none', background:'#AAEB3A', color:'#080618', fontSize:16, fontWeight:900, width:'100%' },
  btnOut: { padding:'14px', borderRadius:14, border:'1.5px solid rgba(170,235,58,0.4)', background:'transparent', color:'#AAEB3A', fontSize:15, fontWeight:700, width:'100%' },
  toggle: { textAlign:'center', color:'rgba(255,255,255,0.5)', fontSize:13, marginTop:4, cursor:'pointer' },
  err: { color:'#ff6666', fontSize:13, textAlign:'center' },
  foot: { color:'rgba(255,255,255,0.2)', fontSize:11, textAlign:'center', marginTop:16 },
}

export default function Welcome() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o contraseña incorrectos')
    else router.push('/home')
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!name || !email || !password) { setError('Por favor completa todos los campos'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, phone } }
    })
    if (error) setError(error.message)
    else router.push('/home')
    setLoading(false)
  }

  return (
    <div style={C.wrap}>
      {/* Stars */}
      {[[20,40,1.2],[60,80,0.8],[120,25,1],[200,60,0.9],[250,35,1.1],[280,90,0.7],[90,110,0.8],[170,15,1.3]].map(([x,y,r],i) => (
        <div key={i} style={{...C.star, left:x, top:y, width:r*2, height:r*2, opacity:0.6+(i%3)*0.15}} />
      ))}
      {/* Green stars */}
      {[[40,150,1],[270,120,0.8],[150,80,0.9]].map(([x,y,r],i) => (
        <div key={'g'+i} style={{...C.star, left:x, top:y, width:r*2, height:r*2, background:'#AAEB3A', opacity:0.4}} />
      ))}

      {/* RAVstronauta */}
      <svg style={C.mascot} viewBox="0 0 180 200">
        <circle cx="90" cy="80" r="62" fill="none" stroke="white" strokeWidth="3.5" opacity=".85"/>
        <ellipse cx="90" cy="80" rx="48" ry="46" fill="#AAEB3A"/>
        <ellipse cx="38" cy="82" rx="10" ry="8" fill="#AAEB3A"/>
        <ellipse cx="142" cy="82" rx="10" ry="8" fill="#AAEB3A"/>
        <rect x="20" y="77" width="14" height="8" rx="3" fill="white" stroke="#ccc" strokeWidth="1"/>
        <rect x="146" y="77" width="14" height="8" rx="3" fill="white" stroke="#ccc" strokeWidth="1"/>
        <ellipse cx="73" cy="82" rx="13" ry="15" fill="white"/>
        <ellipse cx="108" cy="82" rx="13" ry="15" fill="white"/>
        <circle cx="73" cy="83" r="7.5" fill="#1a3a1a"/>
        <circle cx="108" cy="83" r="7.5" fill="#1a3a1a"/>
        <circle cx="70" cy="80" r="2.5" fill="white" opacity=".8"/>
        <circle cx="105" cy="80" r="2.5" fill="white" opacity=".8"/>
        <ellipse cx="90" cy="62" rx="7" ry="8" fill="white"/>
        <circle cx="90" cy="63" r="4.5" fill="#1a3a1a"/>
        <circle cx="88" cy="61" r="1.8" fill="white" opacity=".8"/>
        <line x1="78" y1="38" x2="68" y2="16" stroke="#7ab82a" strokeWidth="2"/>
        <circle cx="68" cy="14" r="4" fill="#AAEB3A"/>
        <line x1="103" y1="38" x2="113" y2="16" stroke="#7ab82a" strokeWidth="2"/>
        <circle cx="113" cy="14" r="4" fill="#AAEB3A"/>
        <circle cx="77" cy="99" r="1.5" fill="#7ab82a" opacity=".7"/>
        <circle cx="82" cy="104" r="1.5" fill="#7ab82a" opacity=".7"/>
        <circle cx="99" cy="99" r="1.5" fill="#7ab82a" opacity=".7"/>
        <circle cx="104" cy="104" r="1.5" fill="#7ab82a" opacity=".7"/>
        <path d="M76 110 Q90 121 104 110" fill="none" stroke="#2a5a0a" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="82" y="110" width="6" height="5" rx="1" fill="white"/>
        <rect x="91" y="110" width="6" height="5" rx="1" fill="white"/>
        <rect x="66" y="124" width="48" height="9" rx="4" fill="#2B3FBF"/>
        <circle cx="80" cy="128" r="2.5" fill="#ff5533"/>
        <circle cx="91" cy="128" r="2.5" fill="#44aaff"/>
        <rect x="54" y="132" width="72" height="55" rx="12" fill="#d0d4e0"/>
        <rect x="54" y="145" width="72" height="5" rx="2" fill="#2B3FBF"/>
        <rect x="54" y="178" width="72" height="5" rx="2" fill="#2B3FBF"/>
        <rect x="78" y="153" width="24" height="18" rx="4" fill="#2B3FBF"/>
        <text x="90" y="165" fontSize="7" fill="white" textAnchor="middle" fontFamily="Nunito" fontWeight="800">RAV</text>
        <rect x="28" y="135" width="24" height="38" rx="10" fill="#d0d4e0"/>
        <rect x="28" y="166" width="24" height="5" rx="2" fill="#2B3FBF"/>
        <ellipse cx="40" cy="178" rx="9" ry="6" fill="white"/>
        <rect x="128" y="135" width="24" height="38" rx="10" fill="#d0d4e0"/>
        <rect x="128" y="166" width="24" height="5" rx="2" fill="#2B3FBF"/>
        <ellipse cx="140" cy="178" rx="9" ry="6" fill="white"/>
        <rect x="64" y="186" width="22" height="12" rx="6" fill="#b0b4c0"/>
        <rect x="94" y="186" width="22" height="12" rx="6" fill="#b0b4c0"/>
      </svg>

      <div style={C.form}>
        <p style={C.title}>RAV Club</p>
        <p style={C.sub}>{mode === 'login' ? 'Inicia sesión para continuar' : 'Únete al universo RAV'}</p>

        {mode === 'signup' && (
          <input placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} />
        )}
        <input placeholder="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        {mode === 'signup' && (
          <input placeholder="Teléfono (opcional)" value={phone} onChange={e => setPhone(e.target.value)} />
        )}
        <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />

        {error && <p style={C.err}>{error}</p>}

        <button style={C.btnGreen} onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

        <p style={C.toggle} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
        </p>
        <p style={C.foot}>RAV Toys · Medellín, Colombia 🌌</p>
      </div>
    </div>
  )
}