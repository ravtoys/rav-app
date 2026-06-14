import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const STARS = Array.from({ length: 78 }, (_, i) => {
  const x = (i * 37 + 11) % 100
  const y = (i * 53 + 7) % 100
  const size = 0.7 + ((i * 17) % 16) / 10
  const tone = i % 17 === 0 ? 'gold' : i % 7 === 0 ? 'lime' : 'white'
  const duration = 2.4 + ((i * 19) % 31) / 10
  const delay = ((i * 23) % 55) / 10
  return { x, y, size, tone, duration, delay }
})

const C = {
  wrap: {
    minHeight:'100vh',
    background:'radial-gradient(125% 80% at 50% -8%, rgba(108,96,184,0.50) 0%, transparent 58%), radial-gradient(100% 65% at 86% 12%, rgba(60,141,199,0.34) 0%, transparent 55%), radial-gradient(95% 60% at 6% 26%, rgba(189,242,74,0.10) 0%, transparent 52%), linear-gradient(180deg, #141A3A 0%, #0B0C1A 46%, #05060E 100%)',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    padding:'22px 28px 24px',
    position:'relative',
    overflow:'hidden',
    color:'#EAF0FF',
  },
  vignette: {
    position:'absolute',
    inset:0,
    background:'radial-gradient(120% 90% at 50% 38%, transparent 55%, rgba(0,0,0,0.45) 100%)',
    pointerEvents:'none',
    zIndex:2,
  },
  nebula: {
    position:'absolute',
    width:220,
    height:220,
    borderRadius:'50%',
    filter:'blur(48px)',
    opacity:0.5,
    zIndex:0,
  },
  star: {
    position:'absolute',
    borderRadius:'50%',
    zIndex:1,
    opacity:0.72,
  },
  content: {
    width:'100%',
    maxWidth:402,
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    position:'relative',
    zIndex:3,
  },
  eyebrow: {
    fontFamily:"'Fredoka', sans-serif",
    fontSize:12,
    fontWeight:700,
    letterSpacing:'.16em',
    textTransform:'uppercase',
    color:'#BDF24A',
    opacity:0.85,
    marginBottom:8,
    textAlign:'center',
  },
  hero: {
    width:280,
    height:280,
    position:'relative',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    margin:'-4px 0 -8px',
  },
  burst: {
    position:'absolute',
    width:308,
    height:308,
    borderRadius:'50%',
    inset:'50% auto auto 50%',
    transform:'translate(-50%,-50%)',
    WebkitMask:'radial-gradient(circle, #000 14%, rgba(0,0,0,.55) 38%, transparent 64%)',
    mask:'radial-gradient(circle, #000 14%, rgba(0,0,0,.55) 38%, transparent 64%)',
  },
  burstGold: {
    background:'repeating-conic-gradient(from 0deg, rgba(255,216,77,.20) 0deg 3.2deg, transparent 3.2deg 11deg)',
  },
  burstLime: {
    background:'repeating-conic-gradient(from 1.6deg, rgba(189,242,74,.16) 0deg 3.2deg, transparent 3.2deg 11deg)',
  },
  halo: {
    position:'absolute',
    width:210,
    height:210,
    borderRadius:'50%',
    background:'radial-gradient(circle, rgba(189,242,74,.55) 0%, rgba(108,96,184,.25) 45%, transparent 70%)',
    filter:'blur(16px)',
  },
  mascot: {
    width:188,
    position:'relative',
    zIndex:4,
    filter:'drop-shadow(0 14px 28px rgba(0,0,0,.5))',
  },
  wordmark: {
    fontFamily:"'Stalinist One', sans-serif",
    fontSize:40,
    lineHeight:1,
    letterSpacing:'.015em',
    textAlign:'center',
    background:'linear-gradient(180deg, #FFFFFF 0%, #CFE0A8 30%, #BDF24A 52%, #7FC916 72%, #5C9A0E 100%)',
    WebkitBackgroundClip:'text',
    backgroundClip:'text',
    color:'transparent',
    filter:'drop-shadow(0 3px 0 rgba(0,0,0,.32)) drop-shadow(0 0 22px rgba(189,242,74,.42))',
    whiteSpace:'nowrap',
    marginBottom:9,
  },
  subtitle: {
    fontFamily:"'Fredoka', sans-serif",
    fontSize:16,
    fontWeight:600,
    color:'rgba(216,224,248,0.66)',
    textAlign:'center',
    marginBottom:22,
  },
  form: {
    width:'100%',
    maxWidth:340,
    display:'flex',
    flexDirection:'column',
    gap:14,
  },
  field: {
    height:58,
    display:'flex',
    alignItems:'center',
    gap:12,
    borderRadius:16,
    border:'1.5px solid rgba(168,178,210,0.14)',
    background:'rgba(20,26,58,0.55)',
    backdropFilter:'blur(8px)',
    padding:'0 16px',
    color:'#AEB6D6',
  },
  fieldInput: {
    flex:1,
    height:'100%',
    border:'none',
    background:'transparent',
    color:'#EAF0FF',
    fontFamily:"'Nunito', sans-serif",
    fontSize:15,
    fontWeight:600,
    outline:'none',
    padding:0,
  },
  plainInput: {
    height:52,
    borderRadius:16,
    border:'1.5px solid rgba(168,178,210,0.14)',
    background:'rgba(20,26,58,0.55)',
    color:'#EAF0FF',
    fontFamily:"'Nunito', sans-serif",
    fontSize:15,
    fontWeight:600,
    outline:'none',
    padding:'0 16px',
  },
  primary: {
    width:'100%',
    height:58,
    border:'none',
    borderRadius:999,
    background:'linear-gradient(160deg, #D6FF6E, #BDF24A 55%, #7FC916)',
    color:'#10240a',
    fontFamily:"'Fredoka', sans-serif",
    fontSize:18,
    fontWeight:700,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    gap:9,
    boxShadow:'0 10px 26px rgba(127,201,22,.40), inset 0 2px 0 rgba(255,255,255,.5)',
    cursor:'pointer',
    marginTop:2,
  },
  links: {
    display:'flex',
    flexDirection:'column',
    gap:14,
    alignItems:'center',
    marginTop:5,
    fontFamily:"'Fredoka', sans-serif",
    fontSize:14,
    fontWeight:600,
    color:'rgba(216,224,248,0.66)',
  },
  linkStrong: {
    color:'#BDF24A',
    fontWeight:700,
    cursor:'pointer',
  },
  link: {
    color:'#BDF24A',
    cursor:'pointer',
  },
  err: {
    color:'#ff6666',
    fontSize:13,
    textAlign:'center',
    fontFamily:"'Nunito', sans-serif",
    fontWeight:700,
  },
  consentBox: {
    display:'flex',
    gap:12,
    alignItems:'flex-start',
    padding:'12px',
    borderRadius:16,
    border:'1.5px solid rgba(189,242,74,0.38)',
    background:'rgba(20,26,58,0.55)',
    cursor:'pointer',
  },
  checkbox: {
    width:22,
    height:22,
    marginTop:1,
    accentColor:'#BDF24A',
    flexShrink:0,
    cursor:'pointer',
  },
  consentTitle: {
    display:'block',
    color:'#BDF24A',
    fontSize:13,
    fontWeight:900,
    marginBottom:4,
  },
  consentText: {
    display:'block',
    color:'rgba(216,224,248,0.66)',
    fontSize:11,
    lineHeight:1.35,
  },
}

