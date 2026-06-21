# Makan — Malaysian calorie tracker (PWA)

A mobile-first calorie tracker with photo recognition tuned for Malaysian food and
local fast-food chains. Built with **Next.js (App Router) + TypeScript**, recognition
runs through a **Server Action** so your Anthropic API key never reaches the browser.
Installs to the iPhone Home Screen as a full-screen PWA.

## Features

- 📷 **Snap or import** a food photo (camera or gallery) → Claude estimates the dish,
  weight, calories and macros, with a Malaysia-aware prompt.
- ✏️ **Review step** — set the real weight in grams (everything rescales), edit any
  value, and add a note before saving.
- 🔎 **Offline search** of ~50 local foods (nasi lemak, mamak, KFC, drinks, kuih…).
- ⌨️ **Manual entry** for anything else.
- 🟢 Daily calorie ring + protein-forward macro bars, 7-day insights, day navigation.
- 💾 Saves to `localStorage` — no database required to run.

## 1. Run locally

```bash
npm install
cp .env.example .env.local      # then paste your key into .env.local
npm run dev                      # http://localhost:3000
```

Get an API key at https://console.anthropic.com → **Settings → API Keys**.

```
ANTHROPIC_API_KEY=sk-ant-...
```

## 2. Deploy to Vercel

```bash
npm i -g vercel    # if you don't have it
vercel             # follow prompts
vercel --prod
```

In the Vercel dashboard → **Project → Settings → Environment Variables**, add
`ANTHROPIC_API_KEY` with your key, then redeploy. That's the only env var needed.

## 3. Install on your iPhone

1. Open your Vercel URL in **Safari** (must be Safari, not Chrome).
2. Tap the **Share** button → **Add to Home Screen**.
3. Launch it from the new icon — it opens full-screen with no browser bars,
   uses the pandan icon, and works offline for everything except photo recognition
   (that one call needs a connection).

## How recognition stays secure

The browser never talks to Anthropic directly. The photo is downscaled client-side,
then handed to the `recogniseFood` **Server Action** (`app/actions.ts`), which runs on
Vercel's server with your secret key. This is why you must never put the key in any
`NEXT_PUBLIC_*` variable or client component.

## Project structure

```
app/
  actions.ts            Server Action: calls Claude vision (holds the API key)
  components/Makan.tsx   The whole UI (client component)
  manifest.ts            PWA manifest (Next App Router convention)
  layout.tsx             Metadata + Apple Web App tags
  page.tsx               Renders <Makan />
  types.ts               Shared types
public/
  sw.js                  Service worker (offline app shell)
  icon-192/512, apple-touch-icon, icon-maskable
```

## Upgrading to real accounts (Neon + Prisma)

`localStorage` keeps data on one device. To sync across devices and back it up, move
the log to your usual stack:

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

2. Add NextAuth for sign-in, then replace the `store` object in `Makan.tsx` with
   Server Actions (`addEntry`, `getDay`, `updateEntry`, `deleteEntry`) that read/write
   via Prisma, scoped to `session.user.id`.
3. Keep `localStorage` as an offline cache if you want optimistic updates.

## Notes

- Photo estimates are AI guesses — the weight field and editable macros are there to
  correct them.
- The model string lives in `app/actions.ts` (`MODEL`) if you want to swap it.
- Built-in food macros are approximate, sourced for everyday tracking rather than lab
  accuracy.
```
