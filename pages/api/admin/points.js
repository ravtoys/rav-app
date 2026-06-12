import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

function isAdmin(req) {
  const configuredPassword = process.env.RAV_ADMIN_PASSWORD
  const providedPassword = req.headers['x-rav-admin-password']
  return Boolean(configuredPassword && providedPassword === configuredPassword)
}

function getLevel(points) {
  if (points >= 2000) return 'Leyenda'
  if (points >= 500) return 'Aventurero'
  return 'Explorador'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { userId, points, type, description } = req.body || {}
  const parsedPoints = parseInt(points || 0, 10)

  if (!userId || !parsedPoints || parsedPoints <= 0 || !['add', 'remove'].includes(type)) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, points')
      .eq('id', userId)
      .single()

    if (profileError || !profile) throw profileError || new Error('Profile not found')

    const change = type === 'add' ? parsedPoints : -parsedPoints
    const newPoints = Math.max(0, (profile.points || 0) + change)
    const newLevel = getLevel(newPoints)
    const safeDescription = description || (type === 'add' ? 'Puntos agregados por admin' : 'Puntos deducidos por admin')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ points: newPoints, level: newLevel })
      .eq('id', userId)

    if (updateError) throw updateError

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        description: safeDescription,
        amount: 0,
        points_change: change,
      })

    if (txError) throw txError

    return res.status(200).json({
      user: {
        ...profile,
        points: newPoints,
        level: newLevel,
      },
    })
  } catch (error) {
    return res.status(500).json({ error: 'Could not update points' })
  }
}
