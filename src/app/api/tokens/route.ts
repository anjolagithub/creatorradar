// app/api/tokens/route.ts
import { NextResponse } from 'next/server'
import { getTopTokens } from '@/lib/bags'
import { scoreTokens } from '@/lib/score'

export const revalidate = 60 // re-run at most once per minute

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50)

    const tokens = await getTopTokens(limit)
    const scored = await scoreTokens(tokens)

    // Sort by momentum score descending
    scored.sort((a, b) => b.momentumScore - a.momentumScore)

    return NextResponse.json({ ok: true, tokens: scored, updatedAt: Date.now() })
  } catch (err: any) {
    console.error('/api/tokens error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
