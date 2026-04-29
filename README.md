# CreatorRadar 🎯

> AI-powered momentum scoring for creator tokens on Bags.fm

**Hackathon Track**: AI Agents + Social Finance  
**Built for**: Bags Hackathon ($1M prize pool)  
**Live Demo**: https://creatorradar-theta.vercel.app  
**Built by**: @anjolagithub

---

## What it does

CreatorRadar is a Bloomberg Terminal for Bags.fm. It monitors every creator token and uses AI to score them 0-100 on momentum potential — so traders can find the signal and skip the noise.

Every token gets scored across 4 dimensions:
- **Holder momentum** — community growth signals
- **Fee velocity** — sustained trading / creator earnings  
- **Price strength** — recent price direction
- **Volume health** — trading activity depth

Traders can also view top holders per token and copy their wallet addresses for copy-trading.

---

## Why it matters

Right now every Bags trader is flying blind. CreatorRadar gives them a radar. It's the first AI-powered token intelligence dashboard built specifically for the Bags ecosystem.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js + Tailwind |
| Token Data | Bags REST API + SDK |
| AI Scoring | Groq (llama-3.3-70b) |
| Blockchain | Solana via Helius RPC |
| Hosting | Vercel |

---

## Setup (15 minutes)

### 1. Clone & install
```bash
git clone https://github.com/anjolagithub/creatorradar
cd creatorradar
npm install --legacy-peer-deps
```

### 2. Get API keys (all free)

| Key | Where |
|---|---|
| `BAGS_API_KEY` | https://dev.bags.fm/login |
| `HELIUS_RPC_URL` | https://dev.helius.xyz |
| `GROQ_API_KEY` | https://console.groq.com |

### 3. Set environment variables
```bash
cp .env.example .env.local
# fill in your keys
```

### 4. Run locally
```bash
npm run dev
# → http://localhost:3000
```

### 5. Deploy
```bash
npx vercel --prod
```

---

## Project structure
src/
├── app/
│   ├── page.tsx              # Main dashboard UI
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Dark crypto aesthetic
│   └── api/
│       ├── tokens/route.ts   # GET /api/tokens — AI scored leaderboard
│       └── holders/route.ts  # GET /api/holders — top holders per token
├── components/
│   └── TokenCard.tsx         # Token card with score ring + AI insight
└── lib/
├── bags.ts               # Bags SDK + REST API helpers
└── score.ts              # Groq AI scoring engine

---


