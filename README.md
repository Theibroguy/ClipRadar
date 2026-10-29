# ClipRadar

**Social video discovery** — ClipRadar surfaces short-form clips of public social media personalities doing interesting, funny, or noteworthy things. It fetches metadata from official platform APIs, enriches each result with a Google Gemini AI description, and displays everything in a fast React/Vite frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, CSS (custom design system) |
| Backend | Node.js, Express 4, ES Modules |
| Database | MongoDB Atlas (Mongoose) |
| AI | Google Gemini 1.5 Flash (`@google/genai`) |
| Platforms | YouTube Data API v3, X API v2, Instagram Graph API, TikTok Display API |
| Testing | Vitest, Supertest, @testing-library/react |

---

## Project Structure

```
ClipRadar1/
├── server/            Express API + platform services + AI
│   ├── src/
│   │   ├── app.js             Express app (middleware, routes)
│   │   ├── index.js           Entry point
│   │   ├── config/db.js       MongoDB connection
│   │   ├── models/Video.js    Mongoose schema
│   │   ├── services/          youtube / twitter / instagram / tiktok / gemini
│   │   ├── controllers/       Request handlers
│   │   ├── routes/            Route definitions
│   │   ├── middleware/        Error handler
│   │   └── data/demoVideos.js Demo seed data
│   └── tests/videos.test.js
│
└── client/            React/Vite frontend
    ├── src/
    │   ├── api/videos.js      Fetch helpers (no secrets)
    │   ├── components/        VideoCard, FilterBar, Spinner
    │   └── pages/VideoFeed/   Main discovery feed
    └── tests/VideoCard.test.jsx
```

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or skip with demo mode)
- API keys (optional for demo mode)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd ClipRadar1

# Install all dependencies
npm run install:all
```

### 2. Configure environment variables

**Server** — copy and fill in:
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
PORT=3001
DEMO_MODE=true          # ← set to true to skip all external APIs
MONGODB_URI=...         # only needed when DEMO_MODE=false
GEMINI_API_KEY=...
YOUTUBE_API_KEY=...
TWITTER_BEARER_TOKEN=...
INSTAGRAM_ACCESS_TOKEN=...
TIKTOK_ACCESS_TOKEN=...
CLIENT_ORIGIN=http://localhost:5173
```

**Client** — copy and optionally edit:
```bash
cd ../client
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3001  (default, no change needed for dev)
```

### 3. Run in demo mode (no API keys needed)

Open **two terminals**:

```bash
# Terminal 1 — backend (demo mode is on by default in .env)
cd server
npm run dev
# → http://localhost:3001
```

```bash
# Terminal 2 — frontend
cd client
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### 4. Verify the backend

```
GET http://localhost:3001/api/health
→ { "status": "ok", "mode": "demo" }

GET http://localhost:3001/api/videos
→ { videos: [...], total: 6, mode: "demo" }
```

---

## Running Tests

```bash
# Server tests (Vitest + Supertest — no DB or API keys needed)
cd server
npm test

# Client tests (Vitest + @testing-library/react)
cd client
npm test
```

All tests run against demo mode — no real API credentials are required.

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/videos` | List videos (filters: `platform`, `category`, `limit`, `skip`) |
| `POST` | `/api/videos/refresh` | Trigger platform fetch + AI enrichment (production only) |

---

## Platform Integration Notes

> **All integrations use official APIs only.** No scraping or unauthorised access.

| Platform | Status | Notes |
|---|---|---|
| YouTube | ✅ Ready | Needs `YOUTUBE_API_KEY` |
| X / Twitter | ✅ Ready | Needs `TWITTER_BEARER_TOKEN` (v2 Essential access) |
| Instagram | ✅ Ready | Needs `INSTAGRAM_ACCESS_TOKEN`; only your own account's media |
| TikTok | ✅ Ready | Needs `TIKTOK_ACCESS_TOKEN` via OAuth; TikTok Display API |
| Demo mode | ✅ Always works | 6 realistic seed entries; no keys required |

---

## Security

- All API keys are **server-side only** — the browser never sees them.
- Helmet sets secure HTTP headers.
- Rate limiting (200 req / 15 min) is applied to all `/api/*` routes.
- CORS is restricted to `CLIENT_ORIGIN`.
- JSON body size is capped at 10 KB.

---

## Development Roadmap

- [x] Phase 1 — Project foundation (repo, configs, env vars)
- [x] Phase 2 — Backend core (Express, MongoDB, platform services, Gemini AI)
- [x] Phase 3 — Frontend core (React/Vite, design system, components)
- [x] Phase 4 — Integration (frontend ↔ backend in demo mode)
- [x] Phase 5 — Testing (Vitest + Supertest all passing)
- [x] Phase 6 — Live YouTube integration & Gemini AI enrichment (Production MongoDB Atlas connected)
- [x] Phase 7 — Pagination / infinite scroll (IntersectionObserver + manual fallback)
- [x] Phase 8 — Video preview modal with embed support
- [x] Phase 9 — User bookmarks (local storage) & real-time search bar
- [ ] Phase 10 — Deploy (e.g., Railway for server, Vercel for client)
