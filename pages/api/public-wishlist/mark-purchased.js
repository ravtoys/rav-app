import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = String(req.body?.token || '').trim()
  const itemId = String(req.body?.itemId || '').trim()

  if (!token || token.length < 8 || !itemId) {
    return res.status(400).json({ error: 'Missing wishlist item' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, wishlist_public')
      .eq('wishlist_share_token', token)
      .single()

    if (profileError || !profile || profile.wishlist_public === false) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }

    const { data: item, error: itemError } = await supabase
      .from('wishlist_items')
      .update({
        status: 'purchased',
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .eq('user_id', profile.id)
      .select('id, status')
      .single()

    if (itemError || !item) {
      return res.status(404).json({ error: 'Wishlist item not found' })
    }

    return res.status(200).json({ ok: true, item })
  } catch (error) {
    return res.status(500).json({ error: 'Could not mark item as purchased' })
  }
}
