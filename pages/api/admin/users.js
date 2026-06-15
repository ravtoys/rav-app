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
      .select('id, parent_id, nickname, birth_date, interests, avatar, avatar_url, consent_at, created_at')
      .order('birth_date', { ascending: true })

    if (childProfilesError) throw childProfilesError

    const { data: passportStamps, error: passportStampsError } = await supabase
      .from('child_passport_stamps')
      .select('id, child_id, parent_id, stamp_key, stamp_name, points_awarded, notes, created_at')
      .order('created_at', { ascending: false })

    if (passportStampsError) throw passportStampsError

    const { data: wishlistItemsData, error: wishlistItemsError } = await supabase
      .from('wishlist_items')
      .select('id, user_id, child_id, title, image_url, uploaded_image_url, price, detected_price, detected_title, product_url, status, source, match_status, shopify_product_id, shopify_variant_id, sku, created_at')
      .order('created_at', { ascending: false })

    const wishlistItems = wishlistItemsError ? [] : (wishlistItemsData || [])

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

    const childNameById = new Map((childProfiles || []).map((child) => [child.id, child.nickname]))
    const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]))
    const wishlistByUserId = wishlistItems.reduce((map, item) => {
      if (!map.has(item.user_id)) map.set(item.user_id, [])
      const parent = profileById.get(item.user_id) || {}
      map.get(item.user_id).push({
        ...item,
        child_name: item.child_id ? childNameById.get(item.child_id) || 'Peque' : 'General',
        parent_name: parent.full_name || 'Sin nombre',
        parent_email: emailById.get(item.user_id) || '',
        parent_phone: parent.phone || '',
      })
      return map
    }, new Map())

    const users = (profiles || []).map((profile) => ({
      ...profile,
      email: emailById.get(profile.id) || '',
      children: childrenByParentId.get(profile.id) || [],
      wishlist_items: wishlistByUserId.get(profile.id) || [],
    }))

    return res.status(200).json({ users })
  } catch (error) {
    return res.status(500).json({ error: 'Could not load users' })
  }
}
