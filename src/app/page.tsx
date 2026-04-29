'use client'
import { useState, useEffect, useCallback } from 'react'
import type { ScoredToken } from '@/lib/score'
import TokenCard from '@/components/TokenCard'

type SortKey = 'momentumScore' | 'holderCount' | 'volume24h' | 'change24h' | 'lifetimeFeesSOL'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'momentumScore', label: 'AI Score' },
  { key: 'holderCount',   label: 'Holders' },
  { key: 'volume24h',     label: 'Volume' },
  { key: 'change24h',     label: '24h Change' },
  { key: 'lifetimeFeesSOL', label: 'Fees Earned' },
]

export default function Home() {
  const [tokens, setTokens] = useState<ScoredToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState<SortKey>('momentumScore')
  const [search, setSearch] = useState('')
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tokens?limit=20')
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)
      setTokens(data.tokens)
      setUpdatedAt(data.updatedAt)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(() => load(true), 60_000)
    return () => clearInterval(t)
  }, [load])

  const filtered = tokens
    .filter(t =>
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.creatorHandle.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b[sort] as number) - (a[sort] as number))

  const avgScore = tokens.length ? Math.round(tokens.reduce((s, t) => s + t.momentumScore, 0) / tokens.length) : 0
  const topGainer = tokens.reduce((best, t) => t.change24h > (best?.change24h ?? -Infinity) ? t : best, null as ScoredToken | null)

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="pulse-dot" />
          <span style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Live — Bags.fm
          </span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
          Creator<span className="glow-text">Radar</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 520 }}>
          AI-powered momentum scoring for every creator token on Bags.fm. Find the signal, skip the noise.
        </p>
      </div>

      {/* Stats bar */}
      {!loading && tokens.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Tokens Tracked', value: tokens.length, suffix: '' },
            { label: 'Avg AI Score', value: avgScore, suffix: '/100' },
            { label: 'Top Gainer', value: topGainer ? `+${topGainer.change24h.toFixed(1)}%` : '—', suffix: '' },
            { label: 'Total Holders', value: tokens.reduce((s, t) => s + t.holderCount, 0).toLocaleString(), suffix: '' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>
                {stat.value}{stat.suffix}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search tokens, creators..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 180,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '9px 14px', color: 'var(--text)',
            fontFamily: 'Syne, sans-serif', fontSize: 14, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Syne, sans-serif', border: 'none',
                background: sort === opt.key ? 'var(--green)' : 'var(--bg3)',
                color: sort === opt.key ? '#080c10' : 'var(--muted)',
                transition: 'all 0.15s',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
        <button
          className="btn-ghost"
          onClick={() => load(true)}
          disabled={refreshing}
          style={{ fontSize: 12, padding: '8px 14px', opacity: refreshing ? 0.5 : 1 }}>
          {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Updated at */}
      {updatedAt && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>
          Last updated: {new Date(updatedAt).toLocaleTimeString()}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>
            Fetching tokens + running AI scoring...
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
            This takes ~5s on first load
          </div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ color: 'var(--red)', marginBottom: 8 }}>Error loading tokens</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>{error}</div>
          <button className="btn-primary" onClick={() => load()}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          No tokens match "{search}"
        </div>
      ) : (
        <div>
          {filtered.map((token, i) => (
            <TokenCard key={token.mint} token={token} rank={i + 1} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          CreatorRadar — Built for the{' '}
          <a href="https://bags.fm" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--green)', textDecoration: 'none' }}>
            Bags Hackathon
          </a>
          {' '}· Powered by Bags SDK + Groq AI
        </div>
      </div>
    </main>
  )
}
