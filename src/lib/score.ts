// lib/score.ts
// Uses Groq (free) to produce a 0-100 momentum score for each token

import type { TokenSummary } from './bags'

const GROQ_API_KEY = process.env.GROQ_API_KEY!

export interface ScoredToken extends TokenSummary {
  momentumScore: number
  scoreBreakdown: {
    holderMomentum: number
    feeVelocity: number
    priceStrength: number
    volumeHealth: number
  }
  aiInsight: string
}

export async function scoreTokens(tokens: TokenSummary[]): Promise<ScoredToken[]> {
  if (tokens.length === 0) return []

  const prompt = `You are a crypto token momentum analyst specialising in creator tokens on Bags.fm (Solana).

Score each token below from 0-100 based on its momentum potential. Consider:
- holderCount: more holders = stronger community
- lifetimeFeesSOL: total fees earned shows sustained trading
- change24h: recent price direction
- volume24h: trading activity
- royaltyBps: creator's earnings per trade (higher = creator more invested)

Return ONLY valid JSON — an array with one object per token in the same order:
[
  {
    "mint": "<mint>",
    "momentumScore": <0-100 integer>,
    "scoreBreakdown": {
      "holderMomentum": <0-25>,
      "feeVelocity": <0-25>,
      "priceStrength": <0-25>,
      "volumeHealth": <0-25>
    },
    "aiInsight": "<one punchy sentence about why this token is interesting or not>"
  }
]

Tokens to score:
${JSON.stringify(tokens.map(t => ({
  mint: t.mint,
  symbol: t.symbol,
  holderCount: t.holderCount,
  lifetimeFeesSOL: t.lifetimeFeesSOL,
  change24h: t.change24h,
  volume24h: t.volume24h,
  royaltyBps: t.royaltyBps,
})), null, 2)}

Return ONLY the JSON array, no markdown, no explanation.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    console.log('Groq response:', JSON.stringify(data))
    const raw = data.choices[0]?.message?.content ?? ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const scores: any[] = JSON.parse(clean)

    return tokens.map(token => {
      const s = scores.find(x => x.mint === token.mint)
      if (!s) return { ...token, momentumScore: 0, scoreBreakdown: { holderMomentum: 0, feeVelocity: 0, priceStrength: 0, volumeHealth: 0 }, aiInsight: 'No data' }
      return {
        ...token,
        momentumScore: s.momentumScore,
        scoreBreakdown: s.scoreBreakdown,
        aiInsight: s.aiInsight,
      }
    })
  } catch (err) {
    console.error('Score error:', err)
    return tokens.map(t => ({
      ...t,
      momentumScore: Math.min(100, Math.round(
        (Math.min(t.holderCount, 1000) / 1000) * 30 +
        (Math.min(t.lifetimeFeesSOL, 100) / 100) * 25 +
        (t.change24h > 0 ? Math.min(t.change24h, 50) / 50 * 25 : 0) +
        (Math.min(t.volume24h, 50000) / 50000) * 20
      )),
      scoreBreakdown: { holderMomentum: 0, feeVelocity: 0, priceStrength: 0, volumeHealth: 0 },
      aiInsight: 'AI scoring temporarily unavailable',
    }))
  }
}