const GENERAL_CONSENT_TEXT = 'Autorizo a RAV Toys a tratar mis datos personales para gestionar mi cuenta RAV Club, beneficios, recomendaciones y comunicaciones comerciales por email, WhatsApp o SMS. Entiendo que puedo solicitar actualizar o eliminar mis datos.'

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 6.5h15v11h-15z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M5 7l7 5.6L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 10.5h11v8h-11z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8.5 10.5V8.2a3.5 3.5 0 017 0v2.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 14v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function RocketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.5 5.5c2.1-2.1 4.7-2 5-2 .1.3.1 2.9-2 5l-5.9 5.9-3-3 5.9-5.9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9.2 9.9l-3.6.7 2.1-3.4M14.1 14.8l-.7 3.6 3.4-2.1M7.2 16.8l-2.4 2.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.7 7.1h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

function Ravstronaut() {
  return (
    <svg style={C.mascot} viewBox="0 0 180 200" aria-label="RAVstronauta">
      <circle cx="90" cy="80" r="62" fill="none" stroke="white" strokeWidth="3.5" opacity=".85"/>
      <ellipse cx="90" cy="80" rx="48" ry="46" fill="#BDF24A"/>
      <ellipse cx="38" cy="82" rx="10" ry="8" fill="#BDF24A"/>
      <ellipse cx="142" cy="82" rx="10" ry="8" fill="#BDF24A"/>
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
      <line x1="78" y1="38" x2="68" y2="16" stroke="#7FC916" strokeWidth="2"/>
      <circle cx="68" cy="14" r="4" fill="#BDF24A"/>
      <line x1="103" y1="38" x2="113" y2="16" stroke="#7FC916" strokeWidth="2"/>
      <circle cx="113" cy="14" r="4" fill="#BDF24A"/>
      <circle cx="77" cy="99" r="1.5" fill="#7FC916" opacity=".7"/>
      <circle cx="82" cy="104" r="1.5" fill="#7FC916" opacity=".7"/>
      <circle cx="99" cy="99" r="1.5" fill="#7FC916" opacity=".7"/>
      <circle cx="104" cy="104" r="1.5" fill="#7FC916" opacity=".7"/>
      <path d="M76 110 Q90 121 104 110" fill="none" stroke="#2a5a0a" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="82" y="110" width="6" height="5" rx="1" fill="white"/>
      <rect x="91" y="110" width="6" height="5" rx="1" fill="white"/>
      <rect x="66" y="124" width="48" height="9" rx="4" fill="#2B3FBF"/>
      <circle cx="80" cy="128" r="2.5" fill="#FFD84D"/>
      <circle cx="91" cy="128" r="2.5" fill="#9DCDEA"/>
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
  )
}

