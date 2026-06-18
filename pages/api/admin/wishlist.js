import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

function isAdmin(req) {
  const configuredPassword = process.env.RAV_ADMIN_PASSWORD
  const providedPassword = req.headers['x-rav-admin-password']
  return Boolean(configuredPassword && providedPassword === configuredPassword)
}

function cleanPrice(price) {
  if (price === null || price === undefined || price === '') return null
  const value = Number(price)
  return Number.isFinite(value) && value >= 0 ? value : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { action, itemId, product, title, price, productUrl } = req.body || {}
  if (!itemId || !action) {
    return res.status(400).json({ error: 'Missing wishlist item data' })
  }

  try {
    const supabase = getSupabaseAdmin()
    let payload = { updated_at: new Date().toISOString() }

    if (action === 'confirm_shopify') {
      if (!product?.title) return res.status(400).json({ error: 'Missing Shopify product' })
      payload = {
        ...payload,
        title: product.title,
        image_url: product.image_url || null,
        price: cleanPrice(product.price),
        product_url: product.product_url || null,
        status: 'wanted',
        source: 'shopify',
        match_status: 'shopify_matched',
        shopify_product_id: product.product_id || null,
        shopify_variant_id: product.variant_id || null,
        sku: product.sku || null,
      }
    } else if (action === 'confirm_manual') {
      const cleanTitle = String(title || '').trim()
      if (!cleanTitle) return res.status(400).json({ error: 'Missing title' })
      payload = {
        ...payload,
        title: cleanTitle,
        price: cleanPrice(price),
        product_url: String(productUrl || '').trim() || null,
        status: 'wanted',
        match_status: 'manual_confirmed',
      }
    } else if (action === 'mark_unavailable') {
      payload = {
        ...payload,
        status: 'unavailable',
        match_status: 'manual_confirmed',
      }
    } else {
      return res.status(400).json({ error: 'Invalid action' })
    }

    const { error } = await supabase
      .from('wishlist_items')
      .update(payload)
      .eq('id', itemId)

    if (error) throw error

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: 'Could not update wishlist item' })
  }
}
