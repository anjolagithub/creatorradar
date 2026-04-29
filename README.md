# CreatorRadar 🎯

> AI-powered momentum scoring for creator tokens on Bags.fm

**Hackathon Track**: AI Agents + Social Finance  
**Built for**: Bags Hackathon ($1M prize pool)

---

## What it does

CreatorRadar monitors every creator token on Bags.fm and uses Claude AI to produce a 0-100 momentum score based on:

- **Holder momentum** — community growth signals
- **Fee velocity** — sustained trading / creator earnings
- **Price strength** — recent direction
- **Volume health** — trading activity depth

It also shows the top wallet holders per token so you can one-click copy their addresses for copy-trading.

---

## Setup (15 minutes)

### 1. Clone & install
```bash
git clone <your-repo>
cd creatorrader
npm install
```

### 2. Get API keys (all free)

| Key | Where to get it |
|---|---|
| `BAGS_API_KEY` | https://dev.bags.fm/login |
| `HELIUS_RPC_URL` | https://dev.helius.xyz (free tier) |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com |

### 3. Set environment variables
```bash
cp .env.example .env.local
# fill in your keys
```

### 4. Launch your token on Bags (required for submission)
- Go to https://bags.fm
- Launch a token for your project
- Copy the mint address into `PROJECT_TOKEN_MINT` in `.env.local`

### 5. Run locally
```bash
npm run dev
# → http://localhost:3000
```

### 6. Deploy to Vercel (free)
```bash
npx vercel deploy
# Add env vars in Vercel dashboard
```

---

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard UI
│   ├── layout.tsx            # Root layout + metadata
│   ├── globals.css           # Dark crypto aesthetic
│   └── api/
│       ├── tokens/route.ts   # GET /api/tokens — scored leaderboard
│       └── holders/route.ts  # GET /api/holders?mint=... — top holders
├── components/
│   └── TokenCard.tsx         # Individual token card with score ring
└── lib/
    ├── bags.ts               # Bags SDK + REST API helpers
    └── score.ts              # Claude AI scoring engine
```

---

## How the AI scoring works

`lib/score.ts` batches all tokens into a single Claude prompt asking it to:
1. Score each token 0-100 across 4 sub-dimensions (max 25 each)
2. Return a one-line insight explaining the score

Claude returns structured JSON. If the API fails, a deterministic fallback kicks in so the app never breaks.

---

## Hackathon submission checklist

- [ ] Launched project token on Bags
- [ ] Deployed to Vercel
- [ ] Recorded 3-5 min demo video
- [ ] GitHub repo is public
- [ ] Submitted at bags.fm hackathon portal

---

## Why this wins

1. **Deep Bags API integration** — uses SDK, REST API, token data, holder data, fee data
2. **Real traction mechanism** — creators share their score, traders share copy-trade wins
3. **AI track + Social Finance** — two high-value tracks, one submission
4. **$0 cost to run** — all free tiers, judges can verify it live
