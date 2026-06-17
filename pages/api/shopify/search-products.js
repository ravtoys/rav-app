const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-04'

function getShopDomain() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || ''
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function normalizeProduct(product) {
  const variant = product.variants?.edges?.[0]?.node || {}
  const price = product.priceRange?.minVariantPrice
  return {
    product_id: product.id,
    variant_id: variant.id || '',
    sku: variant.sku || '',
    title: product.title,
    handle: product.handle,
    image_url: product.featuredImage?.url || '',
    image_alt: product.featuredImage?.altText || product.title,
    price: price?.amount ? Number(price.amount) : null,
    currency: price?.currencyCode || 'COP',
    product_url: product.onlineStoreUrl || `https://ravtoys.com/products/${product.handle}`,
    available: variant.availableForSale !== false,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const query = String(req.query.q || '').trim()
  if (query.length < 2) return res.status(200).json({ products: [] })

  const domain = getShopDomain()
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!domain || !token) {
    return res.status(200).json({
      products: [],
      notConfigured: true,
      message: 'Shopify catalog is not configured yet',
    })
  }

  const graphql = `
    query SearchProducts($query: String!) {
      search(first: 8, query: $query, types: PRODUCT, prefix: LAST) {
        edges {
          node {
            ... on Product {
              id
              title
              handle
              onlineStoreUrl
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    sku
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch(`https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: graphql,
        variables: { query },
      }),
    })

    const json = await response.json()
    if (!response.ok || json.errors) {
      return res.status(502).json({ error: 'Shopify catalog search failed' })
    }

    const products = (json.data?.search?.edges || [])
      .map(edge => edge.node)
      .filter(Boolean)
      .map(normalizeProduct)

    return res.status(200).json({ products })
  } catch (error) {
    return res.status(502).json({ error: 'Shopify catalog unavailable' })
  }
}
