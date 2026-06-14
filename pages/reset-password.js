import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const C = {
  wrap: { minHeight:'100vh', background:'linear-gradient(180deg,#080618 0%,#1a0a3d 65%,#0d0b2b 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'Nunito',sans-serif" },
  card: { width:'100%', maxWidth:360, display:'flex', flexDirection:'column', gap:12 },
  icon: { fontSize:46, textAlign:'center', marginBottom:4 },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:28, fontWeight:900, color:'#AAEB3A', textAlign:'center', margin:0 },
  sub: { fontSize:13, color:'rgba(255,255,255,0.62)', textAlign:'center', lineHeight:1.45, margin:'0 0 12px' },
  input: { width:'100%', padding:'14px 16px', borderRadius:14, border:'1px solid rgba(170,235,58,0.3)', background:'rgba(255,255,255,0.05)', color:'white', fontFamily:"'Nunito',sans-serif", fontSize:15, outline:'none' },
  btn: { width:'100%', padding:'15px', borderRadius:14, border:'none', background:'#AAEB3A', color:'#080618', fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  ghost: { width:'100%', padding:'14px', borderRadius:14, border:'1.5px solid rgba(170,235,58,0.35)', background:'transparent', color:'#AAEB3A', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  err: { color:'#ff6666', fontSize:13, textAlign:'center', margin:0 },
  ok: { color:'#AAEB3A', fontSize:13, textAlign:'center', lineHeight:1.45, margin:0, fontWeight:800 },
}

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const prepareSession = async () => {
      const code = router.query.code
      if (code) await supabase.auth.exchangeCodeForSession(String(code))

      const { data } = await supabase.auth.getSession()
      setReady(Boolean(data?.session))
    }

    if (router.isReady) prepareSession()
  }, [router.isReady, router.query.code])

  const savePassword = async () => {
    if (password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Este enlace expiró o no es válido. Pide uno nuevo.')
    } else {
      setMessage('Contraseña actualizada. Ya puedes iniciar sesión.')
      setTimeout(() => router.push('/'), 1800)
    }

    setLoading(false)
  }

  return (
    <div style={C.wrap}>
      <div style={C.card}>
        <div style={C.icon}>🚀</div>
        <h1 style={C.title}>Nueva contraseña</h1>
        <p style={C.sub}>Crea una nueva contraseña para volver a entrar al universo RAV.</p>

        {!ready && !message && (
          <p style={C.err}>Abre esta pantalla desde el enlace que llegó a tu correo.</p>
        )}

        <input
          style={C.input}
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          style={C.input}
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && savePassword()}
        />

        {error && <p style={C.err}>{error}</p>}
        {message && <p style={C.ok}>{message}</p>}

        <button style={C.btn} onClick={savePassword} disabled={loading || !ready}>
          {loading ? 'Guardando...' : 'Guardar contraseña'}
        </button>
        <button style={C.ghost} onClick={() => router.push('/forgot-password')}>
          Pedir nuevo enlace
        </button>
      </div>
    </div>
  )
}
