# Quiz Maker — Frontend

A React application for creating and taking coding quizzes, built against a pre-provided Node.js + SQLite backend.

## Requirements

- Node.js 20+
- The backend running on `http://localhost:4000`

## Running locally

### 1. Start the backend

```bash
cd hiring-quiz-maker-backend-main
npm install
npm run seed   # optional: seed with a sample quiz
npm run dev    # runs on http://localhost:4000
```

### 2. Start the frontend

```bash
cd hiring-quiz-maker-frontend-main
npm install
npm run dev    # runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

The frontend reads from `.env.local` (already included):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_TOKEN=dev-token
```

Change `NEXT_PUBLIC_API_TOKEN` if you update `API_TOKEN` in the backend's `.env`.

---

## Architecture decisions & trade-offs

### Framework

Next.js 16 (App Router) in SPA mode — all pages are statically pre-rendered shells, all data fetching is client-side via TanStack Query v5.

### State management

A discriminated union (`Phase`) drives the quiz player:

```text
idle → active → done
```

No global state library needed — TanStack Query handles server state, React `useState` handles UI state. This keeps the data flow explicit and easy to trace.

### Component structure

```text
components/
  quiz-builder/
    index.tsx          — state + mutations owner
    question-card.tsx  — pure UI, no internal state
  quiz-player/
    index.tsx          — state machine + mutations owner
    start-screen.tsx   — enter quiz ID
    question-view.tsx  — question display + navigation
    results-view.tsx   — score breakdown
    anti-cheat-banner.tsx — summary card
hooks/
  useAntiCheat.ts      — event tracking, isolated from UI
lib/
  api.ts               — single fetch wrapper with auth header
  types.ts             — shared TypeScript interfaces
```

Page files (`app/build/page.tsx`, `app/play/page.tsx`) are one-line shells that import the component. This keeps Next.js routing separate from feature logic.

### Answer saving strategy

Answers are saved to the API on every navigation (prev/next). On submit, all questions are flushed before calling `/submit`. This prevents data loss if the user skips questions.

### Code snippet (backend minor change)

The backend schema did not include a `code_snippet` field for questions. A `code_snippet TEXT` column was added via:

- `sql/schema.sql` — added to the table definition for new databases
- `src/db.js` — `PRAGMA table_info` check + `ALTER TABLE ADD COLUMN` for existing databases (safe, idempotent)

This is the only backend change made.

---

## Anti-cheat implementation

Anti-cheat signals are tracked via `hooks/useAntiCheat.ts` and logged to the backend in real time during an active attempt.

### What is tracked

| Event | Backend log | When |
| --- | --- | --- |
| Tab/window blur | `tab_blur on Q{n}` | User switches away from the page |
| Tab/window focus | `tab_focus` | User returns to the page |
| Paste | `paste_detected on Q{n}` | Paste action anywhere on the document |

All events include the active question number (`Q1`, `Q2`, etc.) so reviewers can see exactly where suspicious activity occurred.

### Where it's stored

Events are persisted to the `attempt_events` table in SQLite via `POST /attempts/:id/events`. The backend auto-timestamps each event.

### Results summary

After submission, the results page shows a compact summary:

> **3 tab switches** (Q1, Q2 ×2)
> **2 pastes** (Q2, Q3)

Repeated events on the same question are grouped with a count (e.g. `Q2 ×2`).

### Implementation notes

- Event listeners attach on `window` (blur/focus) and `document` (paste) only while an attempt is active — they are removed on cleanup.
- `useLayoutEffect` is used to keep the "current question" ref in sync after each render, avoiding stale closures without introducing dependency churn.
- Logging is fire-and-forget (`catch(() => {})`) so a failed network request never interrupts the user's quiz.
