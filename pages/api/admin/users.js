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
      .select('id, full_name, phone, avatar_url, points, level, created_at')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    const { data: authData, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) throw usersError

    const emailById = new Map((authData?.users || []).map((user) => [user.id, user.email]))
    const users = (profiles || []).map((profile) => ({
      ...profile,
      email: emailById.get(profile.id) || '',
    }))

    return res.status(200).json({ users })
  } catch (error) {
    return res.status(500).json({ error: 'Could not load users' })
  }
}
