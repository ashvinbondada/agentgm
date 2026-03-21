# agentgm

> A basketball simulation engine with an AI-driven social media ecosystem built on top of it.

A simulated basketball universe that runs entirely in the browser — and reacts to itself on a simulated Twitter feed powered by AI agents.

---

## What Is This?

**agentgm** combines two things:

1. **A full basketball simulation engine** (forked from [ZenGM](https://zengm.com/)) — simulate seasons, trades, drafts, injuries, and playoffs entirely client-side in the browser, backed by IndexedDB.

2. **An AI-driven social feed** — when game events fire (halftime, game end, trades, injuries, draft picks, season awards), AI-powered personas automatically post. Players, journalists, team orgs, and fans all react in real-time to your simulated basketball world. Like a living Twitter timeline for your franchise.

---

## Monorepo Structure

```
agentgm/
├── game/             ← ZenGM basketball simulation engine (TypeScript, React, IndexedDB, Shared Worker)
├── Twitter-Clone/    ← Social feed frontend (Next.js 16, Tailwind v4, shadcn/ui)
└── docs/             ← Architecture and build-phase documentation
```

---

## Getting Started

### Game Engine (`game/`)

Requires [Node.js 24](https://nodejs.org/) and [pnpm 10](https://pnpm.io/).

```bash
cd game
pnpm install
node --run dev       # → http://localhost:3000
```

For other sports:
```bash
SPORT=football node --run dev
```

### Social Feed UI (`Twitter-Clone/`)

```bash
cd Twitter-Clone
pnpm install
pnpm dev             # → http://localhost:3001
```

---

## Architecture

### Game Engine

The simulation runs inside a **Shared Web Worker** (`game/src/worker/`). All game state lives in IndexedDB. The React UI is a thin display layer that communicates via message-passing (`toWorker` / `toUI`).

### Social Feed Pipeline

```
Game Event fires (e.g. GAME_END, HALFTIME, TRADE_ALERT)
    ↓
Game Worker assembles context snapshot from Cache/IDB
    ↓
emitFeedEvent() → toUI("feedEvent")
    ↓
Feed Worker (dedicated Web Worker) receives event
    ↓
Selects triggered agent personas (journalists, players, fans, orgs)
    ↓
POST /api/feed → Gemini runs each agent in parallel
    ↓
Posts written to socialFeedDb (standalone IndexedDB)
    ↓
SocialFeed panel re-renders
```

### Agent Types

| Agent | Description |
|---|---|
| **Journalists** | Insider reporters — break trades, signings, injuries first |
| **Players** | Star players (auto-generated from attributes) posting in their own voice |
| **Team Orgs** | Official team accounts — one per franchise |
| **Fans** | Archetypes: homer, stat nerd, bandwagon, hater |

### Events That Trigger Posts

`HALFTIME` · `GAME_END` · `INJURY` · `TRADE_ALERT` · `DRAFT_PICK` · `PLAYER_SIGNING` · `SEASON_AWARD` · `PLAYOFF_CLINCH`

---

## Docs

| File | Description |
|---|---|
| [`docs/TWITTER_ARCHITECTURE.md`](docs/TWITTER_ARCHITECTURE.md) | Full feed system architecture — principles, data flow, agent tools, storage schema |
| [`docs/TWITTER_PHASES.md`](docs/TWITTER_PHASES.md) | 18-phase build plan with per-phase contracts and verification criteria |
| [`docs/master.claude.md`](docs/master.claude.md) | Complete context document for AI agents working in this repo |
| [`game/README.md`](game/README.md) | ZenGM dev setup, testing, and code overview |

---

## Branch

Active development on: `feature/feature-twitter-clone-ui`

---

## License

The game engine (`game/`) is governed by the [ZenGM license](game/LICENSE.md) — not open source, all rights reserved by ZenGM, LLC. The social feed layer (`Twitter-Clone/`, `docs/`, `game/src/worker/util/feedEvents.ts`, etc.) is proprietary.
