import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

function normalizeItem(item, childById) {
  const child = item.child_id ? childById.get(item.child_id) : null
  return {
    id: item.id,
    child_id: item.child_id,
    child_name: child?.nickname || '',
    title: item.detected_title || item.title || 'Juguete RAV',
    image_url: item.uploaded_image_url || item.image_url || '',
    price: item.price ?? item.detected_price ?? null,
    product_url: item.product_url || '',
    status: item.status || 'wanted',
    match_status: item.match_status || 'manual_confirmed',
    source: item.source || 'manual',
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = String(req.query.token || '').trim()
  if (!token || token.length < 8) return res.status(404).json({ error: 'Wishlist not found' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, wishlist_public')
      .eq('wishlist_share_token', token)
      .single()

    if (profileError || !profile || profile.wishlist_public === false) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }

    const [{ data: children }, { data: items }] = await Promise.all([
      supabase
        .from('child_profiles')
        .select('id, nickname, avatar_url, avatar')
        .eq('parent_id', profile.id)
        .order('nickname', { ascending: true }),
      supabase
        .from('wishlist_items')
        .select('id, child_id, title, image_url, uploaded_image_url, price, detected_price, detected_title, product_url, status, source, match_status, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false }),
    ])

    const childById = new Map((children || []).map(child => [child.id, child]))

    return res.status(200).json({
      owner: {
        name: profile.full_name || 'Familia RAV',
        avatar_url: profile.avatar_url || '',
      },
      children: children || [],
      items: (items || []).map(item => normalizeItem(item, childById)),
    })
  } catch (error) {
    return res.status(500).json({ error: 'Could not load public Wishlist' })
  }
}
