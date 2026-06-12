import crypto from 'crypto'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

export const config = {
  api: {
    bodyParser: false,
  },
}

function getLevel(points) {
  if (points >= 2000) return 'Leyenda'
  if (points >= 500) return 'Aventurero'
  return 'Explorador'
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function verifyShopifyWebhook(rawBody, hmacHeader) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret || !hmacHeader) return false

  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64')

  const digestBuffer = Buffer.from(digest, 'base64')
  const headerBuffer = Buffer.from(hmacHeader, 'base64')

  return (
    digestBuffer.length === headerBuffer.length &&
    crypto.timingSafeEqual(digestBuffer, headerBuffer)
  )
}

function getOrderEmail(order) {
  return (order.email || order.contact_email || order.customer?.email || '').trim().toLowerCase()
}

function getOrderTotal(order) {
  const rawTotal = order.current_subtotal_price || order.subtotal_price || order.total_price || 0
  const total = Number.parseFloat(rawTotal)
  return Number.isFinite(total) ? total : 0
}

function getPointsFromTotal(total) {
  const rate = Number.parseFloat(process.env.SHOPIFY_POINTS_PER_COP || '0.001')
  const safeRate = Number.isFinite(rate) && rate > 0 ? rate : 0.001
  return Math.floor(total * safeRate)
}

async function findUserByEmail(supabase, email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error

  return (data?.users || []).find((user) => user.email?.toLowerCase() === email)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawBody = await readRawBody(req)
  const hmacHeader = req.headers['x-shopify-hmac-sha256']

  if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  let order
  try {
    order = JSON.parse(rawBody.toString('utf8'))
  } catch (error) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  const orderId = order.id ? String(order.id) : ''
  const orderName = order.name || order.order_number || orderId
  const email = getOrderEmail(order)
  const total = getOrderTotal(order)
  const currency = order.currency || order.presentment_currency || 'COP'
  const points = getPointsFromTotal(total)

  if (!orderId || !email || points <= 0) {
    return res.status(200).json({ ok: true, skipped: true })
  }

  try {
    const supabase = getSupabaseAdmin()
    const user = await findUserByEmail(supabase, email)

    const { error: awardError } = await supabase
      .from('shopify_point_awards')
      .insert({
        shopify_order_id: orderId,
        order_name: orderName,
        user_id: user?.id || null,
        email,
        subtotal: total,
        currency,
        points_awarded: user ? points : 0,
        status: user ? 'matched' : 'no_user',
      })

    if (awardError?.code === '23505') {
      return res.status(200).json({ ok: true, duplicate: true })
    }

    if (awardError) throw awardError

    if (!user) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'User not found' })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, points')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) throw profileError || new Error('Profile not found')

    const newPoints = (profile.points || 0) + points
    const newLevel = getLevel(newPoints)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ points: newPoints, level: newLevel })
      .eq('id', user.id)

    if (updateError) throw updateError

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        description: `Compra Shopify ${orderName}`,
        amount: total,
        points_change: points,
      })

    if (txError) throw txError

    return res.status(200).json({ ok: true, points_awarded: points })
  } catch (error) {
    return res.status(500).json({ error: 'Could not process Shopify order' })
  }
}
