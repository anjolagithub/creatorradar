// app/api/holders/route.ts
import { NextResponse } from 'next/server'
import { getTopHolders } from '@/lib/bags'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mint = searchParams.get('mint')
  if (!mint) return NextResponse.json({ error: 'mint required' }, { status: 400 })

  try {
    const holders = await getTopHolders(mint, 20)
    return NextResponse.json({ ok: true, holders })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
