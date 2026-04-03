import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const C = {
  page: { minHeight:'100vh', background:'#080618', paddingBottom:80 },
  header: { background:'linear-gradient(180deg,#1a0a3d,#0d0b2b)', padding:'20px 20px 16px' },
  title: { fontFamily:"'Exo 2',sans-serif", fontSize:20, fontWeight:900, color:'white' },
  sub: { fontSize:11, color:'rgba(170,235,58,0.6)', marginTop:4 },
  body: { padding:'14px 16px' },
  empty: { textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14, marginTop:60 },
  txCard: { background:'rgba(170,235,58,0.05)', border:'1px solid rgba(170,235,58,0.15)', borderRadius:12, padding:'11px 13px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  txCardRed: { background:'rgba(170,30,30,0.07)', border:'1px solid rgba(255,80,80,0.15)', borderRadius:12, padding:'11px 13px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  txLeft: { display:'flex', alignItems:'center', gap:10 },
  txIcon: { width:36, height:36, borderRadius:10, background:'rgba(43,63,191,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  txTitle: { fontSize:12, fontWeight:700, color:'white' },
  txDate: { fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 },
  txPtsGreen: { fontSize:13, fontWeight:800, color:'#AAEB3A' },
  txPtsRed: { fontSize:13, fontWeight:800, color:'#ff6666' },
}

function getIcon(desc) {
  if (desc?.toLowerCase().includes('online')) return '🛒'
  if (desc?.toLowerCase().includes('canje')) return '🏷️'
  if (desc?.toLowerCase().includes('bienvenid')) return '👽'
  return '🧸'
}

export default function History() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setTransactions(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={C.page}>
      <div style={C.header}>
        <p style={C.title}>Mis misiones 🪐</p>
        <p style={C.sub}>Historial de estrellas acumuladas</p>
      </div>
      <div style={C.body}>
        {loading && <p style={C.empty}>Cargando...</p>}
        {!loading && transactions.length === 0 && (
          <div style={{ textAlign:'center', marginTop:60 }}>
            <p style={{ fontSize:40, marginBottom:12 }}>🛸</p>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:14 }}>Aún no tienes actividad.</p>
            <p style={{ color:'rgba(255,255,255,0.2)', fontSize:12, marginTop:4 }}>¡Haz tu primera compra en RAV!</p>
          </div>
        )}
        {transactions.map((tx, i) => {
          const isNeg = tx.points_change < 0
          return (
            <div key={i} style={isNeg ? C.txCardRed : C.txCard}>
              <div style={C.txLeft}>
                <div style={C.txIcon}>{getIcon(tx.description)}</div>
                <div>
                  <p style={C.txTitle}>{tx.description}</p>
                  <p style={C.txDate}>
                    {new Date(tx.created_at).toLocaleDateString('es-CO', { day:'numeric', month:'short' })}
                    {tx.amount > 0 && ` · $${tx.amount.toLocaleString('es-CO')}`}
                  </p>
                </div>
              </div>
              <span style={isNeg ? C.txPtsRed : C.txPtsGreen}>
                {isNeg ? '' : '+'}{tx.points_change} ⭐
              </span>
            </div>
          )
        })}
      </div>
      <Navbar active="history" />
    </div>
  )
}