export default function Welcome() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('Colombia')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [animateReady, setAnimateReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setAnimateReady(true)
  }, [])

  const cleanPhone = phone.replace(/\s/g, '')
  const isValidPhone = /^\+\d{8,15}$/.test(cleanPhone)

  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o contraseña incorrectos')
    else router.push('/home')
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!name || !email || !phone || !city || !country || !password) { setError('Por favor completa todos los campos'); return }
    if (!isValidPhone) { setError('Escribe tu teléfono con indicativo. Ej: +57 3001234567'); return }
    if (!consent) { setError('Debes autorizar el uso de tus datos para crear tu cuenta'); return }
    setLoading(true); setError('')
    const consentAt = new Date().toISOString()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name: name,
          phone: cleanPhone,
          city,
          country,
          marketing_consent: true,
          marketing_consent_at: consentAt,
          marketing_consent_text: GENERAL_CONSENT_TEXT,
        }
      }
    })
    if (error) {
      setError(error.message)
    } else {
      const userId = data?.user?.id
      if (userId) {
        await supabase
          .from('profiles')
          .update({
            full_name: name,
            phone: cleanPhone,
            city,
            country,
            marketing_consent: true,
            marketing_consent_at: consentAt,
            marketing_consent_text: GENERAL_CONSENT_TEXT,
          })
          .eq('id', userId)
      }
      router.push('/home')
    }
    setLoading(false)
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
  }

  return (
    <div style={C.wrap}>
      <div className="nebula nebula-purple" style={{ ...C.nebula, left:-70, top:36, background:'rgba(108,96,184,.9)' }} />
      <div className="nebula nebula-blue" style={{ ...C.nebula, right:-82, top:92, background:'rgba(60,141,199,.85)' }} />
      <div className="nebula nebula-lime" style={{ ...C.nebula, left:'38%', bottom:72, background:'rgba(189,242,74,.30)' }} />

      {STARS.map((star, i) => (
        <span
          key={i}
          className="twinkle-star"
          style={{
            ...C.star,
            left:`${star.x}%`,
            top:`${star.y}%`,
            width:star.size,
            height:star.size,
            background: star.tone === 'lime' ? '#D6FF6E' : star.tone === 'gold' ? '#FFD84D' : '#FFFFFF',
            boxShadow: star.tone === 'white' ? 'none' : `0 0 10px ${star.tone === 'lime' ? '#D6FF6E' : '#FFD84D'}`,
            animationDuration:`${star.duration}s`,
            animationDelay:`${star.delay}s`,
          }}
        />
      ))}

      <div style={C.vignette} />

      <main style={C.content}>
        <p className={animateReady ? 'enter enter-1' : ''} style={C.eyebrow}>Bienvenido al universo</p>

        <section className={animateReady ? 'enter enter-2' : ''} style={C.hero}>
          <div className="burst-rotate-slow" style={{ ...C.burst, ...C.burstGold }} />
          <div className="burst-rotate-reverse" style={{ ...C.burst, ...C.burstLime }} />
          <div className="hero-halo" style={C.halo} />
          <div className="mascot-float">
            <Ravstronaut />
          </div>
        </section>

        <h1 className={animateReady ? 'enter enter-3' : ''} style={C.wordmark}>RAV Club</h1>
        <p className={animateReady ? 'enter enter-4' : ''} style={C.subtitle}>
          {mode === 'login' ? 'Tu pasaporte al universo RAV' : 'Únete al universo RAV'}
        </p>

        <div className={animateReady ? 'enter enter-5' : ''} style={C.form}>
          {mode === 'signup' && (
            <>
              <input className="club-plain-input" style={C.plainInput} placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} />
              <input className="club-plain-input" style={C.plainInput} placeholder="Teléfono con indicativo. Ej: +57 3001234567" value={phone} onChange={e => setPhone(e.target.value)} />
              <input className="club-plain-input" style={C.plainInput} placeholder="Ciudad" value={city} onChange={e => setCity(e.target.value)} />
              <input className="club-plain-input" style={C.plainInput} placeholder="País" value={country} onChange={e => setCountry(e.target.value)} />
            </>
          )}

          <label className="club-field" style={C.field}>
            <MailIcon />
            <input style={C.fieldInput} placeholder="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </label>

          <label className="club-field" style={C.field}>
            <LockIcon />
            <input style={C.fieldInput} placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>

          {mode === 'signup' && (
            <label style={C.consentBox}>
              <input
                style={C.checkbox}
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
              />
              <span>
                <span style={C.consentTitle}>Sí, acepto y autorizo el uso de mis datos</span>
                <span style={C.consentText}>{GENERAL_CONSENT_TEXT}</span>
              </span>
            </label>
          )}

          {error && <p style={C.err}>{error}</p>}

          <button className="club-primary" style={C.primary} onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading}>
            <RocketIcon />
            {loading ? 'Despegando...' : mode === 'login' ? 'Despegar' : 'Crear cuenta'}
          </button>

          <div style={C.links}>
            <p>
              {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <span style={C.linkStrong} onClick={toggleMode}>
                {mode === 'login' ? 'Únete al club' : 'Inicia sesión'}
              </span>
            </p>
            {mode === 'login' && (
              <p style={C.link} onClick={() => router.push('/forgot-password')}>
                ¿Olvidaste tu contraseña?
              </p>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.18; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(26px, -18px, 0); }
        }
        @keyframes driftAlt {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-22px, 20px, 0); }
        }
        @keyframes burstClockwise {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes burstCounter {
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.68; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes floatMascot {
          0%, 100% { transform: translateY(-7px); }
          50% { transform: translateY(7px); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .twinkle-star {
          animation-name: twinkle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .nebula {
          animation: drift 26s ease-in-out infinite alternate;
        }
        .nebula-blue {
          animation-delay: -7s;
          animation-name: driftAlt;
        }
        .nebula-lime {
          animation-delay: -13s;
        }
        .burst-rotate-slow {
          animation: burstClockwise 120s linear infinite;
        }
        .burst-rotate-reverse {
          animation: burstCounter 150s linear infinite;
        }
        .hero-halo {
          animation: breathe 6.5s ease-in-out infinite;
        }
        .mascot-float {
          position: relative;
          z-index: 4;
          animation: floatMascot 6s ease-in-out infinite;
        }
        .enter {
          animation: riseIn .6s ease both;
        }
        .enter-1 { animation-delay: .05s; }
        .enter-2 { animation-delay: .12s; }
        .enter-3 { animation-delay: .2s; }
        .enter-4 { animation-delay: .28s; }
        .enter-5 { animation-delay: .36s; }
        .club-field:focus-within {
          border-color: #BDF24A !important;
          box-shadow: 0 0 0 3px rgba(189,242,74,.18);
          color: #BDF24A !important;
        }
        .club-field input::placeholder,
        .club-plain-input::placeholder {
          color: rgba(180,190,224,0.42);
        }
        .club-plain-input:focus {
          border-color: #BDF24A !important;
          box-shadow: 0 0 0 3px rgba(189,242,74,.18);
        }
        .club-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(127,201,22,.48), inset 0 2px 0 rgba(255,255,255,.58) !important;
        }
        .club-primary:active {
          transform: scale(.97);
        }
        @media (max-height: 760px) {
          main section {
            width: 232px !important;
            height: 232px !important;
          }
          main h1 {
            font-size: 34px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .twinkle-star,
          .nebula,
          .burst-rotate-slow,
          .burst-rotate-reverse,
          .hero-halo,
          .mascot-float,
          .enter {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
