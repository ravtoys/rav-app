import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

function getUserClient(req) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers.authorization || '',
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

function createToken() {
  return crypto.randomBytes(9).toString('base64url')
}

function getOrigin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'club.ravtoys.com'
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userClient = getUserClient(req)
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized' })

    const supabase = getSupabaseAdmin()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, wishlist_share_token, wishlist_public')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) throw profileError || new Error('Profile not found')

    let token = profile.wishlist_share_token
    if (!token) {
      token = createToken()
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          wishlist_share_token: token,
          wishlist_public: true,
        })
        .eq('id', user.id)

      if (updateError) throw updateError
    } else if (profile.wishlist_public === false && req.method === 'POST') {
      const { error: publicError } = await supabase
        .from('profiles')
        .update({ wishlist_public: true })
        .eq('id', user.id)
      if (publicError) throw publicError
    }

    return res.status(200).json({
      token,
      url: `${getOrigin(req)}/w/${token}`,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Could not create public Wishlist link' })
  }
}
