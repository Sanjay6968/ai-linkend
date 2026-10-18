# ContentMint AI

AI-powered LinkedIn content operating system for developers, founders, and creators. Turn rough thoughts into structured posts in under two seconds — draft, schedule, and publish directly to LinkedIn.

---

## Key Features

- **5 High-Converting Writing Archetypes**
  - **Story:** Personal narrative, lived lesson, emotional resonance, authentic hook.
  - **Hot Take:** Contrarian perspective, myth-busting, zero corporate jargon.
  - **Framework:** Step-by-step actionable playbook (1, 2, 3), tactical breakdown.
  - **Case Study:** Before vs. after analysis, operational mechanics, measurable ROI.
  - **Insight:** Diamond-sharp 4-line observation with maximum signal-to-noise ratio.
- **Fast AI Generation via Groq LPU**
  - Sub-2 second generation speed.
  - Resilient model fallback: `openai/gpt-oss-120b` -> `openai/gpt-oss-20b` -> `qwen/qwen3.8-27b`.
  - Strict anti-cliche guardrails (bans generic openings like *"In today's fast-paced world"*).
- **Direct LinkedIn Publishing**
  - Official LinkedIn OAuth 2.0 integration (`w_member_social`).
  - Single-click posting directly to your personal LinkedIn profile feed.
  - Smart 429 rate-limit fallback: automatic clipboard copy + opens native LinkedIn compose window.
- **Automated Background Scheduler**
  - Interactive calendar timeline with time-slot pickers.
  - Automated cron processor (`/api/cron/process-scheduled`) publishing due queued posts.
  - Local background runner daemon support.
- **Draft & Content Management**
  - Save, edit, and organize posts in a database-backed drafts workspace.
  - Dual preview: standard feed view and 3-slide carousel breakdown.
- **Full Authentication Suite**
  - Email & password authentication with Firebase.
  - Route guards on `/dashboard/*`, session persistence, and instant logout.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Lucide Icons, Framer Motion |
| **Styling** | Tailwind CSS v4, shadcn/ui design primitives, custom Earthy Botanical dark palette (`#0A0D08`, `#DBCAC0`, `#6F8055`, `#3E4F32`) |
| **Database & ORM** | Prisma ORM with SQLite (local development) / PostgreSQL (production) |
| **Authentication** | Firebase Auth (Client SDK & State Listeners) |
| **AI Inference** | Groq SDK (LPU accelerated models) |
| **Social API** | LinkedIn REST UGC Posts API v2 |

---

## Architecture & Data Flow

```mermaid
flowchart TD
    User([User]) -->|Auth / Session| FB[Firebase Auth]
    User -->|Prompt + Style| UI[Dashboard Composer]
    UI -->|POST /api/generate| Groq[Groq LPU Engine]
    Groq -->|Generated Draft| UI
    UI -->|Save Draft / Schedule| DB[(Prisma Database)]
    UI -->|Post Now| LI_API[LinkedIn UGC API v2]
    Cron[Scheduler Daemon / Cron] -->|Polls Due Posts| DB
    Cron -->|Auto Publish| LI_API
    LI_API -->|Live Post| Profile[LinkedIn Feed]
```

---

## Local Quickstart

### 1. Clone the repository
```bash
git clone https://github.com/Sanjay6968/linkend.git
cd linkend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Start the Development Server
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

*(Optional)* Run the local background scheduler in a separate terminal:
```bash
node scheduler-runner.mjs
```

---

## Project Structure

```
├── prisma/
│   ├── dev.db                 # Local SQLite database (gitignored)
│   └── schema.prisma          # Database models (User, Post)
├── public/
│   └── favicon.svg            # Custom SVG icon
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth routes: Login, Register, Forgot Password
│   │   ├── api/
│   │   │   ├── auth/linkedin/ # OAuth redirect & callback endpoints
│   │   │   ├── cron/          # Scheduled post background worker
│   │   │   ├── generate/      # Groq AI generator with 5 archetypes
│   │   │   ├── linkedin/      # Direct publishing to LinkedIn UGC API
│   │   │   ├── posts/         # Posts CRUD (Drafts & Scheduled)
│   │   │   └── user/status/   # User LinkedIn connection check
│   │   ├── dashboard/
│   │   │   ├── drafts/        # Saved drafts page
│   │   │   ├── schedule/      # Calendar timeline & scheduler
│   │   │   ├── settings/      # Account & LinkedIn integration settings
│   │   │   ├── layout.tsx     # Dashboard layout & route guard
│   │   │   └── page.tsx       # AI Composer workspace
│   │   ├── globals.css        # Theme variables & base typography
│   │   ├── layout.tsx         # Root layout with AuthProvider & metadata
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # UI primitives (Buttons, Cards, Modals, Tabs)
│   │   └── particle-background.tsx
│   ├── hooks/
│   │   └── use-mobile.ts
│   └── lib/
│       ├── firebase/          # Firebase config & AuthContext
│       ├── prisma.ts          # Singleton Prisma client instance
│       └── scheduler.ts       # Scheduled publishing logic
├── scheduler-runner.mjs       # Dev scheduler daemon
├── package.json
└── README.md
```

---

## API Routes Reference

| Route | Method | Description |
|---|---|---|
| `/api/generate` | `POST` | Generates a LinkedIn post based on user prompt and selected style archetype. |
| `/api/posts` | `GET`, `POST`, `DELETE` | CRUD operations for drafts, scheduled posts, and post deletion. |
| `/api/auth/linkedin` | `GET` | Initiates the LinkedIn 3-legged OAuth 2.0 flow. |
| `/api/auth/linkedin/callback` | `GET` | Handles LinkedIn authorization code exchange and stores tokens. |
| `/api/linkedin/publish` | `POST` | Publishes a post directly to the user's LinkedIn profile via UGC API. |
| `/api/cron/process-scheduled` | `GET` | Evaluates due scheduled posts and triggers automated publishing. |
| `/api/user/status` | `GET` | Checks if the current authenticated user has an active LinkedIn integration. |

---

## Deployment to Vercel

1. Create a free PostgreSQL database on [neon.tech](https://neon.tech).
2. Update `prisma/schema.prisma` to `provider = "postgresql"` and add `directUrl = env("DIRECT_URL")`.
3. Import the repository at [vercel.com](https://vercel.com) and configure your project environment variables in the Vercel dashboard.
4. Set the build command:
   ```bash
   npx prisma generate && npx prisma db push && npm run build
   ```
5. Add your production callback URL under Authorized Redirect URLs in the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).
