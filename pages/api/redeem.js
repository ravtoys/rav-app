import { getSupabaseAdmin } from '../../lib/supabaseAdmin'

const BENEFITS = {
  '10% de descuento': 500,
  'Envío gratis': 300,
  'Regalo sorpresa': 1000,
}

function getLevel(points) {
  if (points >= 2000) return 'Leyenda'
  if (points >= 500) return 'Aventurero'
  return 'Explorador'
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `RAV-${part()}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const { prizeName } = req.body || {}
  const pointsSpent = BENEFITS[prizeName]

  if (!token || !pointsSpent) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    const user = userData?.user

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, points')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) throw profileError || new Error('Profile not found')
    if ((profile.points || 0) < pointsSpent) {
      return res.status(400).json({ error: 'Not enough points' })
    }

    const newPoints = (profile.points || 0) - pointsSpent
    const code = generateCode()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ points: newPoints, level: getLevel(newPoints) })
      .eq('id', user.id)

    if (updateError) throw updateError

    const { error: redemptionError } = await supabase
      .from('redemptions')
      .insert({
        user_id: user.id,
        prize_name: prizeName,
        points_spent: pointsSpent,
        code,
      })

    if (redemptionError) throw redemptionError

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        description: `Canje: ${prizeName} (${code})`,
        amount: 0,
        points_change: -pointsSpent,
      })

    if (txError) throw txError

    return res.status(200).json({ code, points: newPoints })
  } catch (error) {
    return res.status(500).json({ error: 'Could not redeem benefit' })
  }
}
