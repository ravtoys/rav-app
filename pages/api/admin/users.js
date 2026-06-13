import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

function isAdmin(req) {
  const configuredPassword = process.env.RAV_ADMIN_PASSWORD
  const providedPassword = req.headers['x-rav-admin-password']
  return Boolean(configuredPassword && providedPassword === configuredPassword)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, city, country, avatar_url, points, level, marketing_consent, marketing_consent_at, kids_data_consent, kids_data_consent_at, created_at')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    const { data: authData, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) throw usersError

    const { data: childProfiles, error: childProfilesError } = await supabase
      .from('child_profiles')
      .select('id, parent_id, nickname, birth_date, interests, avatar, consent_at, created_at')
      .order('birth_date', { ascending: true })

    if (childProfilesError) throw childProfilesError

    const { data: passportStamps, error: passportStampsError } = await supabase
      .from('child_passport_stamps')
      .select('id, child_id, parent_id, stamp_key, stamp_name, points_awarded, notes, created_at')
      .order('created_at', { ascending: false })

    if (passportStampsError) throw passportStampsError

    const emailById = new Map((authData?.users || []).map((user) => [user.id, user.email]))
    const stampsByChildId = (passportStamps || []).reduce((map, stamp) => {
      if (!map.has(stamp.child_id)) map.set(stamp.child_id, [])
      map.get(stamp.child_id).push(stamp)
      return map
    }, new Map())

    const childrenByParentId = (childProfiles || []).reduce((map, child) => {
      if (!map.has(child.parent_id)) map.set(child.parent_id, [])
      child.passport_stamps = stampsByChildId.get(child.id) || []
      map.get(child.parent_id).push(child)
      return map
    }, new Map())

    const users = (profiles || []).map((profile) => ({
      ...profile,
      email: emailById.get(profile.id) || '',
      children: childrenByParentId.get(profile.id) || [],
    }))

    return res.status(200).json({ users })
  } catch (error) {
    return res.status(500).json({ error: 'Could not load users' })
  }
}
