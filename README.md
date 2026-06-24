# Makan — Malaysian calorie tracker (PWA)

A mobile-first calorie tracker with photo recognition tuned for Malaysian food and
local fast-food chains. A multimodal vision LLM (Google Gemini) estimates the dish,
portion weight, calories and macros from a single photo. Built with **Next.js (App
Router) + TypeScript**; recognition runs through a **Server Action**, so the Gemini
API key never reaches the browser. Installs to the iPhone Home Screen as a full-screen
PWA.

## Features

- 📷 **Snap or import** a food photo (camera or gallery) → Gemini estimates the dish,
  weight, calories and macros, using a Malaysia-aware prompt that returns structured JSON.
- ✏️ **Review step** — set the real weight in grams (everything rescales), edit any
  value, and add a note before saving.
- 🔎 **Offline search** of ~50 local foods (nasi lemak, mamak, KFC, drinks, kuih…).
- ⌨️ **Manual entry** for anything else.
- 🟢 Daily calorie ring + protein-forward macro bars, 7-day insights, day navigation.
- 💾 Saves to `localStorage` — no database required to run.

## Tech stack

Next.js (App Router) · TypeScript · Google Gemini API (multimodal vision) · Server
Actions · PWA (manifest + service worker) · Vercel.

## 1. Run locally

```bash
npm install
cp .env.example .env.local      # then paste your key into .env.local
npm run dev                      # http://localhost:3000
```

Get a free API key at [Google AI Studio](https://aistudio.google.com) → **Get API key**
(no credit card required).

```
GEMINI_API_KEY=your-gemini-key
```

## 2. Deploy to Vercel

```bash
npm i -g vercel    # if you don't have it
vercel             # follow prompts
vercel --prod
```

In the Vercel dashboard → **Project → Settings → Environment Variables**, add
`GEMINI_API_KEY` with your key, then **redeploy** (env changes only apply to new
deployments). That's the only env var needed.

## 3. Install on your iPhone

1. Open your Vercel URL in **Safari** (must be Safari, not Chrome).
2. Tap the **Share** button → **Add to Home Screen**.
3. Launch it from the new icon — it opens full-screen with no browser bars, uses the
   pandan icon, and works offline for everything except photo recognition (that one
   call needs a connection).

## How recognition stays secure

The browser never talks to Gemini directly. The photo is downscaled client-side (which
also converts iOS HEIC to JPEG to cut payload size and tokens), then handed to the
`recogniseFood` **Server Action** (`app/actions.ts`), which runs on Vercel's server with
the secret key. This is why the key must never go in a `NEXT_PUBLIC_*` variable or any
client component.

## Project structure

```
app/
  actions.ts             Server Action: calls Gemini vision (holds the API key)
  components/Makan.tsx    The whole UI (client component)
  manifest.ts             PWA manifest (Next App Router convention)
  layout.tsx              Metadata + Apple Web App tags
  page.tsx                Renders <Makan />
  types.ts                Shared types
public/
  sw.js                   Service worker (offline app shell)
  icon-192/512, apple-touch-icon, icon-maskable
```

## Model & rate limits

The model string lives in `app/actions.ts` (`MODEL`). Gemini's free tier is per-model
and per-day, so a 429 (`RESOURCE_EXHAUSTED`) means you hit the quota — wait for the
daily reset or switch to a Flash-Lite model, which has the most generous free quota.
Avoid the larger "thinking" models with a low `maxOutputTokens`, as the reasoning budget
can crowd out the JSON response and return empty results.

## Upgrading to real accounts (Neon + Prisma)

`localStorage` keeps data on one device. To sync across devices and back it up, move the
log to a database:

1. Add Prisma + Neon and a schema like:

   ```prisma
   model Entry {
     id        String   @id @default(cuid())
     userId    String
     date      String   // YYYY-MM-DD
     name      String
     emoji     String
     kcal      Int
     protein   Int
     carbs     Int
     fat       Int
     portion   String
     notes     String   @default("")
     createdAt DateTime @default(now())
   }
   ```

2. Add NextAuth for sign-in, then replace the `store` object in `Makan.tsx` with Server
   Actions (`addEntry`, `getDay`, `updateEntry`, `deleteEntry`) that read/write via
   Prisma, scoped to `session.user.id`.
3. Keep `localStorage` as an offline cache if you want optimistic updates.

## Notes

- Photo estimates are AI guesses — the weight field and editable macros are there to
  correct them.
- Built-in food macros are approximate, sourced for everyday tracking rather than lab
  accuracy.
