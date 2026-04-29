// lib/bags.ts
// Centralised Bags SDK + REST helpers

import { BagsSDK } from '@bagsfm/bags-sdk'
import { Connection, PublicKey } from '@solana/web3.js'

const BAGS_API_KEY = process.env.BAGS_API_KEY!
const RPC_URL = process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com'
const BASE = 'https://public-api-v2.bags.fm/api/v1'

let _sdk: BagsSDK | null = null

export function getSDK(): BagsSDK {
  if (!_sdk) {
    const connection = new Connection(RPC_URL, 'processed')
    _sdk = new BagsSDK(BAGS_API_KEY, connection, 'processed')
  }
  return _sdk
}

async function bagsGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-api-key': BAGS_API_KEY },
    next: { revalidate: 30 }, // cache for 30s
  })
  if (!res.ok) throw new Error(`Bags API error ${res.status} on ${path}`)
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface TokenSummary {
  mint: string
  name: string
  symbol: string
  creatorHandle: string
  creatorWallet: string
  holderCount: number
  lifetimeFeesSOL: number
  price: number
  volume24h: number
  change24h: number   // percent
  royaltyBps: number
  imageUrl?: string
  // added by scoring layer
  momentumScore?: number
}

export interface HolderInfo {
  wallet: string
  amount: number
  percentage: number
}

// ─── API calls ─────────────────────────────────────────────────────────────

/** Get top creator tokens - mock data for development */
export async function getTopTokens(limit = 20): Promise<TokenSummary[]> {
  const mocks = [
    { name: 'Creator Alpha', symbol: 'CALPHA', change24h: 42.5, holderCount: 1240 },
    { name: 'Builder DAO', symbol: 'BDAO', change24h: -5.2, holderCount: 890 },
    { name: 'Hype Token', symbol: 'HYPE', change24h: 128.3, holderCount: 3400 },
    { name: 'Steady Earn', symbol: 'SEARN', change24h: 2.1, holderCount: 560 },
    { name: 'Moon Bags', symbol: 'MBAGS', change24h: 67.8, holderCount: 2100 },
    { name: 'Vibe Check', symbol: 'VIBE', change24h: -12.4, holderCount: 430 },
    { name: 'Grind Coin', symbol: 'GRND', change24h: 15.6, holderCount: 780 },
    { name: 'Lagos Wave', symbol: 'LGOS', change24h: 89.2, holderCount: 1560 },
    { name: 'Naija Tech', symbol: 'NJTECH', change24h: 33.1, holderCount: 920 },
    { name: 'Afro Bags', symbol: 'AFRO', change24h: 5.7, holderCount: 340 },
  ]
  return mocks.slice(0, limit).map((m, i) => ({
    mint: `mock${i}1111111111111111111111111111111111`,
    name: m.name,
    symbol: m.symbol,
    creatorHandle: `creator_${m.symbol.toLowerCase()}`,
    creatorWallet: `wallet${i}111111111111111111111111111111111`,
    holderCount: m.holderCount,
    lifetimeFeesSOL: Math.random() * 50,
    price: Math.random() * 0.01,
    volume24h: Math.random() * 10000,
    change24h: m.change24h,
    royaltyBps: 100,
    imageUrl: undefined,
  }))
}

/** Get top holders for a token */
export async function getTopHolders(mint: string, limit = 20): Promise<HolderInfo[]> {
  try {
    const res = await bagsGet(`/token-launch/holders?tokenMint=${mint}&limit=${limit}`)
    const items = res.response ?? res.holders ?? []
    return items.slice(0, limit).map((h: any) => ({
      wallet: h.wallet ?? h.address,
      amount: h.amount ?? h.balance ?? 0,
      percentage: h.percentage ?? 0,
    }))
  } catch {
    return []
  }
}

/** Get lifetime fees for a token */
export async function getLifetimeFees(mint: string): Promise<number> {
  try {
    const data = await bagsGet(`/token-launch/lifetime-fees?tokenMint=${mint}`)
    const lamports = data.response?.totalFees ?? data.totalFees ?? 0
    return lamports / 1e9
  } catch {
    return 0
  }
}

/** Get claimable fee positions for a wallet */
export async function getClaimablePositions(walletAddress: string) {
  const sdk = getSDK()
  try {
    const wallet = new PublicKey(walletAddress)
    return await sdk.fee.getAllClaimablePositions(wallet)
  } catch {
    return []
  }
}

/** Get creator info for a token */
export async function getTokenCreators(mint: string) {
  const sdk = getSDK()
  try {
    return await sdk.state.getTokenCreators(new PublicKey(mint))
  } catch {
    return []
  }
}
