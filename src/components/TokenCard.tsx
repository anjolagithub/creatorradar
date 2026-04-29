'use client'
import { useState } from 'react'
import type { ScoredToken } from '@/lib/score'

interface Props {
  token: ScoredToken
  rank: number
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#00ff88' : score >= 40 ? '#f5a623' : '#ff4d6d'
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: `conic-gradient(${color} ${score}%, rgba(255,255,255,0.06) 0%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: '#0d1117',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color,
        fontFamily: 'JetBrains Mono, monospace',
      }}>{score}</div>
    </div>
  )
}

export default function TokenCard({ token, rank }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [holders, setHolders] = useState<any[]>([])
  const [loadingHolders, setLoadingHolders] = useState(false)

  const isUp = token.change24h >= 0
  const priceStr = token.price < 0.0001
    ? token.price.toExponential(2)
    : token.price.toFixed(6)

  async function loadHolders() {
    if (holders.length > 0) { setExpanded(e => !e); return }
    setLoadingHolders(true)
    setExpanded(true)
    try {
      const res = await fetch(`/api/holders?mint=${token.mint}`)
      const data = await res.json()
      setHolders(data.holders ?? [])
    } finally {
      setLoadingHolders(false)
    }
  }

  return (
    <div className="card fade-in" style={{ padding: '16px 20px', marginBottom: 10 }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Rank */}
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          color: 'var(--muted)', minWidth: 24, textAlign: 'right',
        }}>#{rank}</span>

        {/* Avatar */}
        {token.imageUrl ? (
          <img src={token.imageUrl} alt={token.symbol}
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: 'linear-gradient(135deg, #00ff88, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#080c10', flexShrink: 0,
          }}>{token.symbol.charAt(0)}</div>
        )}

        {/* Name + creator */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: 'var(--text)' }}>
            {token.name} <span style={{ color: 'var(--muted)', fontSize: 12 }}>${token.symbol}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            @{token.creatorHandle || token.creatorWallet.slice(0, 8) + '...'}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Price</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text)' }}>
              ${priceStr}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>24h</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: isUp ? 'var(--green)' : 'var(--red)' }}>
              {isUp ? '+' : ''}{token.change24h.toFixed(1)}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Holders</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text)' }}>
              {token.holderCount.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Fees</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text)' }}>
              {token.lifetimeFeesSOL.toFixed(2)} SOL
            </div>
          </div>
        </div>

        {/* Score ring */}
        <ScoreRing score={token.momentumScore} />
      </div>

      {/* AI Insight */}
      {token.aiInsight && (
        <div style={{
          marginTop: 10, padding: '8px 12px',
          background: 'rgba(0,255,136,0.05)',
          border: '1px solid rgba(0,255,136,0.1)',
          borderRadius: 8, fontSize: 12, color: 'rgba(226,232,240,0.7)',
          fontStyle: 'italic',
        }}>
          ✦ {token.aiInsight}
        </div>
      )}

      {/* Score breakdown bar */}
      <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
        {Object.entries(token.scoreBreakdown).map(([key, val]) => (
          <div key={key} style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: `${(val / 25) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Expand button + holders */}
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="btn-ghost" onClick={loadHolders}
          style={{ fontSize: 12, padding: '6px 14px' }}>
          {expanded ? 'Hide' : 'Top Holders'} ↓
        </button>
        <a href={`https://bags.fm/token/${token.mint}`} target="_blank" rel="noopener noreferrer"
          className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none' }}>
          View on Bags ↗
        </a>
      </div>

      {/* Holders list */}
      {expanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {loadingHolders ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading holders...</div>
          ) : holders.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>No holder data available</div>
          ) : (
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top holders — click to copy address
              </div>
              {holders.map((h, i) => (
                <div key={h.wallet} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 0', borderBottom: i < holders.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--muted)', minWidth: 18 }}>
                    #{i + 1}
                  </span>
                  <span
                    style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)', flex: 1, cursor: 'pointer' }}
                    onClick={() => navigator.clipboard.writeText(h.wallet)}
                    title="Click to copy"
                  >
                    {h.wallet.slice(0, 8)}...{h.wallet.slice(-6)}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--green)' }}>
                    {h.percentage?.toFixed(2) ?? '?'}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
