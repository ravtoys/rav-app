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

  return res.status(200).json({
    openai_configured: Boolean(process.env.OPENAI_API_KEY),
    shopify_configured: Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN),
    supabase_admin_configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    photo_matching_ready: Boolean(
      process.env.OPENAI_API_KEY &&
      process.env.SHOPIFY_STORE_DOMAIN &&
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
  })
}
