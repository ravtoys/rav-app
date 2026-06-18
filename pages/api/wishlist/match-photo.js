import { createClient } from '@supabase/supabase-js'
import { searchShopifyProducts } from '../../../lib/shopifyCatalog'

const STOP_WORDS = new Set([
  'para', 'con', 'los', 'las', 'una', 'uno', 'del', 'de', 'la', 'el', 'and',
  'the', 'toy', 'juguete', 'set', 'kit', 'nuevo', 'original', 'kids', 'baby',
])

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

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function unique(values) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))]
}

function tokensFromText(value) {
  return normalizeText(value)
    .split(/\s+/)
    .filter(token => token.length >= 3 && !STOP_WORDS.has(token))
}

function parseOpenAIJson(text) {
  const clean = String(text || '').replace(/```json|```/g, '').trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(clean.slice(start, end + 1))
  } catch {
    return null
  }
}

function getResponseText(json) {
  if (json.output_text) return json.output_text
  return (json.output || [])
    .flatMap(item => item.content || [])
    .map(content => content.text || content.output_text || '')
    .filter(Boolean)
    .join('\n')
}

function cleanAnalysis(raw) {
  if (!raw) return null
  const visibleWords = Array.isArray(raw.visible_words) ? raw.visible_words : []
  const searchQueries = Array.isArray(raw.search_queries) ? raw.search_queries : []
  const price = Number(raw.estimated_price_cop)
  const confidence = Number(raw.confidence)
  return {
    product_name: String(raw.product_name || '').trim(),
    brand: String(raw.brand || '').trim(),
    product_type: String(raw.product_type || '').trim(),
    visible_words: visibleWords.map(word => String(word || '').trim()).filter(Boolean).slice(0, 12),
    search_queries: searchQueries.map(query => String(query || '').trim()).filter(Boolean).slice(0, 5),
    estimated_price_cop: Number.isFinite(price) && price > 0 ? price : null,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
  }
}

async function analyzeImageWithOpenAI(imageUrl, hints) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const model = process.env.OPENAI_VISION_MODEL || 'gpt-5.4-mini'
  const hintText = unique([hints.userTitle, hints.browserDetectedTitle]).join(' | ') || 'Sin pistas del usuario'
  const prompt = `Eres un asistente de RAV Toys. Analiza la foto de un juguete o empaque.
Devuelve SOLO JSON válido con esta forma:
{
  "product_name": "nombre probable del juguete",
  "brand": "marca si se ve o se puede inferir",
  "product_type": "tipo de juguete",
  "visible_words": ["palabras importantes visibles en la caja o etiqueta"],
  "estimated_price_cop": 0,
  "confidence": 0.0,
  "search_queries": ["2 a 5 búsquedas cortas para Shopify"]
}
No inventes datos. Si no se ve claro, usa strings vacíos y confidence bajo.
Pistas del usuario/navegador: ${hintText}`

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageUrl },
          ],
        },
      ],
      max_output_tokens: 450,
    }),
  })

  if (!response.ok) return null
  const json = await response.json()
  return cleanAnalysis(parseOpenAIJson(getResponseText(json)))
}

function buildSearchQueries(analysis, hints) {
  const visible = (analysis?.visible_words || []).join(' ')
  return unique([
    hints.userTitle,
    hints.browserDetectedTitle,
    analysis?.product_name,
    [analysis?.brand, analysis?.product_name].filter(Boolean).join(' '),
    [analysis?.brand, analysis?.product_type].filter(Boolean).join(' '),
    ...(analysis?.search_queries || []),
    visible,
  ])
    .filter(query => normalizeText(query).length >= 2)
    .slice(0, 6)
}

function scoreProduct(product, analysis, hints) {
  const productTitle = normalizeText(product.title)
  const strongName = normalizeText(analysis?.product_name)
  const brand = normalizeText(analysis?.brand)
  const userTitle = normalizeText(hints.userTitle)
  const browserTitle = normalizeText(hints.browserDetectedTitle)
  const signalText = [
    hints.userTitle,
    hints.browserDetectedTitle,
    analysis?.product_name,
    analysis?.brand,
    analysis?.product_type,
    ...(analysis?.visible_words || []),
  ].join(' ')
  const tokens = unique(tokensFromText(signalText))
  const matches = tokens.filter(token => productTitle.includes(token)).length
  let score = tokens.length ? Math.round((matches / tokens.length) * 70) : 0

  if (strongName && productTitle.includes(strongName)) score += 22
  if (brand && productTitle.includes(brand)) score += 14
  if (userTitle && productTitle.includes(userTitle)) score += 20
  if (browserTitle && productTitle.includes(browserTitle)) score += 12
  if (analysis?.confidence >= 0.75) score += 8

  return Math.max(0, Math.min(100, score))
}

function pickMatch(products, analysis, hints) {
  const ranked = products
    .map(product => ({ ...product, match_score: scoreProduct(product, analysis, hints) }))
    .sort((a, b) => b.match_score - a.match_score)

  const best = ranked[0] || null
  const second = ranked[1] || null
  const enoughScore = best && (best.match_score >= 76 || (best.match_score >= 68 && !second))
  const enoughGap = !second || best.match_score - second.match_score >= 12 || best.match_score >= 88

  return {
    ranked: ranked.slice(0, 5),
    match: enoughScore && enoughGap ? best : null,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userClient = getUserClient(req)
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized' })

    const { imageUrl, userTitle, browserDetectedTitle, browserDetectedPrice } = req.body || {}
    if (!imageUrl || !String(imageUrl).startsWith('http')) {
      return res.status(400).json({ error: 'Missing image URL' })
    }

    const hints = {
      userTitle: String(userTitle || '').trim(),
      browserDetectedTitle: String(browserDetectedTitle || '').trim(),
    }

    const analysis = await analyzeImageWithOpenAI(imageUrl, hints)
    const queries = buildSearchQueries(analysis, hints)
    const seen = new Map()

    for (const query of queries) {
      try {
        const result = await searchShopifyProducts(query, { limit: 8 })
        ;(result.products || []).forEach(product => {
          if (!seen.has(product.product_id)) seen.set(product.product_id, product)
        })
      } catch {
        // Keep trying other queries.
      }
    }

    const { ranked, match } = pickMatch([...seen.values()], analysis, hints)
    const browserPrice = Number(browserDetectedPrice)
    const detectedPrice = analysis?.estimated_price_cop || (Number.isFinite(browserPrice) ? browserPrice : null)
    const detectedTitle = analysis?.product_name || hints.userTitle || hints.browserDetectedTitle || ''

    return res.status(200).json({
      matched: Boolean(match),
      product: match,
      candidates: ranked,
      detected_title: detectedTitle,
      detected_price: detectedPrice,
      confidence: match?.match_score || 0,
      ai_configured: Boolean(process.env.OPENAI_API_KEY),
      analysis,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Could not match photo' })
  }
}
