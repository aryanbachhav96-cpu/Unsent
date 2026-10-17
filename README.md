# Unsent — Say what you never sent

> *A quiet place to share your story, your heartbreak or your strangest thoughts. Anonymous, unjudged, and heard.*

---

## Overview

**Unsent** is an anonymous web application where people share trauma, relationship stories, breakups, unrequited love, crushes, deep perspectives, cult/occult experiences, and curated song & book recommendations.

- **Design Philosophy**: Strict monochrome palette (`#000`), Google Font *Instrument Serif* for large headlines, *Inter* for body and UI elements, `.liquid-glass` cards, pills, and inputs with `backdrop-filter: blur(12px)` and `rgba(0,0,0,0.22)`, soft text auras, full-viewport fixed background imagery with ambient Ken Burns drift, and a subtle film-grain texture.
- **Text Motion**: Visible page text reveals letter by letter with a staggered fade, upward movement, and blur-to-focus transition. The Occult heading uses an interactive fuzzy canvas treatment; it becomes crisp for reduced-motion preferences, while assistive technology receives the heading once.
- **Privacy First**: Email is never displayed or leaked publicly. Every user is given a random anonymous handle (e.g. `quiet_owl_482`). Guests can post with rate limits. Raw IP addresses are never logged or stored (salted HMAC-SHA256 hash). Users can permanently delete their own content at any time.
- **Safety**: Gentle, non-blocking crisis intervention modal (providing Tele-MANAS 14416 and international resources), automated PII detection and flagging, strict occult moderation (prohibiting ritual recipes and recruitment), and a persistent helpline link.

---

## Technology Stack

- **Frontend**: Vite + React 18 + React Router 6 + Tailwind CSS 3 + Lucide Icons.
- **Backend**: Node.js + Express + SQLite (`node:sqlite` built-in native `DatabaseSync` in Node 24).
- **Authentication**: JWT stored in `httpOnly`, `SameSite=Lax` cookies; `bcryptjs` password hashing.
- **Security & Performance**: `helmet`, `express-rate-limit`, salted IP hashing.

---

## Installation & Local Run

### Prerequisites
- Node.js 22.5+ or Node.js 24+ (Node.js 24.19+ recommended).
- npm 10+.

### Step 1: Clone and Navigate
```bash
cd d:/unsent
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` (already created for local development):
```bash
cp .env.example .env
```

Contents of `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=<random-secret-at-least-32-characters>
IP_SALT_SECRET=<different-random-secret-at-least-32-characters>

# Optional local admin account
ADMIN_EMAIL=<your-admin-email>
ADMIN_PASSWORD=<unique-admin-password>
ADMIN_HANDLE=<your-admin-handle>
```

> [!WARNING]
> **PRODUCTION DEPLOYMENT WARNING**:  
> Set unique `JWT_SECRET`, `IP_SALT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_HANDLE` values in the production host's secret settings. Production startup rejects missing or weak values. Never commit `.env`.

### Step 4: Run the Application
One single command starts both the backend API and frontend dev server concurrently:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

Guests can post without an account and receive an auto-assigned transient handle.

---

## Sanctuaries & Pages

1. **`/` — Day One default landing**: Daytime hero video, Unsent Day branding, and a flowing menu for Day rooms, the Day feed, and the profile. **`/day/rooms`** lists the Day rooms; **`/day/r/:slug`** opens an individual room with its own full-page background photo. The legacy **`/day`** landing URL remains available.
2. **`/night` — Night One landing**: Night hero video, responsive headline, and a flowing page menu. Night's content routes (such as `/stories`, `/write`, and `/explore`) remain available.
3. **`/stories` and `/day/feed` — Public feeds**: Shared feed of public confessions from all users with topic filters, *Newest* and *Most felt* sorting, "I feel this" reactions, anonymous comments, report triggers, and blur-to-reveal content warnings. The Day feed uses Day styling.
4. **`/write` — The Writing Room**: Distraction-free glass editor over `img-10.jpg`, auto-delete duration selector (Never / 24h / 7d), topic selector, content warning toggle, and crisis detection.
5. **`/letters` — Unsent Letters**: Dedicated letter format (`Dear ____,` + body + sign-off). Features 3 choices:
   - *Keep private*: Stored in the user's private letters vault (strictly owner-only).
   - *Share on Wall*: Displayed on the public wall with addressee displayed only as a first name or initial.
   - *Release (Burn)*: Permanently deletes the letter immediately after a confirmation modal without saving.
6. **`/love` — Heart Corner**: Dedicated tabs for *Breakups*, *Unrequited love*, and *Crushes*, complete with "how long ago" timeline indicator.
7. **`/thoughts` — Perspectives**: Post claims and perspectives with *"I agree"* and *"I see it differently"* reactions, civil discourse comments, and the core principle: *"Argue with ideas, not people."*
8. **`/music` — The Soundtrack**: Outbound song recommendations with mood tags, personal notes on why the song matters, and a featured *Song of the Week*.
9. **`/books` — The Shelf**: Book recommendations with *"Read it when you're..."* tags, reviews, and Open Library book cover integration with graceful text-only fallback.
10. **`/occult` — The Dark Corner**: Interstitial gate requiring *"I understand"* acknowledgment, strictly moderating ritual recipes and recruitment while permitting personal experience-sharing.
11. **`/healing` — Healing Space**: Trauma and recovery feed (content warning blurred by default), pinned Tele-MANAS 14416 card, interactive **Box-Breathing guide** (4-4-4-4 visual pacing), and **5-4-3-2-1 Sensory Grounding tool**.
12. **`/auth` — Account Sanctuary**: Login and registration with automatic random handle generation and private email storage.
13. **`/my` and `/day/profile` — User profile**: View authored stories, private letters vault, and dedicated music/books, with one-click permanent deletion buttons. The Day profile uses Day styling.
14. **`/guidelines` — Community Guidelines**: Calm, detailed community pact outlining safety, anti-doxxing, non-medical advice, and crisis contacts.
15. **`/admin` — Admin Console**: Report queue (Hide, Restore, Remove, Dismiss), safety-flagged posts, ban/unban controls, and a *"Clear sample data"* button that deletes only entries marked `is_sample = 1`.

---

## Crisis Support & Safety

- **India**: Call Tele-MANAS toll-free at **`14416`** or `1800 891 4416` (free, 24/7).
- **International**: Visit [findahelpline.com](https://findahelpline.com) for confidential crisis support in 130+ countries.
