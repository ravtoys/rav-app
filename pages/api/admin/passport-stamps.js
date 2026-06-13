import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

const PASSPORT_STAMPS = {
  'first-trip': 'Primer Viaje RAV',
  birthday: 'Cumple RAV',
  jungle: 'Visitó la Selva',
  'dino-hunter': 'Cazador de Dinosaurios',
  pilot: 'Piloto RAV',
  scientist: 'Peque Científico',
  artist: 'Artista Galáctico',
  builder: 'Constructor Estelar',
  mission: 'Misión Cumplida',
  legend: 'Leyenda en Formación',
}

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

  const { childId, parentId, stampKey, points, notes } = req.body || {}
  const parsedPoints = Math.max(0, parseInt(points || 0, 10) || 0)
  const stampName = PASSPORT_STAMPS[stampKey]

  if (!childId || !parentId || !stampName) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: child, error: childError } = await supabase
      .from('child_profiles')
      .select('id, parent_id, nickname')
      .eq('id', childId)
      .eq('parent_id', parentId)
      .single()

    if (childError || !child) throw childError || new Error('Child not found')

    const { data: stamp, error: stampError } = await supabase
      .from('child_passport_stamps')
      .insert({
        child_id: childId,
        parent_id: parentId,
        stamp_key: stampKey,
        stamp_name: stampName,
        points_awarded: parsedPoints,
        notes: notes || null,
      })
      .select('*')
      .single()

    if (stampError) throw stampError

    if (parsedPoints > 0) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, points')
        .eq('id', parentId)
        .single()

      if (profileError || !profile) throw profileError || new Error('Profile not found')

      const newPoints = (profile.points || 0) + parsedPoints
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints, level: getLevel(newPoints) })
        .eq('id', parentId)

      if (updateError) throw updateError

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: parentId,
          description: `Pasaporte RAV: ${stampName} para ${child.nickname}`,
          amount: 0,
          points_change: parsedPoints,
        })

      if (txError) throw txError
    }

    return res.status(200).json({ stamp })
  } catch (error) {
    return res.status(500).json({ error: 'Could not add passport stamp' })
  }
}
